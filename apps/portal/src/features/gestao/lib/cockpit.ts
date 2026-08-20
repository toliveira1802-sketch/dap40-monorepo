import {
  BriefcaseBusiness,
  Building2,
  Cpu,
  DollarSign,
  GraduationCap,
  Home,
  Megaphone,
  TrendingUp,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { managementPath } from "../paths";

export type CockpitArea =
  | "financial"
  | "commercial"
  | "operations"
  | "people"
  | "marketing"
  | "customer"
  | "growth"
  | "knowledge"
  | "infrastructure"
  | "technology";

export type CockpitSection = "today" | CockpitArea;

export type CockpitRecordType =
  | "routine"
  | "decision"
  | "project"
  | "test"
  | "occurrence"
  | "reminder";

export type CockpitNavItem = {
  key: CockpitSection;
  label: string;
  path: string;
  description: string;
  icon: LucideIcon;
};

export const cockpitPrimaryNav: CockpitNavItem[] = [
  { key: "today", label: "Hoje", path: managementPath("/cockpit"), description: "Prioridades, decisÃµes e trabalho ativo", icon: Home },
  { key: "financial", label: "Financeiro", path: managementPath("/cockpit/financeiro"), description: "DecisÃµes e impactos financeiros", icon: DollarSign },
  { key: "commercial", label: "Comercial", path: managementPath("/cockpit/comercial"), description: "AÃ§Ãµes e testes comerciais", icon: BriefcaseBusiness },
  { key: "operations", label: "OperaÃ§Ã£o", path: managementPath("/cockpit/operacao"), description: "Rotinas e aÃ§Ãµes operacionais", icon: Wrench },
  { key: "people", label: "Pessoas", path: managementPath("/cockpit/pessoas"), description: "Rotinas, ocorrÃªncias e acompanhamentos", icon: UserCog },
  { key: "marketing", label: "Marketing", path: managementPath("/cockpit/marketing"), description: "Projetos, campanhas e testes", icon: Megaphone },
];

export const cockpitMoreNav: CockpitNavItem[] = [
  { key: "customer", label: "Cliente", path: managementPath("/cockpit/cliente"), description: "AÃ§Ãµes de relacionamento e retenÃ§Ã£o", icon: Users },
  { key: "growth", label: "Crescimento", path: managementPath("/cockpit/crescimento"), description: "Iniciativas estratÃ©gicas e expansÃ£o", icon: TrendingUp },
  { key: "knowledge", label: "Conhecimento", path: managementPath("/cockpit/conhecimento"), description: "Procedimentos e aprendizados", icon: GraduationCap },
  { key: "infrastructure", label: "Infraestrutura", path: managementPath("/cockpit/infraestrutura"), description: "Obras, licenÃ§as, equipamentos e melhorias", icon: Building2 },
  { key: "technology", label: "Tecnologia", path: managementPath("/cockpit/tecnologia"), description: "Sistemas, integraÃ§Ãµes e experimentos", icon: Cpu },
];

export const cockpitAllNav = [...cockpitPrimaryNav, ...cockpitMoreNav];

const slugToSection: Record<string, CockpitSection> = {
  financeiro: "financial",
  comercial: "commercial",
  operacao: "operations",
  pessoas: "people",
  marketing: "marketing",
  cliente: "customer",
  crescimento: "growth",
  conhecimento: "knowledge",
  infraestrutura: "infrastructure",
  tecnologia: "technology",
};

export function getCockpitSection(location: string): CockpitSection {
  const segments = location.split("/").filter(Boolean);
  const cockpitIndex = segments.indexOf("cockpit");
  const slug = cockpitIndex >= 0 ? segments[cockpitIndex + 1] : undefined;
  return slug ? slugToSection[slug] ?? "today" : "today";
}

export const cockpitAreaLabels: Record<CockpitArea, string> = {
  financial: "Financeiro",
  commercial: "Comercial",
  operations: "OperaÃ§Ã£o",
  people: "Pessoas",
  marketing: "Marketing",
  customer: "Cliente",
  growth: "Crescimento",
  knowledge: "Conhecimento",
  infrastructure: "Infraestrutura",
  technology: "Tecnologia",
};

export const cockpitAreaOrder: CockpitArea[] = [
  "financial",
  "commercial",
  "operations",
  "people",
  "marketing",
  "customer",
  "growth",
  "knowledge",
  "infrastructure",
  "technology",
];

export const cockpitTemplateShortcuts = [
  { key: "supplier-discount", area: "financial" as const, title: "Simular desconto com fornecedor", type: "decision" as const, decisionType: "supplier_discount" as const, counterpartyType: "supplier" as const },
  { key: "debt-payment", area: "financial" as const, title: "Simular pagamento de dÃ­vida", type: "decision" as const, decisionType: "debt_payment" as const, counterpartyType: "creditor" as const },
  { key: "customer-advance", area: "financial" as const, title: "Registrar adiantamento de cliente", type: "decision" as const, decisionType: "customer_advance" as const, counterpartyType: "customer" as const },
  { key: "people-lateness", area: "people" as const, title: "Registrar atraso", type: "occurrence" as const, occurrenceType: "lateness" as const },
  { key: "medical-certificate", area: "people" as const, title: "Registrar atestado", type: "occurrence" as const, occurrenceType: "medical_certificate" as const },
  { key: "people-follow-up", area: "people" as const, title: "Criar acompanhamento", type: "reminder" as const },
  { key: "commercial-action-plan", area: "commercial" as const, title: "Criar plano de aÃ§Ã£o comercial", type: "project" as const },
  { key: "operations-daily-review", area: "operations" as const, title: "Revisar fila operacional", type: "routine" as const },
  { key: "marketing-experiment", area: "marketing" as const, title: "Testar nova campanha", type: "test" as const },
  { key: "customer-reactivation", area: "customer" as const, title: "Planejar reativaÃ§Ã£o de clientes", type: "project" as const },
  { key: "growth-initiative", area: "growth" as const, title: "Avaliar iniciativa de crescimento", type: "project" as const },
  { key: "knowledge-capture", area: "knowledge" as const, title: "Documentar aprendizado", type: "routine" as const },
  { key: "infrastructure-physical-change", area: "infrastructure" as const, title: "Planejar alteraÃ§Ã£o fÃ­sica", type: "project" as const },
  { key: "scanner-license-acquisition", area: "infrastructure" as const, title: "Adquirir ou renovar licenÃ§a de scanner", type: "project" as const },
  { key: "elevator-preventive-maintenance", area: "infrastructure" as const, title: "Agendar manutenÃ§Ã£o preventiva de elevador", type: "reminder" as const },
  { key: "infrastructure-inspection", area: "infrastructure" as const, title: "Executar inspeÃ§Ã£o de infraestrutura", type: "routine" as const },
  { key: "infrastructure-equipment", area: "infrastructure" as const, title: "Avaliar aquisiÃ§Ã£o de equipamento", type: "decision" as const, decisionType: "custom" as const, counterpartyType: "supplier" as const },
  { key: "infrastructure-improvement-test", area: "infrastructure" as const, title: "Testar melhoria antes de implantar", type: "test" as const },
  { key: "infrastructure-improvement", area: "infrastructure" as const, title: "Abrir projeto de melhoria", type: "project" as const },
  { key: "technology-validation", area: "technology" as const, title: "Validar nova ferramenta", type: "test" as const },
];

export type CockpitTemplateShortcut = (typeof cockpitTemplateShortcuts)[number];

export const cockpitWorkspaceIcon = Building2;
