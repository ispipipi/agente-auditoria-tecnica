import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { CaseStatusBadge } from "../components/CaseStatusBadge";
import { WorkflowStateBadge } from "../components/WorkflowStateBadge";
import { useDemo } from "../context/DemoContext";

const playbookLabels = {
  Aprobado: "Valida atribuibilidad y reparacion",
  Rechazado: "Muestra rechazo tecnico sin regla 70%",
  Incompleto: "Explica alertas por calidad documental",
  Indemnizacion: "Cierra con regla financiera y payout",
};

const playbookOrder = ["Aprobado", "Rechazado", "Incompleto", "Indemnizacion"];

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
  const {
    cases,
    createManualCase,
    dashboardMetrics,
    getCaseProgress,
    getCaseRoute,
    getCaseState,
    getFinalDecision,
    getRecommendedCase,
    startCase,
    workflow,
  } = useDemo();

  const nextCase = getRecommendedCase();
  const manualCase = dashboardMetrics.manualCase;
  const [showManualForm, setShowManualForm] = useState(!manualCase);
  const [manualForm, setManualForm] = useState(() => buildManualFormState(manualCase));

  const journeyCases = useMemo(
    () =>
      cases
        .filter((item) => item.caseOrigin === "demo")
        .slice()
        .sort(
          (left, right) =>
            playbookOrder.indexOf(left.escenario) - playbookOrder.indexOf(right.escenario),
        ),
    [cases],
  );

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

  return (
    <AppShell>
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="hero-pill">Centro de operaciones para la demo</span>
          <h2>Una simulacion completa, navegable y creible para vender el agente de auditoria tecnica.</h2>
          <p>
            La bandeja mezcla storytelling comercial y operacion real: cuatro escenarios
            precargados para conducir la narrativa y un ticket manual para demostrar ingreso,
            recalculo, override y cierre en vivo sin depender solo de mocks.
          </p>

          <div className="hero-actions">
            <button className="primary-button" onClick={() => openCase(nextCase)} type="button">
              {dashboardMetrics.pending === dashboardMetrics.total
                ? "Iniciar demo guiada"
                : "Continuar siguiente caso"}
            </button>
            <button
              className="secondary-button"
              onClick={() => setShowManualForm((current) => !current)}
              type="button"
            >
              {manualCase ? "Editar caso manual" : "Crear caso manual"}
            </button>
          </div>

          <div className="hero-stat-strip">
            <div className="hero-stat-card">
              <span className="hero-stat-label">Recorridos</span>
              <strong className="hero-stat-value">5</strong>
              <span className="hero-stat-copy">4 ejemplos + 1 ticket editable</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-label">Motor</span>
              <strong className="hero-stat-value">70%</strong>
              <span className="hero-stat-copy">Regla financiera ajustable</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-label">Salida</span>
              <strong className="hero-stat-value">PDF</strong>
              <span className="hero-stat-copy">Cierre con override trazable</span>
            </div>
          </div>
        </div>

        <div className="dashboard-hero-panel">
          <p className="panel-kicker">Caso para abrir ahora</p>
          <div className="hero-spotlight-card">
            <div className="hero-spotlight-row">
              <span className="meta-chip">
                {nextCase.caseOrigin === "manual" ? "Ingreso manual" : `Escenario ${nextCase.escenario}`}
              </span>
              <WorkflowStateBadge state={getCaseState(nextCase).status} />
            </div>
            <h3 className="sidebar-title">
              {nextCase.tipoArtefacto} {nextCase.marca} {nextCase.modelo}
            </h3>
            <p className="sidebar-copy">
              {nextCase.caseOrigin === "manual"
                ? "Ideal para probar cambios de texto, checkboxes, recalculo financiero y decision final."
                : playbookLabels[nextCase.escenario]}
            </p>
          </div>

          <p className="panel-kicker">Recorrido sugerido</p>
          <div className="journey-list">
            {journeyCases.map((caseItem, index) => (
              <div className="journey-item" key={caseItem.idTicket}>
                <span className="journey-index">0{index + 1}</span>
                <div>
                  <p className="journey-title">{caseItem.escenario}</p>
                  <p className="journey-copy">{playbookLabels[caseItem.escenario]}</p>
                </div>
              </div>
            ))}
            <div className="journey-item">
              <span className="journey-index">05</span>
              <div>
                <p className="journey-title">Manual</p>
                <p className="journey-copy">
                  Permite ingresar informacion propia y tensionar el flujo en vivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Casos pendientes" value={dashboardMetrics.pending} />
        <MetricCard label="En revision" value={dashboardMetrics.inReview} />
        <MetricCard label="Casos cerrados" value={dashboardMetrics.closed} />
        <MetricCard label="Casos manuales" value={dashboardMetrics.hasManualCase ? 1 : 0} />
      </section>

      <section className="queue-layout">
        <div className="surface-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Bandeja operativa</p>
              <h3 className="section-title">Cockpit de casos para demo guiada o exploracion libre</h3>
            </div>
            <p className="section-copy">
              Cada fila muestra estado, evidencia, progreso y el punto exacto donde retomar la
              simulacion sin perder el hilo comercial.
            </p>
          </div>

          <div className="queue-list">
            {cases.map((caseItem) => {
              const state = workflow[caseItem.idTicket];
              const progress = getCaseProgress(caseItem);
              const finalDecision =
                state.status === "closed" ? getFinalDecision(caseItem) : undefined;

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
                        <p className="queue-copy">{caseItem.descripcionCausaFalla || "Caso listo para completar en vivo."}</p>
                      </div>

                      <div className="queue-badges">
                        <WorkflowStateBadge state={state.status} />
                        <CaseStatusBadge
                          decision={finalDecision}
                          pendingLabel={caseItem.escenario}
                        />
                      </div>
                    </div>

                    <div className="queue-meta">
                      <span className="meta-chip">
                        Origen: {caseItem.caseOrigin === "manual" ? "Ingreso manual" : "Ejemplo cargado"}
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
                        ? "Comenzar simulacion"
                        : state.status === "closed"
                          ? "Ver cierre del caso"
                          : "Continuar flujo"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="sidebar-stack">
          <div className="surface-card surface-card-accent">
            <p className="panel-kicker">Caso recomendado ahora</p>
            <h3 className="sidebar-title">
              {nextCase.caseOrigin === "manual" ? "Caso manual" : `Escenario ${nextCase.escenario}`}
            </h3>
            <p className="sidebar-copy">
              {nextCase.caseOrigin === "manual"
                ? "Usa este ticket para demostrar ingreso de informacion y recalculo en vivo."
                : `${playbookLabels[nextCase.escenario]}. Ideal para mantener la narrativa comercial de la demo.`}
            </p>
            <button className="primary-button w-full" onClick={() => openCase(nextCase)} type="button">
              Abrir caso sugerido
            </button>
          </div>

          <div className="surface-card">
            <div className="section-heading compact">
              <div>
                <p className="panel-kicker">Caso manual</p>
                <h3 className="section-title small">
                  {manualCase ? "Editar datos para la simulacion" : "Crear un ticket en vivo"}
                </h3>
              </div>
            </div>

            <p className="sidebar-copy">
              Completa solo la informacion necesaria para disparar extraccion, criterio tecnico y
              regla financiera. Luego puedes seguir ajustando desde el flujo.
            </p>

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
                    onChange={(event) => handleManualChange("descripcionCausaFalla", event.target.value)}
                    value={manualForm.descripcionCausaFalla}
                  />
                </label>

                <label className="block">
                  <span className="form-label">Comentarios del tecnico</span>
                  <textarea
                    className="form-input mt-2 min-h-28"
                    onChange={(event) => handleManualChange("comentariosObservaciones", event.target.value)}
                    value={manualForm.comentariosObservaciones}
                  />
                </label>

                <label className="block">
                  <span className="form-label">Atribuible a suministro</span>
                  <select
                    className="form-input mt-2"
                    onChange={(event) => handleManualChange("atribuibleSuministro", event.target.value)}
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
                <p className="note-copy">
                  Ticket manual disponible para editar y recorrer en vivo.
                </p>
                <button
                  className="secondary-button w-full"
                  onClick={() => {
                    setManualForm(buildManualFormState(manualCase));
                    setShowManualForm(true);
                  }}
                  type="button"
                >
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

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </div>
  );
}
