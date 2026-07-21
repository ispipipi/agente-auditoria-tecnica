import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDemo } from "../context/DemoContext";

const shellStages = [
  {
    key: "inbox",
    label: "Bandeja",
    copy: "Casos, narrativa comercial y valor visible",
    impact: "Visibilidad ejecutiva del flujo completo",
  },
  {
    key: "extraction",
    label: "Extraccion",
    copy: "Integridad, calidad y filtro documental",
    impact: "Menos reproceso desde el primer gate",
  },
  {
    key: "decision",
    label: "Reglas",
    copy: "Criterio tecnico con recomendacion explicable",
    impact: "Decisiones defendibles frente a cliente y analista",
  },
  {
    key: "financial",
    label: "Financiero",
    copy: "Simulacion economica y propuesta de payout",
    impact: "Cierre mas rapido con criterio economico editable",
  },
  {
    key: "result",
    label: "Cierre",
    copy: "Override, trazabilidad y salida ejecutiva",
    impact: "Control humano sin perder velocidad",
  },
];

function getActiveStage(pathname) {
  if (pathname.includes("/extraccion")) return "extraction";
  if (pathname.includes("/decision")) return "decision";
  if (pathname.includes("/financiero")) return "financial";
  if (pathname.includes("/resultado")) return "result";
  return "inbox";
}

function getCurrentCaseId(pathname) {
  const match = pathname.match(/\/caso\/([^/]+)/);
  return match?.[1] ?? null;
}

function getStagePath(stageKey, caseId) {
  if (stageKey === "inbox") return "/";
  if (!caseId) return "/";

  if (stageKey === "extraction") return `/caso/${caseId}/extraccion`;
  if (stageKey === "decision") return `/caso/${caseId}/decision`;
  if (stageKey === "financial") return `/caso/${caseId}/financiero`;
  return `/caso/${caseId}/resultado`;
}

export function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { dashboardMetrics, getRecommendedCase, getCaseRoute, resetDemo } = useDemo();
  const nextCase = getRecommendedCase();
  const currentCaseId = getCurrentCaseId(location.pathname) ?? nextCase?.idTicket ?? null;
  const activeStage = getActiveStage(location.pathname);
  const activeStageData = shellStages.find((stage) => stage.key === activeStage) ?? shellStages[0];
  const completedCases = dashboardMetrics.closed;
  const completionRatio = Math.round((completedCases / dashboardMetrics.total) * 100);
  const reviewedCases = dashboardMetrics.inReview + dashboardMetrics.closed;

  function handleResetDemo() {
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
          <p className="sidebar-module-label">Plataforma SaaS</p>
          <h2 className="sidebar-module-title">Resolucion clara para casos tecnicos</h2>
          <p className="sidebar-module-copy">
            Una experiencia pensada para mostrar velocidad operativa, criterio explicable y
            control humano en un flujo completo de punta a punta.
          </p>
        </div>

        <nav className="app-sidebar-nav">
          {shellStages.map((stage) => (
            <Link
              className={`sidebar-nav-link ${activeStage === stage.key ? "sidebar-nav-link-active" : ""}`}
              key={stage.key}
              to={getStagePath(stage.key, currentCaseId)}
            >
              <span className="sidebar-nav-title">
                {stage.key === "inbox" ? "Bandeja de casos" : stage.label}
              </span>
              <span className="sidebar-nav-copy">
                {stage.key === "inbox" ? "Entrada comercial y cockpit" : stage.copy}
              </span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-proof-card">
          <p className="sidebar-module-label">Valor visible</p>
          <div className="sidebar-proof-item">
            <strong>Filtra antes</strong>
            <span>Detecta expedientes incompletos antes de consumir revision experta.</span>
          </div>
          <div className="sidebar-proof-item">
            <strong>Explica mejor</strong>
            <span>Convierte narrativa tecnica en una recomendacion entendible y trazable.</span>
          </div>
          <div className="sidebar-proof-item">
            <strong>Cierra con control</strong>
            <span>Propone payout, habilita override y deja salida lista para presentacion.</span>
          </div>
        </div>

        <div className="sidebar-module sidebar-module-compact">
          <p className="sidebar-module-label">Momentum de demo</p>
          <div className="sidebar-metric-row">
            <span>Casos con avance</span>
            <strong>
              {reviewedCases}/{dashboardMetrics.total}
            </strong>
          </div>
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
              <span>Historias listas</span>
              <strong>4 playbooks</strong>
            </div>
            <div className="sidebar-metric-row">
              <span>Stress test manual</span>
              <strong>{dashboardMetrics.hasManualCase ? "Configurado" : "Disponible"}</strong>
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

            <div className="topbar-value-card">
              <p className="topbar-value-label">Valor para negocio</p>
              <strong>{activeStageData.impact}</strong>
            </div>

            <div className="topbar-actions">
              <button className="secondary-button" onClick={handleResetDemo} type="button">
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
