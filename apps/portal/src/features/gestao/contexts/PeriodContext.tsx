import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type PeriodKey = "week" | "month" | "quarter" | "year" | "all";

export interface PeriodOption {
  key: PeriodKey;
  label: string;
  short: string;
  months: number;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { key: "week", label: "Esta Semana", short: "Semana", months: 0 },
  { key: "month", label: "Este MÃªs", short: "MÃªs", months: 1 },
  { key: "quarter", label: "Trimestre", short: "Trimestre", months: 3 },
  { key: "year", label: "Ano", short: "Ano", months: 12 },
  { key: "all", label: "Tudo", short: "Tudo", months: 24 },
];

interface PeriodContextValue {
  period: PeriodKey;
  periodOption: PeriodOption;
  setPeriod: (p: PeriodKey) => void;
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<PeriodKey>("month");

  const value = useMemo<PeriodContextValue>(() => {
    const periodOption = PERIOD_OPTIONS.find((p) => p.key === period) ?? PERIOD_OPTIONS[1];
    return { period, periodOption, setPeriod };
  }, [period]);

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error("usePeriod must be used within PeriodProvider");
  return ctx;
}
