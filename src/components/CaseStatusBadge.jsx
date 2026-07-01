import { getDecisionTone } from "../lib/decisionEngine";

const toneClasses = {
  repair: "border-emerald-200 bg-emerald-50 text-emerald-700",
  indemnify: "border-amber-200 bg-amber-50 text-amber-700",
  reject: "border-rose-200 bg-rose-50 text-rose-700",
  incomplete: "border-slate-200 bg-slate-100 text-slate-700",
  manual: "border-sky-200 bg-sky-50 text-sky-700",
  pending: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

export function CaseStatusBadge({ decision, pendingLabel = "Pendiente de analisis" }) {
  const tone = decision ? getDecisionTone(decision) : "pending";
  const label = decision ?? pendingLabel;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
