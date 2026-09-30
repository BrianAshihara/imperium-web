"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Repeat } from "lucide-react";

import { BudgetProgress } from "@/components/budget-progress";
import { CategoryBreakdown, type CategorySlice } from "@/components/category-breakdown";
import { CommitmentBar, type CommitmentsReport } from "@/components/commitment-bar";
import { EvolutionChart, type EvolutionPoint } from "@/components/evolution-chart";
import { MonthNavigator, type Period } from "@/components/month-navigator";
import { PageHeader } from "@/components/page-header";
import { SegmentedControl } from "@/components/segmented-control";
import { TransactionList, type TransactionItem } from "@/components/transaction-list";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type PaginatedResponse } from "@/lib/api";
import { fullMonthName, longDate, recurrenceLabel } from "@/lib/date";
import { errorMessage } from "@/lib/error-message";
import { formatCurrency } from "@/lib/utils";

type CategoryReport = {
  totalExpensesCents: number;
  categories: CategorySlice[];
};

type Budget = {
  id: string;
  categoryId: string | null;
  limitAmountCents: number;
  spentCents: number;
  percentageUsed: number;
  isOverLimit: boolean;
};

type Category = { id: string; name: string; type: "income" | "expense" };

type Entry = {
  id: string;
  amountCents: number;
  description: string | null;
  date: string;
  categoryId: string | null;
  isRecurring: boolean;
  recurrenceType: string | null;
  recurrenceEndDate: string | null;
};

const WINDOW_OPTIONS = [
  { value: "6", label: "6M" },
  { value: "12", label: "12M" },
] as const;

const RECENT_LIMIT = 6;
const today = new Date();
const currentPeriod = { month: today.getMonth() + 1, year: today.getFullYear() };

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>(currentPeriod);
  const [chartWindow, setChartWindow] = useState<"6" | "12">("6");

  const [commitments, setCommitments] = useState<CommitmentsReport | null>(null);
  const [categoryReport, setCategoryReport] = useState<CategoryReport | null>(null);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recent, setRecent] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const query = { month: String(period.month), year: String(period.year) };
    const recentQuery = { page: "1", limit: String(RECENT_LIMIT) };

    try {
      const [commitmentsRes, categoryRes, evolutionRes, budgetsRes, categoriesRes, incomesRes, expensesRes] =
        await Promise.all([
          api.get<{ data: CommitmentsReport }>("/api/reports/commitments", query),
          api.get<{ data: CategoryReport }>("/api/reports/categories", query),
          api.get<{ data: EvolutionPoint[] }>("/api/reports/evolution", {
            ...query,
            months: chartWindow,
          }),
          api.get<{ data: Budget[] }>("/api/budgets", query),
          api.get<{ data: Category[] }>("/api/categories"),
          api.get<PaginatedResponse<Entry>>("/api/incomes", recentQuery),
          api.get<PaginatedResponse<Entry>>("/api/expenses", recentQuery),
        ]);

      const categoryName = (categoryId: string | null) =>
        categoriesRes.data.find((category) => category.id === categoryId)?.name ?? null;

      const toItem = (entry: Entry, kind: "income" | "expense"): TransactionItem => ({
        id: entry.id,
        kind,
        amountCents: entry.amountCents,
        description: entry.description,
        date: entry.date,
        categoryName: categoryName(entry.categoryId),
        isRecurring: entry.isRecurring,
        recurrenceType: entry.recurrenceType,
        recurrenceEndDate: entry.recurrenceEndDate,
      });

      setCommitments(commitmentsRes.data);
      setCategoryReport(categoryRes.data);
      setEvolution(evolutionRes.data);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data);
      setRecent(
        [
          ...incomesRes.data.map((entry) => toItem(entry, "income")),
          ...expensesRes.data.map((entry) => toItem(entry, "expense")),
        ]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, RECENT_LIMIT)
      );
      setError("");
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao carregar os dados do dashboard."));
    } finally {
      setLoading(false);
    }
  }, [period, chartWindow]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isCurrentMonth =
    period.month === currentPeriod.month && period.year === currentPeriod.year;

  const daysInMonth = new Date(period.year, period.month, 0).getDate();

  /** Só o mês corrente tem "hoje": nos outros o ritmo não significa nada. */
  const elapsedShare = isCurrentMonth ? (today.getDate() / daysInMonth) * 100 : null;
  const daysLeft = isCurrentMonth ? daysInMonth - today.getDate() : null;

  const periodLabel = `${fullMonthName(period.month).toLowerCase()} de ${period.year}`;

  const budgetsWithLabel = useMemo(
    () =>
      budgets.map((budget) => ({
        ...budget,
        label: budget.categoryId
          ? (categories.find((category) => category.id === budget.categoryId)?.name ?? "Categoria")
          : "Todas as despesas",
      })),
    [budgets, categories]
  );

  const header = (
    <PageHeader
      eyebrow={longDate(today)}
      title="Visão geral"
      actions={
        <>
          <MonthNavigator period={period} onChange={setPeriod} maxPeriod={currentPeriod} />
          <Link
            href="/dashboard/transactions?novo=1"
            className="focus-ring flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Nova transação
          </Link>
        </>
      }
    />
  );

  if (error) {
    return (
      <>
        {header}
        <div className="border-y border-border py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button
            type="button"
            onClick={fetchData}
            className="focus-ring mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Tentar novamente
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {header}

      <section className="relative -mx-4 overflow-hidden bg-hero px-4 py-9 text-hero-foreground sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 lg:py-11">
        <div className="dotted-field-inverse pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative">
          <CommitmentBar
            report={commitments}
            periodLabel={periodLabel}
            daysLeft={daysLeft}
            loading={loading}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 divide-y divide-border border-b border-border lg:grid-cols-12 lg:divide-x lg:divide-y-0">
        <div className="py-8 lg:col-span-5 lg:pr-10">
          <SectionTitle title="Onde o dinheiro foi" hint={periodLabel} />
          <CategoryBreakdown
            data={categoryReport?.categories ?? []}
            totalCents={categoryReport?.totalExpensesCents ?? 0}
            loading={loading}
          />
        </div>

        <div className="py-8 lg:col-span-4 lg:px-10">
          <SectionTitle
            title="Compromissos do mês"
            hint={
              commitments && !loading
                ? `${commitments.items.length} ${commitments.items.length === 1 ? "item" : "itens"}`
                : undefined
            }
          />
          <CommitmentList report={commitments} loading={loading} />
        </div>

        <div className="py-8 lg:col-span-3 lg:pl-10">
          <SectionTitle
            title="Ritmo dos limites"
            hint={
              elapsedShare === null ? "mês fechado" : `dia ${today.getDate()} de ${daysInMonth}`
            }
          />

          {loading ? (
            <div className="flex flex-col gap-6">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : budgetsWithLabel.length === 0 ? (
            <EmptyHint
              text="Nenhum limite definido para este mês."
              actionLabel="Criar orçamento"
              href="/dashboard/budgets"
            />
          ) : (
            <div className="flex flex-col gap-6">
              {budgetsWithLabel.map((budget) => (
                <BudgetProgress
                  key={budget.id}
                  label={budget.label}
                  ariaLabel={budget.label}
                  spentCents={budget.spentCents}
                  limitCents={budget.limitAmountCents}
                  percentageUsed={budget.percentageUsed}
                  isOverLimit={budget.isOverLimit}
                  expectedPercentage={elapsedShare}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-border py-8">
        <SectionTitle
          title="Entradas e saídas"
          hint="o mês selecionado aparece cheio"
          action={
            <SegmentedControl
              options={WINDOW_OPTIONS}
              value={chartWindow}
              onChange={setChartWindow}
              size="sm"
              ariaLabel="Janela do gráfico"
            />
          }
        />
        <EvolutionChart data={evolution} loading={loading} />
      </section>

      <section className="py-8">
        <SectionTitle
          title="Últimos lançamentos"
          action={
            <Link
              href="/dashboard/transactions"
              className="focus-ring rounded text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Ver todos
            </Link>
          }
        />
        <TransactionList
          items={recent}
          loading={loading}
          emptyMessage="Você ainda não registrou lançamentos"
        />
      </section>
    </>
  );
}

function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
      <div className="flex items-baseline gap-3">
        <h2 className="eyebrow">{title}</h2>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {action}
    </header>
  );
}

function CommitmentList({
  report,
  loading,
}: {
  report: CommitmentsReport | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!report || report.items.length === 0) {
    return (
      <EmptyHint
        text="Nada fixo ou recorrente neste mês. Marque um lançamento como recorrente para vê-lo aqui."
        actionLabel="Ir para transações"
        href="/dashboard/transactions"
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {report.items.slice(0, 6).map((item, index) => {
        const repeats = item.isRecurring
          ? recurrenceLabel(item.recurrenceType, item.recurrenceEndDate)
          : null;

        return (
          <li
            key={`${item.description ?? "item"}-${index}`}
            className="flex items-baseline gap-3 border-b border-border/70 py-3 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {item.description ?? item.categoryName ?? "Compromisso"}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {repeats ? (
                  <>
                    <Repeat size={11} aria-hidden />
                    {repeats}
                  </>
                ) : (
                  "despesa fixa"
                )}
              </p>
            </div>
            <span className="numeric shrink-0 text-sm font-medium">
              {formatCurrency(item.amountCents)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function EmptyHint({
  text,
  actionLabel,
  href,
}: {
  text: string;
  actionLabel: string;
  href: string;
}) {
  return (
    <div className="border border-dashed border-border px-4 py-8 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Link
        href={href}
        className="focus-ring mt-3 inline-block rounded text-sm font-medium underline underline-offset-4"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
