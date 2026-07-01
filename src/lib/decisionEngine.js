export const DECISION_LABELS = {
  repair: "Proceder con Reparacion",
  indemnify: "Proceder con Indemnizacion",
  reject: "Cierre por Falla No Atribuible",
  incomplete: "Caso Incompleto - Alertar",
  manual: "Revision Manual Requerida",
};

export const REQUIRED_FIELDS = [
  ["idTicket", "ID Ticket"],
  ["tipoArtefacto", "Tipo de artefacto"],
  ["marca", "Marca"],
  ["modelo", "Modelo"],
  ["atribuibleSuministro", "Atribuible a suministro"],
  ["comentariosObservaciones", "Comentarios u observaciones"],
];

export const ACCEPTANCE_KEYWORDS = [
  "alza de voltaje",
  "sobrecarga termica",
  "golpe de tension",
];

export const REJECTION_KEYWORDS = [
  "desgaste natural",
  "falta de mantencion",
  "vida util cumplida",
  "intervencion de terceros",
];

export function normalizeText(value) {
  return (value ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getPriceKey({ tipoArtefacto, marca, modelo }) {
  return [tipoArtefacto, marca, modelo].map(normalizeText).join("|");
}

export function findMissingRequiredFields(caseItem) {
  return REQUIRED_FIELDS.filter(([field]) => {
    const value = caseItem[field];
    if (typeof value === "boolean") {
      return false;
    }

    return value === null || value === undefined || String(value).trim() === "";
  }).map(([, label]) => label);
}

export function extractKeywords(text, keywords) {
  const normalized = normalizeText(text);

  return keywords.filter((keyword) => normalized.includes(normalizeText(keyword)));
}

export function findMarketPrice(caseItem, marketPrices) {
  return marketPrices.find((item) => getPriceKey(item) === getPriceKey(caseItem)) ?? null;
}

export function evaluateFinancialOutcome(budget, marketPrice) {
  if (budget === null || budget === undefined || Number.isNaN(Number(budget))) {
    return {
      threshold: null,
      decision: DECISION_LABELS.manual,
      summary: "Presupuesto de reparacion no disponible.",
    };
  }

  if (marketPrice === null || marketPrice === undefined || Number.isNaN(Number(marketPrice))) {
    return {
      threshold: null,
      decision: DECISION_LABELS.manual,
      summary: "Precio de mercado no disponible. Ingreso manual requerido.",
    };
  }

  const threshold = Math.round(Number(marketPrice) * 0.7);
  const decision =
    Number(budget) <= threshold ? DECISION_LABELS.repair : DECISION_LABELS.indemnify;

  return {
    threshold,
    decision,
    summary:
      decision === DECISION_LABELS.repair
        ? "El presupuesto queda bajo o igual al umbral del 70%."
        : "El presupuesto supera el umbral del 70%; corresponde indemnizacion.",
  };
}

export function evaluateCase(caseItem, marketPriceValue) {
  const missingFields = findMissingRequiredFields(caseItem);
  const textBlock = [caseItem.descripcionCausaFalla, caseItem.comentariosObservaciones]
    .filter(Boolean)
    .join(" ");
  const acceptanceMatches = extractKeywords(textBlock, ACCEPTANCE_KEYWORDS);
  const rejectionMatches = extractKeywords(textBlock, REJECTION_KEYWORDS);
  const finance = evaluateFinancialOutcome(caseItem.presupuestoReparacion, marketPriceValue);

  if (missingFields.length > 0 || caseItem.estadoCaso === "incompleto") {
    return {
      missingFields,
      acceptanceMatches,
      rejectionMatches,
      financial: finance,
      decision: DECISION_LABELS.incomplete,
      narrative: "Faltan campos obligatorios para continuar con el analisis normal.",
      canAdvanceFromExtraction: false,
      canAdvanceToFinancial: false,
    };
  }

  if (caseItem.atribuibleSuministro === false) {
    return {
      missingFields,
      acceptanceMatches,
      rejectionMatches,
      financial: finance,
      decision: DECISION_LABELS.reject,
      narrative: "El check binario del informe descarta atribuibilidad al suministro.",
      canAdvanceFromExtraction: true,
      canAdvanceToFinancial: false,
    };
  }

  if (rejectionMatches.length > 0) {
    return {
      missingFields,
      acceptanceMatches,
      rejectionMatches,
      financial: finance,
      decision: DECISION_LABELS.reject,
      narrative:
        "El analisis semantico detecto palabras clave de rechazo, por lo que el caso no continua a regla financiera.",
      canAdvanceFromExtraction: true,
      canAdvanceToFinancial: false,
    };
  }

  if (acceptanceMatches.length === 0) {
    return {
      missingFields,
      acceptanceMatches,
      rejectionMatches,
      financial: finance,
      decision: DECISION_LABELS.manual,
      narrative: "No hubo coincidencias suficientes para clasificar el caso automaticamente.",
      canAdvanceFromExtraction: true,
      canAdvanceToFinancial: false,
    };
  }

  return {
    missingFields,
    acceptanceMatches,
    rejectionMatches,
    financial: finance,
    decision: finance.decision,
    narrative:
      finance.decision === DECISION_LABELS.repair
        ? "El caso es atribuible y la reparacion es economicamente viable."
        : "El caso es atribuible, pero la reparacion supera el umbral financiero.",
    canAdvanceFromExtraction: true,
    canAdvanceToFinancial: true,
  };
}

export function getDecisionTone(decision) {
  if (decision === DECISION_LABELS.repair) return "repair";
  if (decision === DECISION_LABELS.indemnify) return "indemnify";
  if (decision === DECISION_LABELS.reject) return "reject";
  if (decision === DECISION_LABELS.incomplete) return "incomplete";
  return "manual";
}
