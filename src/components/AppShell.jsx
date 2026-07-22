import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDemo } from "../context/DemoContext";

const shellSections = {
  dashboard: {
    title: "Dashboard Ejecutivo",
    copy: "Vista resumida para abrir la historia correcta y demostrar valor en segundos.",
    impact: "Conteo real por estado y drill-down directo a la operacion.",
  },
  cases: {
    title: "Bandeja de Casos",
    copy: "Cockpit operacional para abrir tickets, revisar estados y tensionar escenarios.",
    impact: "Casos filtrables, recorrido claro y entrada manual en un solo lugar.",
  },
  wizard: {
    title: "Analisis de Caso",
    copy: "Extraccion, criterio tecnico, payout y cierre en una secuencia controlada.",
    impact: "Decision explicable con override y salida lista para presentar.",
  },
};

const mainNavItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    copy: "Resumen ejecutivo",
    to: "/",
  },
  {
    key: "cases",
    label: "Bandeja de Casos",
    copy: "Operacion y filtros",
    to: "/casos",
  },
];

function getCurrentCaseId(pathname) {
  const match = pathname.match(/\/caso\/([^/]+)/);
  return match?.[1] ?? null;
}

function getPrimaryCtaLabel(dashboardMetrics) {
  if (dashboardMetrics.inReview > 0) return "Retomar caso en curso";
  if (dashboardMetrics.closed > 0 && dashboardMetrics.pending > 0) return "Abrir siguiente playbook";
  return "Iniciar demo recomendada";
}

function getSectionKey(pathname) {
  if (pathname.startsWith("/caso/")) return "wizard";
  if (pathname.startsWith("/casos")) return "cases";
  return "dashboard";
}

export function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    dashboardMetrics,
    executiveOverview,
    getCaseById,
    getCaseRoute,
    getCaseState,
    getPresentationState,
    getRecommendedCase,
    resetDemo,
  } = useDemo();
  const sectionKey = getSectionKey(location.pathname);
  const sectionMeta = shellSections[sectionKey];
  const nextCase = getRecommendedCase();
  const currentCaseId = getCurrentCaseId(location.pathname);
  const currentCase = currentCaseId ? getCaseById(currentCaseId) : null;
  const currentCaseState = currentCase ? getCaseState(currentCase) : null;
  const currentPresentationState = currentCase ? getPresentationState(currentCase) : null;
  const completedCases = dashboardMetrics.closed;
  const completionRatio =
    dashboardMetrics.total > 0 ? Math.round((completedCases / dashboardMetrics.total) * 100) : 0;
  const primaryCtaLabel = getPrimaryCtaLabel(dashboardMetrics);

  function handleResetDemo() {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Esto reiniciara la simulacion y te llevara al dashboard principal. Quieres continuar?",
      );

      if (!confirmed) return;
    }

    resetDemo();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <aside className="print-hidden app-sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">AT</div>
          <div>
            <p className="brand-kicker">Demo interactiva</p>
            <h1 className="brand-title">Agente de Auditoria Tecnica</h1>
          </div>
        </div>

        <div className="sidebar-module">
          <p className="sidebar-module-label">Sistema de decision</p>
          <h2 className="sidebar-module-title">Operacion premium con criterio visible</h2>
          <p className="sidebar-module-copy">
            Un demo SaaS pensado para que negocio vea valor rapido y el equipo tecnico mantenga
            control sobre cada cierre.
          </p>
        </div>

        <nav className="app-sidebar-nav app-sidebar-nav-primary">
          {mainNavItems.map((item) => {
            const isActive =
              item.key === "cases" ? sectionKey === "cases" || sectionKey === "wizard" : sectionKey === item.key;

            return (
              <Link
                className={`sidebar-nav-link ${isActive ? "sidebar-nav-link-active" : ""}`}
                key={item.key}
                to={item.to}
              >
                <span className="sidebar-nav-title">{item.label}</span>
                <span className="sidebar-nav-copy">{item.copy}</span>
              </Link>
            );
          })}
        </nav>

        {currentCase ? (
          <div className="sidebar-case-card">
            <p className="sidebar-module-label">Caso en foco</p>
            <h3 className="sidebar-title">
              Ticket {currentCase.idTicket}
            </h3>
            <p className="sidebar-copy">
              {currentCase.tipoArtefacto} {currentCase.marca} {currentCase.modelo}
            </p>
            <div className="sidebar-metric-row">
              <span>Estado del flujo</span>
              <strong>{currentCaseState?.status === "closed" ? "Cerrado" : "En curso"}</strong>
            </div>
            <div className="sidebar-metric-row">
              <span>Salida esperada</span>
              <strong>{currentPresentationState?.label ?? "Sin clasificar"}</strong>
            </div>
          </div>
        ) : (
          <div className="sidebar-case-card">
            <p className="sidebar-module-label">Resumen actual</p>
            <div className="sidebar-metric-row">
              <span>Reparacion</span>
              <strong>{executiveOverview.repair}</strong>
            </div>
            <div className="sidebar-metric-row">
              <span>Indemnizacion</span>
              <strong>{executiveOverview.indemnify}</strong>
            </div>
            <div className="sidebar-metric-row">
              <span>Rechazado</span>
              <strong>{executiveOverview.reject}</strong>
            </div>
            <div className="sidebar-metric-row">
              <span>Incompleto</span>
              <strong>{executiveOverview.incomplete}</strong>
            </div>
          </div>
        )}

        <div className="sidebar-module sidebar-module-compact">
          <p className="sidebar-module-label">Momentum de demo</p>
          <div className="sidebar-metric-row">
            <span>Casos cerrados</span>
            <strong>
              {completedCases}/{dashboardMetrics.total}
            </strong>
          </div>
          <div className="sidebar-progress">
            <span className="sidebar-progress-fill" style={{ width: `${completionRatio}%` }} />
          </div>
          <div className="sidebar-metric-stack">
            <div className="sidebar-metric-row">
              <span>Overrides</span>
              <strong>{dashboardMetrics.overridesApplied}</strong>
            </div>
            <div className="sidebar-metric-row">
              <span>Caso manual</span>
              <strong>{dashboardMetrics.hasManualCase ? "Activo" : "Disponible"}</strong>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="print-hidden app-topbar">
          <div className="app-topbar-inner">
            <div className="topbar-meta">
              <p className="topbar-status">Vista activa</p>
              <h2 className="topbar-title">{sectionMeta.title}</h2>
              <p className="topbar-copy">{sectionMeta.copy}</p>
            </div>

            <div className="topbar-value-card">
              <p className="topbar-value-label">Valor visible</p>
              <strong>{sectionMeta.impact}</strong>
            </div>

            <div className="topbar-actions">
              <button className="secondary-button" onClick={handleResetDemo} type="button">
                Reiniciar simulacion
              </button>
              {nextCase ? (
                <button
                  className="primary-button"
                  onClick={() => navigate(getCaseRoute(nextCase))}
                  type="button"
                >
                  {primaryCtaLabel}
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <div className="app-shell-body">{children}</div>
      </div>
    </div>
  );
}
