import {
  Inbox,
  LayoutDashboard,
  Kanban,
  UserPlus,
} from "lucide-react";
import type { PortalRoute } from "../../lib/portalRoutes";
import InboxPage from "./Inbox";
import DashboardPage from "./Dashboard";
import PipelinePage from "./Pipeline";
import LeadsPage from "./Leads";

const CRM = "CRM" as const;

/**
 * Rotas Comercial (CRM) — inbox unificado Meta (WA / Messenger / IG).
 */
export const routes: PortalRoute[] = [
  {
    path: "/comercial",
    component: InboxPage,
    system: CRM,
    page: "crm.inbox",
    nav: {
      label: "Inbox",
      icon: Inbox,
      order: 10,
      matchPrefix: "/comercial/inbox",
      highlight: true,
    },
  },
  {
    path: "/comercial/inbox",
    component: InboxPage,
    system: CRM,
    page: "crm.inbox",
  },
  {
    path: "/comercial/dashboard",
    component: DashboardPage,
    system: CRM,
    page: "crm.dashboard",
    nav: {
      label: "Dashboard",
      icon: LayoutDashboard,
      order: 20,
      matchPrefix: "/comercial/dashboard",
    },
  },
  {
    path: "/comercial/pipeline",
    component: PipelinePage,
    system: CRM,
    page: "crm.pipeline",
    nav: {
      label: "Pipeline",
      icon: Kanban,
      order: 30,
      matchPrefix: "/comercial/pipeline",
    },
  },
  {
    path: "/comercial/leads",
    component: LeadsPage,
    system: CRM,
    page: "crm.leads",
    nav: {
      label: "Leads",
      icon: UserPlus,
      order: 40,
      matchPrefix: "/comercial/leads",
    },
  },
];

/** @deprecated Use `routes` */
export const comercialRoutes = routes;

export default routes;
