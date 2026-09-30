import { formatPercent } from "@/lib/money";
import { cn, formatCurrency } from "@/lib/utils";

interface BudgetProgressProps {
  /** Omitido quando o contexto (título do card) já nomeia o orçamento. */
  label?: string;
  ariaLabel?: string;
  spentCents: number;
  limitCents: number;
  percentageUsed: number;
  isOverLimit: boolean;
  /** Quanto do mês já passou. Vira a marca de ritmo na barra. */
  expectedPercentage?: number | null;
}

function paceNote(used: number, expected: number): { text: string; tone: string } {
  const gap = Math.round(used - expected);

  if (gap >= 10) return { text: `${gap} pontos adiantado`, tone: "text-expense" };
  if (gap <= -10) return { text: `${Math.abs(gap)} pontos de folga`, tone: "text-muted-foreground" };
  return { text: "no ritmo do mês", tone: "text-muted-foreground" };
}

export function BudgetProgress({
  label,
  ariaLabel,
  spentCents,
  limitCents,
  percentageUsed,
  isOverLimit,
  expectedPercentage = null,
}: BudgetProgressProps) {
  const width = Math.min(percentageUsed, 100);
  const isNearLimit = !isOverLimit && percentageUsed >= 75;
  const pace = expectedPercentage === null ? null : paceNote(percentageUsed, expectedPercentage);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        {label ? (
          <span className="truncate text-sm font-medium">{label}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Uso do limite</span>
        )}
        <span
          className={cn(
            "numeric shrink-0 text-xs",
            isOverLimit ? "font-medium text-expense" : "text-muted-foreground"
          )}
        >
          {isOverLimit
            ? `Excedido em ${formatCurrency(spentCents - limitCents)}`
            : `${formatPercent(percentageUsed, 0)} usado`}
        </span>
      </div>

      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(percentageUsed)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? label}
      >
        <span
          className={cn(
            "block h-full rounded-full transition-[width] duration-500",
            isOverLimit ? "bg-expense" : isNearLimit ? "bg-accent" : "bg-primary"
          )}
          style={{ width: `${width}%` }}
        />
        {expectedPercentage !== null && expectedPercentage < 100 && (
          <span
            className="absolute inset-y-0 w-px bg-foreground/45"
            style={{ left: `${expectedPercentage}%` }}
            aria-hidden
          />
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span className="numeric">
          {formatCurrency(spentCents)} de {formatCurrency(limitCents)}
        </span>
        {pace && <span className={pace.tone}>{pace.text}</span>}
      </div>
    </div>
  );
}
