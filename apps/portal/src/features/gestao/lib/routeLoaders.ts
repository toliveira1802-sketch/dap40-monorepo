import { lazyPage } from "@/features/gestao/lib/lazyPage";
import { MANAGEMENT_BASE_PATH, managementPath, managementSubpath } from "@/features/gestao/paths";

export const DashboardPage = lazyPage(() => import("@/features/gestao/pages/Dashboard"));
export const Visao360Page = lazyPage(() => import("@/features/gestao/pages/Visao360"));
export const ResumoExecutivoPage = lazyPage(() => import("@/features/gestao/pages/ResumoExecutivo"));
export const GestaoKpisPage = lazyPage(() => import("@/features/gestao/pages/GestaoKpis"));
export const CockpitPage = lazyPage(() => import("@/features/gestao/pages/Cockpit"));
export const AreaPageLazy = lazyPage(() => import("@/features/gestao/pages/AreaPage"));

export function prefetchRoute(pathname: string) {
  const sub = managementSubpath(pathname);
  if (sub === "/" || pathname === MANAGEMENT_BASE_PATH) return DashboardPage.preload();
  if (sub === "/visao-360") return Visao360Page.preload();
  if (sub === "/resumo") return ResumoExecutivoPage.preload();
  if (sub === "/kpis") return GestaoKpisPage.preload();
  if (sub.startsWith("/cockpit")) return CockpitPage.preload();
  if (sub.startsWith("/area/")) return AreaPageLazy.preload();
  return Promise.resolve(undefined);
}

export { managementPath };
