import { useTheme } from "@/features/gestao/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) return null;

  const isDark = theme === "dark";
  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="h-9 gap-2 border-border/70 bg-card/75 px-2.5 text-foreground shadow-sm backdrop-blur hover:border-primary/40 hover:bg-accent sm:px-3"
    >
      {isDark ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
      <span className="hidden font-condensed text-xs font-semibold sm:inline">
        {isDark ? "Claro" : "Escuro"}
      </span>
    </Button>
  );
}
