import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Loading / error / empty wrapper — LOCAL ao módulo Comercial. */
export function QueryState({
  isLoading,
  isError,
  isEmpty,
  onRetry,
  errorIcon,
  errorTitle = "Não foi possível carregar",
  errorDescription = "Verifique a conexão e tente novamente.",
  emptyIcon,
  emptyTitle = "Sem dados",
  emptyDescription = "Nada para exibir no momento.",
  loadingFallback,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry?: () => void;
  errorIcon: LucideIcon;
  errorTitle?: string;
  errorDescription?: string;
  emptyIcon: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingFallback: ReactNode;
  children: ReactNode;
}) {
  if (isLoading) return <>{loadingFallback}</>;

  if (isError) {
    return (
      <EmptyState
        icon={errorIcon}
        title={errorTitle}
        description={errorDescription}
        action={
          onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Tentar de novo
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return <>{children}</>;
}

export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 rounded-xl border border-border/70 p-4">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function KanbanSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex gap-3 overflow-hidden pb-2">
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="flex w-72 shrink-0 flex-col gap-2 rounded-xl border border-border/70 p-3"
        >
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function InboxListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-0 p-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border/40 px-2 py-3">
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      ))}
    </div>
  );
}
