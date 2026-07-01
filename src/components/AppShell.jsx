import { Link } from "react-router-dom";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-cloud text-ink">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="print-hidden mb-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-hero-audit px-6 py-5 shadow-card md:flex-row md:items-center md:justify-between">
          <div>
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
                  Demo MVP para trazabilidad de analisis, matriz de decision y regla financiera.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm text-muted shadow-soft">
              4 casos mock listos para demo
            </div>
            <Link className="primary-button" to="/">
              Volver a bandeja
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
