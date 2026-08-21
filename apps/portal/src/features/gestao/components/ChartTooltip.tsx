interface ChartTooltipProps {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string; dataKey?: string }[];
  label?: string;
  formatter?: (value: number | string, name: string) => string;
  unit?: string;
}

export function ChartTooltip({ active, payload, label, formatter, unit = "" }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-primary/30 bg-popover/95 backdrop-blur-sm px-3 py-2 shadow-xl"
      style={{ fontFamily: "Saira Condensed" }}
    >
      {label && (
        <p className="text-xs font-semibold text-foreground mb-1.5 pb-1.5 border-b border-border/50">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => {
          const value = entry.value ?? 0;
          const name = entry.name ?? entry.dataKey ?? "";
          const displayValue = formatter ? formatter(value, name) : `${value}${unit}`;
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{name}:</span>
              <span className="font-semibold text-foreground ml-auto">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
