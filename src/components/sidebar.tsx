"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, LogOut, PiggyBank, Receipt, Tags } from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutGrid },
  { href: "/dashboard/transactions", label: "Transações", icon: Receipt },
  { href: "/dashboard/budgets", label: "Orçamentos", icon: PiggyBank },
  { href: "/dashboard/categories", label: "Categorias", icon: Tags },
] as const;

interface SidebarProps {
  user?: { name: string | null; email: string } | null;
  onNavigate?: () => void;
}

export function Sidebar({ user, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = (user?.name ?? user?.email ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const handleLogout = () => {
    api.removeToken();
    router.replace("/login");
  };

  return (
    <div className="flex h-full w-60 flex-col bg-sidebar px-4 py-5">
      <Link href="/dashboard" onClick={onNavigate} className="focus-ring rounded-lg px-1">
        <BrandLockup />
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[var(--shadow-pill)]"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <item.icon size={18} strokeWidth={isActive ? 2 : 1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        {user && (
          <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-card/60 px-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name ?? "Você"}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          <LogOut size={18} strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </div>
  );
}
