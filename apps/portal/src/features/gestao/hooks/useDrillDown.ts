import { useCallback, useState } from "react";

export interface DrillDownData {
  title: string;
  subtitle?: string;
  metrics: { label: string; value: string; trend?: string; trendUp?: boolean }[];
  breakdown?: { label: string; value: number; color?: string }[];
  details?: { label: string; value: string }[];
}

export function useDrillDown() {
  const [active, setActive] = useState<DrillDownData | null>(null);

  const open = useCallback((data: DrillDownData) => setActive(data), []);
  const close = useCallback(() => setActive(null), []);

  return { active, open, close };
}
