"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { BrandMark } from "@/components/brand";
import { useAuth } from "@/hooks/use-auth";

const TOKEN_KEY = "token";

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

/** O localStorage é uma fonte externa; lê-lo assim evita sincronizar estado em efeito. */
function useStoredToken(): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(TOKEN_KEY),
    () => undefined
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useStoredToken();
  const { user } = useAuth();

  useEffect(() => {
    if (token === null) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [token, router, pathname]);

  if (!token) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <BrandMark className="animate-pulse" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <AppShell user={user}>{children}</AppShell>;
}
