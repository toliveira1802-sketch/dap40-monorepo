import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@dap40/ui";
import { BrandLogo } from "../layout/BrandLogo";
import { useSession } from "./session";
import { CHANGE_PASSWORD_PATH, postLoginPath } from "./paths";

export default function Login() {
  const [, setLocation] = useLocation();
  const { loading, session, signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (loading || !session) return;
    if (session.mustChangePassword) {
      setLocation(CHANGE_PASSWORD_PATH);
      return;
    }
    setLocation(postLoginPath());
  }, [loading, session, setLocation]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const next = await signIn(email, password);
      if (next.mustChangePassword) {
        setLocation(CHANGE_PASSWORD_PATH);
        return;
      }
      setLocation(postLoginPath());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login");
    } finally {
      setPending(false);
    }
  };

  if (loading || session) {
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
          <p className="dap-kicker">Portal Único</p>
          <h1 className="dap-display mt-2 text-3xl text-dap-white sm:text-4xl">
            Acesso <span className="text-dap-red">Oficina</span>
          </h1>
          <p className="mt-3 text-sm leading-6 text-dap-gray">
            Login único para operação, comercial, gestão, mecânico e AIOS.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5">
            <span className="dap-label">E-mail</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="dap-field w-full"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="dap-label">Senha</span>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="dap-field w-full pr-11"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-dap-gray hover:text-dap-white"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-dap-red" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="primary" className="h-11 w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
