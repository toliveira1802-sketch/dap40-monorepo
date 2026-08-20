import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@dap40/ui";
import { validateDefinitivePassword } from "@dap40/utils";
import { BrandLogo } from "../layout/BrandLogo";
import { useSession } from "./session";
import { LOGIN_PATH, postLoginPath } from "./paths";

/**
 * Obrigatório quando profiles.must_change_password = true
 * (usuários criados pelo MASTER com senha inicial 123456).
 * MASTER/DEV não é forçado.
 */
export default function TrocarSenha() {
  const [, setLocation] = useLocation();
  const { loading, session, changePassword, signOut } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      setLocation(LOGIN_PATH);
      return;
    }
    if (!session.mustChangePassword) {
      setLocation(postLoginPath());
    }
  }, [loading, session, setLocation]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Confirmação não confere");
      return;
    }
    const check = validateDefinitivePassword(newPassword);
    if (!check.ok) {
      setError(check.message);
      return;
    }

    setPending(true);
    try {
      await changePassword(currentPassword, newPassword);
      setLocation(postLoginPath());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao trocar senha");
    } finally {
      setPending(false);
    }
  };

  if (loading || !session || !session.mustChangePassword) {
    return (
      <div className="dap-motion-bg flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dap-red" />
      </div>
    );
  }

  return (
    <div className="dap-motion-bg flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-sm border border-dap-red-deep/60 bg-dap-carbon p-8 shadow-[0_28px_90px_rgba(0,0,0,0.55)] sm:p-10">
        <BrandLogo />
        <div className="mt-8 text-center">
          <p className="dap-kicker">Primeiro acesso</p>
          <h1 className="dap-display mt-2 text-3xl text-dap-white">
            Trocar <span className="text-dap-red">senha</span>
          </h1>
          <p className="mt-3 text-sm leading-6 text-dap-gray">
            Mínimo 8 caracteres, com maiúscula, minúscula, número e especial.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5">
            <span className="dap-label">Senha atual</span>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="dap-field w-full"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="dap-label">Nova senha</span>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="dap-field w-full"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="dap-label">Confirmar nova senha</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="dap-field w-full"
            />
          </label>

          {error ? (
            <p className="text-sm text-dap-red" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="primary" className="h-11 w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar e entrar"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full"
            onClick={async () => {
              await signOut();
              setLocation(LOGIN_PATH);
            }}
          >
            Sair
          </Button>
        </form>
      </div>
    </div>
  );
}
