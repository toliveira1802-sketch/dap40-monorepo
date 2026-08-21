import { ChartCard } from "@/features/gestao/components/ChartCard";
import { ChartTooltip } from "@/features/gestao/components/ChartTooltip";
import { DrillDownModal } from "@/features/gestao/components/DrillDownModal";
import { StableChartContainer } from "@/features/gestao/components/StableChartContainer";
import { usePeriodData } from "@/features/gestao/hooks/usePeriodData";
import { useDrillDown, type DrillDownData } from "@/features/gestao/hooks/useDrillDown";
import type { BusinessAreaKey } from "@/features/gestao/lib/areas";
import {
  chartAxisColor,
  chartGridColor,
  chartPrimaryColor,
  chartSecondaryColor,
} from "@/features/gestao/lib/chartTheme";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axisStyle = { fontFamily: "Saira Condensed", fontSize: "12px" };
const axisColor = chartAxisColor;
const gridColor = chartGridColor;
const primaryColor = chartPrimaryColor;
const secondaryColor = chartSecondaryColor;
const ANIM_DUR = 600;

// Helper to build drill-down data
function buildDrill(title: string, subtitle: string, metrics: DrillDownData["metrics"], breakdown?: DrillDownData["breakdown"], details?: DrillDownData["details"]): DrillDownData {
  return { title, subtitle, metrics, breakdown, details };
}

// === CLIENTE ===
const clienteSegmentacao = [
  { name: "Premium", value: 85, fill: primaryColor },
  { name: "Regular", value: 180, fill: secondaryColor },
  { name: "Ocasional", value: 77, fill: "oklch(0.35 0.176 25.4)" },
];

function ClienteCharts() {
  const { clienteEvol } = usePeriodData();
  const drill = useDrillDown();

  const handleEvolClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.mes) return;
    drill.open(buildDrill(
      `Clientes â€” ${d.mes}`,
      "EvoluÃ§Ã£o da base de clientes",
      [
        { label: "Ativos", value: `${d.ativos ?? 0}` },
        { label: "Novos", value: `${d.novos ?? 0}`, trend: d.novos > 5 ? "+ Crescimento" : "EstÃ¡vel", trendUp: d.novos > 5 },
        { label: "Churn", value: `${Math.max(0, (d.ativos ?? 0) - (d.ativos ?? 0) + (d.novos ?? 0) - 2)}` },
      ],
      [
        { label: "Premium", value: Math.round((d.ativos ?? 0) * 0.25), color: primaryColor },
        { label: "Regular", value: Math.round((d.ativos ?? 0) * 0.53), color: secondaryColor },
        { label: "Ocasional", value: Math.round((d.ativos ?? 0) * 0.22), color: "oklch(0.35 0.176 25.4)" },
      ],
      [
        { label: "NPS MÃ©dio", value: "87" },
        { label: "RetenÃ§Ã£o", value: "92%" },
      ],
    ));
  };

  const handleSegClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.name) return;
    drill.open(buildDrill(
      `${d.name} â€” ${d.value} clientes`,
      "SegmentaÃ§Ã£o de clientes",
      [
        { label: "Total", value: `${d.value}` },
        { label: "Receita MÃ©dia", value: `R$ ${(d.value * 0.8).toFixed(0)}K` },
        { label: "FrequÃªncia", value: d.name === "Premium" ? "Mensal" : d.name === "Regular" ? "Trimestral" : "Semestral" },
      ],
      [
        { label: "VW/Audi", value: Math.round(d.value * 0.7), color: primaryColor },
        { label: "Outras", value: Math.round(d.value * 0.3), color: secondaryColor },
      ],
      [
        { label: "Ticket MÃ©dio", value: d.name === "Premium" ? "R$ 3.2K" : d.name === "Regular" ? "R$ 1.8K" : "R$ 0.9K" },
      ],
    ));
  };

  return (
    <>
      <ChartCard title="EvoluÃ§Ã£o de Clientes">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={clienteEvol}>
            <defs>
              <linearGradient id="cliAtivos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="mes" stroke={axisColor} style={axisStyle} />
            <YAxis stroke={axisColor} style={axisStyle} />
            <Tooltip content={<ChartTooltip />} />
            <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
            <Area type="monotone" dataKey="ativos" stroke={primaryColor} fill="url(#cliAtivos)" name="Ativos" strokeWidth={2} animationDuration={ANIM_DUR} onClick={handleEvolClick} className="cursor-pointer" />
            <Area type="monotone" dataKey="novos" stroke={secondaryColor} fill="none" name="Novos" strokeWidth={2} animationDuration={ANIM_DUR} onClick={handleEvolClick} className="cursor-pointer" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="SegmentaÃ§Ã£o">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={clienteSegmentacao} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} animationDuration={ANIM_DUR} onClick={handleSegClick} className="cursor-pointer">
              {clienteSegmentacao.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <Tooltip content={<ChartTooltip unit=" clientes" formatter={(v) => `${v} clientes`} />} />
            <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </>
  );
}

// === CONHECIMENTO ===
const conhecimentoCompetencias = [
  { area: "Remap STG1", nivel: 95 },
  { area: "Remap STG2", nivel: 78 },
  { area: "DiagnÃ³stico", nivel: 88 },
  { area: "VCDS", nivel: 82 },
  { area: "MecÃ¢nica", nivel: 90 },
  { area: "ElÃ©trica", nivel: 65 },
];

function ConhecimentoCharts() {
  const { trilhas } = usePeriodData();
  const drill = useDrillDown();

  const handleTrilhaClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.mes) return;
    drill.open(buildDrill(
      `Trilhas â€” ${d.mes}`,
      "Aprendizado e capacitaÃ§Ã£o",
      [
        { label: "ConcluÃ­dos", value: `${d.concluidos ?? 0}` },
        { label: "Em Andamento", value: `${d.em_andamento ?? 0}` },
        { label: "Taxa de ConclusÃ£o", value: `${d.concluidos && (d.concluidos + d.em_andamento) ? Math.round(d.concluidos / (d.concluidos + d.em_andamento) * 100) : 0}%` },
      ],
      [
        { label: "Remap STG1", value: Math.round((d.concluidos ?? 0) * 0.3), color: primaryColor },
        { label: "DiagnÃ³stico", value: Math.round((d.concluidos ?? 0) * 0.25), color: secondaryColor },
        { label: "MecÃ¢nica", value: Math.round((d.concluidos ?? 0) * 0.2), color: "oklch(0.35 0.176 25.4)" },
        { label: "Outros", value: Math.round((d.concluidos ?? 0) * 0.25), color: "oklch(0.65 0.2 25.4 / 40%)" },
      ],
    ));
  };

  const handleCompClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.area) return;
    drill.open(buildDrill(
      `${d.area} â€” NÃ­vel ${d.nivel}%`,
      "CompetÃªncia tÃ©cnica",
      [
        { label: "NÃ­vel", value: `${d.nivel}%` },
        { label: "Profissionais", value: `${Math.round(d.nivel / 20)}` },
        { label: "Treinamentos", value: `${Math.round(d.nivel / 15)}` },
      ],
      [
        { label: "TeÃ³rico", value: Math.round(d.nivel * 0.4), color: primaryColor },
        { label: "PrÃ¡tico", value: Math.round(d.nivel * 0.6), color: secondaryColor },
      ],
    ));
  };

  return (
    <>
      <ChartCard title="Trilhas de Aprendizado">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={trilhas}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="mes" stroke={axisColor} style={axisStyle} />
            <YAxis stroke={axisColor} style={axisStyle} />
            <Tooltip content={<ChartTooltip formatter={(v) => `${v} trilhas`} />} />
            <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
            <Bar dataKey="concluidos" fill={primaryColor} name="ConcluÃ­dos" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleTrilhaClick} className="cursor-pointer" />
            <Bar dataKey="em_andamento" fill={secondaryColor} name="Em Andamento" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleTrilhaClick} className="cursor-pointer" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Heatmap de CompetÃªncias">
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={conhecimentoCompetencias}>
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis dataKey="area" tick={{ fill: axisColor, fontSize: 11, fontFamily: "Saira Condensed" }} />
            <Radar dataKey="nivel" stroke={primaryColor} fill={primaryColor} fillOpacity={0.25} strokeWidth={2} animationDuration={ANIM_DUR} onClick={handleCompClick} className="cursor-pointer" />
            <Tooltip content={<ChartTooltip unit="%" formatter={(v) => `${v}%`} />} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>
      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </>
  );
}

// === CRESCIMENTO ===
const crescimentoProjecao = [
  { ano: "2025", receita: 0.85, meta: 0.9 },
  { ano: "2026", receita: 1.2, meta: 1.3 },
  { ano: "2027", receita: 2.8, meta: 2.5 },
  { ano: "2028", receita: 4.2, meta: 4.0 },
];

const crescimentoMarcas = [
  { name: "VW/Audi", value: 100, fill: primaryColor },
  { name: "Mercedes/BMW", value: 0, fill: secondaryColor },
  { name: "Porsche", value: 0, fill: "oklch(0.35 0.176 25.4)" },
];

function CrescimentoCharts() {
  const drill = useDrillDown();

  const handleProjClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.ano) return;
    drill.open(buildDrill(
      `ProjeÃ§Ã£o ${d.ano}`,
      "ExpansÃ£o de receita",
      [
        { label: "ProjeÃ§Ã£o", value: `R$ ${d.receita}M`, trend: d.receita >= d.meta ? "Acima da meta" : "Abaixo da meta", trendUp: d.receita >= d.meta },
        { label: "Meta", value: `R$ ${d.meta}M` },
        { label: "Delta", value: `R$ ${(d.receita - d.meta).toFixed(1)}M` },
      ],
      [
        { label: "VW/Audi", value: Math.round(d.receita * 0.7 * 100) / 100, color: primaryColor },
        { label: "Mercedes/BMW", value: d.ano >= "2027" ? Math.round(d.receita * 0.2 * 100) / 100 : 0, color: secondaryColor },
        { label: "Porsche", value: d.ano >= "2028" ? Math.round(d.receita * 0.1 * 100) / 100 : 0, color: "oklch(0.35 0.176 25.4)" },
      ],
    ));
  };

  const handleMarcaClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.name) return;
    drill.open(buildDrill(
      d.name,
      "Roadmap de marcas",
      [
        { label: "Status", value: d.value > 0 ? "Ativo" : "Planejado" },
        { label: "Receita Atual", value: `R$ ${d.value}M` },
        { label: "Meta Ano", value: d.name === "VW/Audi" ? "2026" : d.name === "Mercedes/BMW" ? "2027" : "2028" },
      ],
    ));
  };

  return (
    <>
      <ChartCard title="ProjeÃ§Ã£o de Receita (R$M)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={crescimentoProjecao}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="ano" stroke={axisColor} style={axisStyle} />
            <YAxis stroke={axisColor} style={axisStyle} tickFormatter={(v) => `R$${v}M`} />
            <Tooltip content={<ChartTooltip unit="M" formatter={(v) => `R$ ${v}M`} />} />
            <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
            <Bar dataKey="receita" fill={primaryColor} name="ProjeÃ§Ã£o" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleProjClick} className="cursor-pointer" />
            <Bar dataKey="meta" fill={secondaryColor} name="Meta" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Roadmap de Marcas">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={crescimentoMarcas} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} animationDuration={ANIM_DUR} onClick={handleMarcaClick} className="cursor-pointer">
              {crescimentoMarcas.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <Tooltip content={<ChartTooltip unit="%" formatter={(v) => `${v}%`} />} />
            <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </>
  );
}

// === FINANCEIRO ===
const financeiroDRE = [
  { item: "Receita Bruta", valor: 184 },
  { item: "Custo Operacional", valor: -62 },
  { item: "Margem Bruta", valor: 122 },
  { item: "Despesas", valor: -28 },
  { item: "Lucro LÃ­quido", valor: 94 },
];

function FinanceiroCharts() {
  const { fluxo } = usePeriodData();
  const drill = useDrillDown();

  const handleFluxoClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.mes) return;
    const saldo = (d.entradas ?? 0) - (d.saidas ?? 0);
    drill.open(buildDrill(
      `Fluxo de Caixa â€” ${d.mes}`,
      "Entradas e saÃ­das",
      [
        { label: "Entradas", value: `R$ ${d.entradas ?? 0}K`, trend: "Receita", trendUp: true },
        { label: "SaÃ­das", value: `R$ ${d.saidas ?? 0}K` },
        { label: "Saldo", value: `R$ ${saldo}K`, trend: saldo >= 0 ? "Positivo" : "Negativo", trendUp: saldo >= 0 },
      ],
      [
        { label: "STG 1", value: Math.round((d.entradas ?? 0) * 0.45), color: primaryColor },
        { label: "STG 2", value: Math.round((d.entradas ?? 0) * 0.22), color: secondaryColor },
        { label: "DiagnÃ³stico", value: Math.round((d.entradas ?? 0) * 0.18), color: "oklch(0.35 0.176 25.4)" },
        { label: "Outros", value: Math.round((d.entradas ?? 0) * 0.15), color: "oklch(0.65 0.2 25.4 / 40%)" },
      ],
      [
        { label: "Margem", value: `${((saldo / (d.entradas ?? 1)) * 100).toFixed(0)}%` },
        { label: "Custo/Receita", value: `${(((d.saidas ?? 0) / (d.entradas ?? 1)) * 100).toFixed(0)}%` },
      ],
    ));
  };

  const handleDreClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.item) return;
    drill.open(buildDrill(
      d.item,
      "DRE Simplificado",
      [
        { label: "Valor", value: `R$ ${d.valor}K`, trend: d.valor >= 0 ? "Positivo" : "Negativo", trendUp: d.valor >= 0 },
        { label: "% Receita", value: `${Math.abs(Math.round((d.valor / 184) * 100))}%` },
      ],
      [
        { label: "MÃ£o de Obra", value: Math.round(Math.abs(d.valor) * 0.4), color: primaryColor },
        { label: "Insumos", value: Math.round(Math.abs(d.valor) * 0.35), color: secondaryColor },
        { label: "Overhead", value: Math.round(Math.abs(d.valor) * 0.25), color: "oklch(0.35 0.176 25.4)" },
      ],
    ));
  };

  return (
    <>
      <ChartCard title="Fluxo de Caixa (R$K)">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={fluxo}>
            <defs>
              <linearGradient id="finEnt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="mes" stroke={axisColor} style={axisStyle} />
            <YAxis stroke={axisColor} style={axisStyle} tickFormatter={(v) => `R$${v}K`} />
            <Tooltip content={<ChartTooltip unit="K" formatter={(v) => `R$ ${v}K`} />} />
            <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
            <Area type="monotone" dataKey="entradas" stroke={primaryColor} fill="url(#finEnt)" name="Entradas" strokeWidth={2} animationDuration={ANIM_DUR} onClick={handleFluxoClick} className="cursor-pointer" />
            <Area type="monotone" dataKey="saidas" stroke={secondaryColor} fill="none" name="SaÃ­das" strokeWidth={2} animationDuration={ANIM_DUR} onClick={handleFluxoClick} className="cursor-pointer" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="DRE Simplificado (R$K)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={financeiroDRE} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" stroke={axisColor} style={axisStyle} tickFormatter={(v) => `R$${v}K`} />
            <YAxis type="category" dataKey="item" stroke={axisColor} style={axisStyle} width={100} />
            <Tooltip content={<ChartTooltip unit="K" formatter={(v) => `R$ ${v}K`} />} />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]} animationDuration={ANIM_DUR} onClick={handleDreClick} className="cursor-pointer">
              {financeiroDRE.map((e, i) => (
                <Cell key={i} fill={e.valor >= 0 ? primaryColor : "oklch(0.5 0.2 25.4 / 40%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </>
  );
}

// === MARKETING ===
const marketingFunil = [
  { etapa: "ImpressÃµes", valor: 12500, fill: "oklch(0.65 0.2 25.4 / 30%)" },
  { etapa: "Cliques", valor: 3200, fill: "oklch(0.65 0.2 25.4 / 50%)" },
  { etapa: "Leads", valor: 124, fill: "oklch(0.65 0.2 25.4 / 70%)" },
  { etapa: "Qualificados", valor: 89, fill: primaryColor },
  { etapa: "Convertidos", valor: 17, fill: "oklch(0.35 0.176 25.4)" },
];

const marketingCanais = [
  { canal: "Instagram", leads: 52 },
  { canal: "Meta Ads", leads: 38 },
  { canal: "Google Ads", leads: 22 },
  { canal: "IndicaÃ§Ã£o", leads: 12 },
];

function MarketingCharts() {
  const drill = useDrillDown();

  const handleFunilClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.etapa) return;
    drill.open(buildDrill(
      d.etapa,
      "Funil de leads",
      [
        { label: "Volume", value: `${d.valor}` },
        { label: "Taxa", value: d.valor > 1000 ? `${(d.valor / 12500 * 100).toFixed(1)}%` : `${d.valor}/124 leads` },
      ],
      [
        { label: "Instagram", value: Math.round(d.valor * 0.42), color: primaryColor },
        { label: "Meta Ads", value: Math.round(d.valor * 0.31), color: secondaryColor },
        { label: "Google Ads", value: Math.round(d.valor * 0.18), color: "oklch(0.35 0.176 25.4)" },
        { label: "IndicaÃ§Ã£o", value: Math.round(d.valor * 0.09), color: "oklch(0.65 0.2 25.4 / 40%)" },
      ],
    ));
  };

  const handleCanalClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.canal) return;
    drill.open(buildDrill(
      d.canal,
      "Canal de aquisiÃ§Ã£o",
      [
        { label: "Leads", value: `${d.leads}` },
        { label: "ConversÃ£o", value: `${Math.round(d.leads * 0.14)} vendas` },
        { label: "Custo/Lead", value: d.canal === "Instagram" ? "R$ 2,50" : d.canal === "Meta Ads" ? "R$ 4,20" : d.canal === "Google Ads" ? "R$ 8,00" : "R$ 0,00" },
      ],
    ));
  };

  return (
    <>
      <ChartCard title="Funil de Leads">
        <StableChartContainer>
          <FunnelChart>
            <Tooltip content={<ChartTooltip />} />
            <Funnel data={marketingFunil} dataKey="valor" nameKey="etapa" isAnimationActive animationDuration={ANIM_DUR} onClick={handleFunilClick} className="cursor-pointer">
              <LabelList position="right" fill={axisColor} stroke="none" style={{ fontFamily: "Saira Condensed", fontSize: 11 }} />
            </Funnel>
          </FunnelChart>
        </StableChartContainer>
      </ChartCard>
      <ChartCard title="Canais de AquisiÃ§Ã£o">
        <StableChartContainer>
          <BarChart data={marketingCanais} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" stroke={axisColor} style={axisStyle} />
            <YAxis type="category" dataKey="canal" stroke={axisColor} style={axisStyle} width={80} />
            <Tooltip content={<ChartTooltip unit=" leads" formatter={(v) => `${v} leads`} />} />
            <Bar dataKey="leads" fill={primaryColor} radius={[0, 4, 4, 0]} name="Leads" animationDuration={ANIM_DUR} onClick={handleCanalClick} className="cursor-pointer" />
          </BarChart>
        </StableChartContainer>
      </ChartCard>
      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </>
  );
}

// === OPERAÃ‡ÃƒO ===
const operacaoStatus = [
  { name: "Em Andamento", value: 18, fill: primaryColor },
  { name: "Aguardando", value: 7, fill: secondaryColor },
  { name: "ConcluÃ­das", value: 45, fill: "oklch(0.35 0.176 25.4)" },
  { name: "Retorno", value: 3, fill: "oklch(0.5 0.2 25.4 / 40%)" },
];

function OperacaoCharts() {
  const { tempo } = usePeriodData();
  const drill = useDrillDown();

  const handleStatusClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.name) return;
    drill.open(buildDrill(
      `${d.name} â€” ${d.value} OS`,
      "Status das ordens de serviÃ§o",
      [
        { label: "Total", value: `${d.value}` },
        { label: "Tempo MÃ©dio", value: d.name === "ConcluÃ­das" ? "2.5h" : d.name === "Em Andamento" ? "4.2h" : "1.0h" },
        { label: "Receita", value: `R$ ${d.value * 2.5}K` },
      ],
      [
        { label: "STG 1", value: Math.round(d.value * 0.45), color: primaryColor },
        { label: "STG 2", value: Math.round(d.value * 0.22), color: secondaryColor },
        { label: "DiagnÃ³stico", value: Math.round(d.value * 0.18), color: "oklch(0.35 0.176 25.4)" },
        { label: "Outros", value: Math.round(d.value * 0.15), color: "oklch(0.65 0.2 25.4 / 40%)" },
      ],
    ));
  };

  const handleTempoClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.mes) return;
    drill.open(buildDrill(
      `Tempo MÃ©dio â€” ${d.mes}`,
      "Horas por OS",
      [
        { label: "Tempo", value: `${d.tempo}h` },
        { label: "Meta", value: "3.0h", trend: d.tempo <= 3 ? "Dentro da meta" : "Acima da meta", trendUp: d.tempo <= 3 },
        { label: "OS no mÃªs", value: `${Math.round(184 / d.tempo)}` },
      ],
    ));
  };

  return (
    <>
      <ChartCard title="OS por Status">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={operacaoStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} animationDuration={ANIM_DUR} onClick={handleStatusClick} className="cursor-pointer">
              {operacaoStatus.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <Tooltip content={<ChartTooltip unit=" OS" formatter={(v) => `${v} OS`} />} />
            <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Tempo MÃ©dio de Atendimento (h)">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={tempo}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="mes" stroke={axisColor} style={axisStyle} />
            <YAxis stroke={axisColor} style={axisStyle} domain={[0, 4]} />
            <Tooltip content={<ChartTooltip unit="h" formatter={(v) => `${v}h`} />} />
            <Line type="monotone" dataKey="tempo" stroke={primaryColor} strokeWidth={2} name="Tempo (h)" dot={{ r: 4 }} animationDuration={ANIM_DUR} onClick={handleTempoClick} className="cursor-pointer" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </>
  );
}

// === PESSOAS ===
const pessoasProdutividade = [
  { nome: "JoÃ£o", vendas: 34, os: 28 },
  { nome: "Pedro", vendas: 28, os: 22 },
  { nome: "Simone", vendas: 15, os: 18 },
  { nome: "Mec. 1", vendas: 0, os: 42 },
  { nome: "Mec. 2", vendas: 0, os: 38 },
];

function PessoasCharts() {
  const { headcount } = usePeriodData();
  const drill = useDrillDown();

  const handleHeadClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.mes) return;
    drill.open(buildDrill(
      `Headcount â€” ${d.mes}`,
      "Quadro de pessoal",
      [
        { label: "Total", value: `${d.total}` },
        { label: "Consultores", value: `${Math.round(d.total * 0.25)}` },
        { label: "MecÃ¢nicos", value: `${Math.round(d.total * 0.4)}` },
      ],
      [
        { label: "Consultores", value: Math.round(d.total * 0.25), color: primaryColor },
        { label: "MecÃ¢nicos", value: Math.round(d.total * 0.4), color: secondaryColor },
        { label: "Admin", value: Math.round(d.total * 0.35), color: "oklch(0.35 0.176 25.4)" },
      ],
    ));
  };

  const handleProdClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.nome) return;
    drill.open(buildDrill(
      `${d.nome} â€” Produtividade`,
      "Performance individual",
      [
        { label: "Vendas", value: `${d.vendas}` },
        { label: "OS", value: `${d.os}` },
        { label: "Total", value: `${d.vendas + d.os}` },
      ],
      [
        { label: "STG 1", value: Math.round((d.vendas + d.os) * 0.45), color: primaryColor },
        { label: "STG 2", value: Math.round((d.vendas + d.os) * 0.25), color: secondaryColor },
        { label: "DiagnÃ³stico", value: Math.round((d.vendas + d.os) * 0.3), color: "oklch(0.35 0.176 25.4)" },
      ],
      [
        { label: "AvaliaÃ§Ã£o", value: "4.8/5" },
        { label: "Tempo de Casa", value: "2 anos" },
      ],
    ));
  };

  return (
    <>
      <ChartCard title="Headcount">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={headcount}>
            <defs>
              <linearGradient id="pessHC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="mes" stroke={axisColor} style={axisStyle} />
            <YAxis stroke={axisColor} style={axisStyle} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="total" stroke={primaryColor} fill="url(#pessHC)" name="Total" strokeWidth={2} animationDuration={ANIM_DUR} onClick={handleHeadClick} className="cursor-pointer" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Produtividade por Colaborador">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={pessoasProdutividade}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="nome" stroke={axisColor} style={axisStyle} />
            <YAxis stroke={axisColor} style={axisStyle} />
            <Tooltip content={<ChartTooltip />} />
            <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
            <Bar dataKey="vendas" fill={primaryColor} name="Vendas" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleProdClick} className="cursor-pointer" />
            <Bar dataKey="os" fill={secondaryColor} name="OS Executadas" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleProdClick} className="cursor-pointer" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </>
  );
}

// === TECNOLOGIA ===
const tecnologiaSistemas = [
  { name: "CRM", value: 100, fill: primaryColor },
  { name: "App", value: 85, fill: secondaryColor },
  { name: "Cloud Functions", value: 100, fill: "oklch(0.35 0.176 25.4)" },
  { name: "Agentes IA", value: 75, fill: "oklch(0.5 0.2 25.4 / 40%)" },
  { name: "Equipamentos", value: 90, fill: "oklch(0.65 0.2 25.4 / 50%)" },
];

function TecnologiaCharts() {
  const { uptime } = usePeriodData();
  const drill = useDrillDown();

  const handleUptimeClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.mes) return;
    drill.open(buildDrill(
      `Uptime â€” ${d.mes}`,
      "Disponibilidade de sistemas",
      [
        { label: "Uptime", value: `${d.uptime}%` },
        { label: "Downtime", value: `${(100 - d.uptime).toFixed(1)}h` },
        { label: "SLA", value: "99.5%", trend: d.uptime >= 99.5 ? "Dentro do SLA" : "Abaixo do SLA", trendUp: d.uptime >= 99.5 },
      ],
    ));
  };

  const handleSysClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.name) return;
    drill.open(buildDrill(
      d.name,
      "Status do sistema",
      [
        { label: "Status", value: `${d.value}%` },
        { label: "Disponibilidade", value: d.value >= 95 ? "Operacional" : d.value >= 75 ? "Degradado" : "ManutenÃ§Ã£o" },
      ],
      [
        { label: "Frontend", value: Math.round(d.value * 0.5), color: primaryColor },
        { label: "Backend", value: Math.round(d.value * 0.5), color: secondaryColor },
      ],
    ));
  };

  return (
    <>
      <ChartCard title="Uptime (%)">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={uptime}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="mes" stroke={axisColor} style={axisStyle} />
            <YAxis stroke={axisColor} style={axisStyle} domain={[99, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<ChartTooltip unit="%" formatter={(v) => `${v}%`} />} />
            <Line type="monotone" dataKey="uptime" stroke={primaryColor} strokeWidth={2} name="Uptime" dot={{ r: 4 }} animationDuration={ANIM_DUR} onClick={handleUptimeClick} className="cursor-pointer" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Status de Sistemas">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={tecnologiaSistemas} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" stroke={axisColor} style={axisStyle} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" stroke={axisColor} style={axisStyle} width={110} />
            <Tooltip content={<ChartTooltip unit="%" formatter={(v) => `${v}%`} />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={ANIM_DUR} onClick={handleSysClick} className="cursor-pointer">
              {tecnologiaSistemas.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </>
  );
}

// === INFRAESTRUTURA ===
const infraestruturaProjetos = [
  { projeto: "Layout oficina", planejado: 42, comprometido: 31 },
  { projeto: "ElÃ©trica", planejado: 28, comprometido: 25 },
  { projeto: "Boxes", planejado: 24, comprometido: 16 },
  { projeto: "SeguranÃ§a", planejado: 18, comprometido: 10 },
];

const infraestruturaLicencas = [
  { licenca: "ODIS", dias: 18, status: "Renovar" },
  { licenca: "Autel", dias: 47, status: "Planejar" },
  { licenca: "VCDS", dias: 126, status: "Regular" },
  { licenca: "Bosch", dias: 211, status: "Regular" },
  { licenca: "Scanner OEM", dias: 286, status: "Regular" },
];

function InfraestruturaCharts() {
  const drill = useDrillDown();

  const handleProjectClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.projeto) return;
    const saldo = Math.max(0, (d.planejado ?? 0) - (d.comprometido ?? 0));
    drill.open(buildDrill(
      d.projeto,
      "Investimento em melhoria fÃ­sica",
      [
        { label: "Planejado", value: `R$ ${d.planejado}K` },
        { label: "Comprometido", value: `R$ ${d.comprometido}K` },
        { label: "Saldo", value: `R$ ${saldo}K`, trendUp: saldo > 0 },
      ],
    ));
  };

  const handleLicenseClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.licenca) return;
    drill.open(buildDrill(
      `LicenÃ§a â€” ${d.licenca}`,
      "Validade da licenÃ§a de scanner",
      [
        { label: "Dias restantes", value: `${d.dias}` },
        { label: "Status", value: d.status, trendUp: d.dias > 60 },
        { label: "Janela", value: d.dias <= 60 ? "AÃ§Ã£o necessÃ¡ria" : "Regular" },
      ],
    ));
  };

  return (
    <>
      <ChartCard title="Budget de Melhorias (R$ mil)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={infraestruturaProjetos}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="projeto" stroke={axisColor} style={axisStyle} />
            <YAxis stroke={axisColor} style={axisStyle} tickFormatter={(value) => `R$${value}K`} />
            <Tooltip content={<ChartTooltip formatter={(value) => `R$ ${value}K`} />} />
            <Legend formatter={(value) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{value}</span>} />
            <Bar dataKey="planejado" fill={secondaryColor} name="Planejado" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleProjectClick} className="cursor-pointer" />
            <Bar dataKey="comprometido" fill={primaryColor} name="Comprometido" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleProjectClick} className="cursor-pointer" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Validade das LicenÃ§as de Scanner">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={infraestruturaLicencas} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" stroke={axisColor} style={axisStyle} tickFormatter={(value) => `${value}d`} />
            <YAxis type="category" dataKey="licenca" stroke={axisColor} style={axisStyle} width={90} />
            <Tooltip content={<ChartTooltip formatter={(value) => `${value} dias`} />} />
            <Bar dataKey="dias" name="Dias restantes" radius={[0, 4, 4, 0]} animationDuration={ANIM_DUR} onClick={handleLicenseClick} className="cursor-pointer">
              {infraestruturaLicencas.map((item, index) => <Cell key={index} fill={item.dias <= 60 ? primaryColor : secondaryColor} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </>
  );
}

// === VENDAS ===
const vendasFunil = [
  { etapa: "Leads", valor: 124, fill: "oklch(0.65 0.2 25.4 / 30%)" },
  { etapa: "Qualificados", valor: 89, fill: "oklch(0.65 0.2 25.4 / 50%)" },
  { etapa: "Propostas", valor: 56, fill: "oklch(0.65 0.2 25.4 / 70%)" },
  { etapa: "NegociaÃ§Ã£o", valor: 42, fill: primaryColor },
  { etapa: "Fechados", valor: 67, fill: "oklch(0.35 0.176 25.4)" },
];

const vendasConsultores = [
  { nome: "JoÃ£o", vendas: 34, meta: 40 },
  { nome: "Pedro", vendas: 28, meta: 35 },
  { nome: "Ana (IA)", vendas: 5, meta: 10 },
];

function VendasCharts() {
  const drill = useDrillDown();

  const handleFunilClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.etapa) return;
    drill.open(buildDrill(
      d.etapa,
      "Funil de vendas",
      [
        { label: "Volume", value: `${d.valor}` },
        { label: "Taxa ConversÃ£o", value: d.etapa === "Leads" ? "100%" : `${((d.valor / 124) * 100).toFixed(0)}%` },
      ],
      [
        { label: "STG 1", value: Math.round(d.valor * 0.45), color: primaryColor },
        { label: "STG 2", value: Math.round(d.valor * 0.25), color: secondaryColor },
        { label: "DiagnÃ³stico", value: Math.round(d.valor * 0.3), color: "oklch(0.35 0.176 25.4)" },
      ],
    ));
  };

  const handleConsClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.nome) return;
    const conv = d.meta ? Math.round((d.vendas / d.meta) * 100) : 0;
    drill.open(buildDrill(
      `${d.nome} â€” Vendas`,
      "Performance do consultor",
      [
        { label: "Vendas", value: `${d.vendas}` },
        { label: "Meta", value: `${d.meta}` },
        { label: "ConversÃ£o", value: `${conv}%`, trend: conv >= 100 ? "Meta atingida" : "Abaixo da meta", trendUp: conv >= 100 },
      ],
      [
        { label: "STG 1", value: Math.round(d.vendas * 0.5), color: primaryColor },
        { label: "STG 2", value: Math.round(d.vendas * 0.3), color: secondaryColor },
        { label: "DiagnÃ³stico", value: Math.round(d.vendas * 0.2), color: "oklch(0.35 0.176 25.4)" },
      ],
      [
        { label: "Ticket MÃ©dio", value: `R$ ${(d.vendas * 2.7).toFixed(1)}K` },
        { label: "NPS", value: "87" },
      ],
    ));
  };

  return (
    <>
      <ChartCard title="Funil de Vendas">
        <ResponsiveContainer width="100%" height={240}>
          <FunnelChart>
            <Tooltip content={<ChartTooltip />} />
            <Funnel data={vendasFunil} dataKey="valor" nameKey="etapa" isAnimationActive animationDuration={ANIM_DUR} onClick={handleFunilClick} className="cursor-pointer">
              <LabelList position="right" fill={axisColor} stroke="none" style={{ fontFamily: "Saira Condensed", fontSize: 11 }} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Ranking de Consultores">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={vendasConsultores}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="nome" stroke={axisColor} style={axisStyle} />
            <YAxis stroke={axisColor} style={axisStyle} />
            <Tooltip content={<ChartTooltip formatter={(v) => `${v} vendas`} />} />
            <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
            <Bar dataKey="vendas" fill={primaryColor} name="Vendas" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleConsClick} className="cursor-pointer" />
            <Bar dataKey="meta" fill={secondaryColor} name="Meta" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </>
  );
}

const chartMap: Record<BusinessAreaKey, React.FC> = {
  cliente: ClienteCharts,
  conhecimento: ConhecimentoCharts,
  crescimento: CrescimentoCharts,
  financeiro: FinanceiroCharts,
  marketing: MarketingCharts,
  operacao: OperacaoCharts,
  pessoas: PessoasCharts,
  infraestrutura: InfraestruturaCharts,
  tecnologia: TecnologiaCharts,
  vendas: VendasCharts,
};

export function AreaCharts({ areaKey }: { areaKey: BusinessAreaKey }) {
  const Charts = chartMap[areaKey];
  if (!Charts) return null;
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <Charts />
    </div>
  );
}
