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
    getCaseRoute,
    getCaseState,
    getAgentAnalysis,
    getMarketPriceForCase,
    getFinalDecision,
    getRecommendedCase,
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
  const caseState = getCaseState(caseItem);
  const isClosed = caseState.status === "closed";
  const nextCase = getRecommendedCase(caseItem.idTicket);
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
    setShowOverrideForm(false);
    setComment("");
    setError("");
  }

  function handleOverrideSubmit(event) {
    event.preventDefault();

    if (!comment.trim()) {
      setError("Debes indicar el motivo del cambio.");
      return;
    }

    saveOverride(caseItem, selectedDecision, comment.trim());
    setShowOverrideForm(false);
    setComment("");
    setError("");
  }

  return (
    <AppShell>
      <WizardFrame
        caseItem={caseItem}
        currentStep={3}
        eyebrow="Paso 4"
        title="Resolucion ejecutiva, override y salida premium"
        aside={
          <div className="insight-stack">
            <InsightTile label="Decision agente" value={analysis.decision} />
            <InsightTile label="Decision final" value={finalDecision} />
            <InsightTile label="Intervencion humana" value={interventionLabel} />
            <InsightTile label="Exportacion" value="Vista lista para impresion o PDF" />
          </div>
        }
      >
        <div className="space-y-6">
          <div className="executive-strip">
            <div>
              <p className="section-kicker">Salida ejecutiva</p>
              <h3 className="section-title small">Un cierre que el equipo tecnico puede explicar y negocio puede presentar.</h3>
            </div>
            <div className="executive-strip-metrics">
              <div>
                <strong>{effectiveDecision}</strong>
                <span>Decision final visible</span>
              </div>
              <div>
                <strong>{override?.intervencionHumana ? "Con override" : "Sin override"}</strong>
                <span>Control humano trazado</span>
              </div>
              <div>
                <strong>{formatCurrency(caseItem.presupuestoReparacion)}</strong>
                <span>Salida economica lista</span>
              </div>
            </div>
          </div>

          <div className="value-banner">
            <div>
              <p className="section-kicker">Valor de cierre</p>
              <h3 className="section-title small">
                La plataforma acelera la resolucion, pero deja la ultima palabra en manos del equipo.
              </h3>
            </div>
            <div className="value-banner-metrics">
              <div className="value-banner-stat">
                <strong>Trazabilidad final</strong>
                <span>La recomendacion y el ajuste humano quedan documentados.</span>
              </div>
              <div className="value-banner-stat">
                <strong>Salida lista</strong>
                <span>El caso queda listo para impresion, PDF o presentacion ejecutiva.</span>
              </div>
            </div>
          </div>

          <div className="closure-banner">
            <div>
              <p className="section-kicker">Resultado consolidado</p>
              <h3 className="closure-title">{effectiveDecision}</h3>
              <p className="section-copy">{finalSummary}</p>
            </div>
            <CaseStatusBadge decision={effectiveDecision} />
          </div>

          {isClosed ? (
            <div className="success-strip">
              <div>
                <p className="section-kicker">Caso cerrado</p>
                <h3 className="section-title small">La simulacion ya registro el cierre de este ticket</h3>
                <p className="section-copy">
                  Puedes volver a la bandeja o continuar con el siguiente caso recomendado para
                  completar la demo end-to-end.
                </p>
              </div>
              <div className="hero-actions">
                <button className="secondary-button" onClick={() => navigate("/")} type="button">
                  Volver a bandeja
                </button>
                <button
                  className="primary-button"
                  onClick={() => navigate(getCaseRoute(nextCase))}
                  type="button"
                >
                  Abrir siguiente caso
                </button>
              </div>
            </div>
          ) : null}

          <div className="analysis-grid">
            <div className="analysis-column">
              <div className="info-card">
                <div className="summary-grid">
                  <SummaryCard label="Ticket" value={caseItem.idTicket} />
                  <SummaryCard label="Presupuesto reparacion" value={formatCurrency(caseItem.presupuestoReparacion)} />
                  <SummaryCard label="Precio de mercado" value={formatCurrency(marketInfo.value)} />
                  <SummaryCard label="Umbral 70%" value={formatCurrency(analysis.financial.threshold)} />
                </div>

                <div className="note-panel">
                  <p className="field-label">Nota ejecutiva</p>
                  <p className="note-copy">
                    {override?.intervencionHumana
                      ? `La decision final fue ajustada por analista. Motivo registrado: ${override.comentarioOverride}`
                      : "La decision final coincide con la recomendacion automatica del agente y queda lista para presentacion."}
                  </p>
                </div>
              </div>

              <div className="info-card">
                <p className="section-kicker">Trazabilidad del analisis</p>
                <ol className="trace-list">
                  <TimelineItem
                    title="Extraccion documental"
                    body={
                      analysis.missingFields.length > 0
                        ? `Faltan campos obligatorios: ${analysis.missingFields.join(", ")}.`
                        : "Documento completo para continuar con el flujo normal."
                    }
                  />
                  <TimelineItem
                    title="Matriz tecnica"
                    body={`Aceptacion: ${
                      analysis.acceptanceMatches.join(", ") || "sin coincidencias"
                    }. Rechazo: ${analysis.rejectionMatches.join(", ") || "sin coincidencias"}.`}
                  />
                  <TimelineItem title="Regla financiera" body={analysis.financial.summary} />
                  <TimelineItem title="Decision del agente" body={analysis.decision} />
                </ol>
              </div>
            </div>

            <div className="analysis-column">
              <div className="info-card">
                <p className="section-kicker">Intervencion humana</p>
                <h3 className="section-title small">Control premium antes del cierre</h3>
                <p className="section-copy">
                  Puedes aprobar la salida del agente o reemplazarla por una decision final distinta
                  con trazabilidad obligatoria.
                </p>

                <div className="decision-room-card">
                  <strong>Lo que demuestra esta pantalla</strong>
                  <span>La plataforma recomienda, negocio entiende y el analista conserva la ultima palabra.</span>
                </div>

                {!isClosed ? (
                  <div className="action-stack">
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
                  </div>
                ) : (
                  <div className="closed-badge-box">Estado actual: caso cerrado en simulacion</div>
                )}

                <button
                  className="secondary-button print-hidden w-full"
                  onClick={() => window.print()}
                  type="button"
                >
                  Imprimir / guardar PDF
                </button>

                {showOverrideForm ? (
                  <form className="override-form" onSubmit={handleOverrideSubmit}>
                    <label className="block">
                      <span className="form-label">Nueva decision</span>
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
                      <span className="form-label">Justificacion del override</span>
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
                      Confirmar override y cerrar caso
                    </button>
                  </form>
                ) : null}

                {override?.intervencionHumana ? (
                  <div className="note-panel">
                    <p className="field-label">Ultima justificacion registrada</p>
                    <p className="note-copy">{override.comentarioOverride}</p>
                  </div>
                ) : null}

                <div className="handoff-card">
                  <p className="field-label">Checklist de salida</p>
                  <ul className="value-list">
                    <li>Decision final visible para sponsor.</li>
                    <li>Trazabilidad lista para auditoria interna.</li>
                    <li>Vista preparada para PDF o impresion.</li>
                  </ul>
                </div>
              </div>

              <div className="print-only info-card">
                <p className="section-kicker">Resumen imprimible</p>
                <h3 className="section-title small">{effectiveDecision}</h3>
                <p className="section-copy">{finalSummary}</p>
                <div className="summary-grid two-columns">
                  <SummaryCard label="Cliente" value={caseItem.nCliente} />
                  <SummaryCard label="Fecha visita" value={formatDate(caseItem.fechaVisita)} />
                  <SummaryCard
                    label="Artefacto"
                    value={`${caseItem.tipoArtefacto} ${caseItem.marca} ${caseItem.modelo}`}
                  />
                  <SummaryCard label="Intervencion humana" value={interventionLabel} />
                </div>
              </div>
            </div>
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

function SummaryCard({ label, value }) {
  return (
    <div className="field-card">
      <p className="field-label">{label}</p>
      <p className="field-value">{value}</p>
    </div>
  );
}

function TimelineItem({ title, body }) {
  return (
    <li className="trace-item">
      <p className="check-title">{title}</p>
      <p className="note-copy">{body}</p>
    </li>
  );
}
