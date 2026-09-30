import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";

interface DeltaPillProps {
  value: number | null;
  /** Para despesas, subir é ruim: inverte a leitura de cor. */
  invert?: boolean;
  caption?: string;
}

export function DeltaPill({ value, invert = false, caption }: DeltaPillProps) {
  if (value === null) {
    return caption ? <span className="text-xs text-muted-foreground">{caption}</span> : null;
  }

  const isUp = value > 0;
  const isGood = invert ? !isUp : isUp;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "pill border",
          value === 0 && "border-border bg-muted text-muted-foreground",
          value !== 0 && isGood && "border-transparent bg-primary text-primary-foreground",
          value !== 0 && !isGood && "border-expense/30 bg-expense/10 text-expense"
        )}
      >
        <Icon size={12} strokeWidth={2.5} />
        {formatPercent(Math.abs(value))}
      </span>
      {caption && <span className="text-xs text-muted-foreground">{caption}</span>}
    </span>
  );
}
