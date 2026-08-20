/**
 * GestÃ£o feature page IDs and grants for the DAP40 portal shell.
 * Wire into shared/accessPages.ts at integration time.
 */
export const GESTAO_MODULE_ID = "gestao" as const;

export const gestaoAccessPages = {
  "gestao.dashboard": {
    path: "/gestao",
    label: "Dashboard",
    grant: "gestao.view",
  },
  "gestao.visao360": {
    path: "/gestao/visao-360",
    label: "VisÃ£o 360Â°",
    grant: "gestao.view",
  },
  "gestao.resumo": {
    path: "/gestao/resumo",
    label: "Resumo Executivo",
    grant: "gestao.view",
  },
  "gestao.kpis": {
    path: "/gestao/kpis",
    label: "GestÃ£o de KPIs",
    grant: "gestao.view",
  },
  "gestao.cockpit": {
    path: "/gestao/cockpit",
    label: "Cockpit de OperaÃ§Ã£o",
    grant: "gestao.operate",
  },
  "gestao.area.cliente": {
    path: "/gestao/area/cliente",
    label: "Cliente",
    grant: "gestao.view",
  },
  "gestao.area.conhecimento": {
    path: "/gestao/area/conhecimento",
    label: "Conhecimento",
    grant: "gestao.view",
  },
  "gestao.area.crescimento": {
    path: "/gestao/area/crescimento",
    label: "Crescimento",
    grant: "gestao.view",
  },
  "gestao.area.financeiro": {
    path: "/gestao/area/financeiro",
    label: "Financeiro",
    grant: "gestao.view",
  },
  "gestao.area.marketing": {
    path: "/gestao/area/marketing",
    label: "Marketing",
    grant: "gestao.view",
  },
  "gestao.area.operacao": {
    path: "/gestao/area/operacao",
    label: "OperaÃ§Ã£o",
    grant: "gestao.view",
  },
  "gestao.area.pessoas": {
    path: "/gestao/area/pessoas",
    label: "Pessoas",
    grant: "gestao.view",
  },
  "gestao.area.infraestrutura": {
    path: "/gestao/area/infraestrutura",
    label: "Infraestrutura",
    grant: "gestao.view",
  },
  "gestao.area.tecnologia": {
    path: "/gestao/area/tecnologia",
    label: "Tecnologia",
    grant: "gestao.view",
  },
  "gestao.area.vendas": {
    path: "/gestao/area/vendas",
    label: "Vendas",
    grant: "gestao.view",
  },
} as const;

export type GestaoPageId = keyof typeof gestaoAccessPages;
