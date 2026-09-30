"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { SegmentedControl } from "@/components/segmented-control";
import {
  TransactionFormModal,
  type TransactionValues,
} from "@/components/transaction-form-modal";
import { TransactionList, type TransactionItem } from "@/components/transaction-list";
import { api, type PaginatedResponse } from "@/lib/api";
import { errorMessage } from "@/lib/error-message";

type Kind = "income" | "expense";

type Entry = {
  id: string;
  amountCents: number;
  description: string | null;
  date: string;
  categoryId: string | null;
  isRecurring: boolean;
  recurrenceType: "monthly" | "weekly" | "yearly" | null;
  recurrenceEndDate: string | null;
  expenseType?: "fixed" | "variable";
};

type Category = { id: string; name: string; type: Kind };

const KIND_OPTIONS = [
  { value: "income" as const, label: "Receitas" },
  { value: "expense" as const, label: "Despesas" },
];

const PAGE_SIZE = 12;

const resourceOf = (kind: Kind) => (kind === "income" ? "incomes" : "expenses");

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [kind, setKind] = useState<Kind>("income");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(searchParams.get("novo") === "1");
  const [editing, setEditing] = useState<Entry | null>(null);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const response = await api.get<PaginatedResponse<Entry>>(`/api/${resourceOf(kind)}`, {
          page: String(page),
          limit: String(PAGE_SIZE),
        });

        setEntries(response.data);
        setPagination({
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
        });
        setError("");
      } catch (err: unknown) {
        setError(errorMessage(err, "Erro ao carregar os lançamentos."));
      } finally {
        setLoading(false);
      }
    },
    [kind]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get<{ data: Category[] }>("/api/categories");
      setCategories(response.data);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchEntries(1);
  }, [fetchEntries]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const categoryName = (categoryId: string | null) =>
    categories.find((category) => category.id === categoryId)?.name ?? null;

  const items: TransactionItem[] = entries.map((entry) => ({
    id: entry.id,
    kind,
    amountCents: entry.amountCents,
    description: entry.description,
    date: entry.date,
    categoryName: categoryName(entry.categoryId),
    isRecurring: entry.isRecurring,
    recurrenceType: entry.recurrenceType,
    recurrenceEndDate: entry.recurrenceEndDate,
  }));

  const availableCategories = categories.filter((category) => category.type === kind);

  const initialValues = useMemo<TransactionValues | null>(() => {
    if (!editing) return null;

    return {
      amount: editing.amountCents / 100,
      date: editing.date,
      description: editing.description ?? "",
      categoryId: editing.categoryId ?? undefined,
      expenseType: editing.expenseType ?? "variable",
      isRecurring: editing.isRecurring,
      recurrenceType: editing.recurrenceType ?? undefined,
      recurrenceEndDate: editing.recurrenceEndDate ?? undefined,
    };
  }, [editing]);

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setSaveError("");
    if (searchParams.get("novo")) router.replace("/dashboard/transactions");
  };

  const handleSave = async (values: TransactionValues) => {
    const payload = {
      amountCents: Math.round(values.amount * 100),
      date: values.date,
      description: values.description,
      categoryId: values.categoryId ?? null,
      isRecurring: values.isRecurring,
      recurrenceType: values.isRecurring ? values.recurrenceType : null,
      recurrenceEndDate: values.isRecurring ? (values.recurrenceEndDate ?? null) : null,
      ...(kind === "expense" ? { expenseType: values.expenseType } : {}),
    };

    setSaving(true);
    setSaveError("");

    try {
      if (editing) {
        await api.put(`/api/${resourceOf(kind)}/${editing.id}`, payload);
      } else {
        await api.post(`/api/${resourceOf(kind)}`, payload);
      }
    } catch (err: unknown) {
      setSaveError(errorMessage(err, "Erro ao salvar o lançamento."));
      return;
    } finally {
      setSaving(false);
    }

    closeModal();
    fetchEntries(pagination.page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este lançamento?")) return;

    try {
      await api.delete(`/api/${resourceOf(kind)}/${id}`);
      const isLastOfPage = entries.length === 1 && pagination.page > 1;
      fetchEntries(isLastOfPage ? pagination.page - 1 : pagination.page);
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao excluir o lançamento."));
    }
  };

  return (
    <>
      <PageHeader
        title="Transações"
        eyebrow="Receitas e despesas"
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setSaveError("");
              setModalOpen(true);
            }}
            className="focus-ring flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Novo lançamento
          </button>
        }
      />

      <section className="surface p-5 lg:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SegmentedControl
            options={KIND_OPTIONS}
            value={kind}
            onChange={setKind}
            ariaLabel="Tipo de lançamento"
          />
          {!loading && pagination.total > 0 && (
            <p className="text-sm text-muted-foreground">
              {pagination.total} {pagination.total === 1 ? "lançamento" : "lançamentos"}
            </p>
          )}
        </div>

        {error ? (
          <p className="py-12 text-center text-sm text-destructive">{error}</p>
        ) : (
          <TransactionList
            items={items}
            loading={loading}
            emptyMessage={
              kind === "income" ? "Nenhuma receita registrada" : "Nenhuma despesa registrada"
            }
            onEdit={(id) => {
              const entry = entries.find((item) => item.id === id) ?? null;
              setEditing(entry);
              setSaveError("");
              setModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchEntries(pagination.page - 1)}
                className="focus-ring grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchEntries(pagination.page + 1)}
                className="focus-ring grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                aria-label="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      <TransactionFormModal
        key={editing?.id ?? "novo"}
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        categories={availableCategories}
        kind={kind}
        initialValues={initialValues}
        error={saveError}
        submitting={saving}
      />
    </>
  );
}
