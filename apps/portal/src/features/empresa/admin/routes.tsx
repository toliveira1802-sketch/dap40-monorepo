import type { PortalRoute } from "../../../lib/portalRoutes";
import { Redirect } from "wouter";
import AcessosPage from "./AcessosPage";
import { PAGE_EMPRESA_ACESSOS, SYSTEM_EMPRESA } from "./systems";

function RedirectGestaoAcessos() {
  return <Redirect to="/aios/acessos" />;
}

/**
 * Rotas admin empresa — criador de acessos no portal Dev (AIOS).
 */
export const routes: PortalRoute[] = [
  {
    path: "/aios/acessos",
    component: AcessosPage,
    system: SYSTEM_EMPRESA,
    page: PAGE_EMPRESA_ACESSOS,
    nav: { label: "Acessos", order: 10 },
  },
  {
    path: "/gestao/acessos",
    component: RedirectGestaoAcessos,
    system: SYSTEM_EMPRESA,
    page: PAGE_EMPRESA_ACESSOS,
  },
];

/** @deprecated Use `routes` */
export const empresaAdminRoutes = routes;

export type EmpresaAdminRoute = PortalRoute;

export default routes;
