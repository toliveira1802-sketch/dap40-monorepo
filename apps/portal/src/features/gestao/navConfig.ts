import { gestaoAccessPages } from "./accessPages";

export type GestaoNavItem = {
  pageId: keyof typeof gestaoAccessPages;
  path: string;
  label: string;
};

export type GestaoNavSection = {
  section: string;
  items: GestaoNavItem[];
};

/**
 * Sidebar navigation for the GestÃ£o module inside the DAP40 portal shell.
 * Wire into shared/navConfig.ts at integration time.
 */
export const gestaoNavConfig: GestaoNavSection[] = [
  {
    section: "Operacional",
    items: [
      {
        pageId: "gestao.cockpit",
        path: gestaoAccessPages["gestao.cockpit"].path,
        label: gestaoAccessPages["gestao.cockpit"].label,
      },
    ],
  },
  {
    section: "Indicadores",
    items: [
      {
        pageId: "gestao.dashboard",
        path: gestaoAccessPages["gestao.dashboard"].path,
        label: gestaoAccessPages["gestao.dashboard"].label,
      },
      {
        pageId: "gestao.visao360",
        path: gestaoAccessPages["gestao.visao360"].path,
        label: gestaoAccessPages["gestao.visao360"].label,
      },
      {
        pageId: "gestao.resumo",
        path: gestaoAccessPages["gestao.resumo"].path,
        label: gestaoAccessPages["gestao.resumo"].label,
      },
      {
        pageId: "gestao.kpis",
        path: gestaoAccessPages["gestao.kpis"].path,
        label: gestaoAccessPages["gestao.kpis"].label,
      },
    ],
  },
  {
    section: "Ãreas",
    items: [
      {
        pageId: "gestao.area.cliente",
        path: gestaoAccessPages["gestao.area.cliente"].path,
        label: gestaoAccessPages["gestao.area.cliente"].label,
      },
      {
        pageId: "gestao.area.conhecimento",
        path: gestaoAccessPages["gestao.area.conhecimento"].path,
        label: gestaoAccessPages["gestao.area.conhecimento"].label,
      },
      {
        pageId: "gestao.area.crescimento",
        path: gestaoAccessPages["gestao.area.crescimento"].path,
        label: gestaoAccessPages["gestao.area.crescimento"].label,
      },
      {
        pageId: "gestao.area.financeiro",
        path: gestaoAccessPages["gestao.area.financeiro"].path,
        label: gestaoAccessPages["gestao.area.financeiro"].label,
      },
      {
        pageId: "gestao.area.marketing",
        path: gestaoAccessPages["gestao.area.marketing"].path,
        label: gestaoAccessPages["gestao.area.marketing"].label,
      },
      {
        pageId: "gestao.area.operacao",
        path: gestaoAccessPages["gestao.area.operacao"].path,
        label: gestaoAccessPages["gestao.area.operacao"].label,
      },
      {
        pageId: "gestao.area.pessoas",
        path: gestaoAccessPages["gestao.area.pessoas"].path,
        label: gestaoAccessPages["gestao.area.pessoas"].label,
      },
      {
        pageId: "gestao.area.infraestrutura",
        path: gestaoAccessPages["gestao.area.infraestrutura"].path,
        label: gestaoAccessPages["gestao.area.infraestrutura"].label,
      },
      {
        pageId: "gestao.area.tecnologia",
        path: gestaoAccessPages["gestao.area.tecnologia"].path,
        label: gestaoAccessPages["gestao.area.tecnologia"].label,
      },
      {
        pageId: "gestao.area.vendas",
        path: gestaoAccessPages["gestao.area.vendas"].path,
        label: gestaoAccessPages["gestao.area.vendas"].label,
      },
    ],
  },
];
