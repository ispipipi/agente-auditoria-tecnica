import { Link, useNavigate } from "react-router-dom";
import { useDemo } from "../context/DemoContext";

export function AppShell({ children }) {
  const navigate = useNavigate();
  const { dashboardMetrics, getRecommendedCase, getCaseRoute, resetDemo } = useDemo();
  const nextCase = getRecommendedCase();

  return (
    <div className="app-shell">
      <header className="print-hidden app-topbar">
        <div className="app-topbar-inner">
          <div className="brand-lockup">
            <div className="brand-mark">AT</div>
            <div>
              <p className="brand-kicker">Demo producto</p>
              <h1 className="brand-title">Agente de Auditoria Tecnica</h1>
            </div>
          </div>

          <nav className="app-nav">
            <Link className="nav-link nav-link-active" to="/">
              Bandeja
            </Link>
            <span className="nav-link nav-link-muted">Flujo tecnico</span>
            <span className="nav-link nav-link-muted">Cierre y override</span>
          </nav>

          <div className="topbar-actions">
            <button
              className="secondary-button"
              onClick={() => resetDemo()}
              type="button"
            >
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

      <div className="app-shell-body">
        {children}
      </div>
    </div>
  );
}
