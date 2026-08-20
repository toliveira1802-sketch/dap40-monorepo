/** Senha definitiva (após primeiro acesso). Senha inicial `123456` NÃO passa aqui. */
export const INITIAL_USER_PASSWORD = "123456";

export type PasswordValidation =
  | { ok: true }
  | { ok: false; message: string };

export function validateDefinitivePassword(password: string): PasswordValidation {
  if (!password || password.length < 8) {
    return { ok: false, message: "Senha deve ter no mínimo 8 caracteres" };
  }
  if (!/[a-z]/.test(password)) {
    return { ok: false, message: "Senha deve ter ao menos 1 letra minúscula" };
  }
  if (!/[A-Z]/.test(password)) {
    return { ok: false, message: "Senha deve ter ao menos 1 letra maiúscula" };
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false, message: "Senha deve ter ao menos 1 número" };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { ok: false, message: "Senha deve ter ao menos 1 caractere especial" };
  }
  if (password === INITIAL_USER_PASSWORD) {
    return { ok: false, message: "Escolha uma senha diferente da senha inicial" };
  }
  return { ok: true };
}
