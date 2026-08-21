import { type DrillDownData } from "@/features/gestao/hooks/useDrillDown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, X } from "lucide-react";

interface DrillDownModalProps {
  data: DrillDownData | null;
  open: boolean;
  onClose: () => void;
}

export function DrillDownModal({ data, open, onClose }: DrillDownModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl bg-popover border-border/50">
        <DialogHeader>
          <DialogTitle className="dap-heading text-xl text-foreground">
            {data.title}
          </DialogTitle>
          {data.subtitle && (
            <DialogDescription className="font-condensed text-sm text-muted-foreground">
              {data.subtitle}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* MÃ©tricas principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.metrics.map((m) => (
            <Card key={m.label} className="bg-card border-border/50">
              <CardContent className="p-3">
                <p className="text-[10px] font-condensed uppercase tracking-wide text-muted-foreground mb-1">
                  {m.label}
                </p>
                <p className="font-display text-xl text-foreground leading-none">
                  {m.value}
                </p>
                {m.trend && (
                  <p className={`text-[10px] font-condensed mt-1 flex items-center gap-1 ${m.trendUp ? "text-primary" : "text-muted-foreground"}`}>
                    {m.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {m.trend}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Breakdown visual */}
        {data.breakdown && data.breakdown.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-condensed font-semibold uppercase tracking-wide text-muted-foreground">
              ComposiÃ§Ã£o
            </h3>
            {data.breakdown.map((b) => {
              const max = Math.max(...data.breakdown!.map((x) => x.value), 1);
              const pct = (b.value / max) * 100;
              return (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="text-xs font-condensed text-foreground w-28 shrink-0 truncate">
                    {b.label}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: b.color ?? "oklch(0.546 0.227 25.4)",
                      }}
                    />
                  </div>
                  <span className="text-xs font-condensed font-medium text-foreground w-12 text-right shrink-0">
                    {b.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Detalhes adicionais */}
        {data.details && data.details.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/30">
            <h3 className="text-xs font-condensed font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Detalhes
            </h3>
            {data.details.map((d) => (
              <div key={d.label} className="flex items-center justify-between gap-2 text-xs font-condensed">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="text-foreground font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
