import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Espelha public.access_system no DAP-REAL. Sem AIOS (não existe no enum). */
export const accessSystemEnum = pgEnum("access_system", [
  "ERP",
  "CRM",
  "PORTAL-GESTAO",
  "PORTAL-MECANICO",
  "PORTAL-EMPRESA",
  "PORTAL-CLIENTE",
]);

export const accessLevelEnum = pgEnum("access_level", [
  "none",
  "read",
  "write",
  "admin",
]);

export const accessPages = pgTable("access_pages", {
  pageId: text("page_id").primaryKey(),
  system: accessSystemEnum("system").notNull(),
  path: text("path").notNull(),
  label: text("label").notNull(),
});

export const accessGrants = pgTable(
  "access_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    system: accessSystemEnum("system").notNull(),
    level: accessLevelEnum("level").notNull(),
    grantedBy: uuid("granted_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    userSystem: uniqueIndex("access_grants_user_system_key").on(table.userId, table.system),
  })
);

export const accessPageGrants = pgTable(
  "access_page_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    pageId: text("page_id")
      .notNull()
      .references(() => accessPages.pageId, { onDelete: "cascade" }),
    grantedBy: uuid("granted_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    userPage: uniqueIndex("access_page_grants_user_page_key").on(table.userId, table.pageId),
  })
);
