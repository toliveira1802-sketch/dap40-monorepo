export { canAccessPortal, canAccessPage, type SessionSystems } from "./canAccess";
export {
  MANAGED_SYSTEMS,
  ACCESS_LEVEL_LABELS,
  PAGE_GESTAO_ACESSOS,
  SYSTEM_GESTAO,
  systemLabel,
} from "./systems";
export {
  routes,
  empresaAdminRoutes,
  type EmpresaAdminRoute,
} from "./routes";
export { default as AcessosPage } from "./AcessosPage";
export {
  fetchAccessPages,
  fetchAccessUsers,
  setPortalGrant,
  setUserPageGrants,
  hasPageGrant,
} from "./api";
