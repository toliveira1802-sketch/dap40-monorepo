import type { ComponentType } from "react";
import type { AccessSystem } from "@dap40/types";
import type { LucideIcon } from "lucide-react";

/** Contrato de rota exportado por cada feature (`routes.tsx`). */
export type PortalRoute = {
  path: string;
  component: ComponentType;
  /** Fora do Layout / RequireAuth (ex.: /login). */
  public?: boolean;
  /** Sem grant deste portal, a rota não renderiza. */
  system?: AccessSystem;
  /** Grant de página (access_pages); opcional. */
  page?: string;
  /** Entrada no menu do portal ativo. */
  nav?: {
    label: string;
    icon?: LucideIcon;
    order?: number;
    matchPrefix?: string;
    highlight?: boolean;
  };
};
