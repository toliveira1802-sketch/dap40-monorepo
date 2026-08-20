/**
 * Doctor Auto Prime — design tokens (design-dap).
 * Fonte: pmo-oficina-init/portal/src/config/design-tokens.ts
 */
export const DAP_COLORS = {
  black: "#000000",
  graphite: "#0E0E0E",
  carbon: "#1A1A1A",
  red: "#E51A1A",
  redDeep: "#8C0808",
  redBright: "#C8000A",
  white: "#F8F8F8",
  gray: "#C8C8C8",
  whatsapp: "#25D366",
  /** KPI / CTA premium — nunca substitui o vermelho de marca */
  gold: "#C8A96E",
} as const;

export type DapColor = keyof typeof DAP_COLORS;
