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
        title="Regla financiera del 70%"
        actions={
          <Link className="primary-button" to={`/caso/${caseItem.idTicket}/resultado`}>
            Ver resultado final
          </Link>
        }
        aside={
          <div className="space-y-4">
            <FinancialBlock label="Fuente simulada" value={marketInfo.source} />
            <FinancialBlock
              label="Decision financiera"
              value={analysis.financial.decision}
            />
            <FinancialBlock
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
        <div className="grid gap-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Precio de mercado editable
            </p>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-4 md:grid-cols-3">
                <MoneyCard
                  label="Precio de mercado"
                  value={
                    <input
                      className="money-input"
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

              <div className="rounded-[24px] bg-slate-950 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                  Resultado automatico
                </p>
                <p className="mt-3 text-2xl font-bold">{analysis.financial.decision}</p>
                <p className="mt-3 text-sm leading-7 text-white/76">{analysis.financial.summary}</p>
                {analysis.financial.decision === DECISION_LABELS.indemnify ? (
                  <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/88">
                    Nota demo: adjuntar link de respaldo de mercado en produccion.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-mist p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Regla aplicada</p>
              <p className="mt-3 text-sm leading-7 text-slate-950">
                Si el presupuesto es menor o igual al 70% del valor comercial, el agente recomienda
                reparar. Si lo supera, recomienda indemnizar.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-mist p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Contexto del caso</p>
              <p className="mt-3 text-sm leading-7 text-slate-950">
                La fuente de precio es mock editable para la demo; el recalculo ocurre al instante
                sin persistencia entre sesiones.
              </p>
            </div>
          </div>
        </div>
      </WizardFrame>
    </AppShell>
  );
}

function FinancialBlock({ label, value }) {
  return (
    <div className="rounded-2xl bg-mist p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function MoneyCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-mist p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <div className="mt-3 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}
