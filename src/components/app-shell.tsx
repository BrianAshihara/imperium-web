"use client";

import { createContext, useContext, useState } from "react";

import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

type ShellUser = { name: string | null; email: string } | null;

const SidebarContext = createContext<{ open: () => void }>({ open: () => {} });

export const useSidebar = () => useContext(SidebarContext);

export function AppShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ open: () => setMobileOpen(true) }}>
      <div className="flex min-h-screen bg-background">
        <aside className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <Sidebar user={user} />
        </aside>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 h-screen border-r border-sidebar-border transition-transform duration-200 lg:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar user={user} onNavigate={() => setMobileOpen(false)} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
          <footer className="mx-auto w-full max-w-[1440px] px-4 pb-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-1 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Imperium - projeto de portfólio</span>
              <span>Valores em reais (BRL)</span>
            </div>
          </footer>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
