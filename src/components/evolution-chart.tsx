"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartTooltip } from "@/components/chart-tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact } from "@/lib/money";
import { formatCurrency, monthName } from "@/lib/utils";

export type EvolutionPoint = {
  month: number;
  year: number;
  totalIncomeCents: number;
  totalExpensesCents: number;
  netBalanceCents: number;
};

const SERIES = [
  { key: "receitas", label: "Entradas", active: "var(--primary)", muted: "var(--chart-4)" },
  { key: "despesas", label: "Saídas", active: "var(--expense)", muted: "oklch(0.87 0.055 42)" },
] as const;

interface EvolutionChartProps {
  data: EvolutionPoint[];
  loading?: boolean;
}

export function EvolutionChart({ data, loading = false }: EvolutionChartProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[260px] w-full rounded-xl" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Sem histórico para o período
      </p>
    );
  }

  const highlighted = data[data.length - 1];
  const highlightLabel = `${monthName(highlighted.month)}/${String(highlighted.year).slice(2)}`;

  const chartData = data.map((point) => ({
    label: `${monthName(point.month)}/${String(point.year).slice(2)}`,
    receitas: point.totalIncomeCents,
    despesas: point.totalExpensesCents,
  }));

  return (
    <div className="flex flex-col gap-5">
      <dl className="flex flex-wrap gap-x-10 gap-y-4 border-b border-border pb-5">
        <div>
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" aria-hidden />
            Entradas em {highlightLabel}
          </dt>
          <dd className="numeric mt-1 text-lg font-semibold">
            {formatCurrency(highlighted.totalIncomeCents)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-expense" aria-hidden />
            Saídas em {highlightLabel}
          </dt>
          <dd className="numeric mt-1 text-lg font-semibold">
            {formatCurrency(highlighted.totalExpensesCents)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Resultado líquido</dt>
          <dd className="numeric mt-1 text-lg font-semibold">
            {formatCurrency(highlighted.netBalanceCents)}
          </dd>
        </div>
      </dl>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} barGap={3} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={68}
            tickFormatter={(value: number) => formatCompact(value)}
          />
          <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.55 }} content={<ChartTooltip />} />

          {SERIES.map((series) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              name={series.label}
              radius={[5, 5, 0, 0]}
              maxBarSize={22}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={index === chartData.length - 1 ? series.active : series.muted}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
