import { BrandLockup } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="dotted-field pointer-events-none absolute inset-0 opacity-10" aria-hidden />

        <div className="relative flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-accent" aria-hidden>
            <svg viewBox="0 0 24 24" className="size-4" fill="none">
              <rect x="4" y="12" width="3.5" height="8" rx="1.25" fill="var(--primary)" />
              <rect x="10.25" y="7" width="3.5" height="13" rx="1.25" fill="var(--primary)" />
              <rect x="16.5" y="4" width="3.5" height="16" rx="1.25" fill="var(--primary)" opacity="0.55" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">Imperium</span>
        </div>

        <div className="relative max-w-md">
          <p className="text-[38px] font-semibold leading-[1.1] tracking-[-0.03em]">
            Todo real que entra e sai, em um lugar só.
          </p>
          <p className="mt-4 text-primary-foreground/70">
            Receitas, despesas, orçamentos e relatórios mensais, sem planilha.
          </p>
        </div>

        <dl className="relative grid grid-cols-3 gap-6 border-t border-primary-foreground/15 pt-8">
          <div>
            <dt className="text-xs text-primary-foreground/60">Lançamentos</dt>
            <dd className="mt-1 text-sm font-medium">Receitas e despesas</dd>
          </div>
          <div>
            <dt className="text-xs text-primary-foreground/60">Recorrência</dt>
            <dd className="mt-1 text-sm font-medium">Projetada, não duplicada</dd>
          </div>
          <div>
            <dt className="text-xs text-primary-foreground/60">Relatórios</dt>
            <dd className="mt-1 text-sm font-medium">Mês a mês</dd>
          </div>
        </dl>
      </aside>

      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandLockup />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
