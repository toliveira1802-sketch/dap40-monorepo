import type { BusinessAreaKey } from "./areas";

// === TIPOS ===

export type KpiPriority = "critica" | "alta" | "media" | "baixa";
export type KpiCategory = "receita" | "operacional" | "estrategico" | "qualidade" | "pessoas" | "marketing";
export type KpiStatus = "acima" | "dentro" | "abaixo" | "sem_meta";
export type KpiFrequency = "diario" | "semanal" | "mensal" | "trimestral" | "anual";

export interface KpiDefinition {
  id: string;
  area: BusinessAreaKey;
  label: string;
  description: string;
  unit: string;
  currentValue: string;
  targetValue: string;
  previousValue: string;
  priority: KpiPriority;
  category: KpiCategory;
  status: KpiStatus;
  frequency: KpiFrequency;
  owner: string;
  formula?: string;
  trend: string;
  trendUp: boolean;
}

// === DADOS POR ÃREA ===

export const kpiDefinitions: KpiDefinition[] = [
  // --- CLIENTE ---
  { id: "cli-01", area: "cliente", label: "Total de Clientes Ativos", description: "Base total de clientes com pelo menos 1 serviÃ§o nos Ãºltimos 6 meses", unit: "clientes", currentValue: "342", targetValue: "350", previousValue: "330", priority: "alta", category: "estrategico", status: "dentro", frequency: "mensal", owner: "Simone", trend: "+12", trendUp: true },
  { id: "cli-02", area: "cliente", label: "Novos Clientes no MÃªs", description: "Clientes que realizaram o primeiro serviÃ§o no mÃªs vigente", unit: "clientes", currentValue: "28", targetValue: "30", previousValue: "20", priority: "alta", category: "estrategico", status: "abaixo", frequency: "mensal", owner: "Simone", trend: "+8", trendUp: true },
  { id: "cli-03", area: "cliente", label: "Taxa de RetenÃ§Ã£o", description: "% de clientes que voltaram apÃ³s o primeiro serviÃ§o", unit: "%", currentValue: "87%", targetValue: "85%", previousValue: "84%", priority: "critica", category: "qualidade", status: "acima", frequency: "mensal", owner: "Simone", trend: "+3%", trendUp: true },
  { id: "cli-04", area: "cliente", label: "NPS", description: "Net Promoter Score â€” satisfaÃ§Ã£o do cliente", unit: "pontos", currentValue: "9.2", targetValue: "8.5", previousValue: "8.8", priority: "critica", category: "qualidade", status: "acima", frequency: "mensal", owner: "Simone", trend: "+0.4", trendUp: true },
  { id: "cli-05", area: "cliente", label: "Ticket MÃ©dio por Cliente", description: "Receita mÃ©dia por cliente no perÃ­odo", unit: "R$", currentValue: "R$ 2.8K", targetValue: "R$ 2.5K", previousValue: "R$ 2.6K", priority: "alta", category: "receita", status: "acima", frequency: "mensal", owner: "JoÃ£o", trend: "+8%", trendUp: true },
  { id: "cli-06", area: "cliente", label: "Clientes Inativos (90d)", description: "Clientes sem serviÃ§o nos Ãºltimos 90 dias", unit: "clientes", currentValue: "48", targetValue: "30", previousValue: "52", priority: "media", category: "estrategico", status: "abaixo", frequency: "mensal", owner: "Simone", trend: "-4", trendUp: true },

  // --- CONHECIMENTO ---
  { id: "con-00", area: "conhecimento", label: "QualificaÃ§Ã£o da Equipe", description: "% da equipe com certificaÃ§Ã£o tÃ©cnica atualizada", unit: "%", currentValue: "78%", targetValue: "90%", previousValue: "72%", priority: "critica", category: "pessoas", status: "abaixo", frequency: "trimestral", owner: "Pedro", trend: "+6pp", trendUp: true },
  { id: "con-01", area: "conhecimento", label: "Documentos TÃ©cnicos", description: "Total de manuais, procedimentos e guias catalogados", unit: "docs", currentValue: "156", targetValue: "150", previousValue: "144", priority: "media", category: "operacional", status: "acima", frequency: "trimestral", owner: "Pedro", trend: "+12", trendUp: true },
  { id: "con-02", area: "conhecimento", label: "Treinamentos Ativos", description: "Trilhas de capacitaÃ§Ã£o em andamento", unit: "trilhas", currentValue: "7", targetValue: "5", previousValue: "5", priority: "alta", category: "pessoas", status: "acima", frequency: "mensal", owner: "Pedro", trend: "+2", trendUp: true },
  { id: "con-03", area: "conhecimento", label: "Taxa de ConclusÃ£o de Treinamentos", description: "% de trilhas concluÃ­das dentro do prazo", unit: "%", currentValue: "92%", targetValue: "85%", previousValue: "87%", priority: "alta", category: "pessoas", status: "acima", frequency: "mensal", owner: "Pedro", trend: "+5%", trendUp: true },
  { id: "con-04", area: "conhecimento", label: "Biblioteca de Mapas", description: "Mapas exclusivos catalogados por veÃ­culo e estÃ¡gio", unit: "mapas", currentValue: "89", targetValue: "100", previousValue: "84", priority: "media", category: "operacional", status: "abaixo", frequency: "trimestral", owner: "Pedro", trend: "+5", trendUp: true },
  { id: "con-05", area: "conhecimento", label: "Casos Documentados", description: "Casos reais de diagnÃ³stico e soluÃ§Ã£o na wiki", unit: "casos", currentValue: "34", targetValue: "50", previousValue: "28", priority: "baixa", category: "operacional", status: "abaixo", frequency: "mensal", owner: "Pedro", trend: "+6", trendUp: true },

  // --- CRESCIMENTO ---
  { id: "cre-01", area: "crescimento", label: "Receita Acumulada", description: "Receita total acumulada no ano", unit: "R$", currentValue: "R$ 1.2M", targetValue: "R$ 1.3M", previousValue: "R$ 0.85M", priority: "critica", category: "receita", status: "abaixo", frequency: "anual", owner: "Pitoco", trend: "+41%", trendUp: true },
  { id: "cre-02", area: "crescimento", label: "Market Share VW/Audi", description: "ParticipaÃ§Ã£o no mercado de serviÃ§os VW/Audi em SP", unit: "%", currentValue: "23%", targetValue: "25%", previousValue: "19%", priority: "critica", category: "estrategico", status: "abaixo", frequency: "trimestral", owner: "Pitoco", trend: "+4%", trendUp: true },
  { id: "cre-03", area: "crescimento", label: "ProjeÃ§Ã£o 2027", description: "Meta de receita para 2027 com expansÃ£o Mercedes/BMW", unit: "R$", currentValue: "R$ 2.8M", targetValue: "R$ 2.5M", previousValue: "R$ 0", priority: "alta", category: "estrategico", status: "acima", frequency: "anual", owner: "Pitoco", trend: "Planejado", trendUp: true },
  { id: "cre-04", area: "crescimento", label: "Novas Marcas Onboarded", description: "Marcas adicionadas ao portfÃ³lio de serviÃ§os", unit: "marcas", currentValue: "0", targetValue: "2", previousValue: "0", priority: "alta", category: "estrategico", status: "abaixo", frequency: "anual", owner: "Pitoco", trend: "2027", trendUp: true },
  { id: "cre-05", area: "crescimento", label: "GalpÃ£o Casa Verde", description: "Status da aquisiÃ§Ã£o do galpÃ£o estratÃ©gico", unit: "status", currentValue: "Em anÃ¡lise", targetValue: "Assinado", previousValue: "Pesquisa", priority: "media", category: "estrategico", status: "sem_meta", frequency: "trimestral", owner: "Pitoco", trend: "Avaliando", trendUp: true },

  // --- FINANCEIRO ---
  { id: "fin-01", area: "financeiro", label: "Faturamento Mensal", description: "Receita bruta do mÃªs vigente", unit: "R$", currentValue: "R$ 184K", targetValue: "R$ 180K", previousValue: "R$ 172K", priority: "critica", category: "receita", status: "acima", frequency: "mensal", owner: "Simone", trend: "+7%", trendUp: true },
  { id: "fin-02", area: "financeiro", label: "Margem de Lucro", description: "Lucro lÃ­quido / receita bruta", unit: "%", currentValue: "34%", targetValue: "30%", previousValue: "32%", priority: "critica", category: "receita", status: "acima", frequency: "mensal", owner: "Simone", trend: "+2pp", trendUp: true },
  { id: "fin-03", area: "financeiro", label: "Custo Operacional", description: "Custos diretos + overhead do mÃªs", unit: "R$", currentValue: "R$ 62K", targetValue: "R$ 70K", previousValue: "R$ 65K", priority: "alta", category: "operacional", status: "acima", frequency: "mensal", owner: "Simone", trend: "-5%", trendUp: true },
  { id: "fin-04", area: "financeiro", label: "Cash Flow", description: "Saldo de caixa no fim do mÃªs", unit: "R$", currentValue: "R$ 122K", targetValue: "R$ 100K", previousValue: "R$ 113K", priority: "alta", category: "receita", status: "acima", frequency: "mensal", owner: "Simone", trend: "+8%", trendUp: true },
  { id: "fin-05", area: "financeiro", label: "InadimplÃªncia", description: "% de contas em atraso > 30 dias", unit: "%", currentValue: "2.1%", targetValue: "3.0%", previousValue: "2.8%", priority: "media", category: "operacional", status: "acima", frequency: "mensal", owner: "Simone", trend: "-0.7pp", trendUp: true },
  { id: "fin-06", area: "financeiro", label: "ROI Marketing", description: "Retorno sobre investimento em marketing", unit: "x", currentValue: "3.8x", targetValue: "4.0x", previousValue: "3.4x", priority: "alta", category: "marketing", status: "abaixo", frequency: "mensal", owner: "Simone", trend: "+0.4x", trendUp: true },

  // --- MARKETING ---
  { id: "mkt-01", area: "marketing", label: "Leads Gerados", description: "Total de leads capturados no mÃªs", unit: "leads", currentValue: "124", targetValue: "100", previousValue: "106", priority: "critica", category: "marketing", status: "acima", frequency: "mensal", owner: "Pedro", trend: "+18%", trendUp: true },
  { id: "mkt-02", area: "marketing", label: "Custo por Lead (CPL)", description: "Investimento em ads / total de leads", unit: "R$", currentValue: "R$ 4,20", targetValue: "R$ 6,00", previousValue: "R$ 4,80", priority: "alta", category: "marketing", status: "acima", frequency: "mensal", owner: "Pedro", trend: "-12%", trendUp: true },
  { id: "mkt-03", area: "marketing", label: "Taxa de ConversÃ£o", description: "Leads convertidos em vendas / total de leads", unit: "%", currentValue: "13.7%", targetValue: "15%", previousValue: "11.6%", priority: "critica", category: "marketing", status: "abaixo", frequency: "mensal", owner: "Pedro", trend: "+2.1pp", trendUp: true },
  { id: "mkt-04", area: "marketing", label: "Engajamento Instagram", description: "Taxa de engajamento mÃ©dia nos posts", unit: "%", currentValue: "6.8%", targetValue: "5.0%", previousValue: "5.6%", priority: "media", category: "marketing", status: "acima", frequency: "semanal", owner: "Pedro", trend: "+1.2pp", trendUp: true },
  { id: "mkt-05", area: "marketing", label: "ROAS", description: "Return on Ad Spend â€” receita / investimento em ads", unit: "x", currentValue: "3.8x", targetValue: "4.0x", previousValue: "3.4x", priority: "alta", category: "marketing", status: "abaixo", frequency: "mensal", owner: "Pedro", trend: "+0.4x", trendUp: true },

  // --- OPERAÃ‡ÃƒO ---
  { id: "ope-01", area: "operacao", label: "OS no MÃªs", description: "Total de ordens de serviÃ§o executadas no mÃªs", unit: "OS", currentValue: "73", targetValue: "70", previousValue: "65", priority: "alta", category: "operacional", status: "acima", frequency: "mensal", owner: "JoÃ£o", trend: "+8", trendUp: true },
  { id: "ope-02", area: "operacao", label: "Tempo MÃ©dio de Atendimento", description: "Tempo mÃ©dio entre entrada e entrega do veÃ­culo", unit: "h", currentValue: "2.8h", targetValue: "3.0h", previousValue: "3.2h", priority: "critica", category: "operacional", status: "acima", frequency: "semanal", owner: "JoÃ£o", trend: "-0.4h", trendUp: true },
  { id: "ope-03", area: "operacao", label: "Taxa de Retorno", description: "% de OS que voltaram para retrabalho", unit: "%", currentValue: "4%", targetValue: "5%", previousValue: "5.1%", priority: "critica", category: "qualidade", status: "acima", frequency: "mensal", owner: "JoÃ£o", trend: "-1pp", trendUp: true },
  { id: "ope-04", area: "operacao", label: "Produtividade da Equipe", description: "OS concluÃ­das / horas disponÃ­veis da equipe", unit: "%", currentValue: "91%", targetValue: "85%", previousValue: "87%", priority: "alta", category: "operacional", status: "acima", frequency: "mensal", owner: "JoÃ£o", trend: "+4pp", trendUp: true },
  { id: "ope-05", area: "operacao", label: "OS em Andamento", description: "Ordens de serviÃ§o atualmente em execuÃ§Ã£o", unit: "OS", currentValue: "18", targetValue: "20", previousValue: "15", priority: "media", category: "operacional", status: "dentro", frequency: "diario", owner: "JoÃ£o", trend: "+3", trendUp: true },

  // --- PESSOAS ---
  { id: "pes-00", area: "pessoas", label: "Produtividade Geral", description: "Produtividade mÃ©dia da equipe (OS/hora)", unit: "OS/h", currentValue: "1.8", targetValue: "2.0", previousValue: "1.6", priority: "critica", category: "operacional", status: "abaixo", frequency: "mensal", owner: "Simone", trend: "+0.2", trendUp: true },
  { id: "pes-01", area: "pessoas", label: "Headcount Total", description: "Total de colaboradores ativos", unit: "pessoas", currentValue: "12", targetValue: "12", previousValue: "10", priority: "media", category: "pessoas", status: "dentro", frequency: "mensal", owner: "Simone", trend: "+2", trendUp: true },
  { id: "pes-02", area: "pessoas", label: "Turnover", description: "% de colaboradores que saÃ­ram no perÃ­odo", unit: "%", currentValue: "8%", targetValue: "10%", previousValue: "11%", priority: "alta", category: "pessoas", status: "acima", frequency: "trimestral", owner: "Simone", trend: "-3pp", trendUp: true },
  { id: "pes-03", area: "pessoas", label: "Consultores Ativos", description: "Consultores comerciais em operaÃ§Ã£o", unit: "consultores", currentValue: "2", targetValue: "2", previousValue: "2", priority: "alta", category: "pessoas", status: "dentro", frequency: "mensal", owner: "Simone", trend: "JoÃ£o e Pedro", trendUp: true },
  { id: "pes-04", area: "pessoas", label: "MecÃ¢nicos Ativos", description: "MecÃ¢nicos em operaÃ§Ã£o", unit: "mecÃ¢nicos", currentValue: "5", targetValue: "5", previousValue: "4", priority: "alta", category: "pessoas", status: "dentro", frequency: "mensal", owner: "Simone", trend: "+1", trendUp: true },
  { id: "pes-05", area: "pessoas", label: "Horas de Treinamento", description: "Horas de capacitaÃ§Ã£o por colaborador no mÃªs", unit: "h", currentValue: "8h", targetValue: "6h", previousValue: "5h", priority: "media", category: "pessoas", status: "acima", frequency: "mensal", owner: "Pedro", trend: "+3h", trendUp: true },

  // --- INFRAESTRUTURA ---
  { id: "inf-01", area: "infraestrutura", label: "Disponibilidade da Infraestrutura", description: "% de recursos fÃ­sicos crÃ­ticos disponÃ­veis para a operaÃ§Ã£o", unit: "%", currentValue: "96%", targetValue: "98%", previousValue: "94%", priority: "critica", category: "qualidade", status: "abaixo", frequency: "semanal", owner: "Pitoco", trend: "+2pp", trendUp: true },
  { id: "inf-02", area: "infraestrutura", label: "IntervenÃ§Ãµes no Prazo", description: "% de obras e melhorias fÃ­sicas concluÃ­das dentro do prazo acordado", unit: "%", currentValue: "82%", targetValue: "90%", previousValue: "76%", priority: "alta", category: "operacional", status: "abaixo", frequency: "mensal", owner: "Pitoco", trend: "+6pp", trendUp: true },
  { id: "inf-03", area: "infraestrutura", label: "LicenÃ§as de Scanner Regulares", description: "% de licenÃ§as de scanners ativas e em conformidade", unit: "%", currentValue: "100%", targetValue: "100%", previousValue: "88%", priority: "critica", category: "operacional", status: "dentro", frequency: "mensal", owner: "Pitoco", trend: "+12pp", trendUp: true },
  { id: "inf-04", area: "infraestrutura", label: "LicenÃ§as a Vencer em 60 Dias", description: "LicenÃ§as de scanner com renovaÃ§Ã£o necessÃ¡ria nos prÃ³ximos 60 dias", unit: "licenÃ§as", currentValue: "2", targetValue: "0", previousValue: "3", priority: "alta", category: "operacional", status: "abaixo", frequency: "semanal", owner: "Pitoco", trend: "-1", trendUp: true },
  { id: "inf-05", area: "infraestrutura", label: "Equipamentos CrÃ­ticos Operacionais", description: "% de scanners, elevadores e equipamentos essenciais disponÃ­veis", unit: "%", currentValue: "93%", targetValue: "95%", previousValue: "90%", priority: "critica", category: "qualidade", status: "abaixo", frequency: "semanal", owner: "Pitoco", trend: "+3pp", trendUp: true },
  { id: "inf-06", area: "infraestrutura", label: "ExecuÃ§Ã£o do Budget de Melhorias", description: "% do orÃ§amento anual comprometido em projetos estruturais aprovados", unit: "%", currentValue: "68%", targetValue: "75%", previousValue: "51%", priority: "media", category: "estrategico", status: "dentro", frequency: "mensal", owner: "Pitoco", trend: "+17pp", trendUp: true },

  // --- TECNOLOGIA ---
  { id: "tec-01", area: "tecnologia", label: "Uptime de Sistemas", description: "Disponibilidade mÃ©dia dos sistemas crÃ­ticos", unit: "%", currentValue: "99.8%", targetValue: "99.5%", previousValue: "99.6%", priority: "critica", category: "operacional", status: "acima", frequency: "diario", owner: "Pitoco", trend: "+0.2pp", trendUp: true },
  { id: "tec-02", area: "tecnologia", label: "Sistemas Ativos", description: "Sistemas em operaÃ§Ã£o (CRM, app, Cloud Functions)", unit: "sistemas", currentValue: "6", targetValue: "6", previousValue: "5", priority: "media", category: "operacional", status: "dentro", frequency: "mensal", owner: "Pitoco", trend: "+1", trendUp: true },
  { id: "tec-03", area: "tecnologia", label: "Agentes de IA", description: "Agentes de IA em operaÃ§Ã£o (Ana, etc)", unit: "agentes", currentValue: "3", targetValue: "3", previousValue: "2", priority: "alta", category: "operacional", status: "dentro", frequency: "mensal", owner: "Pitoco", trend: "+1", trendUp: true },
  { id: "tec-04", area: "tecnologia", label: "Equipamentos Operacionais", description: "Equipamentos de diagnÃ³stico em funcionamento", unit: "equip.", currentValue: "14", targetValue: "14", previousValue: "12", priority: "alta", category: "operacional", status: "dentro", frequency: "semanal", owner: "Pitoco", trend: "+2", trendUp: true },
  { id: "tec-05", area: "tecnologia", label: "Incidentes de SeguranÃ§a", description: "Incidentes de seguranÃ§a da informaÃ§Ã£o no mÃªs", unit: "incidentes", currentValue: "0", targetValue: "0", previousValue: "0", priority: "critica", category: "qualidade", status: "dentro", frequency: "mensal", owner: "Pitoco", trend: "0", trendUp: true },

  // --- VENDAS ---
  { id: "ven-01", area: "vendas", label: "Vendas do MÃªs", description: "Total de vendas fechadas no mÃªs", unit: "vendas", currentValue: "67", targetValue: "80", previousValue: "52", priority: "critica", category: "receita", status: "abaixo", frequency: "mensal", owner: "JoÃ£o", trend: "+15", trendUp: true },
  { id: "ven-02", area: "vendas", label: "Pipeline Comercial", description: "Valor total em aberto no funil de vendas", unit: "R$", currentValue: "R$ 420K", targetValue: "R$ 350K", previousValue: "R$ 344K", priority: "critica", category: "receita", status: "acima", frequency: "semanal", owner: "JoÃ£o", trend: "+22%", trendUp: true },
  { id: "ven-03", area: "vendas", label: "Taxa de ConversÃ£o", description: "Vendas fechadas / leads qualificados", unit: "%", currentValue: "31%", targetValue: "35%", previousValue: "27%", priority: "critica", category: "marketing", status: "abaixo", frequency: "mensal", owner: "JoÃ£o", trend: "+4pp", trendUp: true },
  { id: "ven-04", area: "vendas", label: "Ticket MÃ©dio", description: "Receita mÃ©dia por venda", unit: "R$", currentValue: "R$ 2.7K", targetValue: "R$ 2.5K", previousValue: "R$ 2.6K", priority: "alta", category: "receita", status: "acima", frequency: "mensal", owner: "JoÃ£o", trend: "+5%", trendUp: true },
  { id: "ven-05", area: "vendas", label: "Meta do MÃªs", description: "% da meta mensal atingida", unit: "%", currentValue: "84%", targetValue: "100%", previousValue: "72%", priority: "critica", category: "receita", status: "abaixo", frequency: "diario", owner: "JoÃ£o", trend: "+12pp", trendUp: true },
  { id: "ven-06", area: "vendas", label: "Vendas por Consultor", description: "Ranking de vendas individuais", unit: "vendas", currentValue: "JoÃ£o: 34 / Pedro: 28", targetValue: "JoÃ£o: 40 / Pedro: 35", previousValue: "JoÃ£o: 28 / Pedro: 24", priority: "alta", category: "pessoas", status: "abaixo", frequency: "semanal", owner: "JoÃ£o", trend: "+10", trendUp: true },
];

// === HELPERS ===

export const priorityLabels: Record<KpiPriority, string> = {
  critica: "CrÃ­tica",
  alta: "Alta",
  media: "MÃ©dia",
  baixa: "Baixa",
};

export const categoryLabels: Record<KpiCategory, string> = {
  receita: "Receita",
  operacional: "Operacional",
  estrategico: "EstratÃ©gico",
  qualidade: "Qualidade",
  pessoas: "Pessoas",
  marketing: "Marketing",
};

export const statusLabels: Record<KpiStatus, string> = {
  acima: "Acima da Meta",
  dentro: "Dentro da Meta",
  abaixo: "Abaixo da Meta",
  sem_meta: "Sem Meta",
};

export const frequencyLabels: Record<KpiFrequency, string> = {
  diario: "DiÃ¡rio",
  semanal: "Semanal",
  mensal: "Mensal",
  trimestral: "Trimestral",
  anual: "Anual",
};

export const priorityColors: Record<KpiPriority, string> = {
  critica: "oklch(0.546 0.227 25.4)",
  alta: "oklch(0.65 0.2 25.4 / 70%)",
  media: "oklch(0.7 0.1 25.4 / 50%)",
  baixa: "oklch(0.6 0.05 25.4 / 30%)",
};

export const statusColors: Record<KpiStatus, string> = {
  acima: "oklch(0.65 0.18 145)",
  dentro: "oklch(0.7 0.15 250)",
  abaixo: "oklch(0.546 0.227 25.4)",
  sem_meta: "oklch(0.5 0 0)",
};

export function getKpisByArea(area: BusinessAreaKey): KpiDefinition[] {
  return kpiDefinitions.filter((k) => k.area === area);
}

export function getKpiStats() {
  const total = kpiDefinitions.length;
  const acima = kpiDefinitions.filter((k) => k.status === "acima").length;
  const dentro = kpiDefinitions.filter((k) => k.status === "dentro").length;
  const abaixo = kpiDefinitions.filter((k) => k.status === "abaixo").length;
  const semMeta = kpiDefinitions.filter((k) => k.status === "sem_meta").length;
  const criticos = kpiDefinitions.filter((k) => k.priority === "critica").length;
  return { total, acima, dentro, abaixo, semMeta, criticos };
}
