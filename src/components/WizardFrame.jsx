import { Link } from "react-router-dom";
import { formatDate } from "../lib/formatters";
import { CaseStatusBadge } from "./CaseStatusBadge";

const steps = [
  { title: "Extraccion", path: "extraccion" },
  { title: "Decision", path: "decision" },
  { title: "Financiero", path: "financiero" },
  { title: "Resultado", path: "resultado" },
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
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6">
        <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-accent/70">
                {eyebrow}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.05em] text-slate-950">
                {title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                Ticket {caseItem.idTicket} · {caseItem.tipoArtefacto} {caseItem.marca}{" "}
                {caseItem.modelo} · visita {formatDate(caseItem.fechaVisita)}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <CaseStatusBadge pendingLabel={caseItem.escenario} />
              <Link className="secondary-button print-hidden" to="/">
                Ir a bandeja
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {steps.map((step, index) => {
              const isActive = currentStep === index;
              const isComplete = currentStep > index;
              return (
                <div
                  key={step.path}
                  className={`rounded-2xl border px-4 py-4 ${
                    isActive
                      ? "border-cyan-300 bg-cyan-50"
                      : isComplete
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Paso {index + 1}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{step.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-soft">
          {children}
        </div>

        {actions ? (
          <div className="print-hidden flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/80 bg-white/88 px-5 py-4 shadow-soft">
            <Link className="secondary-button" to="/">
              Volver a la bandeja
            </Link>
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          </div>
        ) : null}
      </section>

      <aside className="space-y-6">
        <div className="rounded-[28px] border border-white/80 bg-slate-950 p-6 text-white shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Resumen del caso
          </p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-white/55">Cliente</dt>
              <dd className="mt-1 font-semibold">{caseItem.nCliente}</dd>
            </div>
            <div>
              <dt className="text-white/55">Componentes</dt>
              <dd className="mt-1 font-semibold">{caseItem.componentesDeteriorados}</dd>
            </div>
            <div>
              <dt className="text-white/55">Servicio tecnico</dt>
              <dd className="mt-1 font-semibold">{caseItem.razonSocialServicio}</dd>
            </div>
            <div>
              <dt className="text-white/55">Tecnico responsable</dt>
              <dd className="mt-1 font-semibold">{caseItem.tecnicoResponsable}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-soft">
          {aside}
        </div>
      </aside>
    </div>
  );
}
