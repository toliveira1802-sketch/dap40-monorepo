export const LOGIN_PATH = "/login";
export const CHANGE_PASSWORD_PATH = "/trocar-senha";

export function loginUrl(fromPath?: string): string {
  if (
    fromPath &&
    fromPath.startsWith("/") &&
    !fromPath.startsWith("//") &&
    fromPath !== LOGIN_PATH &&
    fromPath !== CHANGE_PASSWORD_PATH &&
    !fromPath.includes("\\")
  ) {
    return `${LOGIN_PATH}?redirect=${encodeURIComponent(fromPath)}`;
  }
  return LOGIN_PATH;
}

export function isMasterRole(role: string | null | undefined): boolean {
  return role === "MASTER";
}

function safeRedirect(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return null;
  }
  if (raw === LOGIN_PATH || raw === CHANGE_PASSWORD_PATH) return null;
  return raw;
}

/** Destino pós-login (sem must_change). */
export function postLoginPath(search = window.location.search): string {
  const redirect = safeRedirect(new URLSearchParams(search).get("redirect"));
  /** Preview operação: pós-login sem must_change → dashboard ERP. */
  return redirect ?? "/dashboard";
}
