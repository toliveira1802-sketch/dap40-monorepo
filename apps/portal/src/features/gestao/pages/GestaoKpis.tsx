import DashboardLayout from "@/features/gestao/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  kpiDefinitions,
  getKpiStats,
  priorityLabels,
  categoryLabels,
  statusLabels,
  frequencyLabels,
  priorityColors,
  statusColors,
  type KpiDefinition,
  type KpiPriority,
  type KpiStatus,
  type KpiCategory,
} from "@/features/gestao/lib/kpiConfig";
import { businessAreas, sidebarAreas, type BusinessAreaKey } from "@/features/gestao/lib/areas";
import { useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Gauge,
  LayoutGrid,
  List,
  Minus,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";

type AreaFilter = "all" | BusinessAreaKey;
type PriorityFilter = "all" | KpiPriority;
type StatusFilter = "all" | KpiStatus;
type ViewMode = "grid" | "table";

export default function GestaoKpis() {
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const stats = getKpiStats();

  const filteredKpis = useMemo(() => {
    return kpiDefinitions.filter((kpi) => {
      if (areaFilter !== "all" && kpi.area !== areaFilter) return false;
      if (priorityFilter !== "all" && kpi.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && kpi.status !== statusFilter) return false;
      if (search && !kpi.label.toLowerCase().includes(search.toLowerCase()) && !kpi.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [areaFilter, priorityFilter, statusFilter, search]);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="dap-heading text-3xl md:text-4xl text-foreground">
              GestÃ£o de <span className="text-primary">KPIs</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-condensed">
              {stats.total} indicadores mapeados em {businessAreas.length} Ã¡reas â€” Doctor Auto Prime
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-condensed text-muted-foreground">
            <Gauge className="h-4 w-4 text-primary" />
            <span>Matriz de Indicadores</span>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-condensed uppercase tracking-wide text-muted-foreground block">Total de KPIs</span>
                <span className="font-display text-xl text-foreground">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "oklch(0.65 0.18 145 / 15%)", border: "1px solid oklch(0.65 0.18 145 / 30%)" }}>
                <CheckCircle2 className="h-5 w-5" style={{ color: "oklch(0.65 0.18 145)" }} />
              </div>
              <div>
                <span className="text-[10px] font-condensed uppercase tracking-wide text-muted-foreground block">Acima da Meta</span>
                <span className="font-display text-xl text-foreground">{stats.acima}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "oklch(0.7 0.15 250 / 15%)", border: "1px solid oklch(0.7 0.15 250 / 30%)" }}>
                <Minus className="h-5 w-5" style={{ color: "oklch(0.7 0.15 250)" }} />
              </div>
              <div>
                <span className="text-[10px] font-condensed uppercase tracking-wide text-muted-foreground block">Dentro da Meta</span>
                <span className="font-display text-xl text-foreground">{stats.dentro}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-primary/20">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-condensed uppercase tracking-wide text-muted-foreground block">Abaixo da Meta</span>
                <span className="font-display text-xl text-primary">{stats.abaixo}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-card border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-condensed text-muted-foreground">
              <Filter className="h-3.5 w-3.5 text-primary" />
              <span className="uppercase tracking-wide">Filtros</span>
            </div>

            {/* Linha 1: Ãrea + Busca */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAreaFilter("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-condensed transition-colors ${
                  areaFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Todas as Ãreas
              </button>
              {businessAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <button
                    key={area.key}
                    onClick={() => setAreaFilter(area.key as AreaFilter)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-condensed transition-colors ${
                      areaFilter === area.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {area.label}
                  </button>
                );
              })}
            </div>

            {/* Linha 2: Prioridade + Status + View toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Prioridade */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-condensed uppercase tracking-wide text-muted-foreground">Prioridade:</span>
                <button
                  onClick={() => setPriorityFilter("all")}
                  className={`px-2.5 py-1 rounded text-[11px] font-condensed transition-colors ${
                    priorityFilter === "all" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Todas
                </button>
                {(["critica", "alta", "media", "baixa"] as KpiPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`px-2.5 py-1 rounded text-[11px] font-condensed transition-colors ${
                      priorityFilter === p ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {priorityLabels[p]}
                  </button>
                ))}
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-condensed uppercase tracking-wide text-muted-foreground">Status:</span>
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded text-[11px] font-condensed transition-colors ${
                    statusFilter === "all" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Todos
                </button>
                {(["acima", "dentro", "abaixo", "sem_meta"] as KpiStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded text-[11px] font-condensed transition-colors ${
                      statusFilter === s ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded transition-colors ${viewMode === "table" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar KPI por nome ou descriÃ§Ã£o..."
                className="w-full pl-10 pr-4 py-2 rounded-md bg-muted/50 border border-border/30 text-sm font-condensed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resultado: Grid ou Tabela */}
        {filteredKpis.length === 0 ? (
          <Card className="bg-card border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-sm font-condensed text-muted-foreground">Nenhum KPI encontrado com os filtros selecionados.</p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredKpis.map((kpi) => (
              <KpiGridCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        ) : (
          <KpiTable kpis={filteredKpis} />
        )}

        {/* Resumo por Ã¡rea (quando filtro = all) */}
        {areaFilter === "all" && (
          <div>
            <h2 className="dap-heading text-xl text-foreground mb-4">
              DistribuiÃ§Ã£o <span className="text-primary">por Ãrea</span>
            </h2>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
              {businessAreas.map((area) => {
                const areaKpis = kpiDefinitions.filter((k) => k.area === area.key);
                const areaAbaixo = areaKpis.filter((k) => k.status === "abaixo").length;
                const Icon = area.icon;
                return (
                  <Card key={area.key} className="bg-card border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-xs font-condensed font-semibold uppercase tracking-wide text-foreground">{area.label}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-2xl text-foreground">{areaKpis.length}</span>
                        <span className="text-[10px] font-condensed text-muted-foreground">KPIs</span>
                      </div>
                      {areaAbaixo > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] font-condensed text-primary">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {areaAbaixo} {areaAbaixo === 1 ? "abaixo da meta" : "abaixo da meta"}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// === CARD DE KPI (modo grid) ===

function KpiGridCard({ kpi }: { kpi: KpiDefinition }) {
  const areaConfig = sidebarAreas.find((a) => a.key === kpi.area);
  const AreaIcon = areaConfig?.icon;
  const isAlert = kpi.status === "abaixo";

  return (
    <Card className={`bg-card overflow-hidden transition-colors ${isAlert ? "border-primary/30" : "border-border/50 hover:border-primary/20"}`}>
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          {AreaIcon && (
            <div className="h-7 w-7 rounded-md bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <AreaIcon className="h-3.5 w-3.5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <span className="text-xs font-condensed font-semibold text-foreground block truncate">{kpi.label}</span>
            <span className="text-[10px] font-condensed text-muted-foreground">{areaConfig?.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className="text-[9px] font-condensed px-1.5 py-0.5 rounded uppercase tracking-wide"
            style={{
              backgroundColor: `${priorityColors[kpi.priority]}20`,
              color: priorityColors[kpi.priority],
            }}
          >
            {priorityLabels[kpi.priority]}
          </span>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Valores */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[9px] font-condensed uppercase tracking-wide text-muted-foreground block">Atual</span>
            <span className={`font-display text-lg ${isAlert ? "text-primary" : "text-foreground"}`}>{kpi.currentValue}</span>
          </div>
          <div>
            <span className="text-[9px] font-condensed uppercase tracking-wide text-muted-foreground block">Meta</span>
            <span className="font-display text-lg text-foreground/70">{kpi.targetValue}</span>
          </div>
          <div>
            <span className="text-[9px] font-condensed uppercase tracking-wide text-muted-foreground block">Anterior</span>
            <span className="font-display text-lg text-foreground/50">{kpi.previousValue}</span>
          </div>
        </div>

        {/* Status + TendÃªncia */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: statusColors[kpi.status] }}
            />
            <span className="text-[10px] font-condensed text-muted-foreground">{statusLabels[kpi.status]}</span>
          </div>
          <span className={`text-[10px] font-condensed flex items-center gap-0.5 ${kpi.trendUp ? "text-primary" : "text-muted-foreground"}`}>
            {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {kpi.trend}
          </span>
        </div>

        {/* DescriÃ§Ã£o */}
        <p className="text-[11px] font-condensed text-muted-foreground/70 leading-relaxed">{kpi.description}</p>

        {/* Footer: categoria + frequÃªncia + owner */}
        <div className="flex items-center justify-between pt-2 border-t border-border/20 text-[10px] font-condensed text-muted-foreground">
          <span>{categoryLabels[kpi.category]}</span>
          <span>{frequencyLabels[kpi.frequency]}</span>
          <span>Resp: {kpi.owner}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// === TABELA DE KPIs (modo table) ===

function KpiTable({ kpis }: { kpis: KpiDefinition[] }) {
  return (
    <Card className="bg-card border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-condensed">
          <thead>
            <tr className="border-b border-border/30 bg-muted/30">
              <th className="text-left px-4 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">KPI</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Ãrea</th>
              <th className="text-right px-3 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Atual</th>
              <th className="text-right px-3 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Meta</th>
              <th className="text-center px-3 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Status</th>
              <th className="text-center px-3 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Prioridade</th>
              <th className="text-center px-3 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Categoria</th>
              <th className="text-center px-3 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">FrequÃªncia</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Resp.</th>
              <th className="text-right px-3 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Tend.</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi, i) => {
              const areaConfig = sidebarAreas.find((a) => a.key === kpi.area);
              const isAlert = kpi.status === "abaixo";
              return (
                <tr
                  key={kpi.id}
                  className={`border-b border-border/10 hover:bg-muted/20 transition-colors ${isAlert ? "bg-primary/5" : ""} ${i % 2 === 1 ? "bg-muted/5" : ""}`}
                >
                  <td className="px-4 py-2.5">
                    <span className="text-foreground font-medium">{kpi.label}</span>
                    <span className="text-muted-foreground/60 block text-[10px]">{kpi.description}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-muted-foreground">{areaConfig?.label}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={isAlert ? "text-primary font-medium" : "text-foreground"}>{kpi.currentValue}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-foreground/70">{kpi.targetValue}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[kpi.status] }} />
                      <span className="text-[10px] text-muted-foreground">{statusLabels[kpi.status]}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide"
                      style={{ backgroundColor: `${priorityColors[kpi.priority]}20`, color: priorityColors[kpi.priority] }}
                    >
                      {priorityLabels[kpi.priority]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-muted-foreground">{categoryLabels[kpi.category]}</td>
                  <td className="px-3 py-2.5 text-center text-muted-foreground">{frequencyLabels[kpi.frequency]}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{kpi.owner}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`flex items-center justify-end gap-0.5 ${kpi.trendUp ? "text-primary" : "text-muted-foreground"}`}>
                      {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {kpi.trend}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
