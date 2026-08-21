import DashboardLayout from "@/features/gestao/components/DashboardLayout";
import { AreaCharts } from "@/features/gestao/components/AreaCharts";
import { KpiCard } from "@/features/gestao/components/KpiCard";
import { ModuleCard } from "@/features/gestao/components/ModuleCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { areas, type BusinessAreaKey } from "@/features/gestao/lib/areas";

interface AreaPageProps {
  areaKey: BusinessAreaKey;
}

export default function AreaPage({ areaKey }: AreaPageProps) {
  const area = areas[areaKey];

  if (!area) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Ãrea nÃ£o encontrada</p>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = area.icon;

  return (
    <DashboardLayout>
      <div className="min-w-0 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="dap-heading text-3xl md:text-4xl text-foreground">
                {area.label.toUpperCase()}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-condensed max-w-2xl">
                {area.description}
              </p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          {area.kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* GrÃ¡ficos especÃ­ficos da Ã¡rea */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="dap-heading text-xl text-foreground">
              AnÃ¡lise <span className="text-primary">Visual</span>
            </h2>
          </div>
          <AreaCharts areaKey={areaKey} />
        </div>

        {/* Modules */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="dap-heading text-xl text-foreground">
              MÃ³dulos da <span className="text-primary">Ãrea</span>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {area.modules.map((mod) => (
              <ModuleCard key={mod.title} {...mod} />
            ))}
          </div>
        </div>

        {/* Placeholder for future content */}
        <Card className="bg-card border-border/50 border-dashed">
          <CardHeader>
            <CardTitle className="font-condensed font-semibold text-sm text-muted-foreground">
              PrÃ³ximas SeÃ§Ãµes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground font-condensed">
              Esta Ã¡rea estÃ¡ estruturada para expansÃ£o modular. Novos componentes, grÃ¡ficos e
              funcionalidades serÃ£o adicionados progressivamente conforme cada mÃ³dulo Ã© desenvolvido.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
