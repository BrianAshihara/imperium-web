import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Leva menos de um minuto para começar.
        </p>
      </header>

      <RegisterForm />
    </>
  );
}
