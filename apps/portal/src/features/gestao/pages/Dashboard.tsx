import { ChartCard } from "@/features/gestao/components/ChartCard";
import { ChartTooltip } from "@/features/gestao/components/ChartTooltip";
import { DrillDownModal } from "@/features/gestao/components/DrillDownModal";
import DashboardLayout from "@/features/gestao/components/DashboardLayout";
import { KpiCard } from "@/features/gestao/components/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePeriodData } from "@/features/gestao/hooks/usePeriodData";
import { usePeriod } from "@/features/gestao/contexts/PeriodContext";
import { useDrillDown, type DrillDownData } from "@/features/gestao/hooks/useDrillDown";
import { areas, businessAreas } from "@/features/gestao/lib/areas";
import {
  chartAxisColor,
  chartGridColor,
  chartNeutralColor,
  chartPrimaryColor,
} from "@/features/gestao/lib/chartTheme";
import { DollarSign, ShoppingCart, TrendingUp, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const serviceDistribution = [
  { name: "STG 1", value: 45, color: "oklch(0.546 0.227 25.4)" },
  { name: "STG 2", value: 22, color: "oklch(0.494 0.227 25.4)" },
  { name: "DiagnÃ³stico", value: 18, color: "oklch(0.35 0.176 25.4)" },
  { name: "Outros", value: 15, color: "oklch(0.65 0.2 25.4)" },
];

const consultantPerformance = [
  { name: "JoÃ£o", vendas: 34, meta: 40 },
  { name: "Pedro", vendas: 28, meta: 35 },
  { name: "Simone", vendas: 15, meta: 20 },
];

export default function Dashboard() {
  const { periodOption } = usePeriod();
  const { monthlyRevenue } = usePeriodData();
  const [consultor, setConsultor] = useState("all");
  const drill = useDrillDown();

  const executiveKpis = useMemo(() => {
    const last = monthlyRevenue[monthlyRevenue.length - 1];
    const prev = monthlyRevenue[monthlyRevenue.length - 2];
    const receita = last?.receita ?? 184;
    const receitaPrev = prev?.receita ?? 172;
    const delta = receita - receitaPrev;
    const pct = receitaPrev > 0 ? ((delta / receitaPrev) * 100).toFixed(0) : "0";

    return [
      { label: "Faturamento do PerÃ­odo", value: `R$ ${receita}K`, trend: `${delta >= 0 ? "â†—" : "â†˜"} ${delta >= 0 ? "+" : ""}${pct}%`, trendUp: delta >= 0, icon: DollarSign },
      { label: "Vendas do PerÃ­odo", value: "67", trend: "+15", trendUp: true, icon: ShoppingCart },
      { label: "Clientes Ativos", value: "342", trend: "+12", trendUp: true, icon: TrendingUp },
      { label: "OS em Andamento", value: "18", trend: "+3", trendUp: true, icon: Wrench },
    ];
  }, [monthlyRevenue]);

  const handleRevenueClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.month) return;
    const drillData: DrillDownData = {
      title: `Faturamento â€” ${d.month}`,
      subtitle: "Detalhamento da receita do mÃªs",
      metrics: [
        { label: "Receita", value: `R$ ${d.receita ?? 0}K`, trend: d.receita && d.meta ? `${d.receita >= d.meta ? "Meta atingida" : "Abaixo da meta"}` : undefined, trendUp: (d.receita ?? 0) >= (d.meta ?? 0) },
        { label: "Meta", value: `R$ ${d.meta ?? 0}K` },
        { label: "Delta", value: `R$ ${(d.receita ?? 0) - (d.meta ?? 0)}K`, trend: `${d.receita && d.meta ? (((d.receita - d.meta) / d.meta) * 100).toFixed(1) : 0}%`, trendUp: (d.receita ?? 0) >= (d.meta ?? 0) },
      ],
      breakdown: [
        { label: "STG 1", value: Math.round((d.receita ?? 0) * 0.45), color: "oklch(0.546 0.227 25.4)" },
        { label: "STG 2", value: Math.round((d.receita ?? 0) * 0.22), color: "oklch(0.494 0.227 25.4)" },
        { label: "DiagnÃ³stico", value: Math.round((d.receita ?? 0) * 0.18), color: "oklch(0.35 0.176 25.4)" },
        { label: "Outros", value: Math.round((d.receita ?? 0) * 0.15), color: "oklch(0.65 0.2 25.4)" },
      ],
      details: [
        { label: "Ticket MÃ©dio", value: `R$ ${((d.receita ?? 0) / 67 * 1000).toFixed(0)}` },
        { label: "ConversÃ£o", value: "31%" },
        { label: "Consultor Top", value: "JoÃ£o (34 vendas)" },
      ],
    };
    drill.open(drillData);
  };

  const handleServiceClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.name) return;
    const drillData: DrillDownData = {
      title: `${d.name} â€” ${d.value} OS`,
      subtitle: "Detalhamento do tipo de serviÃ§o",
      metrics: [
        { label: "Total OS", value: `${d.value}` },
        { label: "Receita", value: `R$ ${Math.round((d.value ?? 0) * 2.5)}K` },
        { label: "Tempo MÃ©dio", value: `${(d.value ?? 0) > 30 ? "4.2h" : "2.5h"}` },
      ],
      breakdown: [
        { label: "Em Andamento", value: Math.round((d.value ?? 0) * 0.4), color: "oklch(0.546 0.227 25.4)" },
        { label: "ConcluÃ­das", value: Math.round((d.value ?? 0) * 0.5), color: "oklch(0.35 0.176 25.4)" },
        { label: "Retorno", value: Math.round((d.value ?? 0) * 0.1), color: "oklch(0.65 0.2 25.4)" },
      ],
      details: [
        { label: "Consultor ResponsÃ¡vel", value: "JoÃ£o" },
        { label: "Margem MÃ©dia", value: "62%" },
      ],
    };
    drill.open(drillData);
  };

  const handleConsultantClick = (data: any) => {
    const d = data?.payload ?? data;
    if (!d?.name) return;
    const conv = d.meta ? ((d.vendas ?? 0) / d.meta * 100).toFixed(0) : "0";
    const drillData: DrillDownData = {
      title: `${d.name} â€” Performance`,
      subtitle: "Detalhamento do consultor",
      metrics: [
        { label: "Vendas", value: `${d.vendas ?? 0}` },
        { label: "Meta", value: `${d.meta ?? 0}` },
        { label: "ConversÃ£o", value: `${conv}%`, trend: `${(d.vendas ?? 0) >= (d.meta ?? 0) ? "Meta atingida" : "Abaixo"}`, trendUp: (d.vendas ?? 0) >= (d.meta ?? 0) },
      ],
      breakdown: [
        { label: "STG 1", value: Math.round((d.vendas ?? 0) * 0.5), color: "oklch(0.546 0.227 25.4)" },
        { label: "STG 2", value: Math.round((d.vendas ?? 0) * 0.3), color: "oklch(0.494 0.227 25.4)" },
        { label: "DiagnÃ³stico", value: Math.round((d.vendas ?? 0) * 0.2), color: "oklch(0.35 0.176 25.4)" },
      ],
      details: [
        { label: "Ticket MÃ©dio", value: `R$ ${((d.vendas ?? 0) * 2.7).toFixed(1)}K` },
        { label: "Clientes Atendidos", value: `${Math.round((d.vendas ?? 0) * 1.5)}` },
        { label: "NPS", value: "87" },
      ],
    };
    drill.open(drillData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="dap-heading text-3xl md:text-4xl text-foreground">
              Dashboard <span className="text-primary">Executivo</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-condensed">
              VisÃ£o consolidada â€” {periodOption.label} â€” Doctor Auto Prime
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={consultor} onValueChange={setConsultor}>
              <SelectTrigger className="w-[130px] h-9 font-condensed">
                <SelectValue placeholder="Consultor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="joao">JoÃ£o</SelectItem>
                <SelectItem value="pedro">Pedro</SelectItem>
                <SelectItem value="simone">Simone</SelectItem>
                <SelectItem value="ai">Ana (IA)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Executive KPIs */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          {executiveKpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCard title="Faturamento Mensal" icon={DollarSign} className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="receitaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.546 0.227 25.4)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.546 0.227 25.4)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="month" stroke={chartAxisColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} />
                <YAxis stroke={chartAxisColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} tickFormatter={(v) => `R$${v}K`} />
                <Tooltip content={<ChartTooltip unit="K" formatter={(v) => `R$ ${v}K`} />} />
                <Area type="monotone" dataKey="receita" stroke={chartPrimaryColor} strokeWidth={2} fill="url(#receitaGradient)" name="Receita" animationDuration={600} onClick={handleRevenueClick} className="cursor-pointer" />
                <Area type="monotone" dataKey="meta" stroke={chartNeutralColor} strokeWidth={1.5} strokeDasharray="5 5" fill="none" name="Meta" animationDuration={600} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="DistribuiÃ§Ã£o de ServiÃ§os" icon={Wrench}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={serviceDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} animationDuration={600} onClick={handleServiceClick} className="cursor-pointer">
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip unit=" OS" formatter={(v) => `${v} OS`} />} />
                <Legend formatter={(value) => (<span style={{ fontFamily: "Saira Condensed", fontSize: "12px", color: chartAxisColor }}>{value}</span>)} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Consultant performance */}
        <ChartCard title="Performance por Consultor" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={consultantPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="name" stroke={chartAxisColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} />
              <YAxis stroke={chartAxisColor} style={{ fontFamily: "Saira Condensed", fontSize: "12px" }} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v} vendas`} />} />
              <Legend formatter={(value) => (<span style={{ fontFamily: "Saira Condensed", fontSize: "12px", color: chartAxisColor }}>{value}</span>)} />
              <Bar dataKey="vendas" fill={chartPrimaryColor} name="Vendas" radius={[4, 4, 0, 0]} animationDuration={600} onClick={handleConsultantClick} className="cursor-pointer" />
              <Bar dataKey="meta" fill={chartNeutralColor} name="Meta" radius={[4, 4, 0, 0]} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* KPIs by area */}
        <div>
          <h2 className="dap-heading text-xl text-foreground mb-4">
            Indicadores por <span className="text-primary">Ãrea</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businessAreas.map((area) => (
                <Card key={area.key} className="bg-card border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <area.icon className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="font-condensed font-semibold text-sm">{area.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      {area.kpis.map((kpi) => (
                        <div key={kpi.label} className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-condensed uppercase tracking-wide text-muted-foreground truncate">{kpi.label}</span>
                          <span className="font-display text-lg text-foreground leading-none">{kpi.value}</span>
                          {kpi.trend && (
                            <span className={`text-[10px] font-condensed ${kpi.trendUp ? "text-primary" : "text-muted-foreground"}`}>{kpi.trend}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>

      <DrillDownModal data={drill.active} open={!!drill.active} onClose={drill.close} />
    </DashboardLayout>
  );
}
