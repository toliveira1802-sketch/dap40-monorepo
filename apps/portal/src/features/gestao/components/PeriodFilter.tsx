import { Button } from "@/components/ui/button";
import { PERIOD_OPTIONS, usePeriod, type PeriodKey } from "@/features/gestao/contexts/PeriodContext";
import { Calendar } from "lucide-react";
import { cn } from "@/features/gestao/lib/utils";

export function PeriodFilter() {
  const { period, setPeriod } = usePeriod();

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/50 p-1">
      <Calendar className="h-3.5 w-3.5 text-muted-foreground ml-1.5 mr-0.5 shrink-0" />
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => setPeriod(opt.key as PeriodKey)}
          className={cn(
            "px-2.5 py-1 text-xs font-condensed font-medium rounded-md transition-all duration-200",
            "hover:bg-accent/50",
            period === opt.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.short}
        </button>
      ))}
    </div>
  );
}
