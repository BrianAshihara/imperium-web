"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/lib/money";
import { formatCurrency } from "@/lib/utils";

export type Commitment = {
  description: string | null;
  categoryName: string | null;
  amountCents: number;
  isRecurring: boolean;
  recurrenceType: string | null;
  recurrenceEndDate: string | null;
};

export type CommitmentsReport = {
  totalIncomeCents: number;
  committedCents: number;
  variableCents: number;
  freeCents: number;
  committedShare: number;
  items: Commitment[];
};

interface CommitmentBarProps {
  report: CommitmentsReport | null;
  periodLabel: string;
  /** Dias restantes no mês; só faz sentido no mês corrente */
  daysLeft: number | null;
  loading?: boolean;
}

const nameOf = (item: Commitment) =>
  item.description ?? item.categoryName ?? "Compromisso";

export function CommitmentBar({
  report,
  periodLabel,
  daysLeft,
  loading = false,
}: CommitmentBarProps) {
  if (loading || !report) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-24 bg-white/10" />
        <Skeleton className="h-12 w-72 bg-white/10" />
        <Skeleton className="h-3 w-full rounded-full bg-white/10" />
        <Skeleton className="h-20 w-full bg-white/10" />
      </div>
    );
  }

  const { totalIncomeCents, committedCents, variableCents, freeCents } = report;

  // Sem receita no mês a barra não tem base de comparação: usa o gasto como total
  const base = totalIncomeCents > 0 ? totalIncomeCents : committedCents + variableCents;
  const share = (value: number) => (base > 0 ? Math.max((value / base) * 100, 0) : 0);

  const segments = [
    {
      key: "committed",
      label: "Comprometido",
      hint: "fixos e recorrentes",
      value: committedCents,
      displayValue: committedCents,
      color: "var(--hero-muted)",
    },
    {
      key: "variable",
      label: "Variável",
      hint: "gastos do dia a dia",
      value: variableCents,
      displayValue: variableCents,
      color: "var(--expense)",
    },
    {
      key: "free",
      label: "Livre",
      hint: freeCents < 0 ? "você gastou mais do que entrou" : "sobrou de verdade",
      value: Math.max(freeCents, 0),
      displayValue: freeCents,
      color: "var(--accent)",
    },
  ];

  const highlights = report.items.slice(0, 3).map(nameOf);
  const perDay = daysLeft && daysLeft > 0 ? Math.round(freeCents / daysLeft) : null;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-hero-muted">Seu mês</p>
        <p className="display-value mt-2 text-[40px] leading-none sm:text-[52px]">
          {formatCurrency(totalIncomeCents)}
        </p>
        <p className="mt-2 text-sm text-hero-muted">
          entraram em {periodLabel}, e {formatPercent(report.committedShare, 0)} disso já tinha dono
        </p>
      </div>

      <div className="flex h-3 gap-[3px] overflow-hidden rounded-full">
        {segments.map((segment) => (
          <span
            key={segment.key}
            className="h-full rounded-full"
            style={{
              width: `${Math.max(share(segment.value), 0.5)}%`,
              backgroundColor: segment.color,
            }}
            aria-hidden
          />
        ))}
      </div>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
        {segments.map((segment) => (
          <div key={segment.key} className="flex flex-col gap-1">
            <dt className="flex items-center gap-2 text-sm text-hero-muted">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: segment.color }}
                aria-hidden
              />
              {segment.label}
            </dt>
            <dd>
              <span className="numeric text-xl font-semibold">
                {formatCurrency(segment.displayValue)}
              </span>
              <span className="numeric ml-2 text-sm text-hero-muted">
                {formatPercent(share(segment.value), 0)}
              </span>
              <span className="mt-0.5 block text-xs text-hero-muted">{segment.hint}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-white/12 pt-5 text-sm text-hero-muted">
        <p>
          {highlights.length > 0 ? (
            <>
              Maiores compromissos:{" "}
              <span className="font-medium text-hero-foreground">{highlights.join(", ")}</span>
            </>
          ) : (
            "Nenhum gasto fixo ou recorrente neste mês"
          )}
        </p>
        {perDay !== null && (
          <p>
            Dá para gastar{" "}
            <span className="numeric font-medium text-accent">{formatCurrency(perDay)}</span> por
            dia nos {daysLeft} dias que faltam
          </p>
        )}
      </div>
    </div>
  );
}
