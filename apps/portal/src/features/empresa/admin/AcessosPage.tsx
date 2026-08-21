import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Redirect } from "wouter";
import { Button, Card } from "@dap40/ui";
import type { AccessLevel } from "@dap40/types";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import {
  isMasterRole,
  useSession,
} from "../../shared/auth";
import { canAccessPortal, hasProjectFloatAccess } from "./canAccess";
import {
  fetchAccessPages,
  fetchAccessUsers,
  hasPageGrant,
  setPortalGrant,
  setUserPageGrants,
  type AccessPageRow,
  type AccessUserRow,
} from "./api";
import {
  ACCESS_LEVEL_LABELS,
  MANAGED_SYSTEMS,
  PAGE_EMPRESA_ACESSOS,
  SYSTEM_EMPRESA,
  systemLabel,
  type ManagedSystem,
} from "./systems";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function LoadingBlock() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_1fr]">
      <div className="h-72 animate-pulse rounded-sm bg-dap-graphite" />
      <div className="h-72 animate-pulse rounded-sm bg-dap-graphite" />
    </div>
  );
}

function RequireGestaoAcessos({ children }: { children: ReactNode }) {
  const { loading, session } = useSession();
  const [pageOk, setPageOk] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    if (loading || !session) {
      setPageOk(null);
      return;
    }
    if (hasProjectFloatAccess(session.systems, session.role)) {
      setPageOk(true);
      return;
    }
    if (!canAccessPortal(session.systems, SYSTEM_EMPRESA, session.role)) {
      setPageOk(false);
      return;
    }
    void hasPageGrant(PAGE_EMPRESA_ACESSOS)
      .then(ok => {
        if (mounted) setPageOk(ok);
      })
      .catch(() => {
        if (mounted) setPageOk(false);
      });
    return () => {
      mounted = false;
    };
  }, [loading, session]);

  if (loading || pageOk === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dap-red" />
      </div>
    );
  }
  if (!session || !pageOk) return <Redirect to="/" />;
  return <>{children}</>;
}

export default function AcessosPage() {
  return (
    <RequireGestaoAcessos>
      <AcessosMasterScreen />
    </RequireGestaoAcessos>
  );
}

function AcessosMasterScreen() {
  const { session } = useSession();
  const isMaster = isMasterRole(session?.role);

  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Partial<Record<ManagedSystem, boolean>>>({});
  const [users, setUsers] = useState<AccessUserRow[]>([]);
  const [pages, setPages] = useState<AccessPageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, p] = await Promise.all([fetchAccessUsers(), fetchAccessPages()]);
      setUsers(u);
      setPages(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(u => {
      const hay = `${u.fullName} ${u.role ?? ""} ${u.id}`.toLowerCase();
      return hay.includes(term);
    });
  }, [search, users]);

  const selected =
    filtered.find(u => u.id === selectedUserId) ?? filtered[0] ?? null;

  const pagesBySystem = useMemo(() => {
    const map = new Map<ManagedSystem, AccessPageRow[]>();
    for (const system of MANAGED_SYSTEMS) map.set(system, []);
    for (const page of pages) {
      if (!(MANAGED_SYSTEMS as readonly string[]).includes(page.system)) continue;
      map.get(page.system as ManagedSystem)?.push(page);
    }
    return map;
  }, [pages]);

  async function changePortal(user: AccessUserRow, system: ManagedSystem, level: AccessLevel) {
    if (!isMaster || user.role === "MASTER") return;
    setPending(true);
    setFlash(null);
    try {
      await setPortalGrant(user.id, system, level);
      setFlash(level === "none" ? "Portal bloqueado" : "Portal atualizado");
      await reload();
    } catch (e) {
      setFlash(e instanceof Error ? e.message : "Erro ao salvar portal");
    } finally {
      setPending(false);
    }
  }

  async function togglePage(user: AccessUserRow, pageId: string, enabled: boolean) {
    if (!isMaster || user.role === "MASTER") return;
    setPending(true);
    setFlash(null);
    try {
      const next = new Set(user.pageIds);
      if (enabled) next.add(pageId);
      else next.delete(pageId);
      await setUserPageGrants(user.id, [...next]);
      setFlash(enabled ? "Página liberada" : "Página revogada");
      await reload();
    } catch (e) {
      setFlash(e instanceof Error ? e.message : "Erro ao salvar página");
    } finally {
      setPending(false);
    }
  }

  if (!isMaster) {
    return (
      <Card className="space-y-2 p-6">
        <AlertTriangle className="h-5 w-5 text-dap-red" />
        <p className="font-medium text-dap-white">Somente MASTER gerencia grants</p>
        <p className="text-sm text-dap-gray">
          Você tem a página liberada, mas as RPCs de escrita exigem cargo MASTER.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-2">
        <p className="dap-kicker">Admin Master</p>
        <h1 className="dap-display text-3xl text-dap-white">
          Acessos <span className="text-dap-red">por portal</span>
        </h1>
        <p className="max-w-2xl text-sm text-dap-gray">
          Usuário → portais (<code className="text-dap-white/80">access_grants</code>) →
          páginas (<code className="text-dap-white/80">access_page_grants</code>).
        </p>
      </header>

      {flash ? (
        <p className="rounded-sm border border-dap-red-deep/40 bg-dap-graphite px-3 py-2 text-xs text-dap-gray">
          {flash}
        </p>
      ) : null}

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dap-gray" />
          <input
            className="w-full rounded-sm border border-dap-red-deep/40 bg-dap-black/40 py-2 pl-9 pr-3 text-sm text-dap-white placeholder:text-dap-gray"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cargo"
          />
        </div>
        <Button type="button" variant="ghost" onClick={() => void reload()} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Atualizar
        </Button>
      </Card>

      {error ? (
        <Card className="flex flex-col items-start gap-3 p-6">
          <AlertTriangle className="h-5 w-5 text-dap-red" />
          <p className="font-medium text-dap-white">Falha ao carregar</p>
          <p className="text-sm text-dap-gray">{error}</p>
          <Button variant="ghost" onClick={() => void reload()}>
            Tentar novamente
          </Button>
        </Card>
      ) : loading ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-start gap-3 p-6">
          <Users className="h-5 w-5 text-dap-gray" />
          <p className="font-medium text-dap-white">
            {search.trim() ? "Nenhum resultado para a busca" : "Nenhum colaborador"}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_1fr]">
          <aside className="rounded-sm border border-dap-red-deep/40 bg-dap-graphite p-3">
            <p className="mb-2 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-dap-gray">
              Colaboradores
            </p>
            <ul className="space-y-1">
              {filtered.map(user => {
                const active = selected?.id === user.id;
                const grantCount = MANAGED_SYSTEMS.filter(s => {
                  const level = user.role === "MASTER" ? "admin" : user.grants[s];
                  return level && level !== "none";
                }).length;
                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-sm border px-3 py-3 text-left transition",
                        active
                          ? "border-dap-red/40 bg-dap-red/10"
                          : "border-transparent hover:border-dap-red-deep/40 hover:bg-dap-black/40"
                      )}
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-dap-red-deep/40 text-dap-gray">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-dap-white">
                          {user.fullName}
                        </p>
                        <p className="truncate text-xs text-dap-gray">{user.role}</p>
                        <span
                          className={cn(
                            "mt-2 inline-block rounded-sm border px-2 py-0.5 text-[0.65rem]",
                            grantCount > 0
                              ? "border-emerald-500/25 text-emerald-400"
                              : "border-dap-red-deep/40 text-dap-gray"
                          )}
                        >
                          {user.role === "MASTER"
                            ? "Admin implícito"
                            : grantCount > 0
                              ? `${grantCount} portal${grantCount === 1 ? "" : "es"}`
                              : "Sem liberação"}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="rounded-sm border border-dap-red-deep/40 bg-dap-graphite p-5">
            {selected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dap-red-deep/40 pb-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-dap-red">
                      <KeyRound className="h-3.5 w-3.5" />
                      Portais e páginas
                    </div>
                    <h2 className="dap-display text-2xl text-dap-white">{selected.fullName}</h2>
                    <p className="mt-1 text-sm text-dap-gray">{selected.role}</p>
                  </div>
                  {pending ? (
                    <div className="flex items-center gap-2 text-xs text-dap-gray">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Salvando…
                    </div>
                  ) : null}
                </div>

                {selected.role === "MASTER" ? (
                  <p className="mt-4 text-sm text-dap-gray">
                    MASTER não usa linhas em <code>access_grants</code> /{" "}
                    <code>access_page_grants</code> — acesso admin implícito.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {MANAGED_SYSTEMS.map(system => {
                      const level = selected.grants[system] ?? "none";
                      const open = Boolean(expanded[system]);
                      const systemPages = pagesBySystem.get(system) ?? [];
                      const portalOn = level !== "none";
                      return (
                        <li
                          key={system}
                          className="rounded-sm border border-dap-red-deep/40 bg-dap-black/30"
                        >
                          <div className="flex flex-wrap items-center gap-3 px-3 py-3">
                            <button
                              type="button"
                              className="flex min-w-0 flex-1 items-center gap-2 text-left"
                              onClick={() =>
                                setExpanded(prev => ({ ...prev, [system]: !prev[system] }))
                              }
                            >
                              {open ? (
                                <ChevronDown className="h-4 w-4 shrink-0 text-dap-gray" />
                              ) : (
                                <ChevronRight className="h-4 w-4 shrink-0 text-dap-gray" />
                              )}
                              <span className="truncate text-sm font-medium text-dap-white">
                                {systemLabel(system)}
                              </span>
                            </button>
                            <select
                              className="rounded-sm border border-dap-red-deep/40 bg-dap-black/50 px-2 py-1.5 text-xs text-dap-white"
                              value={level}
                              disabled={pending}
                              onChange={e =>
                                void changePortal(
                                  selected,
                                  system,
                                  e.target.value as AccessLevel
                                )
                              }
                            >
                              {(["none", "read", "write", "admin"] as AccessLevel[]).map(l => (
                                <option key={l} value={l}>
                                  {ACCESS_LEVEL_LABELS[l]}
                                </option>
                              ))}
                            </select>
                          </div>
                          {open ? (
                            <ul className="space-y-1 border-t border-dap-red-deep/30 px-3 py-2">
                              {systemPages.length === 0 ? (
                                <li className="py-2 text-xs text-dap-gray">
                                  Sem páginas cadastradas neste portal.
                                </li>
                              ) : (
                                systemPages.map(page => {
                                  const checked = selected.pageIds.includes(page.pageId);
                                  return (
                                    <li
                                      key={page.pageId}
                                      className="flex items-center justify-between gap-3 py-1.5"
                                    >
                                      <span className="min-w-0">
                                        <span className="block truncate text-sm text-dap-white">
                                          {page.label}
                                        </span>
                                        <span className="block truncate text-[0.65rem] text-dap-gray">
                                          {page.path} · {page.pageId}
                                        </span>
                                      </span>
                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-dap-red"
                                        checked={checked}
                                        disabled={pending || !portalOn}
                                        onChange={e =>
                                          void togglePage(selected, page.pageId, e.target.checked)
                                        }
                                      />
                                    </li>
                                  );
                                })
                              )}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
