import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Bot, Check, Inbox, RefreshCw, SearchX, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FilterBar } from "./FilterBar";
import { InboxListSkeleton, QueryState } from "./QueryState";

export default function ComercialInboxPage() {
  const utils = trpc.useUtils();
  const {
    data: conversations,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = trpc.crm.inbox.listConversations.useQuery(undefined, {
    refetchInterval: 8_000,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations ?? [];
    return (conversations ?? []).filter(c => {
      const haystack = [
        c.contactName,
        c.subject ?? "",
        c.channelType,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [conversations, search]);

  useEffect(() => {
    if (!selectedId && filteredConversations[0]) {
      setSelectedId(filteredConversations[0].id);
      return;
    }
    if (
      selectedId &&
      filteredConversations.length > 0 &&
      !filteredConversations.some(c => c.id === selectedId)
    ) {
      setSelectedId(filteredConversations[0]?.id ?? null);
    }
  }, [filteredConversations, selectedId]);

  const selected = useMemo(
    () => filteredConversations.find(c => c.id === selectedId) ?? null,
    [filteredConversations, selectedId]
  );

  const { data: messages } = trpc.crm.inbox.listMessages.useQuery(
    { conversationId: selectedId! },
    { enabled: Boolean(selectedId), refetchInterval: 5_000 }
  );

  const { data: suggestions } = trpc.crm.anna.listSuggestions.useQuery(
    { conversationId: selectedId! },
    { enabled: Boolean(selectedId) }
  );

  const sendMessage = trpc.crm.inbox.sendMessage.useMutation({
    onSuccess: async () => {
      setDraft("");
      await utils.crm.inbox.listMessages.invalidate();
      await utils.crm.inbox.listConversations.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const generateAnna = trpc.crm.anna.generate.useMutation({
    onSuccess: async () => {
      await utils.crm.anna.listSuggestions.invalidate();
      toast.success("Sugestão Anna gerada — aprove antes de enviar");
    },
    onError: error => toast.error(error.message),
  });

  const decideAnna = trpc.crm.anna.decide.useMutation({
    onSuccess: async () => {
      await utils.crm.anna.listSuggestions.invalidate();
      await utils.crm.inbox.listMessages.invalidate();
      await utils.crm.inbox.listConversations.invalidate();
      toast.success("Decisão Anna registrada");
    },
    onError: error => toast.error(error.message),
  });

  const [draft, setDraft] = useState("");
  const activeSuggestion = suggestions?.[0];
  const hasData = (conversations?.length ?? 0) > 0;
  const filterEmpty = hasData && filteredConversations.length === 0;

  return (
    <div className="comercial-surface flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 md:p-6">
      <PageHeader
        eyebrow="Comercial"
        title="Inbox"
        description="Conversas omnichannel com Anna sob aprovação humana."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        }
      />

      {!isLoading && !isError && hasData ? (
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar conversas…"
        />
      ) : null}

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[280px_1fr]">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/30">
          <div className="border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Conversas
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <QueryState
              isLoading={isLoading}
              isError={isError}
              isEmpty={!hasData}
              onRetry={() => refetch()}
              errorIcon={Inbox}
              errorTitle="Não foi possível carregar o inbox"
              emptyIcon={Inbox}
              emptyTitle="Inbox vazio"
              emptyDescription="Nenhuma conversa ainda."
              loadingFallback={<InboxListSkeleton />}
            >
              {filterEmpty ? (
                <EmptyState
                  compact
                  icon={SearchX}
                  title="Nenhum resultado"
                  description="Nenhuma conversa corresponde à busca."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearch("")}
                    >
                      Limpar busca
                    </Button>
                  }
                />
              ) : (
                filteredConversations.map(conversation => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedId(conversation.id)}
                    className={cn(
                      "flex w-full flex-col gap-1 border-b border-border/40 px-3 py-3 text-left transition-colors",
                      selectedId === conversation.id
                        ? "bg-primary/10"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {conversation.contactName}
                      </span>
                      {conversation.unreadCount > 0 ? (
                        <Badge variant="default">
                          {conversation.unreadCount}
                        </Badge>
                      ) : null}
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {conversation.subject ?? conversation.channelType}
                    </span>
                  </button>
                ))
              )}
            </QueryState>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/30">
          {!selected ? (
            <div className="grid flex-1 place-items-center p-6">
              <EmptyState
                icon={Inbox}
                title="Selecione uma conversa"
                description="Escolha um thread à esquerda para responder."
              />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
                <div>
                  <h2 className="font-semibold">{selected.contactName}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selected.channelType} · {selected.status}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={generateAnna.isPending}
                  onClick={() =>
                    generateAnna.mutate({
                      conversationId: selected.id,
                      contactId: selected.contactId,
                      intent: "quote_request",
                    })
                  }
                >
                  <Bot className="mr-2 size-4" />
                  Anna
                </Button>
              </div>

              {activeSuggestion ? (
                <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-200">
                    <Bot className="size-3.5" /> Sugestão Anna (aprovação humana)
                  </div>
                  <p className="mb-3 text-sm leading-relaxed">
                    {activeSuggestion.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        decideAnna.mutate({
                          suggestionId: activeSuggestion.id,
                          action: "accepted",
                        })
                      }
                    >
                      <Check className="mr-1 size-4" /> Aprovar e enviar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        decideAnna.mutate({
                          suggestionId: activeSuggestion.id,
                          action: "rejected",
                          reasons: ["Não adequado"],
                        })
                      }
                    >
                      <X className="mr-1 size-4" /> Rejeitar
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {(messages ?? []).map(message => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      message.direction === "outbound"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {message.body}
                  </div>
                ))}
              </div>

              <form
                className="flex gap-2 border-t border-border/60 p-3"
                onSubmit={event => {
                  event.preventDefault();
                  if (!draft.trim() || !selectedId) return;
                  sendMessage.mutate({
                    conversationId: selectedId,
                    body: draft.trim(),
                  });
                }}
              >
                <Textarea
                  value={draft}
                  onChange={event => setDraft(event.target.value)}
                  placeholder="Escreva a resposta…"
                  className="min-h-[44px] resize-none"
                  rows={2}
                />
                <Button
                  type="submit"
                  disabled={sendMessage.isPending || !draft.trim()}
                  className="shrink-0"
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
