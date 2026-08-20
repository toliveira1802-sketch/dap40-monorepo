export const BUDGET_ITEM_KIND_LABELS = {
  service: "Serviço / Mão de Obra",
  part: "Peça / Componente",
  fluid: "Fluido / Lubrificante",
  external: "Serviço Terceirizado",
} as const;

export const BUDGET_ITEM_STATUS_LABELS = {
  pending: "Pendente de Análise",
  approved: "Aprovado",
  rejected: "Rejeitado pelo Cliente",
  in_progress: "Em Execução",
  completed: "Concluído",
} as const;

export const ENTRY_CHECKLIST_ITEMS = [
  "Nível de Óleo do Motor",
  "Líquido de Arrefecimento",
  "Fluido de Freio",
  "Estado dos Pneus e Rodas",
  "Faróis, Lanternas e Setas",
  "Avarias na Funilaria e Pintura",
  "Pertences e Objetos no Interior",
  "Luzes de Alerta no Painel",
] as const;

export const WORKSPACE_STAGE_ACTIONS = [
  { id: "triagem", label: "Enviar para Triagem", patioStage: "triagem" },
  { id: "diagnostico", label: "Iniciar Diagnóstico", patioStage: "diagnostico" },
  { id: "orcamento", label: "Gerar Orçamento", patioStage: "orcamento" },
  { id: "aprovacao", label: "Aguardar Aprovação", patioStage: "aprovacao" },
  { id: "aguardando_peca", label: "Solicitar Peças", patioStage: "aguardando_peca" },
  { id: "execucao", label: "Iniciar Execução", patioStage: "execucao" },
  { id: "qualidade", label: "Controle de Qualidade", patioStage: "qualidade" },
  { id: "lavagem", label: "Enviar para Lavagem", patioStage: "lavagem" },
  { id: "pronto", label: "Liberar para Entrega", patioStage: "pronto" },
  { id: "deliver", label: "Confirmar Entrega ao Cliente", patioStage: "pronto", deliverYard: true },
  { id: "reject", label: "Orçamento Não Aprovado", patioStage: "triagem", cancelYard: true, osStatus: "cancelled" },
] as const;
