import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDemo } from "../context/DemoContext";

const shellStages = [
  { key: "inbox", label: "Bandeja", copy: "Casos y narrativa comercial" },
  { key: "extraction", label: "Extraccion", copy: "Integridad y evidencia" },
  { key: "decision", label: "Reglas", copy: "Matriz tecnica y validacion" },
  { key: "financial", label: "Financiero", copy: "Regla del 70% y payout" },
  { key: "result", label: "Cierre", copy: "Override, PDF y salida" },
];

function getActiveStage(pathname) {
  if (pathname.includes("/extraccion")) return "extraction";
  if (pathname.includes("/decision")) return "decision";
  if (pathname.includes("/financiero")) return "financial";
  if (pathname.includes("/resultado")) return "result";
  return "inbox";
}

export function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { dashboardMetrics, getRecommendedCase, getCaseRoute, resetDemo } = useDemo();
  const nextCase = getRecommendedCase();
  const activeStage = getActiveStage(location.pathname);
  const activeStageData = shellStages.find((stage) => stage.key === activeStage) ?? shellStages[0];
  const completedCases = dashboardMetrics.closed;
  const completionRatio = Math.round((completedCases / dashboardMetrics.total) * 100);

  return (
    <div className="app-shell">
      <aside className="print-hidden app-sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">AT</div>
          <div>
            <p className="brand-kicker">Producto demo</p>
            <h1 className="brand-title">Agente de Auditoria Tecnica</h1>
          </div>
        </div>

        <div className="sidebar-module">
          <p className="sidebar-module-label">Workspace</p>
          <h2 className="sidebar-module-title">Demo sponsor-ready</h2>
          <p className="sidebar-module-copy">
            Experiencia completa con ejemplos precargados y un caso manual editable para tensionar
            el flujo en vivo.
          </p>
        </div>

        <nav className="app-sidebar-nav">
          <Link
            className={`sidebar-nav-link ${activeStage === "inbox" ? "sidebar-nav-link-active" : ""}`}
            to="/"
          >
            <span className="sidebar-nav-title">Bandeja de casos</span>
            <span className="sidebar-nav-copy">Entrada comercial y cockpit</span>
          </Link>

          {shellStages.slice(1).map((stage) => (
            <div
              className={`sidebar-nav-link ${activeStage === stage.key ? "sidebar-nav-link-active" : ""}`}
              key={stage.key}
            >
              <span className="sidebar-nav-title">{stage.label}</span>
              <span className="sidebar-nav-copy">{stage.copy}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-module sidebar-module-compact">
          <p className="sidebar-module-label">Estado de demo</p>
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
              <span>Escenarios cargados</span>
              <strong>4</strong>
            </div>
            <div className="sidebar-metric-row">
              <span>Caso manual</span>
              <strong>{dashboardMetrics.hasManualCase ? "Listo" : "Disponible"}</strong>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="print-hidden app-topbar">
          <div className="app-topbar-inner">
            <div className="topbar-meta">
              <p className="topbar-status">Vista activa</p>
              <h2 className="topbar-title">{activeStageData.label}</h2>
              <p className="topbar-copy">{activeStageData.copy}</p>
            </div>

            <div className="topbar-actions">
              <button className="secondary-button" onClick={() => resetDemo()} type="button">
                Reiniciar simulacion
              </button>
              <button
                className="primary-button"
                onClick={() => navigate(getCaseRoute(nextCase))}
                type="button"
              >
                {dashboardMetrics.pending === dashboardMetrics.total
                  ? "Iniciar demo"
                  : "Continuar demo"}
              </button>
            </div>
          </div>
        </header>

        <div className="app-shell-body">{children}</div>
      </div>
    </div>
  );
}
