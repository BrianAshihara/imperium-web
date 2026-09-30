"use client";

import { Menu } from "lucide-react";

import { useSidebar } from "@/components/app-shell";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  const { open } = useSidebar();

  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={open}
          className="focus-ring -ml-1 grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>

        <div>
          {eyebrow && <p className="text-sm text-muted-foreground">{eyebrow}</p>}
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">
            {title}
          </h1>
        </div>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
