import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { cn } from "../../../lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  Wrench,
  Circle,
} from "lucide-react";
import { Button } from "@dap40/ui";
import { BrandLogo } from "./BrandLogo";
import { useSession } from "../auth";
import { listUnlockedPortals, type SessionSystems } from "../../../lib/portals";
import {
  listPortalNavItems,
  resolveActivePortal,
  routeMatchesPath,
} from "../../../lib/routeRegistry";
import type { AccessSystem, UserRole } from "@dap40/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";

function portalOpenKey(portalId: AccessSystem) {
  return `dap-sidebar-portal:${portalId}`;
}

function readOpen(portalId: AccessSystem, fallback: boolean) {
  try {
    const raw = localStorage.getItem(portalOpenKey(portalId));
    if (raw === null) return fallback;
    return raw === "1";
  } catch {
    return fallback;
  }
}

function writeOpen(portalId: AccessSystem, open: boolean) {
  try {
    localStorage.setItem(portalOpenKey(portalId), open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openPortals, setOpenPortals] = useState<Partial<Record<AccessSystem, boolean>>>({});
  const { session } = useSession();

  const unlockedPortals = listUnlockedPortals(session?.systems, session?.role);
  const activePortal = resolveActivePortal(location, session?.systems, session?.role);

  const unlockedIds = unlockedPortals.map(p => p.id).join("|");

  useEffect(() => {
    const ids = unlockedIds ? (unlockedIds.split("|") as AccessSystem[]) : [];
    setOpenPortals(prev => {
      const next = { ...prev };
      for (const id of ids) {
        if (next[id] === undefined) {
          next[id] = readOpen(id, activePortal?.id === id);
        }
      }
      if (activePortal?.id) {
        next[activePortal.id] = true;
        writeOpen(activePortal.id, true);
      }
      return next;
    });
  }, [unlockedIds, activePortal?.id]);

  const togglePortal = (portalId: AccessSystem, open: boolean) => {
    setOpenPortals(prev => ({ ...prev, [portalId]: open }));
    writeOpen(portalId, open);
  };

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

      <div className="relative flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3">
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

            {unlockedPortals.map(portal => (
              <PortalMenu
                key={portal.id}
                portalId={portal.id}
                label={portal.label}
                path={portal.path}
                collapsed={collapsed}
                open={Boolean(openPortals[portal.id])}
                onOpenChange={open => togglePortal(portal.id, open)}
                location={location}
                systems={session?.systems}
                role={session?.role}
                onNavigate={setLocation}
              />
            ))}
          </nav>
        </div>
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
                  {session?.email || "—"}
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

function PortalMenu({
  portalId,
  label,
  path,
  collapsed,
  open,
  onOpenChange,
  location,
  systems,
  role,
  onNavigate,
}: {
  portalId: AccessSystem;
  label: string;
  path: string;
  collapsed: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  systems: SessionSystems | null | undefined;
  role: UserRole | null | undefined;
  onNavigate: (path: string) => void;
}) {
  const screens = listPortalNavItems(portalId, systems, role);
  const isActive =
    location === path ||
    location.startsWith(`${path}/`) ||
    screens.some(r => routeMatchesPath(r, location));

  if (collapsed) {
    return (
      <button
        type="button"
        title={label}
        onClick={() => onNavigate(path)}
        className={cn(
          "group flex w-full items-center justify-center rounded-sm px-2 py-2 text-sm transition-colors duration-150",
          isActive ? "dap-nav-active" : "dap-nav-idle"
        )}
      >
        <Wrench className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      </button>
    );
  }

  if (screens.length === 0) {
    return (
      <button
        type="button"
        onClick={() => onNavigate(path)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors duration-150",
          isActive ? "dap-nav-active" : "dap-nav-idle"
        )}
      >
        <Wrench className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate text-left font-medium">{label}</span>
      </button>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div
        className={cn(
          "rounded-sm",
          isActive && !open ? "dap-nav-active" : undefined
        )}
      >
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onNavigate(path)}
            className={cn(
              "group flex min-w-0 flex-1 items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors duration-150",
              isActive ? "dap-nav-active" : "dap-nav-idle"
            )}
          >
            <Wrench className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="min-w-0 flex-1 truncate text-left font-medium">{label}</span>
          </button>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="rounded-sm p-2 text-dap-gray transition-colors hover:text-dap-white"
              aria-label={open ? `Recolher ${label}` : `Expandir ${label}`}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-150",
                  open && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-none">
          <div className="mb-1 ml-3 space-y-0.5 border-l border-dap-red-deep/40 pl-2">
            {screens.map(route => {
              const nav = route.nav!;
              const isMatch = routeMatchesPath(route, location);
              const Icon = nav.icon ?? Circle;
              return (
                <button
                  key={route.path}
                  type="button"
                  onClick={() => onNavigate(route.path)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm transition-colors duration-150",
                    isMatch ? "dap-nav-active" : "dap-nav-idle",
                    nav.highlight && !isMatch && "text-dap-red hover:text-dap-red"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1 truncate text-left text-[0.8125rem] font-medium">
                    {nav.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
