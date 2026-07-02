import { useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../lib/formatters";
import { CaseStatusBadge } from "./CaseStatusBadge";
import { WorkflowStateBadge } from "./WorkflowStateBadge";
import { useDemo } from "../context/DemoContext";

const steps = [
  { title: "Extraccion", path: "extraccion" },
  { title: "Criterio tecnico", path: "decision" },
  { title: "Regla financiera", path: "financiero" },
  { title: "Cierre y override", path: "resultado" },
];

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

  useEffect(() => {
    visitStep(caseItem, steps[currentStep].path);
  }, [caseItem, currentStep, visitStep]);

  return (
    <div className="wizard-shell">
      <section className="wizard-main">
        <div className="surface-card surface-card-hero">
          <div className="surface-eyebrow-row">
            <div>
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
              <Link className="secondary-button" to="/">
                Volver a bandeja
              </Link>
            </div>
          </div>

          <div className="stepper-grid">
            {steps.map((step, index) => {
              const isActive = currentStep === index;
              const isComplete = currentStep > index || caseState.status === "closed";

              return (
                <div
                  key={step.path}
                  className={`step-card ${isActive ? "step-card-active" : ""} ${
                    isComplete ? "step-card-complete" : ""
                  }`}
                >
                  <p className="step-label">Paso {index + 1}</p>
                  <p className="step-title">{step.title}</p>
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
        <div className="summary-card summary-card-dark">
          <p className="summary-kicker">Resumen del caso</p>
          <dl className="summary-list">
            <div>
              <dt>Cliente</dt>
              <dd>{caseItem.nCliente}</dd>
            </div>
            <div>
              <dt>Componentes</dt>
              <dd>{caseItem.componentesDeteriorados}</dd>
            </div>
            <div>
              <dt>Servicio tecnico</dt>
              <dd>{caseItem.razonSocialServicio}</dd>
            </div>
            <div>
              <dt>Tecnico responsable</dt>
              <dd>{caseItem.tecnicoResponsable}</dd>
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
