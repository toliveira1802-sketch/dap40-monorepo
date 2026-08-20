import {
  LayoutDashboard,
  Users,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Megaphone,
  Wrench,
  UserCog,
  Cpu,
  ShoppingCart,
  Crosshair,
  Rocket,
  Gauge,
  Command,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { managementPath } from "../paths";

export type BusinessAreaKey =
  | "cliente"
  | "conhecimento"
  | "crescimento"
  | "financeiro"
  | "marketing"
  | "operacao"
  | "pessoas"
  | "infraestrutura"
  | "tecnologia"
  | "vendas";

export type AreaKey =
  | "cockpit"
  | "dashboard"
  | "visao360"
  | "resumo"
  | "kpis"
  | BusinessAreaKey;

export interface AreaConfig {
  key: AreaKey;
  label: string;
  icon: LucideIcon;
  path: string;
  description: string;
  kpis: { label: string; value: string; trend?: string; trendUp?: boolean }[];
  modules: { title: string; description: string; status: "planned" | "active" | "coming-soon" }[];
}

export const areas: Record<AreaKey, AreaConfig> = {
  cockpit: {
    key: "cockpit",
    label: "Cockpit de OperaÃ§Ã£o",
    icon: Command,
    path: managementPath("/cockpit"),
    description: "Workspace pessoal para executar rotinas, decisÃµes, projetos e testes",
    kpis: [],
    modules: [],
  },
  dashboard: {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: managementPath(),
    description: "VisÃ£o executiva consolidada de todas as Ã¡reas da operaÃ§Ã£o",
    kpis: [],
    modules: [],
  },
  visao360: {
    key: "visao360",
    label: "VisÃ£o 360Â°",
    icon: Crosshair,
    path: managementPath("/visao-360"),
    description: "Cruzamento de indicadores entre todas as Ã¡reas com correlaÃ§Ãµes e tendÃªncias integradas",
    kpis: [],
    modules: [],
  },
  resumo: {
    key: "resumo",
    label: "Resumo Executivo",
    icon: Rocket,
    path: managementPath("/resumo"),
    description: "As 5 Ã¡reas crÃ­ticas do negÃ³cio em uma tela: Marketing, Financeiro, Comercial, OperaÃ§Ã£o e Crescimento",
    kpis: [],
    modules: [],
  },
  kpis: {
    key: "kpis",
    label: "GestÃ£o de KPIs",
    icon: Gauge,
    path: managementPath("/kpis"),
    description: "Matriz de indicadores por Ã¡rea com metas, prioridade, categoria e status",
    kpis: [],
    modules: [],
  },
  cliente: {
    key: "cliente",
    label: "Cliente",
    icon: Users,
    path: managementPath("/area/cliente"),
    description: "GestÃ£o de clientes, histÃ³rico de serviÃ§os e relacionamento",
    kpis: [
      { label: "Total de Clientes", value: "342", trend: "+12", trendUp: true },
      { label: "Novos no MÃªs", value: "28", trend: "+8", trendUp: true },
      { label: "Taxa de RetenÃ§Ã£o", value: "87%", trend: "+3%", trendUp: true },
      { label: "NPS", value: "9.2", trend: "+0.4", trendUp: true },
    ],
    modules: [
      { title: "Base de Clientes", description: "CRM completo com histÃ³rico de serviÃ§os, veÃ­culos e preferÃªncias", status: "planned" },
      { title: "SegmentaÃ§Ã£o", description: "Agrupamento por modelo, frequÃªncia e ticket mÃ©dio", status: "planned" },
      { title: "ReativaÃ§Ã£o", description: "Campanhas de reengajamento de clientes inativos", status: "coming-soon" },
      { title: "Feedback", description: "Coleta e anÃ¡lise de NPS, avaliaÃ§Ãµes e reclamaÃ§Ãµes", status: "coming-soon" },
    ],
  },
  conhecimento: {
    key: "conhecimento",
    label: "Conhecimento",
    icon: GraduationCap,
    path: managementPath("/area/conhecimento"),
    description: "Base de conhecimento tÃ©cnica, manuais e capacitaÃ§Ã£o da equipe",
    kpis: [
      { label: "Documentos TÃ©cnicos", value: "156", trend: "+12", trendUp: true },
      { label: "Manuais de ServiÃ§o", value: "89", trend: "+5", trendUp: true },
      { label: "Treinamentos Ativos", value: "7", trend: "+2", trendUp: true },
      { label: "Taxa de ConclusÃ£o", value: "92%", trend: "+5%", trendUp: true },
    ],
    modules: [
      { title: "Base TÃ©cnica", description: "Manuais, procedimentos e guias de remap por modelo", status: "planned" },
      { title: "Treinamentos", description: "Trilhas de capacitaÃ§Ã£o para consultores e mecÃ¢nicos", status: "planned" },
      { title: "Wiki Interna", description: "DocumentaÃ§Ã£o colaborativa de processos e casos reais", status: "coming-soon" },
      { title: "Biblioteca de Mapas", description: "CatÃ¡logo de mapas exclusivos por veÃ­culo e estÃ¡gio", status: "coming-soon" },
    ],
  },
  crescimento: {
    key: "crescimento",
    label: "Crescimento",
    icon: TrendingUp,
    path: managementPath("/area/crescimento"),
    description: "Planejamento estratÃ©gico, expansÃ£o e roadmap de mercado",
    kpis: [
      { label: "Receita Acumulada", value: "R$ 1.2M", trend: "+18%", trendUp: true },
      { label: "Market Share VW/Audi", value: "23%", trend: "+4%", trendUp: true },
      { label: "ProjeÃ§Ã£o 2027", value: "R$ 2.8M", trend: "+133%", trendUp: true },
      { label: "Novas Marcas", value: "2", trend: "Mercedes/BMW", trendUp: true },
    ],
    modules: [
      { title: "Roadmap EstratÃ©gico", description: "ExpansÃ£o VW/Audi (2026) â†’ Mercedes/BMW (2027) â†’ Porsche (2028)", status: "planned" },
      { title: "Metas e OKRs", description: "DefiniÃ§Ã£o e acompanhamento de objetivos trimestrais", status: "planned" },
      { title: "AnÃ¡lise de Mercado", description: "Estudos de concorrÃªncia e oportunidades de expansÃ£o", status: "coming-soon" },
      { title: "Novas Unidades", description: "AvaliaÃ§Ã£o do galpÃ£o na Casa Verde e pontos estratÃ©gicos", status: "coming-soon" },
    ],
  },
  financeiro: {
    key: "financeiro",
    label: "Financeiro",
    icon: DollarSign,
    path: managementPath("/area/financeiro"),
    description: "Fluxo de caixa, faturamento, custos e indicadores financeiros",
    kpis: [
      { label: "Faturamento do MÃªs", value: "R$ 184K", trend: "+12%", trendUp: true },
      { label: "Ticket MÃ©dio", value: "R$ 2.8K", trend: "+8%", trendUp: true },
      { label: "Margem de Lucro", value: "34%", trend: "+2%", trendUp: true },
      { label: "Custo Operacional", value: "R$ 62K", trend: "-5%", trendUp: true },
    ],
    modules: [
      { title: "Fluxo de Caixa", description: "Entradas, saÃ­das e projeÃ§Ã£o mensal", status: "planned" },
      { title: "DRE", description: "Demonstrativo de resultado mensal e anual", status: "planned" },
      { title: "Contas a Pagar", description: "GestÃ£o de fornecedores e despesas fixas", status: "coming-soon" },
      { title: "Contas a Receber", description: "Controle de recebimentos e inadimplÃªncia", status: "coming-soon" },
    ],
  },
  marketing: {
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    path: managementPath("/area/marketing"),
    description: "Campanhas, conteÃºdo social, anÃºncios e geraÃ§Ã£o de leads",
    kpis: [
      { label: "Leads do MÃªs", value: "124", trend: "+22%", trendUp: true },
      { label: "CPL", value: "R$ 8.40", trend: "-15%", trendUp: true },
      { label: "Engajamento IG", value: "6.8%", trend: "+1.2%", trendUp: true },
      { label: "ConversÃ£o", value: "14%", trend: "+3%", trendUp: true },
    ],
    modules: [
      { title: "CalendÃ¡rio de ConteÃºdo", description: "Planejamento de posts, stories e carrossÃ©is para Instagram", status: "planned" },
      { title: "GestÃ£o de AnÃºncios", description: "Meta Ads e Google Ads com tracking de CPL e ROAS", status: "planned" },
      { title: "Base de Leads", description: "Captura, qualificaÃ§Ã£o e distribuiÃ§Ã£o de leads", status: "coming-soon" },
      { title: "RelatÃ³rios de Campanha", description: "AnÃ¡lise de performance por canal e criativo", status: "coming-soon" },
    ],
  },
  operacao: {
    key: "operacao",
    label: "OperaÃ§Ã£o",
    icon: Wrench,
    path: managementPath("/area/operacao"),
    description: "Ordens de serviÃ§o, agenda, equipe tÃ©cnica e controle de qualidade",
    kpis: [
      { label: "OS em Andamento", value: "18", trend: "+3", trendUp: true },
      { label: "Tempo MÃ©dio", value: "2.4h", trend: "-0.3h", trendUp: true },
      { label: "Taxa de Retorno", value: "4%", trend: "-1%", trendUp: true },
      { label: "Produtividade", value: "91%", trend: "+4%", trendUp: true },
    ],
    modules: [
      { title: "Ordens de ServiÃ§o", description: "GestÃ£o completa de OS: criaÃ§Ã£o, execuÃ§Ã£o e entrega", status: "planned" },
      { title: "Agenda", description: "CalendÃ¡rio de agendamentos por consultor e mecÃ¢nico", status: "planned" },
      { title: "Ranking de MecÃ¢nicos", description: "Produtividade por tÃ©cnico com detalhamento de veÃ­culos", status: "coming-soon" },
      { title: "Controle de Qualidade", description: "Checklist pÃ³s-serviÃ§o e inspeÃ§Ã£o de entrega", status: "coming-soon" },
    ],
  },
  pessoas: {
    key: "pessoas",
    label: "Pessoas",
    icon: UserCog,
    path: managementPath("/area/pessoas"),
    description: "GestÃ£o de equipe, consultores, mecÃ¢nicos e desempenho individual",
    kpis: [
      { label: "Total de Colaboradores", value: "12", trend: "+2", trendUp: true },
      { label: "Consultores Ativos", value: "2", trend: "JoÃ£o e Pedro", trendUp: true },
      { label: "MecÃ¢nicos", value: "5", trend: "+1", trendUp: true },
      { label: "Turnover", value: "8%", trend: "-3%", trendUp: true },
    ],
    modules: [
      { title: "Cadastro de Equipe", description: "Perfis, funÃ§Ãµes e escalas de trabalho", status: "planned" },
      { title: "Desempenho Individual", description: "Metas, ranking e indicadores por colaborador", status: "planned" },
      { title: "Cargos e SalÃ¡rios", description: "Estrutura de remuneraÃ§Ã£o e benefÃ­cios", status: "coming-soon" },
      { title: "Folha de Ponto", description: "Controle de jornada e horas extras", status: "coming-soon" },
    ],
  },
  infraestrutura: {
    key: "infraestrutura",
    label: "Infraestrutura",
    icon: Warehouse,
    path: managementPath("/area/infraestrutura"),
    description: "AlteraÃ§Ãµes fÃ­sicas, licenÃ§as de scanners, equipamentos e melhorias estruturais",
    kpis: [
      { label: "IntervenÃ§Ãµes Ativas", value: "3", trend: "+1", trendUp: true },
      { label: "LicenÃ§as de Scanner", value: "8", trend: "2 renovam em 60d", trendUp: false },
      { label: "Equipamentos CrÃ­ticos", value: "14", trend: "93% disponÃ­veis", trendUp: true },
      { label: "Budget de Melhorias", value: "R$ 120K", trend: "68% comprometido", trendUp: true },
    ],
    modules: [
      { title: "Obras e Layout", description: "Reformas, adequaÃ§Ãµes fÃ­sicas, expansÃ£o de boxes e evoluÃ§Ã£o do galpÃ£o", status: "active" },
      { title: "LicenÃ§as e Assinaturas", description: "AquisiÃ§Ã£o, renovaÃ§Ã£o e validade das licenÃ§as dos scanners", status: "active" },
      { title: "Equipamentos e Ferramentas", description: "AquisiÃ§Ãµes, manutenÃ§Ã£o, disponibilidade e ciclo de vida", status: "planned" },
      { title: "Plano de Melhorias", description: "Backlog priorizado de melhorias estruturais com custo e impacto", status: "planned" },
    ],
  },
  tecnologia: {
    key: "tecnologia",
    label: "Tecnologia",
    icon: Cpu,
    path: managementPath("/area/tecnologia"),
    description: "Sistemas, equipamentos, IA e infraestrutura digital da oficina",
    kpis: [
      { label: "Sistemas Ativos", value: "6", trend: "+1", trendUp: true },
      { label: "Equipamentos", value: "14", trend: "+2", trendUp: true },
      { label: "Agentes IA", value: "3", trend: "+1", trendUp: true },
      { label: "Uptime", value: "99.8%", trend: "+0.2%", trendUp: true },
    ],
    modules: [
      { title: "GestÃ£o de Sistemas", description: "CRM, app proprietÃ¡rio e Google Cloud Functions", status: "planned" },
      { title: "Equipamentos", description: "InventÃ¡rio de ferramentas e equipamentos de diagnÃ³stico", status: "planned" },
      { title: "Agentes de IA", description: "Ana (CRM) e outros agentes para anÃ¡lise e automaÃ§Ã£o", status: "coming-soon" },
      { title: "Infraestrutura", description: "Servidores, rede e seguranÃ§a da informaÃ§Ã£o", status: "coming-soon" },
    ],
  },
  vendas: {
    key: "vendas",
    label: "Vendas",
    icon: ShoppingCart,
    path: managementPath("/area/vendas"),
    description: "Pipeline comercial, conversÃ£o de leads, propostas e metas",
    kpis: [
      { label: "Vendas do MÃªs", value: "67", trend: "+15", trendUp: true },
      { label: "Pipeline", value: "R$ 420K", trend: "+22%", trendUp: true },
      { label: "Taxa de ConversÃ£o", value: "31%", trend: "+4%", trendUp: true },
      { label: "Meta do MÃªs", value: "78%", trend: "+12%", trendUp: true },
    ],
    modules: [
      { title: "Pipeline Comercial", description: "Funil de vendas: lead â†’ proposta â†’ fechamento", status: "planned" },
      { title: "Propostas", description: "GeraÃ§Ã£o e tracking de orÃ§amentos enviados", status: "planned" },
      { title: "Metas por Consultor", description: "Acompanhamento individual (JoÃ£o, Pedro) com termÃ´metro", status: "coming-soon" },
      { title: "ComissÃµes", description: "CÃ¡lculo e controle de comissÃµes por venda", status: "coming-soon" },
    ],
  },
};

export const sidebarAreas: AreaConfig[] = [
  areas.cockpit,
  areas.dashboard,
  areas.visao360,
  areas.resumo,
  areas.kpis,
  areas.cliente,
  areas.conhecimento,
  areas.crescimento,
  areas.financeiro,
  areas.marketing,
  areas.operacao,
  areas.pessoas,
  areas.infraestrutura,
  areas.tecnologia,
  areas.vendas,
];

export const businessAreaKeys: BusinessAreaKey[] = [
  "cliente",
  "conhecimento",
  "crescimento",
  "financeiro",
  "marketing",
  "operacao",
  "pessoas",
  "infraestrutura",
  "tecnologia",
  "vendas",
];

export const businessAreas = businessAreaKeys.map(key => areas[key]);

export const operationalNavigation: AreaConfig[] = [areas.cockpit];
export const indicatorNavigation: AreaConfig[] = sidebarAreas.filter(area => area.key !== "cockpit");
