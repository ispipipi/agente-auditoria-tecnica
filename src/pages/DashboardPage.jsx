import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { WorkflowStateBadge } from "../components/WorkflowStateBadge";
import { useDemo } from "../context/DemoContext";

const statusCards = [
  {
    key: "repair",
    label: "Reparacion",
    copy: "Casos atribuibles con reparacion viable por regla del 70%.",
  },
  {
    key: "indemnify",
    label: "Indemnizacion",
    copy: "Casos atribuibles donde conviene cerrar con payout.",
  },
  {
    key: "reject",
    label: "Rechazado",
    copy: "Casos donde el criterio tecnico protege a la compania.",
  },
  {
    key: "incomplete",
    label: "Incompleto",
    copy: "Expedientes que no deberian consumir revision avanzada.",
  },
];

const journeySteps = [
  {
    title: "Recepcion y filtro",
    copy: "Detecta documentos incompletos y evita reproceso desde el primer gate.",
  },
  {
    title: "Criterio tecnico",
    copy: "Explica por que un caso se acepta, se rechaza o requiere revision.",
  },
  {
    title: "Regla financiera",
    copy: "Simula payout y aterriza la decision tecnica en un cierre economico.",
  },
  {
    title: "Cierre con override",
    copy: "Mantiene la ultima palabra en manos del analista con trazabilidad clara.",
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

  function openNextCase() {
    const route =
      getCaseState(nextCase).status === "new" ? startCase(nextCase) : getCaseRoute(nextCase);
    navigate(route);
  }

  return (
    <AppShell>
      <section className="page-hero">
        <div className="page-hero-copy">
          <span className="hero-pill">Dashboard Ejecutivo</span>
          <h2 className="page-title">
            Una demo que hace obvio donde la plataforma ahorra tiempo, estandariza criterio y
            mejora el cierre.
          </h2>
          <p className="page-copy">
            Parte con el resumen agregado, entra a la bandeja filtrada con un clic y recorre un
            caso completo sin perder la narrativa comercial.
          </p>

          <div className="hero-actions">
            <button className="primary-button" onClick={openNextCase} type="button">
              {dashboardMetrics.inReview > 0 ? "Retomar caso en curso" : "Iniciar demo recomendada"}
            </button>
            <button className="secondary-button" onClick={() => navigate("/casos")} type="button">
              Ir a bandeja de casos
            </button>
          </div>
        </div>

        <div className="surface-card dashboard-hero-panel">
          <p className="panel-kicker">Caso sugerido</p>
          <div className="hero-spotlight-card hero-spotlight-card-light">
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
              {dashboardMetrics.inReview > 0
                ? "Retoma exactamente donde quedo la simulacion para no romper el relato."
                : "El caso recomendado abre la demo con valor visible, decision explicable y cierre defendible."}
            </p>
            <div className="hero-spotlight-points hero-spotlight-points-light">
              <span>Conteo ejecutivo con base real</span>
              <span>Drill-down directo a la bandeja</span>
              <span>Flujo completo hasta PDF u override</span>
            </div>
          </div>
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
            <div className="status-overview-top">
              <span className="status-overview-label">{card.label}</span>
              <span className="status-overview-link">Ver casos</span>
            </div>
            <strong className="status-overview-value">{executiveOverview[card.key]}</strong>
            <p className="status-overview-copy">{card.copy}</p>
          </button>
        ))}
      </section>

      <section className="dashboard-detail-grid">
        <div className="surface-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Recorrido del producto</p>
              <h3 className="section-title">La historia completa cabe en una reunion corta</h3>
            </div>
            <p className="section-copy">
              Cada paso muestra un valor distinto: filtro, criterio, payout y control humano.
            </p>
          </div>

          <div className="dashboard-process-grid">
            {journeySteps.map((step, index) => (
              <div className="process-card" key={step.title}>
                <span className="process-index">0{index + 1}</span>
                <h4>{step.title}</h4>
                <p>{step.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-stack">
          <div className="surface-card">
            <div className="section-heading compact">
              <div>
                <p className="panel-kicker">Base real del dashboard</p>
                <h3 className="section-title small">Conteo vivo de los 4 casos mock</h3>
              </div>
            </div>
            <div className="dashboard-facts-list">
              {demoCases.map((caseItem) => {
                const presentationState = getPresentationState(caseItem);

                return (
                  <div className="dashboard-fact-row" key={caseItem.idTicket}>
                    <div>
                      <p className="queue-ticket">Ticket {caseItem.idTicket}</p>
                      <p className="dashboard-fact-copy">
                        {caseItem.tipoArtefacto} {caseItem.marca} {caseItem.modelo}
                      </p>
                    </div>
                    <span className={`state-pill state-pill-${presentationState.key}`}>
                      {presentationState.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card surface-card-accent">
            <p className="panel-kicker">Momento de venta</p>
            <h3 className="sidebar-title">Lo que el sponsor deberia entender al minuto uno</h3>
            <p className="sidebar-copy">
              Que la plataforma filtra mejor, decide con criterio consistente y deja un cierre
              listo para defender frente a negocio.
            </p>
            <div className="sidebar-value-list">
              <span>Menos lectura manual</span>
              <span>Decision mas consistente</span>
              <span>Override con trazabilidad</span>
            </div>
          </div>

          {inReviewCase ? (
            <div className="surface-card">
              <p className="panel-kicker">Caso en progreso</p>
              <h3 className="section-title small">Ya hay una simulacion abierta</h3>
              <p className="section-copy">
                Puedes retomarla para continuar la historia sin reiniciar el recorrido.
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
