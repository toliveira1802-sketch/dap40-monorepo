import type { HTMLAttributes } from "react";
import { cn } from "../theme/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: "default" | "ai" | "premium";
}

export function Card({
  accent = "default",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        accent === "ai" && "dap-card-ai",
        accent === "premium" && "dap-card-premium",
        accent === "default" && "dap-card",
        className
      )}
      {...props}
    />
  );
}
