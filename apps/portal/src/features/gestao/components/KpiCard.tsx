import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export function KpiCard({ label, value, trend, trendUp, icon: Icon }: KpiCardProps) {
  return (
    <Card className="bg-card border-border/50 hover:border-primary/40 transition-colors">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-condensed font-medium uppercase tracking-wider text-muted-foreground truncate">
              {label}
            </span>
            <span className="font-display text-2xl md:text-3xl text-foreground leading-none">
              {value}
            </span>
          </div>
          {Icon && (
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3">
            {trendUp ? (
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span
              className={`text-xs font-condensed font-medium ${trendUp ? "text-primary" : "text-muted-foreground"}`}
            >
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
