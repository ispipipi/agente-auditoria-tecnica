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
        title="Extraccion documental y control de integridad"
        actions={
          analysis.canAdvanceFromExtraction ? (
            <Link className="primary-button" to={`/caso/${caseItem.idTicket}/decision`}>
              Continuar al criterio tecnico
            </Link>
          ) : (
            <Link className="primary-button" to={`/caso/${caseItem.idTicket}/resultado`}>
              Ir al cierre por alerta
            </Link>
          )
        }
        aside={
          <div className="insight-stack">
            <InsightTile
              label="Firma tecnica"
              value={caseItem.firmaTecnicoPresente ? "Validada" : "Ausente"}
            />
            <InsightTile
              label="Evidencia fotografica"
              value={caseItem.evidenciaFotografica ? "Adjunta" : "No adjunta"}
            />
            <InsightTile
              label="Campos faltantes"
              value={analysis.missingFields.length > 0 ? analysis.missingFields.join(", ") : "Ninguno"}
            />
          </div>
        }
      >
        <div className="analysis-grid">
          <div className="analysis-column">
            <div className="info-card">
              <div className="section-heading compact">
                <div>
                  <p className="section-kicker">Documento fuente</p>
                  <h3 className="section-title">Extraccion estructurada del informe tecnico</h3>
                </div>
              </div>

              <div className="field-grid">
                {[
                  ["ID Ticket", caseItem.idTicket],
                  ["Tipo de artefacto", caseItem.tipoArtefacto],
                  ["Marca", caseItem.marca],
                  ["Modelo", caseItem.modelo],
                  ["Numero de serie", caseItem.numeroSerie || "No informado"],
                  ["Componentes afectados", caseItem.componentesDeteriorados],
                ].map(([label, value]) => (
                  <div className="field-card" key={label}>
                    <p className="field-label">{label}</p>
                    <p className="field-value">{value}</p>
                  </div>
                ))}
              </div>

              <div className="note-panel">
                <p className="field-label">Comentarios del tecnico</p>
                <p className="note-copy">
                  {caseItem.comentariosObservaciones || "Sin observaciones registradas."}
                </p>
              </div>
            </div>
          </div>

          <div className="analysis-column">
            <div className="info-card">
              <p className="section-kicker">Checklist de calidad</p>
              <div className="checklist-stack">
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
              <div className="info-card">
                <p className="section-kicker">Vista previa de evidencia</p>
                <img
                  alt="Evidencia fotografica generica"
                  className="evidence-image"
                  src={`${import.meta.env.BASE_URL}evidence-placeholder.svg`}
                />
              </div>
            ) : null}

            <div className={`info-card ${analysis.missingFields.length > 0 ? "info-card-alert" : ""}`}>
              <p className="section-kicker">Estado de integridad</p>
              <h3 className="section-title">
                {analysis.missingFields.length > 0
                  ? "Caso incompleto: requiere alerta"
                  : "Documento apto para analisis automatico"}
              </h3>
              <p className="section-copy">
                {analysis.missingFields.length > 0
                  ? `Faltan estos campos obligatorios: ${analysis.missingFields.join(", ")}.`
                  : "La informacion minima requerida esta presente para continuar con criterio tecnico y decision."}
              </p>
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

function ValidationRow({ label, value, okText, badText }) {
  return (
    <div className="check-row">
      <div>
        <p className="check-title">{label}</p>
        <p className="check-copy">{value ? okText : badText}</p>
      </div>
      <span className={`check-icon ${value ? "check-icon-ok" : "check-icon-bad"}`}>
        {value ? "✓" : "!"}
      </span>
    </div>
  );
}
