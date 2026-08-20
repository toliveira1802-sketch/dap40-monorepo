import { ChartCard } from "@/features/gestao/components/ChartCard";
import { ChartTooltip } from "@/features/gestao/components/ChartTooltip";
import { DrillDownModal } from "@/features/gestao/components/DrillDownModal";
import DashboardLayout from "@/features/gestao/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { usePeriodData } from "@/features/gestao/hooks/usePeriodData";
import { usePeriod } from "@/features/gestao/contexts/PeriodContext";
import { useDrillDown, type DrillDownData } from "@/features/gestao/hooks/useDrillDown";
import {
  chartAxisColor,
  chartGridColor,
  chartPrimaryColor,
  chartSecondaryColor,
} from "@/features/gestao/lib/chartTheme";
import { useState, useRef, type FC, type ComponentType } from "react";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Megaphone,
  ShoppingCart,
  TrendingUp,
  Wrench,
  Rocket,
  AlertTriangle,
  CheckCircle2,
  Target,
  GripVertical,
  GripHorizontal,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ANIM_DUR = 600;
const axisColor = chartAxisColor;
const gridColor = chartGridColor;
const primaryColor = chartPrimaryColor;
const secondaryColor = chartSecondaryColor;

// === TIPOS ===

interface KpiData {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  /** Meta da mÃ©trica para comparaÃ§Ã£o. Se ausente, nÃ£o gera alerta. */
  target?: string;
  /** Indica explicitamente se estÃ¡ abaixo da meta. Se true, destaca em vermelho. */
  belowTarget?: boolean;
}

interface InsightData {
  type: "positive" | "alert";
  text: string;
}

interface BlockConfig {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  kpis: KpiData[];
  insights: InsightData[];
  accent: string;
  span?: "full" | "half";
  chart: FC;
}

// === DADOS ESTÃTICOS POR ÃREA ===

const marketingFunil = [
  { etapa: "ImpressÃµes", valor: 12500, fill: "oklch(0.65 0.2 25.4 / 30%)" },
  { etapa: "Cliques", valor: 3200, fill: "oklch(0.65 0.2 25.4 / 50%)" },
  { etapa: "Leads", valor: 124, fill: "oklch(0.65 0.2 25.4 / 70%)" },
  { etapa: "Qualificados", valor: 89, fill: primaryColor },
  { etapa: "Convertidos", valor: 17, fill: "oklch(0.35 0.176 25.4)" },
];

const marketingKpis: KpiData[] = [
  { label: "Leads Gerados", value: "124", trend: "+18%", trendUp: true, target: "100" },
  { label: "Custo por Lead", value: "R$ 4,20", trend: "-12%", trendUp: true, target: "R$ 6,00" },
  { label: "ConversÃ£o", value: "13.7%", trend: "+2.1pp", trendUp: true, target: "15%", belowTarget: true },
  { label: "ROAS", value: "3.8x", trend: "+0.4x", trendUp: true, target: "4.0x", belowTarget: true },
];

const marketingInsights: InsightData[] = [
  { type: "positive", text: "Instagram gerou 42% dos leads com menor CPL da operaÃ§Ã£o" },
  { type: "alert", text: "Google Ads com CPL 2x acima da mÃ©dia â€” revisar segmentaÃ§Ã£o" },
];

const financeiroKpis: KpiData[] = [
  { label: "Receita", value: "R$ 184K", trend: "+7%", trendUp: true, target: "R$ 180K" },
  { label: "Margem Bruta", value: "66%", trend: "+3pp", trendUp: true, target: "64%" },
  { label: "Lucro LÃ­quido", value: "R$ 94K", trend: "+12%", trendUp: true, target: "R$ 90K" },
  { label: "Cash Flow", value: "R$ 122K", trend: "+8%", trendUp: true, target: "R$ 100K" },
];

const financeiroInsights: InsightData[] = [
  { type: "positive", text: "Margem acima da meta mensal (64%) â€” operaÃ§Ã£o saudÃ¡vel" },
  { type: "alert", text: "Despesas com insumos subiram 8% â€” negociar com fornecedor" },
];

const vendasFunil = [
  { etapa: "Leads", valor: 124, fill: "oklch(0.65 0.2 25.4 / 30%)" },
  { etapa: "Qualificados", valor: 89, fill: "oklch(0.65 0.2 25.4 / 50%)" },
  { etapa: "Propostas", valor: 56, fill: "oklch(0.65 0.2 25.4 / 70%)" },
  { etapa: "NegociaÃ§Ã£o", valor: 42, fill: primaryColor },
  { etapa: "Fechados", valor: 67, fill: "oklch(0.35 0.176 25.4)" },
];

const vendasKpis: KpiData[] = [
  { label: "Vendas", value: "67", trend: "+15", trendUp: true, target: "80", belowTarget: true },
  { label: "Ticket MÃ©dio", value: "R$ 2.7K", trend: "+5%", trendUp: true, target: "R$ 2.5K" },
  { label: "ConversÃ£o", value: "31%", trend: "+4pp", trendUp: true, target: "35%", belowTarget: true },
  { label: "Meta Atingida", value: "84%", trend: "+12pp", trendUp: true, target: "100%", belowTarget: true },
];

const vendasInsights: InsightData[] = [
  { type: "positive", text: "JoÃ£o lidera com 34 vendas (85% da meta individual)" },
  { type: "alert", text: "Ana (IA) com 5 vendas â€” abaixo da meta de 10, ajustar prompts" },
];

const operacaoStatus = [
  { name: "Andamento", value: 18, fill: primaryColor },
  { name: "Aguardando", value: 7, fill: secondaryColor },
  { name: "ConcluÃ­das", value: 45, fill: "oklch(0.35 0.176 25.4)" },
  { name: "Retorno", value: 3, fill: "oklch(0.5 0.2 25.4 / 40%)" },
];

const operacaoKpis: KpiData[] = [
  { label: "OS no MÃªs", value: "73", trend: "+8", trendUp: true, target: "70" },
  { label: "Tempo MÃ©dio", value: "2.8h", trend: "-0.4h", trendUp: true, target: "3.0h" },
  { label: "NPS", value: "87", trend: "+3", trendUp: true, target: "80" },
  { label: "Retrabalho", value: "4.1%", trend: "-1.2pp", trendUp: true, target: "5.0%" },
];

const operacaoInsights: InsightData[] = [
  { type: "positive", text: "Tempo mÃ©dio caiu 12% â€” treinamento de STG2 surtiu efeito" },
  { type: "alert", text: "3 OS em retorno â€” acompanhar qualidade do lote STG2 desta semana" },
];

const crescimentoProjecao = [
  { ano: "2025", receita: 0.85, meta: 0.9 },
  { ano: "2026", receita: 1.2, meta: 1.3 },
  { ano: "2027", receita: 2.8, meta: 2.5 },
  { ano: "2028", receita: 4.2, meta: 4.0 },
];

const crescimentoKpis: KpiData[] = [
  { label: "Receita Atual", value: "R$ 1.2M", trend: "+41%", trendUp: true, target: "R$ 1.3M", belowTarget: true },
  { label: "Meta 2026", value: "92%", trend: "+12pp", trendUp: true, target: "100%", belowTarget: true },
  { label: "Novas Marcas", value: "2", trend: "2027", trendUp: true },
  { label: "GalpÃ£o", value: "Casa Verde", trend: "Em anÃ¡lise", trendUp: true },
];

const crescimentoInsights: InsightData[] = [
  { type: "positive", text: "VW/Audi consolidado â€” pronto para escalar Mercedes/BMW em 2027" },
  { type: "alert", text: "GalpÃ£o Casa Verde: avaliar custo/benefÃ­cio antes de Q4 2026" },
];

// === COMPONENTE DE KPI COM ALERTA ===

function KpiItem({ kpi }: { kpi: KpiData }) {
  const isAlert = kpi.belowTarget === true;
  return (
    <div
      className={`flex flex-col gap-0.5 rounded-md px-2 py-1.5 transition-colors ${
        isAlert ? "bg-primary/10 border border-primary/30" : ""
      }`}
    >
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-condensed uppercase tracking-wide text-muted-foreground truncate">
          {kpi.label}
        </span>
        {isAlert && (
          <AlertTriangle className="h-3 w-3 text-primary shrink-0" />
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-display text-xl leading-none ${
            isAlert ? "text-primary" : "text-foreground"
          }`}
        >
          {kpi.value}
        </span>
        <span
          className={`text-[10px] font-condensed flex items-center gap-0.5 ${
            kpi.trendUp ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {kpi.trendUp ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {kpi.trend}
        </span>
      </div>
      {kpi.target && (
        <span className="text-[9px] font-condensed text-muted-foreground/60">
          Meta: {kpi.target}
        </span>
      )}
    </div>
  );
}

// === COMPONENTE DE BLOCO DE ÃREA COM DRAG ===

interface AreaBlockProps {
  block: BlockConfig;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
}

function AreaBlock({
  block,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  children,
}: AreaBlockProps) {
  const Icon = block.icon;
  const alertCount = block.kpis.filter((k) => k.belowTarget).length;

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, block.id)}
      onDragOver={(e) => onDragOver(e, block.id)}
      onDrop={(e) => onDrop(e, block.id)}
      onDragEnd={onDragEnd}
      className={`bg-card border-border/50 overflow-hidden transition-all duration-200 ${
        isDragging ? "opacity-40 border-primary/50 scale-[0.98]" : "opacity-100"
      } cursor-grab active:cursor-grabbing hover:border-primary/30`}
    >
      {/* Header do bloco */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2.5">
          <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h2 className="dap-heading text-lg text-foreground">{block.title}</h2>
          {alertCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-condensed bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/20">
              <AlertTriangle className="h-2.5 w-2.5" />
              {alertCount} {alertCount === 1 ? "alerta" : "alertas"}
            </span>
          )}
        </div>
        <span className="text-[10px] font-condensed uppercase tracking-wide text-muted-foreground">
          {block.accent}
        </span>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* KPIs compactos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {block.kpis.map((kpi) => (
            <KpiItem key={kpi.label} kpi={kpi} />
          ))}
        </div>

        {/* GrÃ¡fico */}
        <div className="h-[200px]">{children}</div>

        {/* Insights */}
        <div className="space-y-1.5 pt-2 border-t border-border/20">
          {block.insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs font-condensed"
            >
              {insight.type === "positive" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              )}
              <span
                className={
                  insight.type === "positive"
                    ? "text-foreground/80"
                    : "text-foreground/60"
                }
              >
                {insight.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// === GRÃFICOS POR BLOCO ===

function MarketingChart() {
  const drill = useDrillDown();
  const handleClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.etapa) return;
    drill.open({
      title: `Marketing â€” ${d.etapa}`,
      subtitle: "Funil de aquisiÃ§Ã£o",
      metrics: [
        { label: "Volume", value: `${d.valor}` },
        { label: "Taxa", value: d.valor > 1000 ? `${(d.valor / 12500 * 100).toFixed(1)}%` : `${d.valor}/124 leads` },
      ],
      breakdown: [
        { label: "Instagram", value: Math.round(d.valor * 0.42), color: primaryColor },
        { label: "Meta Ads", value: Math.round(d.valor * 0.31), color: secondaryColor },
        { label: "Google Ads", value: Math.round(d.valor * 0.18), color: "oklch(0.35 0.176 25.4)" },
        { label: "IndicaÃ§Ã£o", value: Math.round(d.valor * 0.09), color: "oklch(0.65 0.2 25.4 / 40%)" },
      ],
    });
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart>
        <Tooltip content={<ChartTooltip />} />
        <Funnel data={marketingFunil} dataKey="valor" nameKey="etapa" isAnimationActive animationDuration={ANIM_DUR} onClick={handleClick} className="cursor-pointer" />
      </FunnelChart>
    </ResponsiveContainer>
  );
}

function FinanceiroChart() {
  const { fluxo } = usePeriodData();
  const drill = useDrillDown();
  const handleClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.mes) return;
    const saldo = (d.entradas ?? 0) - (d.saidas ?? 0);
    drill.open({
      title: `Financeiro â€” ${d.mes}`,
      subtitle: "Fluxo de caixa",
      metrics: [
        { label: "Entradas", value: `R$ ${d.entradas ?? 0}K`, trendUp: true },
        { label: "SaÃ­das", value: `R$ ${d.saidas ?? 0}K` },
        { label: "Saldo", value: `R$ ${saldo}K`, trend: saldo >= 0 ? "Positivo" : "Negativo", trendUp: saldo >= 0 },
      ],
      breakdown: [
        { label: "STG 1", value: Math.round((d.entradas ?? 0) * 0.45), color: primaryColor },
        { label: "STG 2", value: Math.round((d.entradas ?? 0) * 0.22), color: secondaryColor },
        { label: "DiagnÃ³stico", value: Math.round((d.entradas ?? 0) * 0.18), color: "oklch(0.35 0.176 25.4)" },
        { label: "Outros", value: Math.round((d.entradas ?? 0) * 0.15), color: "oklch(0.65 0.2 25.4 / 40%)" },
      ],
    });
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={fluxo}>
        <defs>
          <linearGradient id="resFinEnt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="mes" stroke={axisColor} style={{ fontFamily: "Saira Condensed", fontSize: "11px" }} />
        <YAxis stroke={axisColor} style={{ fontFamily: "Saira Condensed", fontSize: "11px" }} tickFormatter={(v) => `R$${v}K`} />
        <Tooltip content={<ChartTooltip unit="K" formatter={(v) => `R$ ${v}K`} />} />
        <Area type="monotone" dataKey="entradas" stroke={primaryColor} fill="url(#resFinEnt)" name="Entradas" strokeWidth={2} animationDuration={ANIM_DUR} onClick={handleClick} className="cursor-pointer" />
        <Area type="monotone" dataKey="saidas" stroke={secondaryColor} fill="none" name="SaÃ­das" strokeWidth={2} animationDuration={ANIM_DUR} onClick={handleClick} className="cursor-pointer" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function VendasChart() {
  const drill = useDrillDown();
  const handleClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.etapa) return;
    drill.open({
      title: `Vendas â€” ${d.etapa}`,
      subtitle: "Funil comercial",
      metrics: [
        { label: "Volume", value: `${d.valor}` },
        { label: "ConversÃ£o", value: `${((d.valor / 124) * 100).toFixed(0)}%` },
      ],
      breakdown: [
        { label: "STG 1", value: Math.round(d.valor * 0.45), color: primaryColor },
        { label: "STG 2", value: Math.round(d.valor * 0.25), color: secondaryColor },
        { label: "DiagnÃ³stico", value: Math.round(d.valor * 0.3), color: "oklch(0.35 0.176 25.4)" },
      ],
    });
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart>
        <Tooltip content={<ChartTooltip />} />
        <Funnel data={vendasFunil} dataKey="valor" nameKey="etapa" isAnimationActive animationDuration={ANIM_DUR} onClick={handleClick} className="cursor-pointer" />
      </FunnelChart>
    </ResponsiveContainer>
  );
}

function OperacaoChart() {
  const drill = useDrillDown();
  const handleClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.name) return;
    drill.open({
      title: `OperaÃ§Ã£o â€” ${d.name}`,
      subtitle: "Status das OS",
      metrics: [
        { label: "Total", value: `${d.value}` },
        { label: "Receita", value: `R$ ${d.value * 2.5}K` },
        { label: "Tempo MÃ©dio", value: d.name === "ConcluÃ­das" ? "2.5h" : "4.2h" },
      ],
      breakdown: [
        { label: "STG 1", value: Math.round(d.value * 0.45), color: primaryColor },
        { label: "STG 2", value: Math.round(d.value * 0.22), color: secondaryColor },
        { label: "DiagnÃ³stico", value: Math.round(d.value * 0.18), color: "oklch(0.35 0.176 25.4)" },
        { label: "Outros", value: Math.round(d.value * 0.15), color: "oklch(0.65 0.2 25.4 / 40%)" },
      ],
    });
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={operacaoStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} animationDuration={ANIM_DUR} onClick={handleClick} className="cursor-pointer">
          {operacaoStatus.map((e, i) => <Cell key={i} fill={e.fill} />)}
        </Pie>
        <Tooltip content={<ChartTooltip unit=" OS" formatter={(v) => `${v} OS`} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function CrescimentoChart() {
  const drill = useDrillDown();
  const handleClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.ano) return;
    drill.open({
      title: `Crescimento â€” ${d.ano}`,
      subtitle: "ProjeÃ§Ã£o de receita",
      metrics: [
        { label: "ProjeÃ§Ã£o", value: `R$ ${d.receita}M`, trend: d.receita >= d.meta ? "Acima" : "Abaixo", trendUp: d.receita >= d.meta },
        { label: "Meta", value: `R$ ${d.meta}M` },
        { label: "Delta", value: `R$ ${(d.receita - d.meta).toFixed(1)}M` },
      ],
      breakdown: [
        { label: "VW/Audi", value: Math.round(d.receita * 0.7 * 100) / 100, color: primaryColor },
        { label: "Mercedes/BMW", value: d.ano >= "2027" ? Math.round(d.receita * 0.2 * 100) / 100 : 0, color: secondaryColor },
        { label: "Porsche", value: d.ano >= "2028" ? Math.round(d.receita * 0.1 * 100) / 100 : 0, color: "oklch(0.35 0.176 25.4)" },
      ],
    });
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={crescimentoProjecao}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="ano" stroke={axisColor} style={{ fontFamily: "Saira Condensed", fontSize: "11px" }} />
        <YAxis stroke={axisColor} style={{ fontFamily: "Saira Condensed", fontSize: "11px" }} tickFormatter={(v) => `R$${v}M`} />
        <Tooltip content={<ChartTooltip unit="M" formatter={(v) => `R$ ${v}M`} />} />
        <Bar dataKey="receita" fill={primaryColor} name="ProjeÃ§Ã£o" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleClick} className="cursor-pointer" />
        <Bar dataKey="meta" fill={secondaryColor} name="Meta" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// === CONFIGURAÃ‡ÃƒO DOS BLOCOS ===

const defaultBlocks: BlockConfig[] = [
  {
    id: "marketing",
    title: "Marketing",
    icon: Megaphone,
    kpis: marketingKpis,
    insights: marketingInsights,
    accent: "AquisiÃ§Ã£o",
    span: "full",
    chart: MarketingChart,
  },
  {
    id: "financeiro",
    title: "Financeiro",
    icon: DollarSign,
    kpis: financeiroKpis,
    insights: financeiroInsights,
    accent: "Resultado",
    span: "full",
    chart: FinanceiroChart,
  },
  {
    id: "comercial",
    title: "Comercial",
    icon: ShoppingCart,
    kpis: vendasKpis,
    insights: vendasInsights,
    accent: "Vendas",
    span: "full",
    chart: VendasChart,
  },
  {
    id: "operacao",
    title: "OperaÃ§Ã£o",
    icon: Wrench,
    kpis: operacaoKpis,
    insights: operacaoInsights,
    accent: "ProduÃ§Ã£o",
    span: "half",
    chart: OperacaoChart,
  },
  {
    id: "crescimento",
    title: "Crescimento",
    icon: Rocket,
    kpis: crescimentoKpis,
    insights: crescimentoInsights,
    accent: "ExpansÃ£o",
    span: "half",
    chart: CrescimentoChart,
  },
];

// === PÃGINA PRINCIPAL ===

export default function ResumoExecutivo() {
  const { periodOption } = usePeriod();
  const drill = useDrillDown();
  const [blocks, setBlocks] = useState<BlockConfig[]>(defaultBlocks);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedId;
    if (!sourceId || sourceId === id) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    setBlocks((prev) => {
      const sourceIdx = prev.findIndex((b) => b.id === sourceId);
      const targetIdx = prev.findIndex((b) => b.id === id);
      if (sourceIdx === -1 || targetIdx === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(sourceIdx, 1);
      updated.splice(targetIdx, 0, moved);
      return updated;
    });

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Separar blocos full e half para o layout
  const fullBlocks = blocks.filter((b) => b.span !== "half");
  const halfBlocks = blocks.filter((b) => b.span === "half");
  const totalAlerts = blocks.reduce(
    (sum, b) => sum + b.kpis.filter((k) => k.belowTarget).length,
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="dap-heading text-3xl md:text-4xl text-foreground">
              Resumo <span className="text-primary">Executivo</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-condensed">
              As 5 Ã¡reas crÃ­ticas do negÃ³cio em uma tela â€” {periodOption.label} â€” Doctor Auto Prime
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {totalAlerts > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-condensed bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
                <AlertTriangle className="h-3.5 w-3.5" />
                {totalAlerts} {totalAlerts === 1 ? "alerta ativo" : "alertas ativos"}
              </span>
            )}
            <span className="flex items-center gap-2 text-xs font-condensed text-muted-foreground">
              <GripHorizontal className="h-4 w-4 text-primary" />
              Arraste para reordenar
            </span>
          </div>
        </div>

        {/* Todos os blocos em ordem â€” respeita drag-and-drop */}
        <div className="grid gap-5 lg:grid-cols-2">
          {blocks.map((block) => {
            const Chart = block.chart;
            return (
              <div
                key={block.id}
                className={block.span === "half" ? "lg:col-span-1" : "lg:col-span-2"}
              >
                <AreaBlock
                  block={block}
                  isDragging={draggedId === block.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                >
                  <Chart />
                </AreaBlock>
              </div>
            );
          })}
        </div>
      </div>

      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </DashboardLayout>
  );
}
