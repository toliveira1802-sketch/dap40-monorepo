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
  "CANCELADO"
]);

export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const UserRoleEnum = z.enum([
  "ADMIN",
  "CONSULTOR",
  "TECNICO",
  "CLIENTE"
]);

export type UserRole = z.infer<typeof UserRoleEnum>;
