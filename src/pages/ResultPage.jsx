import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { CaseStatusBadge } from "../components/CaseStatusBadge";
import { WizardFrame } from "../components/WizardFrame";
import { useDemo } from "../context/DemoContext";
import { DECISION_LABELS } from "../lib/decisionEngine";
import { formatCurrency } from "../lib/formatters";

const overrideOptions = [
  DECISION_LABELS.repair,
  DECISION_LABELS.indemnify,
  DECISION_LABELS.reject,
  DECISION_LABELS.incomplete,
];

export function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    overrides,
    getCaseById,
    getAgentAnalysis,
    getMarketPriceForCase,
    getFinalDecision,
    confirmAgentDecision,
    saveOverride,
  } = useDemo();

  const caseItem = getCaseById(id);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(DECISION_LABELS.repair);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  if (!caseItem) {
    return <Navigate to="/" replace />;
  }

  const analysis = getAgentAnalysis(caseItem);
  const marketInfo = getMarketPriceForCase(caseItem);
  const override = overrides[caseItem.idTicket];
  const finalDecision = getFinalDecision(caseItem);

  function handleApprove() {
    confirmAgentDecision(caseItem);
    navigate("/");
  }

  function handleOverrideSubmit(event) {
    event.preventDefault();

    if (!comment.trim()) {
      setError("Debes indicar el motivo del cambio.");
      return;
    }

    saveOverride(caseItem, selectedDecision, comment.trim());
    navigate("/");
  }

  return (
    <AppShell>
      <WizardFrame
        caseItem={caseItem}
        currentStep={3}
        eyebrow="Paso 4"
        title="Resultado, override y exportacion"
        aside={
          <div className="space-y-4">
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Decision agente</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{analysis.decision}</p>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Decision final</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{finalDecision}</p>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Intervencion humana</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {override?.intervencionHumana ? "Si" : "No"}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Resultado consolidado
                </p>
                <h3 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-slate-950">
                  {caseItem.tipoArtefacto} {caseItem.marca} {caseItem.modelo}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{analysis.narrative}</p>
              </div>
              <CaseStatusBadge decision={finalDecision} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Ticket" value={caseItem.idTicket} />
              <SummaryCard label="Presupuesto reparacion" value={formatCurrency(caseItem.presupuestoReparacion)} />
              <SummaryCard label="Precio de mercado" value={formatCurrency(marketInfo.value)} />
              <SummaryCard
                label="Umbral 70%"
                value={formatCurrency(analysis.financial.threshold)}
              />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-mist p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Trazabilidad del analisis
              </p>
              <ol className="mt-5 space-y-4">
                <TimelineItem
                  title="Extraccion"
                  body={
                    analysis.missingFields.length > 0
                      ? `Faltan campos obligatorios: ${analysis.missingFields.join(", ")}.`
                      : "Documento completo para continuar con el flujo normal."
                  }
                />
                <TimelineItem
                  title="Matriz de decision"
                  body={`Aceptacion: ${
                    analysis.acceptanceMatches.join(", ") || "sin coincidencias"
                  }. Rechazo: ${analysis.rejectionMatches.join(", ") || "sin coincidencias"}.`}
                />
                <TimelineItem
                  title="Regla financiera"
                  body={analysis.financial.summary}
                />
                <TimelineItem
                  title="Decision del agente"
                  body={analysis.decision}
                />
              </ol>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Intervencion humana
              </p>
              <div className="mt-5 space-y-4">
                <button className="primary-button w-full" onClick={handleApprove} type="button">
                  Aprobar decision del agente
                </button>
                <button
                  className="secondary-button w-full"
                  onClick={() => {
                    setSelectedDecision(finalDecision);
                    setShowOverrideForm(true);
                  }}
                  type="button"
                >
                  Anular / Modificar decision
                </button>
                <button
                  className="secondary-button print-hidden w-full"
                  onClick={() => window.print()}
                  type="button"
                >
                  Exportar resumen
                </button>
              </div>

              {showOverrideForm ? (
                <form className="mt-5 space-y-4 border-t border-slate-100 pt-5" onSubmit={handleOverrideSubmit}>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-950">Nueva decision</span>
                    <select
                      className="form-input mt-2"
                      onChange={(event) => setSelectedDecision(event.target.value)}
                      value={selectedDecision}
                    >
                      {overrideOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-950">
                      Justificacion del override
                    </span>
                    <textarea
                      className="form-input mt-2 min-h-28"
                      onChange={(event) => {
                        setComment(event.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Explica por que la decision automatica debe cambiarse."
                      value={comment}
                    />
                  </label>

                  {error ? <p className="text-sm font-semibold text-reject">{error}</p> : null}

                  <button className="primary-button w-full" type="submit">
                    Confirmar override
                  </button>
                </form>
              ) : null}

              {override?.intervencionHumana ? (
                <div className="mt-5 rounded-[24px] bg-mist p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    Ultima justificacion registrada
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-950">
                    {override.comentarioOverride}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </WizardFrame>
    </AppShell>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-[24px] bg-mist p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function TimelineItem({ title, body }) {
  return (
    <li className="rounded-[24px] bg-white px-4 py-4 shadow-soft">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-7 text-muted">{body}</p>
    </li>
  );
}
