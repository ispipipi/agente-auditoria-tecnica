import { getDecisionTone } from "../lib/decisionEngine";

const toneClasses = {
  repair: "case-badge case-badge-repair",
  indemnify: "case-badge case-badge-indemnify",
  reject: "case-badge case-badge-reject",
  incomplete: "case-badge case-badge-incomplete",
  manual: "case-badge case-badge-manual",
  pending: "case-badge case-badge-pending",
};

export function CaseStatusBadge({ decision, pendingLabel = "Pendiente de analisis" }) {
  const tone = decision ? getDecisionTone(decision) : "pending";
  const label = decision ?? pendingLabel;

  return (
    <span className={toneClasses[tone]}>{label}</span>
  );
}
