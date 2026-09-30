const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function fullMonthName(month: number): string {
  return MONTHS[month - 1] ?? "";
}

/** "Sexta-feira, 26 de setembro", com a inicial maiúscula do dia da semana. */
export function longDate(date: Date): string {
  const formatted = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function toISODate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const RECURRENCE_LABEL: Record<string, string> = {
  monthly: "todo mês",
  weekly: "toda semana",
  yearly: "todo ano",
};

const SHORT_MONTHS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** "todo mês" ou "todo mês até dez/26", para deixar claro que é projeção. */
export function recurrenceLabel(
  type: string | null,
  endDate?: string | null
): string | null {
  if (!type) return null;

  const base = RECURRENCE_LABEL[type];
  if (!base) return null;
  if (!endDate) return base;

  const [year, month] = endDate.split("-");
  const shortMonth = SHORT_MONTHS[Number(month) - 1];
  if (!shortMonth) return base;

  return base + " até " + shortMonth + "/" + year.slice(2);
}
