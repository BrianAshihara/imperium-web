"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { BudgetProgress } from "@/components/budget-progress";
import { MonthNavigator, type Period } from "@/components/month-navigator";
import { PageHeader } from "@/components/page-header";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error-message";
import { formatCurrency } from "@/lib/utils";

type Category = { id: string; name: string; type: "income" | "expense" };

type Budget = {
  id: string;
  month: number;
  year: number;
  limitAmountCents: number;
  categoryId: string | null;
  spentCents: number;
  percentageUsed: number;
  remainingCents: number;
  isOverLimit: boolean;
};

const GLOBAL_OPTION = "global";
const today = new Date();
const currentPeriod = { month: today.getMonth() + 1, year: today.getFullYear() };

export default function BudgetsPage() {
  const [period, setPeriod] = useState<Period>({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<{ data: Budget[] }>("/api/budgets", {
        month: String(period.month),
        year: String(period.year),
      });
      setBudgets(response.data);
      setError("");
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao carregar os orçamentos."));
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get<{ data: Category[] }>("/api/categories");
      setCategories(response.data.filter((category) => category.type === "expense"));
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const labelOf = (budget: Budget) =>
    budget.categoryId
      ? (categories.find((category) => category.id === budget.categoryId)?.name ?? "Categoria")
      : "Todas as despesas";

  const handleDelete = async (budget: Budget) => {
    if (!confirm(`Excluir o orçamento de ${labelOf(budget)}?`)) return;

    try {
      await api.delete(`/api/budgets/${budget.id}`);
      fetchBudgets();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao excluir o orçamento."));
    }
  };

  // Somar todos os "spent" contaria duas vezes: o limite geral já inclui as categorias
  const isCurrentMonth =
    period.month === currentPeriod.month && period.year === currentPeriod.year;
  const daysInMonth = new Date(period.year, period.month, 0).getDate();
  /** Marca de ritmo so existe no mes corrente: nos fechados nao ha hoje. */
  const elapsedShare = isCurrentMonth ? (today.getDate() / daysInMonth) * 100 : null;

  const globalBudget = budgets.find((budget) => budget.categoryId === null) ?? null;
  const overLimitCount = budgets.filter((budget) => budget.isOverLimit).length;

  return (
    <>
      <PageHeader
        title="Orçamentos"
        eyebrow="Limites mensais por categoria"
        actions={
          <>
            <MonthNavigator period={period} onChange={setPeriod} maxPeriod={currentPeriod} />
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="focus-ring flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus size={16} />
              Novo orçamento
            </button>
          </>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {budgets.length > 0 && !loading && (
        <div className="surface mb-4 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="eyebrow">
              {globalBudget ? "Gasto total do mês" : "Limites definidos"}
            </p>
            <p className="display-value mt-1 text-[26px] leading-none">
              {globalBudget
                ? formatCurrency(globalBudget.spentCents)
                : `${budgets.length} ${budgets.length === 1 ? "categoria" : "categorias"}`}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {globalBudget && `de ${formatCurrency(globalBudget.limitAmountCents)} no limite geral, `}
            {overLimitCount === 0
              ? "nenhum limite estourado"
              : `${overLimitCount} ${overLimitCount === 1 ? "limite estourado" : "limites estourados"}`}
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="surface-quiet border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum orçamento definido para este mês.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="focus-ring mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Criar o primeiro
          </button>
        </div>
      ) : (
        <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2">
          {budgets.map((budget) => (
            <article key={budget.id} className="surface flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">{labelOf(budget)}</h2>
                  <p className="text-xs text-muted-foreground">
                    {budget.categoryId ? "Limite da categoria" : "Limite geral do mês"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(budget);
                      setModalOpen(true);
                    }}
                    className="focus-ring grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Editar orçamento"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(budget)}
                    className="focus-ring grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Excluir orçamento"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <BudgetProgress
                ariaLabel={labelOf(budget)}
                spentCents={budget.spentCents}
                limitCents={budget.limitAmountCents}
                percentageUsed={budget.percentageUsed}
                isOverLimit={budget.isOverLimit}
                expectedPercentage={elapsedShare}
              />

              <p className="numeric text-sm">
                <span className="text-muted-foreground">Restante: </span>
                <span className="font-medium">{formatCurrency(budget.remainingCents)}</span>
              </p>
            </article>
          ))}
        </div>
      )}

      <BudgetFormModal
        key={editing?.id ?? "novo"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          setModalOpen(false);
          setEditing(null);
          fetchBudgets();
        }}
        categories={categories}
        budget={editing}
        period={period}
        usedCategoryIds={budgets.map((budget) => budget.categoryId)}
      />
    </>
  );
}

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: Category[];
  budget: Budget | null;
  period: Period;
  usedCategoryIds: Array<string | null>;
}

function BudgetFormModal({
  isOpen,
  onClose,
  onSaved,
  categories,
  budget,
  period,
  usedCategoryIds,
}: BudgetFormModalProps) {
  const isEditing = Boolean(budget);
  const [amount, setAmount] = useState(
    budget ? String(budget.limitAmountCents / 100) : ""
  );
  const [categoryId, setCategoryId] = useState<string>(budget?.categoryId ?? GLOBAL_OPTION);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const available = categories.filter(
    (category) => !usedCategoryIds.includes(category.id) || category.id === budget?.categoryId
  );
  const globalTaken = usedCategoryIds.includes(null) && !isEditing;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number.parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;

    setSaving(true);
    setError("");

    try {
      if (budget) {
        await api.put(`/api/budgets/${budget.id}`, {
          limitAmountCents: Math.round(parsed * 100),
        });
      } else {
        await api.post("/api/budgets", {
          month: period.month,
          year: period.year,
          limitAmountCents: Math.round(parsed * 100),
          categoryId: categoryId === GLOBAL_OPTION ? null : categoryId,
        });
      }
      onSaved();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao salvar o orçamento."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border-border bg-card p-6 text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-[-0.01em]">
            {isEditing ? "Editar orçamento" : "Novo orçamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="limit">Limite do mês</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R$
              </span>
              <Input
                id="limit"
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-category">Aplicar a</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => value && setCategoryId(value)}
              disabled={isEditing}
            >
              <SelectTrigger id="budget-category" className="h-11">
                <SelectValue>
                  {(value: string | null) =>
                    value && value !== GLOBAL_OPTION
                      ? (categories.find((category) => category.id === value)?.name ??
                        "Todas as despesas")
                      : "Todas as despesas"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {!globalTaken && <SelectItem value={GLOBAL_OPTION}>Todas as despesas</SelectItem>}
                {available.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                A categoria não muda depois de criado. Exclua e crie outro, se precisar.
              </p>
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
              disabled={saving}
              className="focus-ring flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
