import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const variantStyles = {
      default:
        "bg-dap-red text-dap-white hover:bg-dap-red-bright disabled:bg-dap-carbon disabled:text-dap-gray/50",
      destructive:
        "bg-dap-carbon text-dap-red border border-dap-red-deep hover:border-dap-red hover:bg-dap-red/10",
      outline:
        "border border-dap-red-deep bg-dap-carbon text-dap-white hover:border-dap-red hover:bg-dap-graphite",
      secondary:
        "bg-dap-carbon text-dap-white border border-dap-red-deep hover:border-dap-red hover:bg-dap-graphite",
      ghost: "bg-transparent text-dap-gray hover:bg-dap-carbon hover:text-dap-white",
      link: "text-dap-red underline-offset-4 hover:underline",
    }[variant];

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-sm uppercase tracking-wide",
      sm: "h-8 rounded-sm px-3 text-xs uppercase tracking-wide",
      lg: "h-10 rounded-sm px-8 text-sm uppercase tracking-wide",
      icon: "h-9 w-9",
    }[size];

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-dap-red disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles,
          sizeStyles,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
