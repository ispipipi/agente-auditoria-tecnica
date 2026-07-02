import { Navigate, Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { KeywordText } from "../components/KeywordText";
import { WizardFrame } from "../components/WizardFrame";
import { useDemo } from "../context/DemoContext";
import { sentenceList } from "../lib/formatters";

export function DecisionPage() {
  const { id } = useParams();
  const { getCaseById, getAgentAnalysis } = useDemo();
  const caseItem = getCaseById(id);

  if (!caseItem) {
    return <Navigate to="/" replace />;
  }

  const analysis = getAgentAnalysis(caseItem);

  if (analysis.missingFields.length > 0) {
    return <Navigate to={`/caso/${caseItem.idTicket}/resultado`} replace />;
  }

  const positiveFlow = analysis.canAdvanceToFinancial;

  return (
    <AppShell>
      <WizardFrame
        caseItem={caseItem}
        currentStep={1}
        eyebrow="Paso 2"
        title="Criterio tecnico y matriz de decision"
        actions={
          positiveFlow ? (
            <Link className="primary-button" to={`/caso/${caseItem.idTicket}/financiero`}>
              Continuar a regla financiera
            </Link>
          ) : (
            <Link className="primary-button" to={`/caso/${caseItem.idTicket}/resultado`}>
              Ir al resultado
            </Link>
          )
        }
        aside={
          <div className="insight-stack">
            <InsightTile
              label="Check binario"
              value={caseItem.atribuibleSuministro ? "Atribuible" : "No atribuible / vacio"}
            />
            <InsightTile
              label="Aceptacion detectada"
              value={sentenceList(analysis.acceptanceMatches)}
            />
            <InsightTile
              label="Rechazo detectado"
              value={sentenceList(analysis.rejectionMatches)}
            />
          </div>
        }
      >
        <div className="analysis-grid single-flow">
          <div className="info-card">
            <div className="signal-grid">
              <DecisionSignal
                copy={
                  caseItem.atribuibleSuministro
                    ? "El informe habilita revision semantica para validar el criterio del tecnico."
                    : "El caso se puede cerrar sin pasar por regla financiera."
                }
                label="Check binario"
                title={
                  caseItem.atribuibleSuministro
                    ? "Atribuible al suministro"
                    : "No atribuible por check binario"
                }
              />
              <DecisionSignal
                copy={analysis.narrative}
                label="Resultado de la matriz"
                title={analysis.decision}
              />
            </div>
          </div>

          <div className="info-card">
            <div className="section-heading compact">
              <div>
                <p className="section-kicker">Analisis semantico</p>
                <h3 className="section-title">Evidencias que activan la decision</h3>
              </div>
            </div>

            <div className="evidence-grid">
              <TextEvidenceCard
                title="Descripcion de causa de falla"
                text={caseItem.descripcionCausaFalla}
                keywords={[...analysis.acceptanceMatches, ...analysis.rejectionMatches]}
              />
              <TextEvidenceCard
                title="Comentarios u observaciones"
                text={caseItem.comentariosObservaciones}
                keywords={[...analysis.acceptanceMatches, ...analysis.rejectionMatches]}
              />
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

function DecisionSignal({ label, title, copy }) {
  return (
    <div className="decision-signal">
      <p className="field-label">{label}</p>
      <h3 className="section-title small">{title}</h3>
      <p className="section-copy">{copy}</p>
    </div>
  );
}

function TextEvidenceCard({ title, text, keywords }) {
  return (
    <div className="evidence-card">
      <p className="check-title">{title}</p>
      <p className="note-copy">
        <KeywordText keywords={keywords} text={text} />
      </p>
    </div>
  );
}
