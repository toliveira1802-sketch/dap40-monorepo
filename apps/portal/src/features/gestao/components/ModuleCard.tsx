import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  status: "planned" | "active" | "coming-soon";
}

const statusConfig = {
  planned: {
    label: "Planejado",
    icon: Clock,
    variant: "outline" as const,
    className: "border-primary/40 text-primary",
  },
  active: {
    label: "Ativo",
    icon: CheckCircle2,
    variant: "default" as const,
    className: "bg-primary text-primary-foreground",
  },
  "coming-soon": {
    label: "Em breve",
    icon: Sparkles,
    variant: "outline" as const,
    className: "border-muted-foreground/30 text-muted-foreground",
  },
};

export function ModuleCard({ title, description, status }: ModuleCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-condensed font-semibold text-sm leading-tight">
            {title}
          </CardTitle>
          <Badge variant={config.variant} className={`shrink-0 text-[10px] font-condensed ${config.className}`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground font-condensed leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
