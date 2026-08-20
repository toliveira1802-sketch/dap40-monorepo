import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number | string;
}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div className={cn("inline-flex items-center justify-center", className)} {...props}>
      <Loader2 className="size-full animate-spin text-current" />
    </div>
  );
}
