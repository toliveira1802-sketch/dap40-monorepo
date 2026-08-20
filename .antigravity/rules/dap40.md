# Antigravity Workspace Rules - DAP40

- **Arquitetura Base:** Monorepo com `pnpm workspaces`.
- **Packages Compartilhados:**
  - Banco de Dados: `@dap40/database`
  - Contratos e Tipos: `@dap40/types`
  - UI Kit: `@dap40/ui`
  - Utilitários: `@dap40/utils`
- **Diretrizes de Geração:**
  - Não duplique tabelas ou validações em `apps/`.
  - Use sempre imports de workspace (`@dap40/*`).
