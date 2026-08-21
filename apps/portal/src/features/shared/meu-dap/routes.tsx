import type { PortalRoute } from "../../../lib/portalRoutes";
import MeuDapPage from "./MeuDapPage";

/**
 * Home comum (não é portal). Sem system / pageId — só sessão autenticada.
 */
export const routes: PortalRoute[] = [
  {
    path: "/meu-dap",
    component: MeuDapPage,
  },
];

export const meuDapRoutes = routes;

export default routes;
