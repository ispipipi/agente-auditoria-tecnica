const workflowToneClasses = {
  new: "workflow-badge workflow-badge-new",
  in_review: "workflow-badge workflow-badge-review",
  closed: "workflow-badge workflow-badge-closed",
};

const workflowLabels = {
  new: "Nuevo",
  in_review: "En revision",
  closed: "Cerrado",
};

export function WorkflowStateBadge({ state, label }) {
  const tone = workflowToneClasses[state] ?? workflowToneClasses.new;
  const content = label ?? workflowLabels[state] ?? workflowLabels.new;

  return <span className={tone}>{content}</span>;
}
