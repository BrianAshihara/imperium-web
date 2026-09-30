"use client";

import { formatCurrency } from "@/lib/utils";

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-44 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-raised)]">
      {label && <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>}
      <div className="flex flex-col gap-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="numeric ml-auto font-medium">
              {formatCurrency(Number(entry.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
