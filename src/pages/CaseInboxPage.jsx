import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { CaseStatusBadge } from "../components/CaseStatusBadge";
import { useDemo } from "../context/DemoContext";

export function CaseInboxPage() {
  const navigate = useNavigate();
  const { cases, overrides } = useDemo();

  const reviewedCount = Object.keys(overrides).length;

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-[32px] border border-white/80 bg-slate-950 px-6 py-7 text-white shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-aqua/80">
            Bandeja de casos
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold tracking-[-0.06em]">
            Cuatro escenarios listos para demostrar extraccion, criterio tecnico y decision financiera.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
            Cada caso recorre el wizard completo y permite override humano con trazabilidad.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">Casos cargados</p>
              <p className="mt-3 text-3xl font-bold">{cases.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">Revisados</p>
              <p className="mt-3 text-3xl font-bold">{reviewedCount}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">Estado</p>
              <p className="mt-3 text-xl font-semibold">Mock en memoria</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70">
            Reglas principales
          </p>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-muted">
            <li>Campos obligatorios vacios llevan el caso directo a resultado incompleto.</li>
            <li>Palabras clave atribuyen o rechazan sin necesidad de backend u OCR real.</li>
            <li>La regla del 70% recalcula en tiempo real con precio de mercado editable.</li>
            <li>El analista puede aprobar o reemplazar la decision del agente con justificacion.</li>
          </ul>
        </div>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        {cases.map((caseItem) => {
          const override = overrides[caseItem.idTicket];
          return (
            <button
              key={caseItem.idTicket}
              className="group rounded-[28px] border border-white/80 bg-white/92 p-6 text-left shadow-soft transition hover:-translate-y-1 hover:shadow-card"
              onClick={() => navigate(`/caso/${caseItem.idTicket}/extraccion`)}
              type="button"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/65">
                    Escenario {caseItem.escenario}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.05em] text-slate-950">
                    Ticket {caseItem.idTicket}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {caseItem.tipoArtefacto} {caseItem.marca} {caseItem.modelo}
                  </p>
                </div>

                <CaseStatusBadge decision={override?.decisionFinal} />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-mist p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Hallazgo clave</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {caseItem.descripcionCausaFalla}
                  </p>
                </div>
                <div className="rounded-2xl bg-mist p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Override</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {override?.intervencionHumana ? "Intervenido por analista" : "Sin intervencion"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm font-semibold text-accent">
                  Abrir flujo de analisis
                </span>
                <span className="text-xl text-accent transition group-hover:translate-x-1">→</span>
              </div>
            </button>
          );
        })}
      </section>
    </AppShell>
  );
}
