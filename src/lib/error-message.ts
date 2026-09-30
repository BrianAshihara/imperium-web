/**
 * Traduz as mensagens da API para pt-BR.
 *
 * O backend responde em inglês de propósito (mensagem + código são de máquina);
 * o texto que o usuário lê é responsabilidade daqui.
 */
const MESSAGES: Record<string, string> = {
  // auth
  "Invalid credentials": "E-mail ou senha inválidos.",
  "Email already in use": "Este e-mail já está em uso.",
  "Missing token": "Sua sessão expirou. Entre novamente.",
  "Invalid token": "Sua sessão expirou. Entre novamente.",
  Unauthorized: "Sua sessão expirou. Entre novamente.",
  "Too many requests, try again later":
    "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",

  // validação
  "Validation failed": "Confira os dados informados.",
  "Recurrence type is required for recurring entries":
    "Escolha a frequência da recorrência.",
  "Recurrence type is only allowed on recurring entries":
    "A frequência só se aplica a lançamentos recorrentes.",
  "Recurrence end date is only allowed on recurring entries":
    "A data final só se aplica a lançamentos recorrentes.",
  "Recurrence end date cannot be before the entry date":
    "A data final da recorrência não pode ser anterior à data do lançamento.",

  // categorias
  "Category not found": "Categoria não encontrada.",
  "Category name is required": "Informe o nome da categoria.",
  "Category name already exists": "Já existe uma categoria com esse nome.",
  "Category must be of type income":
    "Escolha uma categoria de receita para este lançamento.",
  "Category must be of type expense":
    "Escolha uma categoria de despesa para este lançamento.",
  "Default categories cannot be renamed":
    "Categorias padrão não podem ser renomeadas.",
  "Category cannot be deleted because it is still in use":
    "Esta categoria ainda está em uso e não pode ser excluída.",

  // lançamentos e orçamentos
  "Income not found": "Receita não encontrada.",
  "Expense not found": "Despesa não encontrada.",
  "Budget not found": "Orçamento não encontrado.",
  "Budget already exists for this period and category":
    "Já existe um orçamento para esta categoria neste mês.",

  // rede / servidor
  "Internal server error": "Erro no servidor. Tente novamente em instantes.",
  "Failed to fetch": "Não foi possível falar com o servidor. Ele está rodando?",
};

export function errorMessage(
  error: unknown,
  fallback = "Algo deu errado. Tente novamente."
): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  if (!raw) return fallback;

  return MESSAGES[raw] ?? fallback;
}
