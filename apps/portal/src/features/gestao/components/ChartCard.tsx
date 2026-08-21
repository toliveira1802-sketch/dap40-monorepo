import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, icon: Icon, children, className }: ChartCardProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card
      className={`min-w-0 overflow-hidden bg-card border-border/50 transition-all duration-500 ${
        loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } ${className ?? ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          <CardTitle className="font-condensed font-semibold text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="min-w-0">
        {!loaded ? (
          <Skeleton className="w-full h-[240px] rounded-lg" />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
