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
        title="Matriz de decision logica"
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
          <div className="space-y-4">
            <MetricBlock
              label="Check binario"
              value={caseItem.atribuibleSuministro ? "Si" : "No / vacio"}
            />
            <MetricBlock label="Aceptacion detectada" value={sentenceList(analysis.acceptanceMatches)} />
            <MetricBlock label="Rechazo detectado" value={sentenceList(analysis.rejectionMatches)} />
          </div>
        }
      >
        <div className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-mist p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Paso A · Check binario
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {caseItem.atribuibleSuministro
                  ? "Atribuible al suministro"
                  : "No atribuible por check binario"}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                {caseItem.atribuibleSuministro
                  ? "El informe habilita la revision semantica para confirmar el criterio del tecnico."
                  : "El caso se cierra sin pasar por la regla financiera."}
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Resultado de la matriz
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-950">{analysis.decision}</p>
              <p className="mt-3 text-sm leading-7 text-muted">{analysis.narrative}</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Paso B · Analisis semantico
            </p>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
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

function MetricBlock({ label, value }) {
  return (
    <div className="rounded-2xl bg-mist p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function TextEvidenceCard({ title, text, keywords }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-mist p-5">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-4 text-sm leading-7 text-muted">
        <KeywordText keywords={keywords} text={text} />
      </p>
    </div>
  );
}
