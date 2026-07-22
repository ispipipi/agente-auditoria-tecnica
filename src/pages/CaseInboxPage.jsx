import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  const location = useLocation();
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

  useEffect(() => {
    if (location.hash !== "#manual") return;
    setShowManualForm(true);
  }, [location.hash]);

  return (
    <AppShell>
      <section className="page-intro">
        <div>
          <span className="hero-pill">Vista Ejecutiva</span>
          <h1 className="page-title page-title-accent">Bandeja de Auditoria</h1>
          <p className="page-copy">
            Gestion centralizada de revisiones tecnicas y reclamaciones de garantia con ejemplos
            precargados y entrada manual lista para demo consultiva.
          </p>
        </div>

        <div className="hero-actions">
          <button className="secondary-button" onClick={() => window.print()} type="button">
            Exportar
          </button>
          <button className="primary-button" onClick={() => setShowManualForm(true)} type="button">
            Crear auditoria
          </button>
        </div>
      </section>

      {filterKey && FILTER_LABELS[filterKey] ? (
        <div className="filter-chip-row">
          <span className="filter-chip">
            Filtrando por: <strong>{FILTER_LABELS[filterKey]}</strong>
          </span>
          <button className="link-button" onClick={clearFilter} type="button">
            Limpiar filtros
          </button>
        </div>
      ) : null}

      <section className="stats-grid">
        <SummaryStatCard
          copy="Casos activos"
          label="Carga de trabajo"
          tone="primary"
          value={`${filteredCases.length}`}
        />
        <SummaryStatCard
          copy="+2.1% desde ayer"
          label="Tasa de aprobacion"
          tone="success"
          value={`${Math.max(78, Math.round((executiveOverview.repair / Math.max(1, cases.length)) * 100))}%`}
        />
        <SummaryStatCard
          copy="Cerca del limite critico"
          label="SLA promedio"
          tone="warning"
          value={dashboardMetrics.inReview > 0 ? "2.4h" : "4.2h"}
        />
      </section>

      <section className="queue-layout">
        <div className="surface-card surface-card-table">
          <div className="queue-table">
            <div className="queue-table-head">
              <span>ID ticket</span>
              <span>Artefacto (marca/modelo)</span>
              <span>Estado</span>
              <span>Progreso</span>
              <span>Accion</span>
            </div>

            {filteredCases.length > 0 ? (
              filteredCases.map((caseItem) => {
                const state = getCaseState(caseItem);
                const progress = getCaseProgress(caseItem);
                const finalDecision =
                  state.status === "closed" ? getFinalDecision(caseItem) : undefined;
                const presentationState = getPresentationState(caseItem);

                return (
                  <div className="queue-table-row" key={caseItem.idTicket}>
                    <div className="queue-table-ticket">
                      <strong>#{caseItem.idTicket}</strong>
                      <span>
                        {caseItem.caseOrigin === "manual"
                          ? "Ingreso manual"
                          : `Escenario ${caseItem.escenario}`}
                      </span>
                    </div>

                    <div className="queue-table-device">
                      <span className="queue-table-icon">{caseItem.tipoArtefacto.slice(0, 2)}</span>
                      <div>
                        <strong>
                          {caseItem.tipoArtefacto} {caseItem.marca}
                        </strong>
                        <p>{caseItem.modelo}</p>
                      </div>
                    </div>

                    <div className="queue-table-status">
                      <CaseStatusBadge
                        decision={finalDecision}
                        pendingLabel={presentationState.label}
                      />
                      <WorkflowStateBadge state={state.status} />
                    </div>

                    <div className="queue-table-progress">
                      <div className="progress-track">
                        <span className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span>{progress}%</span>
                    </div>

                    <div className="queue-table-action">
                      <button className="table-action-button" onClick={() => openCase(caseItem)} type="button">
                        {state.status === "new"
                          ? "Abrir caso"
                          : state.status === "closed"
                            ? "Ver cierre"
                            : "Continuar"}
                      </button>
                    </div>
                  </div>
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

        <div className="dashboard-side-column">
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

function SummaryStatCard({ label, value, copy, tone }) {
  return (
    <div className="summary-stat-card">
      <span>{label}</span>
      <strong className={`summary-stat-value tone-${tone}`}>{value}</strong>
      <p>{copy}</p>
    </div>
  );
}
