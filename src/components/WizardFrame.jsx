import { useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../lib/formatters";
import { CaseStatusBadge } from "./CaseStatusBadge";
import { WorkflowStateBadge } from "./WorkflowStateBadge";
import { useDemo } from "../context/DemoContext";

const steps = [
  {
    title: "Extraccion",
    path: "extraccion",
    copy: "Valida integridad y evita reproceso temprano.",
    value: "Gate documental",
  },
  {
    title: "Criterio tecnico",
    path: "decision",
    copy: "Explica la recomendacion con señales visibles.",
    value: "Decision explicable",
  },
  {
    title: "Regla financiera",
    path: "financiero",
    copy: "Simula payout y criterio economico editable.",
    value: "Payout defendible",
  },
  {
    title: "Cierre y override",
    path: "resultado",
    copy: "Deja trazabilidad, control humano y salida final.",
    value: "Cierre controlado",
  },
];

function canOpenStep(index, currentStep, caseState) {
  if (caseState.status === "closed") return true;
  if (index === currentStep) return true;
  return index <= caseState.lastVisitedStep;
}

export function WizardFrame({
  caseItem,
  currentStep,
  title,
  eyebrow,
  children,
  actions,
  aside,
}) {
  const { getCaseState, getFinalDecision, visitStep } = useDemo();
  const caseState = getCaseState(caseItem);
  const completionValue = Math.round(((currentStep + 1) / steps.length) * 100);
  const currentStepMeta = steps[currentStep];

  useEffect(() => {
    visitStep(caseItem, steps[currentStep].path);
  }, [caseItem, currentStep, visitStep]);

  return (
    <div className="wizard-shell">
      <section className="wizard-main">
        <div className="surface-card surface-card-hero">
          <div className="surface-eyebrow-row">
            <div className="surface-copy-block">
              <p className="surface-eyebrow">{eyebrow}</p>
              <h2 className="surface-title">{title}</h2>
              <p className="surface-copy">
                Ticket {caseItem.idTicket} · {caseItem.tipoArtefacto} {caseItem.marca}{" "}
                {caseItem.modelo} · visita {formatDate(caseItem.fechaVisita)}
              </p>
            </div>

            <div className="wizard-hero-actions">
              <WorkflowStateBadge state={caseState.status} />
              <CaseStatusBadge
                decision={caseState.status === "closed" ? getFinalDecision(caseItem) : undefined}
                pendingLabel={caseItem.escenario}
              />
              <Link className="secondary-button" to="/casos">
                Volver a bandeja
              </Link>
            </div>
          </div>

          <div className="wizard-progress-panel">
            <div className="wizard-progress-metric">
              <p className="field-label">Paso actual</p>
              <strong>{currentStep + 1} de 4</strong>
              <span>{currentStepMeta.title}</span>
            </div>
            <div>
              <p className="field-label">Objetivo</p>
              <div className="wizard-value-chip">{currentStepMeta.value}</div>
            </div>
            <p className="wizard-progress-copy">{currentStepMeta.copy}</p>
            <div className="progress-track wizard-progress-track">
              <span className="progress-fill" style={{ width: `${completionValue}%` }} />
            </div>
          </div>

          <div className="stepper-grid">
            {steps.map((step, index) => {
              const isActive = currentStep === index;
              const isComplete = currentStep > index || caseState.status === "closed";
              const isAvailable = canOpenStep(index, currentStep, caseState);

              return isAvailable ? (
                <Link
                  key={step.path}
                  className={`step-card ${isActive ? "step-card-active" : ""} ${
                    isComplete ? "step-card-complete" : ""
                  }`}
                  to={`/caso/${caseItem.idTicket}/${step.path}`}
                >
                  <div className="step-index">{isComplete ? "OK" : `0${index + 1}`}</div>
                  <div>
                    <p className="step-title">{step.title}</p>
                    <p className="step-status-copy">
                      {isActive ? "Paso actual" : isComplete ? "Completado" : "Pendiente"}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="step-card step-card-disabled" key={step.path}>
                  <div className="step-index">{`0${index + 1}`}</div>
                  <div>
                    <p className="step-title">{step.title}</p>
                    <p className="step-status-copy">Pendiente</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface-card">
          {children}
        </div>

        {actions ? <div className="wizard-actions-bar print-hidden">{actions}</div> : null}
      </section>

      <aside className="wizard-aside">
        <div className="summary-card summary-card-compact">
          <p className="summary-kicker">Resumen del caso</p>
          <dl className="summary-list summary-list-compact">
            <div>
              <dt>Cliente</dt>
              <dd>{caseItem.nCliente}</dd>
            </div>
            <div>
              <dt>Artefacto</dt>
              <dd>
                {caseItem.tipoArtefacto} {caseItem.marca}
              </dd>
            </div>
            <div>
              <dt>Componente</dt>
              <dd>{caseItem.componentesDeteriorados}</dd>
            </div>
          </dl>
        </div>

        <div className="summary-card">
          {aside}
        </div>
      </aside>
    </div>
  );
}
