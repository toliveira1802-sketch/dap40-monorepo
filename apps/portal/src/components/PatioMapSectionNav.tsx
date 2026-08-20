import React from "react";
import { useLocation } from "wouter";
import { cn } from "../lib/utils";
import { LayoutGrid, Calendar, Car } from "lucide-react";

export function PatioMapSectionNav() {
  const [location, setLocation] = useLocation();

  const tabs = [
    { label: "Planta das Baías & Elevadores", path: "/patio/mapa", icon: LayoutGrid },
    { label: "Agenda dos Mecânicos", path: "/agenda-mecanicos", icon: Calendar },
    { label: "Pipeline Kanban", path: "/patio/kanban", icon: Car },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border/80 bg-card/60 p-1.5 shadow-sm">
      {tabs.map(tab => {
        const active = location === tab.path || location.startsWith(`${tab.path}/`);
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => setLocation(tab.path)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
