"use client";

import { ArrowDownLeft, ArrowUpRight, Pencil, Repeat, Trash2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { recurrenceLabel } from "@/lib/date";
import { formatSigned } from "@/lib/money";
import { cn, formatDate } from "@/lib/utils";

export type TransactionItem = {
  id: string;
  kind: "income" | "expense";
  amountCents: number;
  description: string | null;
  date: string;
  categoryName: string | null;
  isRecurring: boolean;
  recurrenceType?: string | null;
  recurrenceEndDate?: string | null;
};

interface TransactionListProps {
  items: TransactionItem[];
  loading?: boolean;
  emptyMessage?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TransactionList({
  items,
  loading = false,
  emptyMessage = "Nenhum lançamento encontrado",
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-2">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const hasActions = Boolean(onEdit || onDelete);

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-border">
          <th className="eyebrow py-2 text-left font-medium">Descrição</th>
          <th className="eyebrow hidden py-2 text-left font-medium lg:table-cell">Categoria</th>
          <th className="eyebrow hidden py-2 text-left font-medium sm:table-cell">Quando</th>
          <th className="eyebrow py-2 text-right font-medium">Valor</th>
          {hasActions && <th className="w-20 py-2" />}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const isIncome = item.kind === "income";
          const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
          const repeats = item.isRecurring
            ? recurrenceLabel(item.recurrenceType ?? null, item.recurrenceEndDate)
            : null;

          return (
            <tr key={item.id} className="group border-b border-border/70 last:border-0">
              <td className="py-3 pr-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full",
                      isIncome ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"
                    )}
                    aria-hidden
                  >
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {item.description ?? (isIncome ? "Receita" : "Despesa")}
                    </p>
                    <p className="text-xs text-muted-foreground lg:hidden">
                      {item.categoryName ?? "Sem categoria"}
                      <span className="sm:hidden"> - {repeats ?? formatDate(item.date)}</span>
                    </p>
                  </div>
                </div>
              </td>

              <td className="hidden py-3 pr-3 lg:table-cell">
                <span className="text-sm text-muted-foreground">
                  {item.categoryName ?? "Sem categoria"}
                </span>
              </td>

              <td className="hidden py-3 pr-3 text-sm sm:table-cell">
                {repeats ? (
                  <span className="pill bg-muted text-muted-foreground">
                    <Repeat size={11} aria-hidden />
                    {repeats}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{formatDate(item.date)}</span>
                )}
              </td>

              <td className="numeric py-3 text-right text-sm font-medium">
                {formatSigned(isIncome ? item.amountCents : -item.amountCents)}
              </td>

              {hasActions && (
                <td className="py-3 pl-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(item.id)}
                        className="focus-ring grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Editar lançamento"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="focus-ring grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Excluir lançamento"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
