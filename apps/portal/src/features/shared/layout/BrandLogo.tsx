interface BrandLogoProps {
  collapsed?: boolean;
  /** Compact mark + wordmark for the top header bar. */
  variant?: "default" | "header";
}

export function BrandLogo({ collapsed = false, variant = "default" }: BrandLogoProps) {
  if (variant === "header") {
    return (
      <div
        className="flex shrink-0 items-center gap-2"
        aria-label="Doctor Auto Prime"
      >
        <div className="flex size-9 items-center justify-center rounded-sm border border-dap-red-deep/60 bg-dap-graphite">
          <span className="dap-display text-sm text-dap-red">D</span>
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="dap-display text-sm leading-none text-dap-white">
            Doctor <span className="text-dap-red">Auto</span>
          </p>
          <p className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-dap-gray/70">
            Prime
          </p>
        </div>
      </div>
    );
  }

  if (collapsed) {
    return (
      <div className="mx-auto flex size-9 items-center justify-center rounded-sm border border-dap-red-deep/60 bg-dap-black">
        <span className="dap-display text-sm text-dap-red">D</span>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <p className="dap-label">Doctor Auto</p>
      <p className="dap-display text-xl leading-none text-dap-white">
        Doctor <span className="text-dap-red">Auto</span>
      </p>
      <p className="dap-display mt-0.5 text-sm text-dap-red">Prime</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-dap-gray/70">
        Portal Empresa
      </p>
    </div>
  );
}
