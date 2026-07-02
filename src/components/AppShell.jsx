import { Link } from "react-router-dom";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-cloud text-ink">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="print-hidden relative mb-6 overflow-hidden rounded-[28px] border border-white/70 bg-hero-audit px-6 py-5 shadow-card">
          <div className="hero-spot pointer-events-none absolute inset-y-0 right-0 w-72" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-200 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent shadow-soft">
                  Demo sponsor-ready
                </span>
                <span className="rounded-full border border-white/70 bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Sin backend
                </span>
                <span className="rounded-full border border-white/70 bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  4 escenarios guiados
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-accent/70">
                Grupo Saesa / OnAssist
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white shadow-soft">
                  AT
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-[-0.04em] text-slate-950">
                    Agente de Auditoria Tecnica
                  </h1>
                  <p className="text-sm text-muted">
                    Demo ejecutiva para explicar extraccion, criterio tecnico, override humano y regla financiera.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-[22px] border border-white/80 bg-white/80 px-4 py-3 text-sm text-muted shadow-soft">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent/70">
                  Entorno actual
                </p>
                <p className="mt-1 font-semibold text-slate-950">4 casos mock listos para demo</p>
              </div>
              <Link className="primary-button" to="/">
                Volver a bandeja
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
