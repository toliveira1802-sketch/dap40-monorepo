import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  caption?: string;
  icon?: LucideIcon;
  tone?: "default" | "critical" | "positive" | "warning" | "info" | "premium";
  onClick?: () => void;
  footer?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = "default",
  onClick,
  footer,
  className,
}: MetricCardProps) {
  const toneStyles = {
    default: "border-dap-red-deep/50 bg-dap-carbon text-dap-white",
    critical: "border-dap-red/40 bg-dap-red/10 text-dap-red",
    positive: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400",
    warning: "border-amber-500/30 bg-amber-950/20 text-amber-400",
    info: "border-dap-red-deep/40 bg-dap-graphite text-dap-gray",
    /** Dourado só em KPI/CTA premium — nunca no lugar do vermelho de marca */
    premium: "border-dap-gold/50 bg-dap-carbon text-dap-gold",
  }[tone];

  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex flex-col justify-between rounded-sm border p-4 text-left transition-colors",
        onClick && "cursor-pointer hover:border-dap-red/40",
        toneStyles,
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="dap-label">{label}</span>
          {Icon && (
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-sm border border-dap-red-deep/40 bg-dap-black/40",
                tone === "premium" ? "text-dap-gold" : "text-dap-red"
              )}
            >
              <Icon className="size-4 text-current" />
            </div>
          )}
        </div>

        <div className="mt-3">
          <p
            className={cn(
              "text-2xl font-bold tracking-tight sm:text-3xl font-mono",
              tone === "premium" ? "text-dap-gold" : "text-dap-white"
            )}
          >
            {value}
          </p>
          {caption && <p className="mt-1 text-xs text-dap-gray">{caption}</p>}
        </div>
      </div>

      {footer && (
        <div className="mt-4 border-t border-dap-red-deep/40 pt-3">{footer}</div>
      )}
    </Comp>
  );
}
