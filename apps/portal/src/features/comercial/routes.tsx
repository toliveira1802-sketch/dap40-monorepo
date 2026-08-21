import type { ComponentType } from "react";
import {
  Contact,
  Inbox as InboxIcon,
  LayoutDashboard,
  Target,
  Waves,
} from "lucide-react";
import type { PortalRoute } from "../../lib/portalRoutes";
import { RequireCrmPage } from "./RequireCrmPage";
import ComercialDashboardPage from "./ComercialDashboard";
import InboxPage from "./Inbox";
import LeadsPage from "./Leads";
import LeadDetailPage from "./LeadDetail";
import PipelinePage from "./Pipeline";
import ContactsPage from "./Contacts";

const CRM = "CRM" as const;

function withCrmPage(Page: ComponentType, pageId: string) {
  return function CrmPageGuarded() {
    return (
      <RequireCrmPage pageId={pageId}>
        <Page />
      </RequireCrmPage>
    );
  };
}

const Dashboard = withCrmPage(ComercialDashboardPage, "crm.dashboard");
const InboxGuarded = withCrmPage(InboxPage, "crm.inbox");
const Leads = withCrmPage(LeadsPage, "crm.leads");
const LeadDetail = withCrmPage(LeadDetailPage, "crm.leads");
const Pipeline = withCrmPage(PipelinePage, "crm.pipeline");
const Contatos = withCrmPage(ContactsPage, "crm.leads");

/**
 * Metadados de nav que o casco/sidebar ainda não consome.
 * Contatos: desabilitar no shell com hint "Ficha no ERP" (PortalRoute sem `disabled`).
 */
export const comercialNav = {
  contatos: {
    label: "Contatos",
    disabled: true,
    disabledHint: "Ficha no ERP",
    matchPrefix: "/comercial/contatos",
  },
} as const;

/**
 * Rotas de Comercial (CRM).
 * TODO(prompt 4 / casco): registrar em routeRegistry / App.tsx — não fazer aqui.
 */
export const routes: PortalRoute[] = [
  {
    path: "/comercial/dashboard",
    component: Dashboard,
    system: CRM,
    page: "crm.dashboard",
    nav: {
      label: "Dashboard",
      icon: LayoutDashboard,
      order: 10,
      matchPrefix: "/comercial/dashboard",
    },
  },
  {
    path: "/comercial/inbox",
    component: InboxGuarded,
    system: CRM,
    page: "crm.inbox",
    nav: {
      label: "Inbox",
      icon: InboxIcon,
      order: 20,
      matchPrefix: "/comercial/inbox",
    },
  },
  {
    path: "/comercial/leads/:id",
    component: LeadDetail,
    system: CRM,
    page: "crm.leads",
  },
  {
    path: "/comercial/leads",
    component: Leads,
    system: CRM,
    page: "crm.leads",
    nav: {
      label: "Leads",
      icon: Waves,
      order: 30,
      matchPrefix: "/comercial/leads",
    },
  },
  {
    path: "/comercial/pipeline",
    component: Pipeline,
    system: CRM,
    page: "crm.pipeline",
    nav: {
      label: "Pipeline",
      icon: Target,
      order: 40,
      matchPrefix: "/comercial/pipeline",
    },
  },
  {
    // TODO(casco/sidebar): desabilitar com hint "Ficha no ERP" — ver comercialNav.contatos
    path: "/comercial/contatos",
    component: Contatos,
    system: CRM,
    page: "crm.leads",
    nav: {
      label: "Contatos",
      icon: Contact,
      order: 50,
      matchPrefix: "/comercial/contatos",
    },
  },
];

/** @deprecated Use `routes` */
export const comercialRoutes = routes;

export default routes;
