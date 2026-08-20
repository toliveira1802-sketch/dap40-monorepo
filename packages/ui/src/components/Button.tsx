import type { ButtonHTMLAttributes } from "react";
import { cn } from "../theme/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-dap-red text-dap-white hover:bg-dap-red-bright disabled:bg-dap-carbon disabled:text-dap-gray/50",
  secondary:
    "bg-dap-carbon text-dap-white border border-dap-red-deep hover:border-dap-red hover:bg-dap-graphite",
  ghost: "bg-transparent text-dap-gray hover:bg-dap-carbon hover:text-dap-white",
  danger:
    "bg-dap-carbon text-dap-red border border-dap-red-deep hover:border-dap-red hover:bg-dap-red/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs uppercase tracking-wide",
  md: "px-3 py-2 text-sm uppercase tracking-wide",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
