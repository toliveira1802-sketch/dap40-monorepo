import type { PortalRoute } from "../../../lib/portalRoutes";
import Login from "./Login";
import TrocarSenha from "./TrocarSenha";
import { CHANGE_PASSWORD_PATH, LOGIN_PATH } from "./paths";

/** Rotas do módulo auth — o casco (prompt 4) agrega este array. */
export const routes: PortalRoute[] = [
  { path: LOGIN_PATH, component: Login, public: true },
  { path: CHANGE_PASSWORD_PATH, component: TrocarSenha, public: true },
];

/** @deprecated Use `routes` */
export const authRoutes = routes;

export type AuthRoute = PortalRoute;

export default routes;
