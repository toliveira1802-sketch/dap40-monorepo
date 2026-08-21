export type MeuDapWidgetKind = "common" | "personal";

export type MeuDapWidgetId =
  | "avisos"
  | "atalhos"
  | "status_oficina"
  | "faltas"
  | "atestado"
  | "aniversario";

export type MeuDapWidgetDef = {
  id: MeuDapWidgetId;
  kind: MeuDapWidgetKind;
  title: string;
  description: string;
  defaultVisible: boolean;
  defaultOrder: number;
};

/** Catálogo fixo — conteúdo comum não é editável pelo usuário. */
export const MEU_DAP_WIDGETS: MeuDapWidgetDef[] = [
  {
    id: "avisos",
    kind: "common",
    title: "Avisos da empresa",
    description: "Comunicados gerais da oficina",
    defaultVisible: true,
    defaultOrder: 10,
  },
  {
    id: "atalhos",
    kind: "common",
    title: "Atalhos rápidos",
    description: "Links úteis do dia a dia",
    defaultVisible: true,
    defaultOrder: 20,
  },
  {
    id: "status_oficina",
    kind: "common",
    title: "Status da oficina",
    description: "Resumo operacional (informativo)",
    defaultVisible: true,
    defaultOrder: 30,
  },
  {
    id: "faltas",
    kind: "personal",
    title: "Faltas",
    description: "Registro pessoal",
    defaultVisible: true,
    defaultOrder: 40,
  },
  {
    id: "atestado",
    kind: "personal",
    title: "Atestado",
    description: "Atestados médicos",
    defaultVisible: true,
    defaultOrder: 50,
  },
  {
    id: "aniversario",
    kind: "personal",
    title: "Aniversário do colaborador",
    description: "Próximos aniversários",
    defaultVisible: true,
    defaultOrder: 60,
  },
];

export type MeuDapWidgetPrefs = {
  /** ids ocultos */
  hidden: MeuDapWidgetId[];
  /** ordem preferida; ids omitidos usam defaultOrder */
  order: MeuDapWidgetId[];
};
