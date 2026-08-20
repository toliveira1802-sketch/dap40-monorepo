import { z } from "zod";

export const OrderStatusEnum = z.enum([
  "CHECKIN",
  "TRIAGEM",
  "ORCAMENTO",
  "APROVADO",
  "EXECUCAO",
  "CONTROLE_QUALIDADE",
  "PRONTO",
  "ENTREGUE",
  "CANCELADO",
]);

export type OrderStatus = z.infer<typeof OrderStatusEnum>;

/** Cargos canônicos DAP-REAL (public.user_role). */
export const UserRoleEnum = z.enum([
  "MASTER",
  "ADMINISTRADOR",
  "CONSULTOR",
  "MECANICO",
  "TERCEIROS",
  "CLIENTE",
]);

export type UserRole = z.infer<typeof UserRoleEnum>;

export const AccessSystemEnum = z.enum([
  "ERP",
  "CRM",
  "PORTAL-GESTAO",
  "PORTAL-MECANICO",
  "PORTAL-EMPRESA",
  "PORTAL-CLIENTE",
]);

export type AccessSystem = z.infer<typeof AccessSystemEnum>;

export const AccessLevelEnum = z.enum(["none", "read", "write", "admin"]);

export type AccessLevel = z.infer<typeof AccessLevelEnum>;

export const ACCESS_SYSTEM_LABELS: Record<AccessSystem, string> = {
  ERP: "Operação (ERP)",
  CRM: "Comercial (CRM)",
  "PORTAL-GESTAO": "Gestão & BI",
  "PORTAL-MECANICO": "Mecânico PWA",
  "PORTAL-EMPRESA": "AIOS / Empresa",
  "PORTAL-CLIENTE": "Portal Cliente",
};
