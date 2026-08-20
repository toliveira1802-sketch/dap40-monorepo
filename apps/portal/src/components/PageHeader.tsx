import React from "react";
import { cn } from "../lib/utils";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div>
        {eyebrow && <p className="dap-kicker mb-1">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-dap-white sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm text-dap-gray">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
