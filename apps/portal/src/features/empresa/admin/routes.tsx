import type { PortalRoute } from "../../../lib/portalRoutes";
import AcessosPage from "./AcessosPage";
import { PAGE_GESTAO_ACESSOS, SYSTEM_GESTAO } from "./systems";

/**
 * Rotas admin empresa (/gestao/acessos).
 * prompt 4 registra isto no casco (App.tsx).
 */
export const routes: PortalRoute[] = [
  {
    path: "/gestao/acessos",
    component: AcessosPage,
    system: SYSTEM_GESTAO,
    page: PAGE_GESTAO_ACESSOS,
    nav: { label: "Acessos", order: 10 },
  },
];

/** @deprecated Use `routes` */
export const empresaAdminRoutes = routes;

export type EmpresaAdminRoute = PortalRoute;

export default routes;
