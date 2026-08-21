interface DapLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function DapLogo({ collapsed, className = "" }: DapLogoProps) {
  if (collapsed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative h-9 w-9 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center">
          <span className="font-display text-primary text-lg leading-none">D</span>
          <span className="font-display text-primary text-lg leading-none -ml-0.5">A</span>
          <span className="font-display text-primary text-lg leading-none -ml-0.5">P</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative h-9 w-9 shrink-0 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center">
        <span className="font-display text-primary text-lg leading-none">D</span>
        <span className="font-display text-primary text-lg leading-none -ml-0.5">A</span>
        <span className="font-display text-primary text-lg leading-none -ml-0.5">P</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-sm text-foreground tracking-wide">
          DOCTOR AUTO
        </span>
        <span className="font-display text-sm text-primary tracking-wide">
          PRIME
        </span>
      </div>
    </div>
  );
}
