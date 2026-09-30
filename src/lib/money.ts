import { formatCurrency } from "@/lib/utils";

export function formatSigned(cents: number): string {
  const absolute = formatCurrency(Math.abs(cents));
  if (cents === 0) return absolute;
  return `${cents > 0 ? "+" : "-"}${absolute}`;
}

export function formatCompact(cents: number): string {
  return Intl.NumberFormat("pt-BR", {
    notation: "compact",
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 1,
  }).format(cents / 100);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: fractionDigits,
  }).format(value)}%`;
}

/** Variação percentual entre dois períodos; null quando não há base de comparação. */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
