import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  cockpitMoreNav,
  cockpitPrimaryNav,
  type CockpitSection,
} from "@/features/gestao/lib/cockpit";
import { ChevronDown, Plus } from "lucide-react";
import { useLocation } from "wouter";

type CockpitTopNavProps = {
  activeSection: CockpitSection;
  onRegister: () => void;
};

export function CockpitTopNav({ activeSection, onRegister }: CockpitTopNavProps) {
  const [, setLocation] = useLocation();
  const isMoreActive = cockpitMoreNav.some(item => item.key === activeSection);

  return (
    <div className="sticky top-14 z-30 -mx-4 -mt-4 mb-6 border-b border-primary/15 bg-background/95 px-4 backdrop-blur md:-mx-6 md:-mt-6 md:px-6">
      <div className="flex min-h-16 items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {cockpitPrimaryNav.map(item => {
            const Icon = item.icon;
            const active = item.key === activeSection;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setLocation(item.path)}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-md px-3 font-condensed text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex h-10 shrink-0 items-center gap-2 rounded-md px-3 font-condensed text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isMoreActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                Mais
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {cockpitMoreNav.map(item => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.key}
                    onClick={() => setLocation(item.path)}
                    className="cursor-pointer gap-2 font-condensed"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.description}</p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Badge variant="outline" className="hidden border-amber-500/30 bg-amber-500/10 text-amber-300 lg:inline-flex">
          HomologaÃ§Ã£o
        </Badge>
        <Button onClick={onRegister} size="sm" className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Registrar</span>
        </Button>
      </div>
    </div>
  );
}
