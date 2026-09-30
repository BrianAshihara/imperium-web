"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/lib/money";
import { cn, formatCurrency } from "@/lib/utils";

export type CategorySlice = {
  categoryId: string | null;
  categoryName: string | null;
  totalCents: number;
  percentage: number;
};

/**
 * Ordem fixa por tamanho. A cor sozinha não identifica nada: cada fatia é
 * nomeada na legenda, com percentual e valor ao lado.
 */
const SLICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const MAX_SLICES = 4;
const REST_COLOR_INDEX = SLICE_COLORS.length - 1;

interface CategoryBreakdownProps {
  data: CategorySlice[];
  totalCents: number;
  loading?: boolean;
}

export function CategoryBreakdown({ data, totalCents, loading = false }: CategoryBreakdownProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-2.5 w-full rounded-full" />
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-5 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nenhuma despesa registrada neste mês
      </p>
    );
  }

  const ranked = [...data].sort((a, b) => b.totalCents - a.totalCents);
  const visible = ranked.slice(0, MAX_SLICES);
  const rest = ranked.slice(MAX_SLICES);

  const slices = rest.length
    ? [
        ...visible.map((slice, index) => ({ ...slice, color: SLICE_COLORS[index] })),
        {
          categoryId: "__rest__",
          categoryName: `Outras ${rest.length}`,
          totalCents: rest.reduce((sum, item) => sum + item.totalCents, 0),
          percentage: rest.reduce((sum, item) => sum + item.percentage, 0),
          color: SLICE_COLORS[REST_COLOR_INDEX],
        },
      ]
    : visible.map((slice, index) => ({ ...slice, color: SLICE_COLORS[index] }));

  return (
    <div className="flex flex-col gap-5">
      <p className="display-value text-[26px] leading-none">{formatCurrency(totalCents)}</p>

      <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full">
        {slices.map((slice, index) => (
          <span
            key={slice.categoryId ?? index}
            className="h-full rounded-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${Math.max(slice.percentage, 1)}%`,
              backgroundColor: slice.color,
            }}
            aria-hidden
          />
        ))}
      </div>

      <ul className="flex flex-col">
        {slices.map((slice, index) => (
          <li
            key={slice.categoryId ?? index}
            className="flex items-baseline gap-3 border-b border-border/70 py-3 last:border-0"
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
              aria-hidden
            />
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                index === 0 ? "text-base font-medium" : "text-sm"
              )}
            >
              {slice.categoryName ?? "Sem categoria"}
            </span>
            <span className="numeric w-12 text-right text-xs text-muted-foreground">
              {formatPercent(slice.percentage, 0)}
            </span>
            <span
              className={cn(
                "numeric w-28 text-right",
                index === 0 ? "text-lg font-semibold" : "text-sm font-medium"
              )}
            >
              {formatCurrency(slice.totalCents)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
