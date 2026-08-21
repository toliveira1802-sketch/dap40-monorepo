import type { PortalRoute } from "../../../lib/portalRoutes";
import { Redirect } from "wouter";
import { UsersRound } from "lucide-react";
import AcessosPage from "./AcessosPage";
import EquipePage from "./EquipePage";
import { PAGE_EMPRESA_ACESSOS, PAGE_EMPRESA_EQUIPE, SYSTEM_EMPRESA } from "./systems";

function RedirectGestaoAcessos() {
  return <Redirect to="/aios/acessos" />;
}

function RedirectLegacyEquipe() {
  return <Redirect to="/aios/equipe" />;
}

/**
 * Rotas admin empresa — portal Dev (AIOS).
 * Cadastro de colaboradores: só float Dev / MASTER.
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
    path: "/aios/equipe",
    component: EquipePage,
    system: SYSTEM_EMPRESA,
    page: PAGE_EMPRESA_EQUIPE,
    nav: { label: "Colaboradores", icon: UsersRound, order: 20, matchPrefix: "/aios/equipe" },
  },
  {
    path: "/gestao/acessos",
    component: RedirectGestaoAcessos,
    system: SYSTEM_EMPRESA,
    page: PAGE_EMPRESA_ACESSOS,
  },
  {
    path: "/equipe",
    component: RedirectLegacyEquipe,
    system: SYSTEM_EMPRESA,
    page: PAGE_EMPRESA_EQUIPE,
  },
];

/** @deprecated Use `routes` */
export const empresaAdminRoutes = routes;

export type EmpresaAdminRoute = PortalRoute;

export default routes;
