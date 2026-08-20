import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "../../../lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  Wrench,
  Circle,
} from "lucide-react";
import { Button } from "@dap40/ui";
import { BrandLogo } from "./BrandLogo";
import { useSession, isMasterRole } from "../auth";
import { listUnlockedPortals } from "../../../lib/portals";
import {
  listPortalNavItems,
  resolveActivePortal,
  routeMatchesPath,
} from "../../../lib/routeRegistry";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { session } = useSession();

  const unlockedPortals = listUnlockedPortals(session?.systems, session?.role);
  const activePortal = resolveActivePortal(location, session?.systems, session?.role);
  const portalScreens = activePortal
    ? listPortalNavItems(activePortal.id, session?.systems, session?.role)
    : [];

  return (
    <aside
      className={cn(
        "relative flex h-screen shrink-0 flex-col border-r border-dap-red-deep/50 bg-dap-graphite transition-[width] duration-150 select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-32deg, transparent, transparent 14px, rgba(209,10,17,0.08) 14px, rgba(209,10,17,0.08) 15px)",
        }}
      />

      <div className="relative flex items-center justify-between border-b border-dap-red-deep/50 px-3 py-4">
        <BrandLogo collapsed={collapsed} />
        <Button
          variant="ghost"
          size="sm"
          className="relative px-2"
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="relative flex flex-1 flex-col gap-6 overflow-y-auto px-2 py-3">
        <div>
          {!collapsed ? <p className="dap-kicker mb-2 px-2">Portais</p> : null}
          <nav className="space-y-1">
            <button
              type="button"
              title={collapsed ? "Hub" : undefined}
              onClick={() => setLocation("/hub")}
              className={cn(
                "group flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors duration-150",
                location === "/hub" ? "dap-nav-active" : "dap-nav-idle"
              )}
            >
              <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {!collapsed ? <span className="truncate font-medium">Hub</span> : null}
            </button>

            {unlockedPortals.map(portal => {
              const isMatch =
                activePortal?.id === portal.id ||
                location === portal.path ||
                location.startsWith(`${portal.path}/`);
              return (
                <button
                  key={portal.id}
                  type="button"
                  title={collapsed ? portal.label : undefined}
                  onClick={() => setLocation(portal.path)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors duration-150",
                    isMatch ? "dap-nav-active" : "dap-nav-idle"
                  )}
                >
                  <Wrench className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {!collapsed ? (
                    <span className="min-w-0 flex-1 truncate text-left font-medium">
                      {portal.label}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {activePortal && portalScreens.length > 0 ? (
          <div>
            {!collapsed ? (
              <p className="dap-kicker mb-2 px-2">{activePortal.label}</p>
            ) : null}
            <nav className="space-y-1">
              {portalScreens.map(route => {
                const nav = route.nav!;
                const isMatch = routeMatchesPath(route, location);
                const Icon = nav.icon ?? Circle;

                return (
                  <button
                    key={route.path}
                    type="button"
                    title={collapsed ? nav.label : undefined}
                    onClick={() => setLocation(route.path)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors duration-150",
                      isMatch ? "dap-nav-active" : "dap-nav-idle",
                      nav.highlight && !isMatch && "text-dap-red hover:text-dap-red"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {!collapsed ? (
                      <span className="min-w-0 flex-1 truncate text-left font-medium">
                        {nav.label}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        ) : null}
      </div>

      <div className="relative border-t border-dap-red-deep/50 bg-dap-black/40 p-3">
        <div className="flex items-center gap-3 rounded-sm p-2">
          <div className="flex size-8 items-center justify-center rounded-sm border border-dap-red-deep/40 bg-dap-carbon text-xs font-bold text-dap-red">
            {(session?.fullName || session?.email || "U").slice(0, 2).toUpperCase()}
          </div>
          {!collapsed ? (
            <>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs font-semibold text-dap-white">
                  {session?.fullName || "Usuário"}
                </span>
                <span className="truncate text-[0.65rem] text-dap-gray">
                  {session?.role ?? "—"}
                  {isMasterRole(session?.role) ? " · Admin" : ""}
                </span>
              </div>
              <ShieldCheck className="size-4 shrink-0 text-dap-whatsapp" />
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
