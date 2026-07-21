import { Navigate, Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { WizardFrame } from "../components/WizardFrame";
import { useDemo } from "../context/DemoContext";
import { DECISION_LABELS } from "../lib/decisionEngine";
import { formatCurrency } from "../lib/formatters";

export function FinancialPage() {
  const { id } = useParams();
  const { getCaseById, getAgentAnalysis, getMarketPriceForCase, updateMarketPrice } = useDemo();
  const caseItem = getCaseById(id);

  if (!caseItem) {
    return <Navigate to="/" replace />;
  }

  const analysis = getAgentAnalysis(caseItem);
  const marketInfo = getMarketPriceForCase(caseItem);

  if (!analysis.canAdvanceToFinancial) {
    return <Navigate to={`/caso/${caseItem.idTicket}/resultado`} replace />;
  }

  return (
    <AppShell>
      <WizardFrame
        caseItem={caseItem}
        currentStep={2}
        eyebrow="Paso 3"
        title="Motor economico y simulador de payout"
        actions={
          <Link className="primary-button" to={`/caso/${caseItem.idTicket}/resultado`}>
            Continuar al cierre del caso
          </Link>
        }
        aside={
          <div className="insight-stack">
            <InsightTile label="Fuente simulada" value={marketInfo.source} />
            <InsightTile label="Decision financiera" value={analysis.financial.decision} />
            <InsightTile
              label="Monto sugerido"
              value={
                analysis.financial.decision === DECISION_LABELS.indemnify
                  ? formatCurrency(marketInfo.value)
                  : formatCurrency(caseItem.presupuestoReparacion)
              }
            />
          </div>
        }
      >
        <div className="analysis-grid single-flow">
          <div className="value-banner">
            <div>
              <p className="section-kicker">Valor para negocio</p>
              <h3 className="section-title small">
                Aterriza la recomendacion tecnica en una propuesta economica editable y defendible.
              </h3>
            </div>
            <div className="value-banner-metrics">
              <div className="value-banner-stat">
                <strong>Regla visible</strong>
                <span>El umbral financiero se entiende en segundos.</span>
              </div>
              <div className="value-banner-stat">
                <strong>Simulacion en vivo</strong>
                <span>Permite tensionar escenarios comerciales durante la demo.</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="section-heading compact">
              <div>
                <p className="section-kicker">Motor economico</p>
                <h3 className="section-title">Calculadora editable para cierre con criterio</h3>
              </div>
            </div>

            <div className="finance-grid">
              <MoneyCard
                label="Precio de mercado"
                value={
                  <input
                    className="money-input finance-input"
                    min="0"
                    onChange={(event) => updateMarketPrice(caseItem, event.target.value)}
                    type="number"
                    value={marketInfo.value ?? ""}
                  />
                }
              />
              <MoneyCard
                label="Umbral 70%"
                value={formatCurrency(analysis.financial.threshold)}
              />
              <MoneyCard
                label="Presupuesto reparacion"
                value={formatCurrency(caseItem.presupuestoReparacion)}
              />
            </div>
          </div>

          <div className="finance-outcome-card">
            <p className="field-label">Resultado automatico</p>
            <h3 className="finance-outcome-title">{analysis.financial.decision}</h3>
            <p className="finance-outcome-copy">{analysis.financial.summary}</p>

            <div className="finance-rule-box">
              Si el presupuesto es menor o igual al 70% del valor comercial, el agente propone
              reparar. Si lo supera, propone indemnizar y dejar una salida mas consistente para el
              equipo.
            </div>

            {analysis.financial.decision === DECISION_LABELS.indemnify ? (
              <div className="finance-note">
                En produccion aqui se adjuntaria la referencia de mercado usada como respaldo.
              </div>
            ) : null}
          </div>
        </div>
      </WizardFrame>
    </AppShell>
  );
}

function InsightTile({ label, value }) {
  return (
    <div className="insight-tile">
      <p className="field-label">{label}</p>
      <p className="field-value">{value}</p>
    </div>
  );
}

function MoneyCard({ label, value }) {
  return (
    <div className="field-card">
      <p className="field-label">{label}</p>
      <div className="field-value finance-card-value">{value}</div>
    </div>
  );
}
