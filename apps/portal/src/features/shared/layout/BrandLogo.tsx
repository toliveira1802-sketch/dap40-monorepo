interface BrandLogoProps {
  collapsed?: boolean;
}

export function BrandLogo({ collapsed = false }: BrandLogoProps) {
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
