"use client";

import { useState } from "react";

import { SegmentedControl } from "@/components/segmented-control";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toISODate } from "@/lib/date";

export type ExpenseKind = "fixed" | "variable";
export type RecurrenceType = "monthly" | "weekly" | "yearly";

export type TransactionValues = {
  amount: number;
  date: string;
  description: string;
  categoryId?: string;
  expenseType: ExpenseKind;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: string;
};

type Category = { id: string; name: string; type: "income" | "expense" };

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TransactionValues) => void;
  categories: Category[];
  kind: "income" | "expense";
  initialValues?: TransactionValues | null;
  error?: string;
  submitting?: boolean;
}

const EXPENSE_KINDS = [
  { value: "variable" as const, label: "Variável" },
  { value: "fixed" as const, label: "Fixa" },
];

const RECURRENCES: Array<{ value: RecurrenceType; label: string }> = [
  { value: "monthly", label: "Todo mês" },
  { value: "weekly", label: "Toda semana" },
  { value: "yearly", label: "Todo ano" },
];

export function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  kind,
  initialValues,
  error,
  submitting = false,
}: TransactionFormModalProps) {
  const isEditing = Boolean(initialValues);
  const noun = kind === "income" ? "Receita" : "Despesa";

  const [amount, setAmount] = useState(initialValues ? String(initialValues.amount) : "");
  const [date, setDate] = useState(initialValues?.date ?? toISODate(new Date()));
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [expenseType, setExpenseType] = useState<ExpenseKind>(
    initialValues?.expenseType ?? "variable"
  );
  const [isRecurring, setIsRecurring] = useState(initialValues?.isRecurring ?? false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    initialValues?.recurrenceType ?? "monthly"
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    initialValues?.recurrenceEndDate ?? ""
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number.parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || !date) return;

    onSubmit({
      amount: parsedAmount,
      date,
      description: description.trim(),
      categoryId: categoryId || undefined,
      expenseType,
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : undefined,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border-border bg-card p-6 text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-[-0.01em]">
            {isEditing ? `Editar ${noun.toLowerCase()}` : `Nova ${noun.toLowerCase()}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                autoFocus
                className="numeric h-11 pl-9 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={(value) => value && setCategoryId(value)}>
                <SelectTrigger id="category" className="h-11">
                  <SelectValue placeholder="Selecionar">
                    {(value: string | null) =>
                      categories.find((category) => category.id === value)?.name ?? "Selecionar"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder={kind === "income" ? "Ex: Salário" : "Ex: Supermercado"}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={255}
              className="h-11"
            />
          </div>

          {kind === "expense" && (
            <div className="flex items-center justify-between gap-3">
              <Label className="mb-0">Tipo de despesa</Label>
              <SegmentedControl
                options={EXPENSE_KINDS}
                value={expenseType}
                onChange={setExpenseType}
                size="sm"
                ariaLabel="Tipo de despesa"
              />
            </div>
          )}

          <div className="rounded-xl border border-border p-3">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-medium">Repetir automaticamente</span>
                <span className="block text-xs text-muted-foreground">
                  Lançado uma vez e projetado nos relatórios
                </span>
              </span>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(event) => setIsRecurring(event.target.checked)}
                className="size-4 shrink-0 accent-[var(--primary)]"
              />
            </label>

            {isRecurring && (
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="recurrence">Frequência</Label>
                  <Select
                    value={recurrenceType}
                    onValueChange={(value) => value && setRecurrenceType(value as RecurrenceType)}
                  >
                    <SelectTrigger id="recurrence" className="h-10">
                      <SelectValue>
                        {(value: string | null) =>
                          RECURRENCES.find((item) => item.value === value)?.label ?? "Todo mês"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="recurrence-end">Até (opcional)</Label>
                  <Input
                    id="recurrence-end"
                    type="date"
                    min={date}
                    value={recurrenceEndDate}
                    onChange={(event) => setRecurrenceEndDate(event.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring flex-1 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
