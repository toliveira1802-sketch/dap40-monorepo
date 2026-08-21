import type { ComponentType } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  FileStack,
  LayoutDashboard,
  Users,
  Warehouse,
} from "lucide-react";
import type { PortalRoute } from "../../lib/portalRoutes";
import { RequireErpPage } from "./RequireErpPage";
import DashboardPage from "./Dashboard";
import PatioHubPage from "./PatioHub";
import ServiceOrdersPage from "./ServiceOrders";
import NewServiceOrderWizardPage from "./NewServiceOrderWizard";
import ServiceOrderWorkspacePage from "./ServiceOrderWorkspace";
import AppointmentsPage from "./Appointments";
import OccurrencesPage from "./Occurrences";
import VehiclesPage from "./Vehicles";

const ERP = "ERP" as const;

function withErpPage(Page: ComponentType, pageId: string) {
  return function ErpPageGuarded() {
    return (
      <RequireErpPage pageId={pageId}>
        <Page />
      </RequireErpPage>
    );
  };
}

const Dashboard = withErpPage(DashboardPage, "erp.dashboard");
const Patio = withErpPage(PatioHubPage, "erp.patio");
const Appointments = withErpPage(AppointmentsPage, "erp.agendamentos");
const Occurrences = withErpPage(OccurrencesPage, "erp.ocorrencias");
const ServiceOrders = withErpPage(ServiceOrdersPage, "erp.os.create");
const NewOs = withErpPage(NewServiceOrderWizardPage, "erp.os.create");
const OsWorkspace = withErpPage(ServiceOrderWorkspacePage, "erp.os.create");
const CadastroClientes = withErpPage(VehiclesPage, "erp.cadastro.clientes");
const CadastroOs = withErpPage(ServiceOrdersPage, "erp.cadastro.os");

/**
 * Rotas de Operação (ERP).
 * Cadastro de colaboradores fica no portal AIOS (Dev), não aqui.
 */
export const routes: PortalRoute[] = [
  {
    path: "/dashboard",
    component: Dashboard,
    system: ERP,
    page: "erp.dashboard",
    nav: {
      label: "Dashboard",
      icon: LayoutDashboard,
      order: 10,
      matchPrefix: "/dashboard",
    },
  },
  { path: "/patio/kanban", component: Patio, system: ERP, page: "erp.patio" },
  { path: "/patio/mapa", component: Patio, system: ERP, page: "erp.patio" },
  { path: "/patio/ordens", component: Patio, system: ERP, page: "erp.patio" },
  {
    path: "/patio",
    component: Patio,
    system: ERP,
    page: "erp.patio",
    nav: {
      label: "Pátio",
      icon: Warehouse,
      order: 20,
      matchPrefix: "/patio",
    },
  },
  {
    path: "/ordens-servico/nova",
    component: NewOs,
    system: ERP,
    page: "erp.os.create",
  },
  {
    path: "/ordens-servico/:id",
    component: OsWorkspace,
    system: ERP,
    page: "erp.os.create",
  },
  {
    path: "/ordens-servico",
    component: ServiceOrders,
    system: ERP,
    page: "erp.os.create",
    nav: {
      label: "Criar OS",
      icon: ClipboardList,
      order: 30,
      matchPrefix: "/ordens-servico",
      highlight: true,
    },
  },
  {
    path: "/agendamentos",
    component: Appointments,
    system: ERP,
    page: "erp.agendamentos",
    nav: {
      label: "Agendamentos",
      icon: CalendarDays,
      order: 40,
      matchPrefix: "/agendamentos",
    },
  },
  {
    path: "/ocorrencias",
    component: Occurrences,
    system: ERP,
    page: "erp.ocorrencias",
    nav: {
      label: "Ocorrências",
      icon: AlertTriangle,
      order: 50,
      matchPrefix: "/ocorrencias",
    },
  },
  {
    path: "/cadastro/clientes",
    component: CadastroClientes,
    system: ERP,
    page: "erp.cadastro.clientes",
    nav: {
      label: "Clientes",
      icon: Users,
      order: 60,
      matchPrefix: "/cadastro/clientes",
    },
  },
  {
    path: "/cadastro/ordens-servico",
    component: CadastroOs,
    system: ERP,
    page: "erp.cadastro.os",
    nav: {
      label: "Ordens de serviço",
      icon: FileStack,
      order: 70,
      matchPrefix: "/cadastro/ordens-servico",
    },
  },
];

/** @deprecated Use `routes` */
export const operacaoRoutes = routes;

export default routes;
