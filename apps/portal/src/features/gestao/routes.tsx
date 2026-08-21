import type { ComponentType } from "react";
import {
  Building2,
  Cpu,
  Factory,
  FileText,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Radar,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { PortalRoute } from "../../lib/portalRoutes";
import AreaPage from "./pages/AreaPage";
import CockpitPage from "./pages/Cockpit";
import DashboardPage from "./pages/Dashboard";
import GestaoKpisPage from "./pages/GestaoKpis";
import ResumoExecutivoPage from "./pages/ResumoExecutivo";
import Visao360Page from "./pages/Visao360";
import type { BusinessAreaKey } from "./lib/areas";
import { PeriodProvider } from "./contexts/PeriodContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

const GESTAO = "PORTAL-GESTAO" as const;

/**
 * Providers precisam envolver a página inteira: várias telas chamam
 * usePeriod()/usePeriodData() ANTES de montar o DashboardLayout.
 * Sem isso → throw → tela preta no Vercel.
 */
function withGestaoShell(Page: ComponentType): ComponentType {
  return function GestaoShellPage() {
    return (
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark">
          <PeriodProvider>
            <Page />
          </PeriodProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  };
}

function areaPage(areaKey: BusinessAreaKey): ComponentType {
  return withGestaoShell(function GestaoAreaPage() {
    return <AreaPage areaKey={areaKey} />;
  });
}

function page(Page: ComponentType): ComponentType {
  return withGestaoShell(Page);
}

export const routes: PortalRoute[] = [
  {
    path: "/gestao",
    component: page(DashboardPage),
    system: GESTAO,
    page: "gestao.painel",
    nav: { label: "Painel gerencial", icon: LayoutDashboard, order: 10 },
  },
  { path: "/gestao/painel", component: page(DashboardPage), system: GESTAO, page: "gestao.painel" },
  {
    path: "/gestao/visao-360",
    component: page(Visao360Page),
    system: GESTAO,
    page: "gestao.visao-360",
    nav: { label: "Visão 360", icon: Radar, order: 20 },
  },
  {
    path: "/gestao/resumo",
    component: page(ResumoExecutivoPage),
    system: GESTAO,
    page: "gestao.resumo",
    nav: { label: "Resumo executivo", icon: FileText, order: 30 },
  },
  {
    path: "/gestao/kpis",
    component: page(GestaoKpisPage),
    system: GESTAO,
    page: "gestao.kpis",
    nav: { label: "Gestão de KPIs", icon: Target, order: 40 },
  },
  {
    path: "/gestao/cockpit",
    component: page(CockpitPage),
    system: GESTAO,
    page: "gestao.cockpit",
    nav: { label: "Cockpit", icon: Gauge, order: 50, matchPrefix: "/gestao/cockpit" },
  },
  { path: "/gestao/cockpit/:section", component: page(CockpitPage), system: GESTAO, page: "gestao.cockpit" },
  { path: "/gestao/area/cliente", component: areaPage("cliente"), system: GESTAO, page: "gestao.area.cliente", nav: { label: "Cliente", icon: Users, order: 60 } },
  { path: "/gestao/area/conhecimento", component: areaPage("conhecimento"), system: GESTAO, page: "gestao.area.conhecimento", nav: { label: "Conhecimento", icon: GraduationCap, order: 61 } },
  { path: "/gestao/area/crescimento", component: areaPage("crescimento"), system: GESTAO, page: "gestao.area.crescimento", nav: { label: "Crescimento", icon: TrendingUp, order: 62 } },
  { path: "/gestao/area/financeiro", component: areaPage("financeiro"), system: GESTAO, page: "gestao.area.financeiro", nav: { label: "Financeiro", icon: Wallet, order: 63 } },
  { path: "/gestao/area/marketing", component: areaPage("marketing"), system: GESTAO, page: "gestao.area.marketing", nav: { label: "Marketing", icon: Megaphone, order: 64 } },
  { path: "/gestao/area/operacao", component: areaPage("operacao"), system: GESTAO, page: "gestao.area.operacao", nav: { label: "Operação", icon: Factory, order: 65 } },
  { path: "/gestao/area/pessoas", component: areaPage("pessoas"), system: GESTAO, page: "gestao.area.pessoas", nav: { label: "Pessoas", icon: Users, order: 66 } },
  { path: "/gestao/area/infraestrutura", component: areaPage("infraestrutura"), system: GESTAO, page: "gestao.area.infraestrutura", nav: { label: "Infraestrutura", icon: Building2, order: 67 } },
  { path: "/gestao/area/tecnologia", component: areaPage("tecnologia"), system: GESTAO, page: "gestao.area.tecnologia", nav: { label: "Tecnologia", icon: Cpu, order: 68 } },
  { path: "/gestao/area/vendas", component: areaPage("vendas"), system: GESTAO, page: "gestao.area.vendas", nav: { label: "Vendas", icon: ShoppingCart, order: 69 } },
];
