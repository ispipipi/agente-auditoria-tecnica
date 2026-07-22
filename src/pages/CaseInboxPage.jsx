import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { CaseStatusBadge } from "../components/CaseStatusBadge";
import { WorkflowStateBadge } from "../components/WorkflowStateBadge";
import { useDemo } from "../context/DemoContext";

const FILTER_LABELS = {
  repair: "Reparacion",
  indemnify: "Indemnizacion",
  reject: "Rechazado",
  incomplete: "Incompleto",
};

const playbookOrder = ["Aprobado", "Rechazado", "Incompleto", "Indemnizacion", "Manual"];

function buildManualFormState(manualCase) {
  return {
    nCliente: manualCase?.nCliente ?? "12000001",
    tipoArtefacto: manualCase?.tipoArtefacto ?? "LAVADORA",
    marca: manualCase?.marca ?? "MIDEA",
    modelo: manualCase?.modelo ?? "MANUAL DEMO 2026",
    numeroSerie: manualCase?.numeroSerie ?? "",
    componentesDeteriorados: manualCase?.componentesDeteriorados ?? "Panel de control",
    descripcionCausaFalla: manualCase?.descripcionCausaFalla ?? "",
    comentariosObservaciones: manualCase?.comentariosObservaciones ?? "",
    atribuibleSuministro:
      manualCase?.atribuibleSuministro === null || manualCase?.atribuibleSuministro === undefined
        ? "null"
        : String(manualCase.atribuibleSuministro),
    firmaTecnicoPresente: manualCase?.firmaTecnicoPresente ?? false,
    evidenciaFotografica: manualCase?.evidenciaFotografica ?? false,
    presupuestoReparacion:
      manualCase?.presupuestoReparacion === null || manualCase?.presupuestoReparacion === undefined
        ? ""
        : String(manualCase.presupuestoReparacion),
    razonSocialServicio:
      manualCase?.razonSocialServicio ?? "Servicio ingresado manualmente",
    tecnicoResponsable: manualCase?.tecnicoResponsable ?? "Analista Demo",
  };
}

export function CaseInboxPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    cases,
    createManualCase,
    dashboardMetrics,
    executiveOverview,
    getCaseProgress,
    getCaseRoute,
    getCaseState,
    getFinalDecision,
    getPresentationState,
    getRecommendedCase,
    startCase,
  } = useDemo();
  const filterKey = searchParams.get("estado");
  const nextCase = getRecommendedCase();
  const manualCase = dashboardMetrics.manualCase;
  const [showManualForm, setShowManualForm] = useState(!manualCase);
  const [manualForm, setManualForm] = useState(() => buildManualFormState(manualCase));
  const manualCaseRef = useRef(null);

  const orderedCases = useMemo(
    () =>
      cases
        .slice()
        .sort(
          (left, right) =>
            playbookOrder.indexOf(left.escenario) - playbookOrder.indexOf(right.escenario),
        ),
    [cases],
  );

  const filteredCases = useMemo(() => {
    if (!filterKey || !FILTER_LABELS[filterKey]) return orderedCases;
    return orderedCases.filter((item) => getPresentationState(item).key === filterKey);
  }, [filterKey, getPresentationState, orderedCases]);

  function openCase(caseItem) {
    const state = getCaseState(caseItem);
    const route = state.status === "new" ? startCase(caseItem) : getCaseRoute(caseItem);
    navigate(route);
  }

  function handleManualChange(field, value) {
    setManualForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleManualSubmit(event) {
    event.preventDefault();

    const createdCase = createManualCase({
      ...manualForm,
      presupuestoReparacion: manualForm.presupuestoReparacion,
      atribuibleSuministro: manualForm.atribuibleSuministro,
      escenario: "Manual",
    });

    setShowManualForm(false);
    navigate(startCase(createdCase));
  }

  function openManualEditor() {
    setManualForm(buildManualFormState(manualCase));
    setShowManualForm(true);
  }

  function clearFilter() {
    setSearchParams({});
  }

  useEffect(() => {
    if (!showManualForm || !manualCaseRef.current) return;

    manualCaseRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [showManualForm]);

  return (
    <AppShell>
      <section className="page-hero page-hero-compact">
        <div>
          <span className="hero-pill">Bandeja de Casos</span>
          <h2 className="page-title">Una vista operacional clara para demostrar criterio y cierre.</h2>
          <p className="page-copy">
            Abre cualquier caso, retoma donde quedo la simulacion o filtra por el resultado que
            quieras presentar al cliente.
          </p>
        </div>

        <div className="inbox-summary-grid">
          <SummaryChip label="Reparacion" value={executiveOverview.repair} />
          <SummaryChip label="Indemnizacion" value={executiveOverview.indemnify} />
          <SummaryChip label="Rechazado" value={executiveOverview.reject} />
          <SummaryChip label="Incompleto" value={executiveOverview.incomplete} />
        </div>
      </section>

      <section className="queue-layout">
        <div className="surface-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Operacion filtrable</p>
              <h3 className="section-title">Bandeja lista para recorrer la demo completa</h3>
            </div>

            {filterKey && FILTER_LABELS[filterKey] ? (
              <div className="filter-chip-row">
                <span className="filter-chip">
                  Filtrando por: <strong>{FILTER_LABELS[filterKey]}</strong>
                </span>
                <button className="secondary-button" onClick={clearFilter} type="button">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <p className="section-copy">
                Cada ticket abre una historia distinta: aprobacion, rechazo, alerta documental,
                indemnizacion o stress test manual.
              </p>
            )}
          </div>

          <div className="queue-list">
            {filteredCases.length > 0 ? (
              filteredCases.map((caseItem) => {
                const state = getCaseState(caseItem);
                const progress = getCaseProgress(caseItem);
                const finalDecision =
                  state.status === "closed" ? getFinalDecision(caseItem) : undefined;
                const presentationState = getPresentationState(caseItem);

                return (
                  <button
                    className="queue-row"
                    key={caseItem.idTicket}
                    onClick={() => openCase(caseItem)}
                    type="button"
                  >
                    <div className="queue-row-main">
                      <div className="queue-row-heading">
                        <div>
                          <p className="queue-ticket">Ticket {caseItem.idTicket}</p>
                          <h4 className="queue-device">
                            {caseItem.tipoArtefacto} {caseItem.marca} {caseItem.modelo}
                          </h4>
                          <p className="queue-copy">
                            {caseItem.descripcionCausaFalla || "Caso listo para completar en vivo."}
                          </p>
                        </div>

                        <div className="queue-badges">
                          <WorkflowStateBadge state={state.status} />
                          <CaseStatusBadge
                            decision={finalDecision}
                            pendingLabel={presentationState.label}
                          />
                        </div>
                      </div>

                      <div className="queue-meta">
                        <span className="meta-chip">
                          {caseItem.caseOrigin === "manual" ? "Ingreso manual" : `Escenario ${caseItem.escenario}`}
                        </span>
                        <span className="meta-chip">
                          {state.status === "closed"
                            ? "Cierre completado"
                            : state.status === "in_review"
                              ? "Flujo en curso"
                              : "Sin iniciar"}
                        </span>
                        <span className="meta-chip">
                          {caseItem.evidenciaFotografica ? "Con evidencia" : "Sin evidencia"}
                        </span>
                      </div>
                    </div>

                    <div className="queue-row-side">
                      <div>
                        <p className="queue-side-label">Progreso</p>
                        <p className="queue-side-value">{progress}%</p>
                      </div>
                      <div className="progress-track">
                        <span className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="queue-link">
                        {state.status === "new"
                          ? "Comenzar analisis"
                          : state.status === "closed"
                            ? "Ver cierre del caso"
                            : "Continuar flujo"}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="empty-filter-card">
                <p className="section-kicker">Sin coincidencias</p>
                <h3 className="section-title small">No hay casos para este filtro en la bandeja actual.</h3>
                <p className="section-copy">
                  Limpia el filtro para volver a ver todos los tickets disponibles.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-stack">
          <div className="surface-card surface-card-accent">
            <p className="panel-kicker">Recorrido recomendado</p>
            <h3 className="sidebar-title">
              {nextCase.caseOrigin === "manual" ? "Caso manual" : `Escenario ${nextCase.escenario}`}
            </h3>
            <p className="sidebar-copy">
              {nextCase.caseOrigin === "manual"
                ? "Usa este ticket para mostrar flexibilidad operativa y cambios en vivo sin depender del mock."
                : "Ideal para abrir la conversacion con una historia clara y defender valor desde el primer clic."}
            </p>
            <div className="sidebar-value-list">
              <span>Lectura rapida del caso</span>
              <span>Explicacion comercial simple</span>
              <span>Cierre defendible frente a sponsor</span>
            </div>
            <button className="primary-button w-full" onClick={() => openCase(nextCase)} type="button">
              {dashboardMetrics.inReview > 0 ? "Retomar caso activo" : "Abrir caso sugerido"}
            </button>
          </div>

          <div className="surface-card" ref={manualCaseRef}>
            <div className="section-heading compact">
              <div>
                <p className="panel-kicker">Caso manual</p>
                <h3 className="section-title small">
                  {manualCase ? "Editar datos para la simulacion" : "Crear un ticket en vivo"}
                </h3>
              </div>
            </div>

            <p className="sidebar-copy">
              Completa la informacion minima y demuestra como la plataforma se adapta a un caso
              nuevo, recalcula y deja trazabilidad sin perder consistencia.
            </p>

            <div className="manual-hint-card">
              <strong>Ideal para demo consultiva</strong>
              <span>
                Usa este bloque cuando quieras demostrar flexibilidad y responder a un caso real
                que proponga el cliente en la reunion.
              </span>
            </div>

            {showManualForm ? (
              <form className="manual-case-form" onSubmit={handleManualSubmit}>
                <label className="block">
                  <span className="form-label">Cliente</span>
                  <input
                    className="form-input mt-2"
                    onChange={(event) => handleManualChange("nCliente", event.target.value)}
                    value={manualForm.nCliente}
                  />
                </label>

                <div className="manual-form-grid">
                  <label className="block">
                    <span className="form-label">Artefacto</span>
                    <input
                      className="form-input mt-2"
                      onChange={(event) => handleManualChange("tipoArtefacto", event.target.value)}
                      value={manualForm.tipoArtefacto}
                    />
                  </label>
                  <label className="block">
                    <span className="form-label">Marca</span>
                    <input
                      className="form-input mt-2"
                      onChange={(event) => handleManualChange("marca", event.target.value)}
                      value={manualForm.marca}
                    />
                  </label>
                </div>

                <div className="manual-form-grid">
                  <label className="block">
                    <span className="form-label">Modelo</span>
                    <input
                      className="form-input mt-2"
                      onChange={(event) => handleManualChange("modelo", event.target.value)}
                      value={manualForm.modelo}
                    />
                  </label>
                  <label className="block">
                    <span className="form-label">Presupuesto reparacion</span>
                    <input
                      className="form-input mt-2"
                      min="0"
                      onChange={(event) =>
                        handleManualChange("presupuestoReparacion", event.target.value)
                      }
                      type="number"
                      value={manualForm.presupuestoReparacion}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="form-label">Causa de falla</span>
                  <textarea
                    className="form-input mt-2 min-h-28"
                    onChange={(event) =>
                      handleManualChange("descripcionCausaFalla", event.target.value)
                    }
                    value={manualForm.descripcionCausaFalla}
                  />
                </label>

                <label className="block">
                  <span className="form-label">Comentarios del tecnico</span>
                  <textarea
                    className="form-input mt-2 min-h-28"
                    onChange={(event) =>
                      handleManualChange("comentariosObservaciones", event.target.value)
                    }
                    value={manualForm.comentariosObservaciones}
                  />
                </label>

                <label className="block">
                  <span className="form-label">Atribuible a suministro</span>
                  <select
                    className="form-input mt-2"
                    onChange={(event) =>
                      handleManualChange("atribuibleSuministro", event.target.value)
                    }
                    value={manualForm.atribuibleSuministro}
                  >
                    <option value="null">Sin definir</option>
                    <option value="true">Si</option>
                    <option value="false">No</option>
                  </select>
                </label>

                <div className="manual-check-grid">
                  <label className="check-toggle">
                    <input
                      checked={manualForm.firmaTecnicoPresente}
                      onChange={(event) =>
                        handleManualChange("firmaTecnicoPresente", event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>Firma tecnica presente</span>
                  </label>
                  <label className="check-toggle">
                    <input
                      checked={manualForm.evidenciaFotografica}
                      onChange={(event) =>
                        handleManualChange("evidenciaFotografica", event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>Evidencia fotografica</span>
                  </label>
                </div>

                <button className="primary-button w-full" type="submit">
                  {manualCase ? "Guardar y abrir caso manual" : "Crear y abrir caso manual"}
                </button>
              </form>
            ) : (
              <div className="manual-case-compact">
                <p className="section-copy">
                  Ticket manual disponible para editar y recorrer en vivo.
                </p>
                <button className="secondary-button w-full" onClick={openManualEditor} type="button">
                  Editar datos del caso manual
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function SummaryChip({ label, value }) {
  return (
    <div className="summary-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
