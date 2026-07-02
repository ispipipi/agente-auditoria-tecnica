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

export function CaseInboxPage() {
  const navigate = useNavigate();
  const {
    cases,
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

  function openCase(caseItem) {
    const state = getCaseState(caseItem);
    const route = state.status === "new" ? startCase(caseItem) : getCaseRoute(caseItem);
    navigate(route);
  }

  return (
    <AppShell>
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="hero-pill">Demo interactiva estilo producto</span>
          <h2>Una bandeja de auditoria tecnica que se siente operativa, clara y lista para vender.</h2>
          <p>
            La simulacion recorre extraccion documental, criterio tecnico, regla del 70%,
            override humano y cierre del caso. Cada ticket mantiene su estado para que la demo
            pueda continuar sin perder el hilo.
          </p>

          <div className="hero-actions">
            <button className="primary-button" onClick={() => openCase(nextCase)} type="button">
              {dashboardMetrics.pending === dashboardMetrics.total
                ? "Iniciar demo guiada"
                : "Continuar siguiente caso"}
            </button>
            <button className="secondary-button" onClick={() => navigate(getCaseRoute(nextCase))} type="button">
              Abrir caso recomendado
            </button>
          </div>
        </div>

        <div className="dashboard-hero-panel">
          <p className="panel-kicker">Recorrido sugerido</p>
          <div className="journey-list">
            {cases
              .slice()
              .sort(
                (left, right) =>
                  playbookOrder.indexOf(left.escenario) - playbookOrder.indexOf(right.escenario),
              )
              .map((caseItem, index) => (
                <div className="journey-item" key={caseItem.idTicket}>
                  <span className="journey-index">0{index + 1}</span>
                  <div>
                    <p className="journey-title">{caseItem.escenario}</p>
                    <p className="journey-copy">{playbookLabels[caseItem.escenario]}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Casos pendientes" value={dashboardMetrics.pending} />
        <MetricCard label="En revision" value={dashboardMetrics.inReview} />
        <MetricCard label="Casos cerrados" value={dashboardMetrics.closed} />
        <MetricCard label="Overrides aplicados" value={dashboardMetrics.overridesApplied} />
      </section>

      <section className="queue-layout">
        <div className="surface-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Bandeja operativa</p>
              <h3 className="section-title">Casos listos para la simulacion completa</h3>
            </div>
            <p className="section-copy">
              Cada fila muestra el estado del ticket, el progreso del flujo y el siguiente paso
              recomendado para mantener la demo viva.
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
                        <p className="queue-copy">{caseItem.descripcionCausaFalla}</p>
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
                      <span className="meta-chip">Escenario: {caseItem.escenario}</span>
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
            <h3 className="sidebar-title">Escenario {nextCase.escenario}</h3>
            <p className="sidebar-copy">
              {playbookLabels[nextCase.escenario]}. Ideal para mantener la narrativa comercial de
              la demo.
            </p>
            <button className="primary-button w-full" onClick={() => openCase(nextCase)} type="button">
              Abrir caso sugerido
            </button>
          </div>

          <div className="surface-card">
            <p className="panel-kicker">Valor para sponsor</p>
            <ul className="value-list">
              <li>Explica por que un caso se aprueba, rechaza o alerta.</li>
              <li>Hace visible cuando entra la regla economica del 70%.</li>
              <li>Permite override humano con trazabilidad antes del cierre.</li>
              <li>Muestra el cierre del ticket y deja lista la siguiente iteracion.</li>
            </ul>
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
