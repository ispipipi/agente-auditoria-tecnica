import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDemo } from "../context/DemoContext";

const shellSections = {
  dashboard: {
    title: "Dashboard Ejecutivo",
    eyebrow: "Cockpit overview",
    copy: "Resumen ejecutivo consolidado de los procesos de auditoria vigentes.",
    impact: "Conteo real por estado y drill-down directo a la operacion.",
  },
  cases: {
    title: "Bandeja de Casos",
    eyebrow: "Audit workspace",
    copy: "Gestion centralizada para abrir tickets, revisar estados y simular cierres.",
    impact: "Casos filtrables, recorrido claro y entrada manual en un solo lugar.",
  },
  wizard: {
    title: "Analisis de Caso",
    eyebrow: "Live audit",
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

const secondaryNavItems = [
  { key: "dashboard", label: "Dashboard", to: "/" },
  { key: "cases", label: "Casos", to: "/casos" },
  { key: "wizard", label: "Flujo demo", to: "/casos" },
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

function ShellIcon({ name }) {
  if (name === "dashboard") {
    return (
      <svg aria-hidden="true" className="nav-icon-svg" viewBox="0 0 24 24">
        <rect height="7" rx="1.5" width="7" x="3" y="3" />
        <rect height="11" rx="1.5" width="7" x="14" y="3" />
        <rect height="11" rx="1.5" width="7" x="3" y="10" />
        <rect height="7" rx="1.5" width="7" x="14" y="14" />
      </svg>
    );
  }

  if (name === "cases") {
    return (
      <svg aria-hidden="true" className="nav-icon-svg" viewBox="0 0 24 24">
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" />
        <path className="nav-icon-cut" d="M7 15h10M7 11h10" />
      </svg>
    );
  }

  if (name === "support") {
    return (
      <svg aria-hidden="true" className="nav-icon-svg" viewBox="0 0 24 24">
        <path d="M12 20a8 8 0 1 0-8-8" />
        <path className="nav-icon-cut" d="M9.8 9.6a2.3 2.3 0 1 1 3.5 2c-.9.6-1.3 1-1.3 2" />
        <circle cx="12" cy="17.2" r="1" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="nav-icon-svg" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
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
  const searchLabel = currentCase
    ? `Ticket ${currentCase.idTicket} · ${currentCase.tipoArtefacto} ${currentCase.marca}`
    : "Buscar ticket o artefacto...";
  const logoSrc = `${import.meta.env.BASE_URL}onassist-logo.png`;

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
          <img alt="OnAssist" className="brand-logo" src={logoSrc} />
          <div>
            <h1 className="brand-title">OnAssist</h1>
            <p className="brand-kicker">Technical Intelligence</p>
          </div>
        </div>

        <div className="sidebar-module">
          <p className="sidebar-module-label">Demo interactiva</p>
          <h2 className="sidebar-module-title">Operacion premium con criterio visible</h2>
          <p className="sidebar-module-copy">
            Un espacio ejecutivo para demostrar filtro documental, criterio tecnico, payout y
            cierre con override en un solo recorrido.
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
                <span className="sidebar-nav-icon">
                  <ShellIcon name={item.key} />
                </span>
                <span className="sidebar-nav-content">
                  <span className="sidebar-nav-title">{item.label}</span>
                  <span className="sidebar-nav-copy">{item.copy}</span>
                </span>
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

        <div className="sidebar-footer-links">
          <button className="sidebar-footer-link" onClick={() => navigate("/casos#manual")} type="button">
            <span className="sidebar-nav-icon">
              <ShellIcon name="support" />
            </span>
            <span>Crear auditoria</span>
          </button>
          <button className="sidebar-footer-link" onClick={() => navigate("/")} type="button">
            <span className="sidebar-nav-icon">
              <ShellIcon name="account" />
            </span>
            <span>Vista ejecutiva</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="print-hidden app-topbar">
          <div className="app-topbar-inner">
            <div className="topbar-heading-group">
              <div className="topbar-meta">
                <h2 className="topbar-title">{sectionMeta.title}</h2>
                <p className="topbar-status">{sectionMeta.eyebrow}</p>
              </div>
              <div className="topbar-search-shell" role="search">
                <span className="topbar-search-icon">⌕</span>
                <input aria-label="Buscar ticket o artefacto" readOnly value={searchLabel} />
              </div>
            </div>

            <nav className="topbar-nav">
              {secondaryNavItems.map((item) => {
                const isActive = sectionKey === item.key || (sectionKey === "wizard" && item.key === "wizard");
                return (
                  <Link
                    className={`topbar-nav-link ${isActive ? "topbar-nav-link-active" : ""}`}
                    key={item.key}
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="topbar-actions">
              <div className="topbar-value-card">
                <p className="topbar-value-label">Valor visible</p>
                <strong>{sectionMeta.impact}</strong>
              </div>
              <button className="secondary-button secondary-button-compact" onClick={() => navigate("/casos#manual")} type="button">
                Nueva auditoria
              </button>
              <button className="secondary-button" onClick={handleResetDemo} type="button">
                Reiniciar
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
