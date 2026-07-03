import { Navigate, Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { WizardFrame } from "../components/WizardFrame";
import { useDemo } from "../context/DemoContext";

export function ExtractionPage() {
  const { id } = useParams();
  const { getCaseById, getAgentAnalysis, updateCase } = useDemo();
  const caseItem = getCaseById(id);

  if (!caseItem) {
    return <Navigate to="/" replace />;
  }

  const analysis = getAgentAnalysis(caseItem);
  const isManualCase = caseItem.caseOrigin === "manual";

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
              label="Origen del caso"
              value={isManualCase ? "Ingreso manual" : "Ejemplo precargado"}
            />
            <InsightTile
              label="Firma tecnica"
              value={caseItem.firmaTecnicoPresente ? "Validada" : "Ausente"}
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
                  <p className="section-kicker">
                    {isManualCase ? "Caso editable" : "Documento fuente"}
                  </p>
                  <h3 className="section-title">
                    {isManualCase
                      ? "Completa la informacion minima para activar el flujo"
                      : "Extraccion estructurada del informe tecnico"}
                  </h3>
                </div>
              </div>

              {isManualCase ? (
                <div className="manual-edit-grid">
                  <div className="manual-form-grid">
                    <label className="block">
                      <span className="form-label">Cliente</span>
                      <input
                        className="form-input mt-2"
                        onChange={(event) => updateCase(caseItem.idTicket, { nCliente: event.target.value })}
                        value={caseItem.nCliente}
                      />
                    </label>
                    <label className="block">
                      <span className="form-label">Numero de serie</span>
                      <input
                        className="form-input mt-2"
                        onChange={(event) => updateCase(caseItem.idTicket, { numeroSerie: event.target.value })}
                        value={caseItem.numeroSerie ?? ""}
                      />
                    </label>
                  </div>

                  <div className="manual-form-grid">
                    <label className="block">
                      <span className="form-label">Artefacto</span>
                      <input
                        className="form-input mt-2"
                        onChange={(event) => updateCase(caseItem.idTicket, { tipoArtefacto: event.target.value })}
                        value={caseItem.tipoArtefacto}
                      />
                    </label>
                    <label className="block">
                      <span className="form-label">Marca</span>
                      <input
                        className="form-input mt-2"
                        onChange={(event) => updateCase(caseItem.idTicket, { marca: event.target.value })}
                        value={caseItem.marca}
                      />
                    </label>
                  </div>

                  <div className="manual-form-grid">
                    <label className="block">
                      <span className="form-label">Modelo</span>
                      <input
                        className="form-input mt-2"
                        onChange={(event) => updateCase(caseItem.idTicket, { modelo: event.target.value })}
                        value={caseItem.modelo}
                      />
                    </label>
                    <label className="block">
                      <span className="form-label">Componentes afectados</span>
                      <input
                        className="form-input mt-2"
                        onChange={(event) =>
                          updateCase(caseItem.idTicket, {
                            componentesDeteriorados: event.target.value,
                          })
                        }
                        value={caseItem.componentesDeteriorados}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="form-label">Descripcion de causa de falla</span>
                    <textarea
                      className="form-input mt-2 min-h-28"
                      onChange={(event) =>
                        updateCase(caseItem.idTicket, {
                          descripcionCausaFalla: event.target.value,
                        })
                      }
                      value={caseItem.descripcionCausaFalla}
                    />
                  </label>

                  <label className="block">
                    <span className="form-label">Comentarios del tecnico</span>
                    <textarea
                      className="form-input mt-2 min-h-28"
                      onChange={(event) =>
                        updateCase(caseItem.idTicket, {
                          comentariosObservaciones: event.target.value,
                        })
                      }
                      value={caseItem.comentariosObservaciones}
                    />
                  </label>

                  <label className="block">
                    <span className="form-label">Atribuible a suministro</span>
                    <select
                      className="form-input mt-2"
                      onChange={(event) =>
                        updateCase(caseItem.idTicket, {
                          atribuibleSuministro: event.target.value,
                        })
                      }
                      value={
                        caseItem.atribuibleSuministro === null ||
                        caseItem.atribuibleSuministro === undefined
                          ? "null"
                          : String(caseItem.atribuibleSuministro)
                      }
                    >
                      <option value="null">Sin definir</option>
                      <option value="true">Si</option>
                      <option value="false">No</option>
                    </select>
                  </label>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          <div className="analysis-column">
            <div className="info-card">
              <p className="section-kicker">Checklist de calidad</p>
              <div className="checklist-stack">
                <ValidationRow
                  editable={isManualCase}
                  label="Autoria tecnica"
                  onToggle={(checked) =>
                    updateCase(caseItem.idTicket, { firmaTecnicoPresente: checked })
                  }
                  value={caseItem.firmaTecnicoPresente}
                  okText="Firma presente"
                  badText="Falta firma del tecnico"
                />
                <ValidationRow
                  editable={isManualCase}
                  label="Evidencia fotografica"
                  onToggle={(checked) =>
                    updateCase(caseItem.idTicket, { evidenciaFotografica: checked })
                  }
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

function ValidationRow({ label, value, okText, badText, editable = false, onToggle }) {
  return (
    <div className="check-row">
      <div>
        <p className="check-title">{label}</p>
        <p className="check-copy">{value ? okText : badText}</p>
      </div>
      {editable ? (
        <label className="check-switch">
          <input checked={value} onChange={(event) => onToggle(event.target.checked)} type="checkbox" />
          <span>{value ? "Si" : "No"}</span>
        </label>
      ) : (
        <span className={`check-icon ${value ? "check-icon-ok" : "check-icon-bad"}`}>
          {value ? "✓" : "!"}
        </span>
      )}
    </div>
  );
}
