import { ChartCard } from "@/features/gestao/components/ChartCard";
import { ChartTooltip } from "@/features/gestao/components/ChartTooltip";
import { DrillDownModal } from "@/features/gestao/components/DrillDownModal";
import DashboardLayout from "@/features/gestao/components/DashboardLayout";
import { KpiCard } from "@/features/gestao/components/KpiCard";
import { Card, CardContent } from "@/components/ui/card";
import { usePeriodData } from "@/features/gestao/hooks/usePeriodData";
import { usePeriod } from "@/features/gestao/contexts/PeriodContext";
import { useDrillDown, type DrillDownData } from "@/features/gestao/hooks/useDrillDown";
import { businessAreas } from "@/features/gestao/lib/areas";
import {
  chartAxisColor,
  chartGridColor,
  chartNeutralColor,
  chartPrimaryColor,
  chartSecondaryColor,
} from "@/features/gestao/lib/chartTheme";
import { Activity, Crosshair, Gauge, Radar, Target, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  RadarChart,
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

const areaPerformance = [
  { area: "Cliente", score: 87 },
  { area: "Conhecimento", score: 72 },
  { area: "Crescimento", score: 91 },
  { area: "Financeiro", score: 84 },
  { area: "Marketing", score: 76 },
  { area: "OperaÃ§Ã£o", score: 89 },
  { area: "Pessoas", score: 68 },
  { area: "Infraestrutura", score: 74 },
  { area: "Tecnologia", score: 82 },
  { area: "Vendas", score: 78 },
];

const funilIntegrado = [
  { etapa: "Leads", marketing: 124, vendas: 0 },
  { etapa: "Qualificados", marketing: 89, vendas: 89 },
  { etapa: "Propostas", marketing: 0, vendas: 56 },
  { etapa: "NegociaÃ§Ã£o", marketing: 0, vendas: 42 },
  { etapa: "Fechados", marketing: 0, vendas: 67 },
];

const receitaPorServico = [
  { servico: "STG 1", receita: 82, os: 45 },
  { servico: "STG 2", receita: 48, os: 22 },
  { servico: "DiagnÃ³stico", receita: 22, os: 18 },
  { servico: "RevisÃ£o", receita: 18, os: 12 },
  { servico: "Outros", receita: 14, os: 15 },
];

const correlacoes: { a: string; b: string; valor: number; label: string }[] = [
  { a: "Marketing", b: "Vendas", valor: 0.82, label: "Leads â†’ ConversÃ£o" },
  { a: "Vendas", b: "Financeiro", valor: 0.91, label: "Vendas â†’ Receita" },
  { a: "OperaÃ§Ã£o", b: "Cliente", valor: 0.74, label: "Tempo OS â†’ NPS" },
  { a: "Pessoas", b: "OperaÃ§Ã£o", valor: 0.68, label: "Produtividade â†’ OS" },
  { a: "Tecnologia", b: "Vendas", valor: 0.55, label: "IA â†’ ConversÃ£o" },
  { a: "Conhecimento", b: "Pessoas", valor: 0.61, label: "Treinamento â†’ Performance" },
];

const crossKpis = [
  { label: "Lead â†’ Venda", value: "31%", trend: "+4%", trendUp: true, icon: Crosshair },
  { label: "OS â†’ Receita", value: "R$ 10.2K", trend: "+8%", trendUp: true, icon: Activity },
  { label: "NPS â†’ RetenÃ§Ã£o", value: "87%", trend: "+3%", trendUp: true, icon: Gauge },
  { label: "Meta Global", value: "82%", trend: "+12%", trendUp: true, icon: Target },
];

export default function Visao360() {
  const { periodOption } = usePeriod();
  const { timeline } = usePeriodData();
  const drill = useDrillDown();

  const handleRadarClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.area) return;
    drill.open({
      title: `${d.area} â€” Score ${d.score}/100`,
      subtitle: "Performance da Ã¡rea",
      metrics: [
        { label: "Score", value: `${d.score}/100` },
        { label: "Status", value: d.score >= 85 ? "Excelente" : d.score >= 70 ? "Bom" : "AtenÃ§Ã£o" },
        { label: "TendÃªncia", value: d.score >= 80 ? "Crescente" : "EstÃ¡vel", trend: d.score >= 80 ? "â†—" : "â†’", trendUp: d.score >= 80 },
      ],
      breakdown: [
        { label: "Processos", value: Math.round(d.score * 0.35), color: primaryColor },
        { label: "Resultados", value: Math.round(d.score * 0.40), color: secondaryColor },
        { label: "Pessoas", value: Math.round(d.score * 0.25), color: "oklch(0.35 0.176 25.4)" },
      ],
    });
  };

  const handleFunilClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.etapa) return;
    drill.open({
      title: d.etapa,
      subtitle: "Funil integrado Marketing â†’ Vendas",
      metrics: [
        { label: "Marketing", value: `${d.marketing}` },
        { label: "Vendas", value: `${d.vendas}` },
        { label: "Total", value: `${d.marketing + d.vendas}` },
      ],
      breakdown: [
        { label: "Instagram", value: Math.round((d.marketing + d.vendas) * 0.42), color: primaryColor },
        { label: "Meta Ads", value: Math.round((d.marketing + d.vendas) * 0.31), color: secondaryColor },
        { label: "Google Ads", value: Math.round((d.marketing + d.vendas) * 0.18), color: "oklch(0.35 0.176 25.4)" },
        { label: "IndicaÃ§Ã£o", value: Math.round((d.marketing + d.vendas) * 0.09), color: "oklch(0.65 0.2 25.4 / 40%)" },
      ],
    });
  };

  const handleReceitaClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.servico) return;
    drill.open({
      title: d.servico,
      subtitle: "Receita vs Volume de OS",
      metrics: [
        { label: "Receita", value: `R$ ${d.receita}K` },
        { label: "OS", value: `${d.os}` },
        { label: "Ticket MÃ©dio", value: `R$ ${(d.receita / d.os * 1000).toFixed(0)}` },
      ],
      breakdown: [
        { label: "JoÃ£o", value: Math.round(d.receita * 0.45), color: primaryColor },
        { label: "Pedro", value: Math.round(d.receita * 0.35), color: secondaryColor },
        { label: "Simone", value: Math.round(d.receita * 0.20), color: "oklch(0.35 0.176 25.4)" },
      ],
    });
  };

  const handleTimelineClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.mes) return;
    drill.open({
      title: `Timeline â€” ${d.mes}`,
      subtitle: "Indicadores unificados do mÃªs",
      metrics: [
        { label: "Vendas", value: `${d.vendas}` },
        { label: "Clientes", value: `${d.clientes}` },
        { label: "Receita", value: `R$ ${d.receita}K`, trend: d.receita >= 150 ? "Acima" : "Abaixo", trendUp: d.receita >= 150 },
        { label: "OS", value: `${d.os}` },
      ],
      breakdown: [
        { label: "STG 1", value: Math.round(d.receita * 0.45), color: primaryColor },
        { label: "STG 2", value: Math.round(d.receita * 0.22), color: secondaryColor },
        { label: "DiagnÃ³stico", value: Math.round(d.receita * 0.18), color: "oklch(0.35 0.176 25.4)" },
        { label: "Outros", value: Math.round(d.receita * 0.15), color: "oklch(0.65 0.2 25.4 / 40%)" },
      ],
      details: [
        { label: "ConversÃ£o", value: "31%" },
        { label: "NPS", value: "87" },
        { label: "Tempo MÃ©dio OS", value: "2.8h" },
      ],
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="dap-heading text-3xl md:text-4xl text-foreground">
            VisÃ£o <span className="text-primary">360Â°</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-condensed max-w-2xl">
            Cruzamento de indicadores entre todas as Ã¡reas â€” {periodOption.label} â€” correlaÃ§Ãµes, tendÃªncias integradas e visÃ£o holÃ­stica do negÃ³cio
          </p>
        </div>

        {/* Cross KPIs */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          {crossKpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Radar + CorrelaÃ§Ãµes */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Performance por Ãrea" icon={Radar}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={areaPerformance}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="area" tick={{ fill: axisColor, fontSize: 11, fontFamily: "Saira Condensed" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: chartNeutralColor, fontSize: 10 }} stroke={gridColor} />
                <RechartsRadar dataKey="score" stroke={primaryColor} fill={primaryColor} fillOpacity={0.25} strokeWidth={2} animationDuration={ANIM_DUR} onClick={handleRadarClick} className="cursor-pointer" />
                <Tooltip content={<ChartTooltip unit="/100" formatter={(v) => `${v}/100`} />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="CorrelaÃ§Ãµes Entre Ãreas" icon={Crosshair}>
            <div className="space-y-3 pt-2">
              {correlacoes.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-condensed text-foreground truncate block">{c.label}</span>
                    <span className="text-[10px] font-condensed text-muted-foreground">{c.a} â†” {c.b}</span>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.abs(c.valor) * 100}%`, backgroundColor: c.valor > 0.7 ? primaryColor : secondaryColor }}
                    />
                  </div>
                  <span className="text-xs font-condensed font-medium text-foreground w-12 text-right shrink-0">{c.valor.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Funil integrado Marketing â†’ Vendas */}
        <ChartCard title="Funil Integrado: Marketing â†’ Vendas" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funilIntegrado} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" stroke={axisColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} />
              <YAxis type="category" dataKey="etapa" stroke={axisColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} width={90} />
              <Tooltip content={<ChartTooltip />} />
              <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
              <Bar dataKey="marketing" fill={secondaryColor} name="Marketing" radius={[0, 4, 4, 0]} animationDuration={ANIM_DUR} onClick={handleFunilClick} className="cursor-pointer" />
              <Bar dataKey="vendas" fill={primaryColor} name="Vendas" radius={[0, 4, 4, 0]} animationDuration={ANIM_DUR} onClick={handleFunilClick} className="cursor-pointer" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Receita vs OS por serviÃ§o */}
        <ChartCard title="Cruzamento: Receita vs Volume de OS por ServiÃ§o" icon={Activity}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={receitaPorServico}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="servico" stroke={axisColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} />
              <YAxis yAxisId="left" stroke={axisColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} tickFormatter={(v) => `R$${v}K`} />
              <YAxis yAxisId="right" orientation="right" stroke="oklch(0.65 0.2 25.4 / 70%)" style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
              <Bar yAxisId="left" dataKey="receita" fill={primaryColor} name="Receita (R$K)" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleReceitaClick} className="cursor-pointer" />
              <Bar yAxisId="right" dataKey="os" fill={secondaryColor} name="Volume OS" radius={[4, 4, 0, 0]} animationDuration={ANIM_DUR} onClick={handleReceitaClick} className="cursor-pointer" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Timeline unificada */}
        <ChartCard title={`Timeline Unificada â€” ${periodOption.label}`} icon={Gauge}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="mes" stroke={axisColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} />
              <YAxis yAxisId="left" stroke={axisColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} />
              <YAxis yAxisId="right" orientation="right" stroke={primaryColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} tickFormatter={(v) => `R$${v}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend formatter={(v) => <span style={{ fontFamily: "Saira Condensed", fontSize: 12, color: axisColor }}>{v}</span>} />
              <Line yAxisId="left" type="monotone" dataKey="vendas" stroke={primaryColor} strokeWidth={2} name="Vendas" dot={{ r: 3 }} animationDuration={ANIM_DUR} onClick={handleTimelineClick} className="cursor-pointer" />
              <Line yAxisId="left" type="monotone" dataKey="clientes" stroke={secondaryColor} strokeWidth={2} name="Clientes" dot={{ r: 3 }} animationDuration={ANIM_DUR} onClick={handleTimelineClick} className="cursor-pointer" />
              <Line yAxisId="left" type="monotone" dataKey="os" stroke={chartNeutralColor} strokeWidth={1.5} name="OS" dot={{ r: 3 }} animationDuration={ANIM_DUR} onClick={handleTimelineClick} className="cursor-pointer" />
              <Line yAxisId="right" type="monotone" dataKey="receita" stroke={primaryColor} strokeWidth={2} strokeDasharray="5 5" name="Receita (R$K)" dot={{ r: 3 }} animationDuration={ANIM_DUR} onClick={handleTimelineClick} className="cursor-pointer" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Resumo por Ã¡rea */}
        <div>
          <h2 className="dap-heading text-xl text-foreground mb-4">
            Resumo <span className="text-primary">RÃ¡pido</span>
          </h2>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            {businessAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Card key={area.key} className="bg-card border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-xs font-condensed font-semibold uppercase tracking-wide text-foreground">{area.label}</span>
                    </div>
                    <div className="space-y-1">
                      {area.kpis.slice(0, 2).map((kpi) => (
                        <div key={kpi.label} className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-condensed text-muted-foreground truncate">{kpi.label}</span>
                          <span className="text-xs font-display text-foreground shrink-0">{kpi.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </DashboardLayout>
  );
}
