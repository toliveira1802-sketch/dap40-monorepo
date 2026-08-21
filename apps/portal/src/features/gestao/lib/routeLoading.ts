import { managementSubpath } from "@/features/gestao/paths";

export type RouteSkeletonKind =
  | "dashboard"
  | "area"
  | "executive-summary"
  | "vision-360"
  | "dense"
  | "cockpit"
  | "generic";

export function getRouteSkeletonKind(pathname: string): RouteSkeletonKind {
  const sub = managementSubpath(pathname);
  if (sub === "/") return "dashboard";
  if (sub.startsWith("/area/")) return "area";
  if (sub === "/resumo") return "executive-summary";
  if (sub === "/visao-360") return "vision-360";
  if (sub === "/kpis") return "dense";
  if (sub.startsWith("/cockpit")) return "cockpit";
  return "generic";
}
