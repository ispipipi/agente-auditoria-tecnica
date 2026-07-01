import { Navigate, Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { WizardFrame } from "../components/WizardFrame";
import { useDemo } from "../context/DemoContext";

export function ExtractionPage() {
  const { id } = useParams();
  const { getCaseById, getAgentAnalysis } = useDemo();
  const caseItem = getCaseById(id);

  if (!caseItem) {
    return <Navigate to="/" replace />;
  }

  const analysis = getAgentAnalysis(caseItem);

  return (
    <AppShell>
      <WizardFrame
        caseItem={caseItem}
        currentStep={0}
        eyebrow="Paso 1"
        title="Extraccion de datos y validacion documental"
        actions={
          analysis.canAdvanceFromExtraction ? (
            <Link className="primary-button" to={`/caso/${caseItem.idTicket}/decision`}>
              Continuar a decision
            </Link>
          ) : (
            <Link className="primary-button" to={`/caso/${caseItem.idTicket}/resultado`}>
              Ver resultado incompleto
            </Link>
          )
        }
        aside={
          <div className="space-y-4">
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Firma tecnica</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {caseItem.firmaTecnicoPresente ? "Validada" : "Ausente"}
              </p>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Evidencia</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {caseItem.evidenciaFotografica ? "Adjunta" : "No adjunta"}
              </p>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Campos faltantes</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {analysis.missingFields.length > 0
                  ? analysis.missingFields.join(", ")
                  : "Ninguno"}
              </p>
            </div>
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-mist p-5">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/65">
                Documento simulado
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ["ID Ticket", caseItem.idTicket],
                  ["Tipo de artefacto", caseItem.tipoArtefacto],
                  ["Marca", caseItem.marca],
                  ["Modelo", caseItem.modelo],
                  ["Numero de serie", caseItem.numeroSerie || "No informado"],
                  ["Componentes", caseItem.componentesDeteriorados],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-accent/65">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                  Comentarios del tecnico
                </p>
                <p className="mt-3 text-sm leading-7 text-white/82">
                  {caseItem.comentariosObservaciones || "Sin observaciones registradas."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted">
                Validaciones
              </p>
              <div className="mt-4 space-y-3">
                <ValidationRow
                  label="Autoria tecnica"
                  value={caseItem.firmaTecnicoPresente}
                  okText="Firma presente"
                  badText="Falta firma del tecnico"
                />
                <ValidationRow
                  label="Evidencia fotografica"
                  value={caseItem.evidenciaFotografica}
                  okText="Adjunto visual disponible"
                  badText="Sin evidencia fotografica"
                />
              </div>
            </div>

            {caseItem.evidenciaFotografica ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted">
                  Thumbnail de evidencia
                </p>
                <img
                  alt="Evidencia fotografica generica"
                  className="mt-4 w-full rounded-[24px] border border-slate-200 bg-mist object-cover"
                  src={`${import.meta.env.BASE_URL}evidence-placeholder.svg`}
                />
              </div>
            ) : null}

            {analysis.missingFields.length > 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-100 p-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted">
                  Alerta de integridad
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  Caso Incompleto - Alertar
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Faltan estos campos obligatorios: {analysis.missingFields.join(", ")}.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </WizardFrame>
    </AppShell>
  );
}

function ValidationRow({ label, value, okText, badText }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-mist px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-950">{label}</p>
        <p className="text-xs text-muted">{value ? okText : badText}</p>
      </div>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-bold ${
          value ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        }`}
      >
        {value ? "✓" : "✕"}
      </span>
    </div>
  );
}
