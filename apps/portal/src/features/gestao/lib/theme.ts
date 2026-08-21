export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function resolveInitialTheme(
  defaultTheme: Theme,
  search: string,
  storedTheme: string | null
): Theme {
  const queryTheme = new URLSearchParams(search).get("theme");
  if (isTheme(queryTheme)) return queryTheme;
  if (isTheme(storedTheme)) return storedTheme;
  return defaultTheme;
}
