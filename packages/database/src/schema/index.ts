import { pgTable, text, timestamp, uuid, integer, numeric, pgEnum } from "drizzle-orm/pg-core";

export { profiles, userRoles, userRoleEnum } from "./auth";
export {
  accessSystemEnum,
  accessLevelEnum,
  accessPages,
  accessGrants,
  accessPageGrants,
} from "./access";

/** @deprecated Prefer userRoleEnum / public.user_role canônico (MASTER…). */
export const roleEnum = pgEnum("legacy_app_role", ["ADMIN", "CONSULTOR", "TECNICO", "CLIENTE"]);
export const orderStatusEnum = pgEnum("order_status", [
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

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").default("CONSULTOR").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  document: text("document"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  plate: text("plate").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  chassis: text("chassis"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const serviceOrders = pgTable("service_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  status: orderStatusEnum("status").default("CHECKIN").notNull(),
  mileage: integer("mileage"),
  fuelLevel: text("fuel_level"),
  observations: text("observations"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
