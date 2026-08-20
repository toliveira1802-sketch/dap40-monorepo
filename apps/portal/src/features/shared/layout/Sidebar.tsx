import React, { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "../../../lib/utils";
import {
  LayoutDashboard,
  CarFront,
  MapPinned,
  ClipboardList,
  PlusCircle,
  CalendarDays,
  AlertTriangle,
  Users,
  Wrench,
  Gauge,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@dap40/ui";
import { store } from "../../../lib/trpc";
import { BrandLogo } from "./BrandLogo";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const activeVehiclesCount = store.vehicles.filter(v => v.status === "active").length;
  const activeOccurrencesCount = store.occurrences.filter(
    o => o.status === "open" || o.status === "in_progress"
  ).length;

  const operacaoNav = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    {
      label: "Pipeline Pátio (Kanban)",
      path: "/patio/kanban",
      matchPrefix: "/patio/kanban",
      icon: CarFront,
      badge: activeVehiclesCount,
    },
    {
      label: "Mapa das Baías & Planta",
      path: "/patio/mapa",
      matchPrefix: "/patio/mapa",
      icon: MapPinned,
    },
    {
      label: "Ordens de Serviço",
      path: "/ordens-servico",
      matchPrefix: "/ordens-servico",
      icon: ClipboardList,
    },
    {
      label: "Nova OS (Wizard)",
      path: "/ordens-servico/nova",
      icon: PlusCircle,
      highlight: true,
    },
    { label: "Agendamentos", path: "/agendamentos", icon: CalendarDays },
    {
      label: "Ocorrências & Avisos",
      path: "/ocorrencias",
      icon: AlertTriangle,
      badge: activeOccurrencesCount > 0 ? activeOccurrencesCount : undefined,
      badgeTone: "destructive" as const,
    },
    { label: "Base de Veículos", path: "/veiculos", icon: Gauge },
    { label: "Agenda Mecânicos", path: "/agenda-mecanicos", icon: Wrench },
    { label: "Equipe Operacional", path: "/equipe", icon: Users },
  ];

  const portals = [
    { name: "Operação (ERP)", active: true, badge: "Ativo" },
    { name: "Comercial (CRM)", active: false, badge: "Em breve" },
    { name: "Gestão & BI", active: false, badge: "Em breve" },
    { name: "Mecânico PWA", active: false, badge: "Em breve" },
    { name: "AIOS / Agentes", active: false, badge: "Em breve" },
  ];

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
          {!collapsed ? (
            <p className="dap-kicker mb-2 px-2">Operação & Pátio</p>
          ) : null}
          <nav className="space-y-1">
            {operacaoNav.map(item => {
              const isMatch =
                location === item.path ||
                (item.path === "/dashboard" && location === "/") ||
                (item.matchPrefix && location.startsWith(item.matchPrefix));
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  type="button"
                  title={collapsed ? item.label : undefined}
                  onClick={() => setLocation(item.path)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors duration-150",
                    isMatch ? "dap-nav-active" : "dap-nav-idle",
                    item.highlight && !isMatch && "text-dap-red hover:text-dap-red"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {!collapsed ? (
                    <>
                      <span className="min-w-0 flex-1 truncate text-left font-medium">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded-sm text-[0.65rem] font-bold",
                            isMatch
                              ? "bg-dap-red/20 text-dap-red"
                              : item.badgeTone === "destructive"
                                ? "bg-dap-red/20 text-dap-red"
                                : "bg-dap-carbon text-dap-gray"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {!collapsed ? (
          <div>
            <p className="dap-kicker mb-2 px-2">Portais da Oficina</p>
            <div className="space-y-1">
              {portals.map(p => (
                <div
                  key={p.name}
                  className={cn(
                    "flex items-center justify-between rounded-sm px-2 py-1.5 text-xs font-medium",
                    p.active
                      ? "border border-dap-red-deep/40 bg-dap-carbon text-dap-white"
                      : "text-dap-gray/50"
                  )}
                >
                  <span>{p.name}</span>
                  <span
                    className={cn(
                      "text-[0.6rem] font-mono uppercase tracking-wide",
                      p.active ? "text-dap-red" : "text-dap-gray/40"
                    )}
                  >
                    {p.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative border-t border-dap-red-deep/50 p-3 bg-dap-black/40">
        <div className="flex items-center gap-3 rounded-sm p-2">
          <div className="flex size-8 items-center justify-center rounded-sm border border-dap-red-deep/40 bg-dap-carbon text-xs font-bold text-dap-red">
            AD
          </div>
          {!collapsed ? (
            <>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs font-semibold text-dap-white">Admin Master</span>
                <span className="truncate text-[0.65rem] text-dap-gray">admin@dap40.com.br</span>
              </div>
              <ShieldCheck className="size-4 shrink-0 text-dap-whatsapp" />
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
