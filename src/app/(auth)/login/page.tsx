import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesse sua conta para continuar.
        </p>
      </header>

      <Suspense
        fallback={<p className="py-4 text-sm text-muted-foreground">Carregando...</p>}
      >
        <LoginForm />
      </Suspense>
    </>
  );
}
