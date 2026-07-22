import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { WorkflowStateBadge } from "../components/WorkflowStateBadge";
import { useDemo } from "../context/DemoContext";

const statusCards = [
  {
    key: "repair",
    label: "Reparacion",
    tone: "success",
    flag: "Real-time",
    helper: "Activo",
    copy: "Casos atribuibles con reparacion viable por regla del 70%.",
  },
  {
    key: "indemnify",
    label: "Indemnizacion",
    tone: "warning",
    flag: "Pending",
    helper: "Revision",
    copy: "Casos atribuibles donde conviene cerrar con payout.",
  },
  {
    key: "reject",
    label: "Rechazado",
    tone: "danger",
    flag: "Critical",
    helper: "Accion requerida",
    copy: "Casos donde el criterio tecnico protege a la compania.",
  },
  {
    key: "incomplete",
    label: "Incompleto",
    tone: "neutral",
    flag: "Staged",
    helper: "Sin datos",
    copy: "Expedientes que no deberian consumir revision avanzada.",
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    cases,
    dashboardMetrics,
    executiveOverview,
    getCaseState,
    getPresentationState,
    getRecommendedCase,
    startCase,
    getCaseRoute,
  } = useDemo();
  const nextCase = getRecommendedCase();
  const demoCases = useMemo(
    () => cases.filter((item) => item.caseOrigin === "demo"),
    [cases],
  );
  const inReviewCase = useMemo(
    () => cases.find((item) => getCaseState(item).status === "in_review") ?? null,
    [cases, getCaseState],
  );
  const activityLog = useMemo(() => {
    const trackedCases = cases.slice(0, 3);

    return trackedCases.map((caseItem, index) => {
      const presentationState = getPresentationState(caseItem);
      return {
        id: `${caseItem.idTicket}-${index}`,
        time: `${12 + index}:${index === 0 ? "44" : index === 1 ? "42" : "39"}:${index === 2 ? "58" : "02"}`,
        message:
          index === 0
            ? `AUTH: Ticket ${caseItem.idTicket} cargado para ${presentationState.label.toLowerCase()}.`
            : index === 1
              ? `AUDIT: Escenario ${caseItem.escenario} listo para abrir desde bandeja.`
              : "EXPORT: Resumen ejecutivo disponible para presentar o imprimir.",
      };
    });
  }, [cases, getPresentationState]);

  function openNextCase() {
    const route =
      getCaseState(nextCase).status === "new" ? startCase(nextCase) : getCaseRoute(nextCase);
    navigate(route);
  }

  return (
    <AppShell>
      <section className="page-intro page-intro-split">
        <div>
          <h1 className="page-title">Technical Intelligence Portal</h1>
          <p className="page-copy">
            Resumen ejecutivo consolidado de los procesos de auditoria vigentes con acceso directo
            a casos, simulacion completa y cierre explicable.
          </p>
        </div>

        <div className="hero-actions">
          <button className="secondary-button" onClick={() => navigate("/casos")} type="button">
            Historial
          </button>
          <button className="secondary-button" onClick={() => window.print()} type="button">
            Exportar
          </button>
        </div>
      </section>

      <section className="status-overview-grid">
        {statusCards.map((card) => (
          <button
            className={`status-overview-card status-overview-card-${card.key}`}
            key={card.key}
            onClick={() => navigate(`/casos?estado=${card.key}`)}
            type="button"
          >
            <div className="status-overview-header">
              <span className={`status-overview-icon tone-${card.tone}`}>{card.label.slice(0, 1)}</span>
              <span className={`status-flag tone-${card.tone}`}>{card.flag}</span>
            </div>
            <span className="status-overview-label">{card.label}</span>
            <div className="status-overview-value-row">
              <strong className="status-overview-value">{executiveOverview[card.key]}</strong>
              <span className={`status-overview-helper tone-${card.tone}`}>{card.helper}</span>
            </div>
            <div className="status-overview-footer">
              <span className="status-overview-copy">Filtrar bandeja</span>
              <span className="status-overview-link">→</span>
            </div>
          </button>
        ))}
      </section>

      <section className="dashboard-reference-grid">
        <div className="surface-card surface-card-table">
          <div className="section-heading section-heading-divider">
            <div>
              <h3 className="section-title">Flujo Tecnico Reciente</h3>
            </div>
            <span className="section-badge-muted">Live updates</span>
          </div>

          <div className="recent-flow-list">
            {demoCases.map((caseItem) => {
              const presentationState = getPresentationState(caseItem);
              return (
                <button
                  className="recent-flow-row"
                  key={caseItem.idTicket}
                  onClick={() => navigate(getCaseRoute(caseItem))}
                  type="button"
                >
                  <span className="recent-flow-icon">{caseItem.tipoArtefacto.slice(0, 2)}</span>
                  <div className="recent-flow-copy">
                    <strong>
                      AUDIT-{caseItem.idTicket}-{presentationState.key.slice(0, 3).toUpperCase()}
                    </strong>
                    <p>
                      {caseItem.tipoArtefacto} {caseItem.marca} {caseItem.modelo}
                    </p>
                  </div>
                  <div className="recent-flow-status">
                    <span className="queue-side-label">Estatus</span>
                    <WorkflowStateBadge
                      label={presentationState.label}
                      state={getCaseState(caseItem).status}
                    />
                  </div>
                  <span className="recent-flow-arrow">›</span>
                </button>
              );
            })}
          </div>

          <button className="table-footer-button" onClick={() => navigate("/casos")} type="button">
            Ver todos los casos registrados
          </button>
        </div>

        <div className="dashboard-side-column">
          <div className="executive-dark-card">
            <p className="panel-kicker">Auditoria activa</p>
            <h3 className="dark-card-title">Seguridad Operativa</h3>
            <p className="dark-card-copy">
              {dashboardMetrics.inReview > 0
                ? "Ya hay un recorrido abierto para continuar la demo sin reiniciar el relato."
                : "Abre un caso sugerido y muestra el ciclo completo con criterio visible."}
            </p>
            <div className="dark-card-signal">
              <span className="dark-card-bars" />
              <span>
                {nextCase.tipoArtefacto} {nextCase.marca}
              </span>
            </div>
            <button className="primary-button primary-button-light" onClick={openNextCase} type="button">
              {dashboardMetrics.inReview > 0 ? "Retomar caso activo" : "Iniciar demo recomendada"}
            </button>
          </div>

          <div className="surface-card">
            <p className="panel-kicker">Logs tecnicos</p>
            <div className="activity-log-list">
              {activityLog.map((item) => (
                <div className="activity-log-row" key={item.id}>
                  <span>{item.time}</span>
                  <p>{item.message}</p>
                </div>
              ))}
            </div>
          </div>

          {inReviewCase ? (
            <div className="surface-card">
              <p className="panel-kicker">Caso en progreso</p>
              <h3 className="section-title small">La simulacion quedo abierta</h3>
              <p className="section-copy">
                Puedes retomar el ticket actual o entrar a la bandeja para cambiar la historia que
                quieres contar.
              </p>
              <button className="primary-button w-full" onClick={() => navigate(getCaseRoute(inReviewCase))} type="button">
                Retomar ticket {inReviewCase.idTicket}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
