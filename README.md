# Imperium Web

Frontend do Imperium, um app de finanças pessoais em pt-BR. Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4.

A API vive em um repositório separado: [imperium-api](https://github.com/brianashihara/imperium-api). **Ela precisa estar rodando** para o app funcionar.

## Como rodar

```bash
# 1. em ../imperium-api
npm run dev            # API em http://localhost:3333

# 2. aqui
npm install
npm run dev            # app em http://localhost:3000
```

Entre com o usuário criado pelo `npm run seed` da API: `demo@imperium.local` / `demo12345`.

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Sobe a build |
| `npm run lint` | ESLint |

### Variáveis de ambiente

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## Telas

| Rota | Conteúdo |
|---|---|
| `/login`, `/register` | Autenticação; o token JWT fica no `localStorage` |
| `/dashboard` | Divisão entre comprometido, variável e livre; onde o dinheiro foi; compromissos do mês; ritmo dos limites; entradas e saídas em 6 ou 12 meses; últimos lançamentos |
| `/dashboard/transactions` | Receitas e despesas com paginação, criação, edição, tipo fixa/variável e recorrência |
| `/dashboard/budgets` | Orçamentos do mês com percentual usado e valor restante |
| `/dashboard/categories` | Categorias padrão e customizadas |

## Estrutura

```
src/
  app/
    (auth)/            # login e cadastro, com layout próprio
    dashboard/         # área autenticada (layout com AuthGuard + shell)
    globals.css        # tokens de cor e utilitários customizados
    layout.tsx         # fonte, metadados e shell do documento
  components/
    ui/                # primitivos shadcn sobre @base-ui/react
    *.tsx              # sidebar, cards, gráficos, formulários
  hooks/
  lib/                 # cliente da API, formatação, datas, mensagens de erro
```

## Design

Tema claro único, com cara de fintech: fundo off-white quente, cards brancos de cantos suaves, tinta preta na ação primária, faixa grafite no topo do dashboard e coral nas saídas. O lime aparece em pouca área, marcando o dinheiro que sobrou livre. Tipografia Geist, com números tabulares em tudo que é valor.

As cores são tokens `oklch` em `globals.css`, expostos ao Tailwind via `@theme inline`. Nada de cor hardcoded no JSX.

| Token | Uso |
|---|---|
| `--primary` | Tinta: botão primário, série de entradas |
| `--accent` | Lime: a fatia livre do mês, destaques pontuais |
| `--expense` | Coral: saídas e despesas |
| `--destructive` | Exclusão e orçamento estourado |
| `--muted-foreground` | Texto secundário |

Os gráficos são Recharts e puxam as cores dos mesmos tokens (`var(--primary)`), nunca de HSL escrito à mão. O ranking de categorias é uma barra segmentada com legenda textual, que é o que garante a leitura sem depender de cor.

## Notas

- Estado é `useState`/`useEffect`, sem Redux, Zustand ou React Query.
- As mensagens de erro da API chegam em inglês e são traduzidas em `src/lib/error-message.ts`.
- `src/lib/api.ts` e `src/lib/utils.ts` são estáveis; evite mexer.
