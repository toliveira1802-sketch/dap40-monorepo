# DAP40 - AI Master Directives

## Workspace Map
- `apps/portal`: Aplicação web de gestão operacional.
- `apps/client`: Aplicação web do cliente.
- `apps/api`: Servidor backend / REST / endpoints.
- `packages/database`: Drizzle ORM + PostgreSQL/Supabase (Fonte única de schemas de banco).
- `packages/types`: Zod schemas, DTOs e tipagens TypeScript universais.
- `packages/ui`: Design System e componentes de interface compartilhados.
- `packages/utils`: Formatadores (placas, CPF/CNPJ, valores) e funções puras.

## Strict Rules
1. **Zero Schema Duplication:** Toda entidade de banco reside exclusivamente em `packages/database`.
2. **Contract First:** Crie e atualize schemas Zod em `packages/types` antes de implementar rotas na API ou formulários no frontend.
3. **Type Safety:** Todas as fronteiras de dados utilizam inferência Zod/Drizzle sem tipos soltos (`any`).
