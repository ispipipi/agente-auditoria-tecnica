export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Pendiente";
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatDate(value) {
  if (!value) return "Sin fecha";
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

export function sentenceList(items) {
  return items.length > 0 ? items.join(", ") : "Sin coincidencias";
}
