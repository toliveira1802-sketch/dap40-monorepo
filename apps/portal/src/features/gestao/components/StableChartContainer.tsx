import {
  CHART_RESIZE_DEBOUNCE_MS,
  STABLE_CHART_HEIGHT,
  stableChartContainment,
} from "@/features/gestao/lib/chartLayout";
import type { ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

type StableChartContainerProps = {
  children: ReactElement;
  height?: number;
};

export function StableChartContainer({
  children,
  height = STABLE_CHART_HEIGHT,
}: StableChartContainerProps) {
  return (
    <div
      className="w-full min-w-0 overflow-hidden"
      style={{ height, contain: stableChartContainment }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={height}
        debounce={CHART_RESIZE_DEBOUNCE_MS}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
}
