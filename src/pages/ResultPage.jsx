import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { CaseStatusBadge } from "../components/CaseStatusBadge";
import { WizardFrame } from "../components/WizardFrame";
import { useDemo } from "../context/DemoContext";
import { DECISION_LABELS } from "../lib/decisionEngine";
import { formatCurrency, formatDate } from "../lib/formatters";

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
  const effectiveDecision = override?.decisionFinal ?? analysis.decision;
  const finalSummary =
    effectiveDecision === DECISION_LABELS.repair
      ? "Proceder con reparacion y documentar respaldo de costo."
      : effectiveDecision === DECISION_LABELS.indemnify
        ? "Proceder con indemnizacion y dejar referencia de mercado."
        : effectiveDecision === DECISION_LABELS.reject
          ? "Cerrar reclamo por falla no atribuible al suministro."
          : "Alertar al analista y solicitar antecedentes complementarios.";
  const interventionLabel = override?.intervencionHumana ? "Override confirmado" : "Sin override";

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
                {interventionLabel}
              </p>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Exportacion</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                Vista lista para impresion o PDF
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="screen-only executive-panel rounded-[28px] border border-cyan-100 p-6 shadow-soft">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/70">
                  Instruccion final para sponsor
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.05em] text-slate-950">
                  {effectiveDecision}
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{finalSummary}</p>
              </div>
              <CaseStatusBadge decision={effectiveDecision} />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <ExecutiveMetric
                label="Cierre recomendado"
                value={effectiveDecision}
              />
              <ExecutiveMetric
                label="Origen de la decision"
                value={override?.intervencionHumana ? "Analista con override" : "Agente automatico"}
              />
              <ExecutiveMetric
                label="Fecha del informe"
                value={formatDate(caseItem.fechaVisita)}
              />
            </div>
          </div>

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

            <div className="mt-5 rounded-[24px] border border-slate-200 bg-mist p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Nota ejecutiva
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-950">
                {override?.intervencionHumana
                  ? `La decision final fue ajustada por analista. Motivo registrado: ${override.comentarioOverride}`
                  : "La decision final coincide con la recomendacion automatica del agente y ya esta lista para presentacion."}
              </p>
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
              <p className="mt-3 text-sm leading-7 text-muted">
                Puedes aprobar la salida del agente o reemplazarla por una decision final distinta con trazabilidad obligatoria.
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
                  Imprimir / guardar PDF
                </button>
              </div>

              {showOverrideForm ? (
                <form
                  className="mt-5 space-y-4 rounded-[24px] border border-slate-100 bg-mist/70 p-5"
                  onSubmit={handleOverrideSubmit}
                >
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

          <div className="print-only rounded-[28px] border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Resumen imprimible
            </p>
            <h3 className="mt-3 text-2xl font-bold text-slate-950">{effectiveDecision}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{finalSummary}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SummaryCard label="Cliente" value={caseItem.nCliente} />
              <SummaryCard label="Fecha visita" value={formatDate(caseItem.fechaVisita)} />
              <SummaryCard label="Artefacto" value={`${caseItem.tipoArtefacto} ${caseItem.marca} ${caseItem.modelo}`} />
              <SummaryCard label="Intervencion humana" value={interventionLabel} />
            </div>
          </div>
        </div>
      </WizardFrame>
    </AppShell>
  );
}

function ExecutiveMetric({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/90 bg-white/88 p-4 shadow-soft">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
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
