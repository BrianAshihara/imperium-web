"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { SegmentedControl } from "@/components/segmented-control";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/error-message";

type CategoryType = "income" | "expense";

type Category = {
  id: string;
  name: string;
  type: CategoryType;
  isDefault: boolean;
};

const TYPE_OPTIONS = [
  { value: "expense" as const, label: "Despesa" },
  { value: "income" as const, label: "Receita" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<{ data: Category[] }>("/api/categories");
      setCategories(response.data);
      setError("");
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao carregar as categorias."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (category: Category) => {
    if (!confirm(`Excluir a categoria "${category.name}"?`)) return;

    try {
      await api.delete(`/api/categories/${category.id}`);
      fetchCategories();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao excluir a categoria."));
    }
  };

  const groups: Array<{ type: CategoryType; title: string; caption: string }> = [
    { type: "income", title: "Receitas", caption: "Entradas de dinheiro" },
    { type: "expense", title: "Despesas", caption: "Saídas de dinheiro" },
  ];

  return (
    <>
      <PageHeader
        title="Categorias"
        eyebrow="Como seus lançamentos são organizados"
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="focus-ring flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Nova categoria
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groups.map((group) => {
          const items = categories.filter((category) => category.type === group.type);

          return (
            <section key={group.type} className="surface p-5 lg:p-6">
              <header className="mb-4 flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-[-0.01em]">{group.title}</h2>
                  <p className="text-sm text-muted-foreground">{group.caption}</p>
                </div>
                <span className="numeric text-sm text-muted-foreground">{items.length}</span>
              </header>

              {loading ? (
                <div className="flex flex-col gap-2">
                  {[...Array(5)].map((_, index) => (
                    <Skeleton key={index} className="h-11 w-full rounded-xl" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma categoria de {group.title.toLowerCase()}
                </p>
              ) : (
                <ul className="flex flex-col">
                  {items.map((category) => (
                    <li
                      key={category.id}
                      className="group flex items-center gap-3 border-b border-border/70 py-2.5 last:border-0"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            group.type === "income" ? "var(--accent)" : "var(--expense)",
                        }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">{category.name}</span>

                      {category.isDefault ? (
                        <span className="pill bg-muted text-muted-foreground">padrão</span>
                      ) : (
                        <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(category);
                              setModalOpen(true);
                            }}
                            className="focus-ring grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label={`Editar ${category.name}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            className="focus-ring grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Excluir ${category.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Categorias padrão não podem ser renomeadas ou excluídas. Uma categoria em uso por algum
        lançamento ou orçamento também fica protegida.
      </p>

      <CategoryFormModal
        key={editing?.id ?? "nova"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          setModalOpen(false);
          setEditing(null);
          fetchCategories();
        }}
        category={editing}
      />
    </>
  );
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  category: Category | null;
}

function CategoryFormModal({ isOpen, onClose, onSaved, category }: CategoryFormModalProps) {
  const isEditing = Boolean(category);
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<CategoryType>(category?.type ?? "expense");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError("");

    try {
      if (category) {
        await api.put(`/api/categories/${category.id}`, { name: name.trim() });
      } else {
        await api.post("/api/categories", { name: name.trim(), type });
      }
      onSaved();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erro ao salvar a categoria."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border-border bg-card p-6 text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-[-0.01em]">
            {isEditing ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-name">Nome</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Assinaturas"
              minLength={2}
              maxLength={60}
              required
              autoFocus
              className="h-11"
            />
          </div>

          {!isEditing && (
            <div className="flex items-center justify-between gap-3">
              <Label className="mb-0">Tipo</Label>
              <SegmentedControl
                options={TYPE_OPTIONS}
                value={type}
                onChange={setType}
                size="sm"
                ariaLabel="Tipo da categoria"
              />
            </div>
          )}

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
