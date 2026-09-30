"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { fullMonthName } from "@/lib/date";

export type Period = { month: number; year: number };

interface MonthNavigatorProps {
  period: Period;
  onChange: (period: Period) => void;
  /** Bloqueia a navegação para meses ainda não iniciados. */
  maxPeriod?: Period;
}

const shift = ({ month, year }: Period, offset: number): Period => {
  const cursor = new Date(year, month - 1 + offset, 1);
  return { month: cursor.getMonth() + 1, year: cursor.getFullYear() };
};

const isAfter = (a: Period, b: Period): boolean =>
  a.year > b.year || (a.year === b.year && a.month > b.month);

export function MonthNavigator({ period, onChange, maxPeriod }: MonthNavigatorProps) {
  const next = shift(period, 1);
  const nextDisabled = maxPeriod ? isAfter(next, maxPeriod) : false;

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
      <button
        type="button"
        onClick={() => onChange(shift(period, -1))}
        className="focus-ring grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="min-w-[128px] text-center text-sm font-medium">
        {fullMonthName(period.month)} de {period.year}
      </span>

      <button
        type="button"
        onClick={() => onChange(next)}
        disabled={nextDisabled}
        className="focus-ring grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        aria-label="Próximo mês"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
