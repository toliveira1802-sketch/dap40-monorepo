import React from "react";
import DashboardLayout from "@/features/gestao/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getRouteSkeletonKind,
  type RouteSkeletonKind,
} from "@/features/gestao/lib/routeLoading";
import { useLocation } from "wouter";

function KpiSkeletons({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border/50 bg-card p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-3 h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

function PageHeadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-64 max-w-[75vw]" />
      <Skeleton className="h-4 w-80 max-w-[85vw]" />
    </div>
  );
}

function DashboardContentSkeleton() {
  return (
    <div className="space-y-6" aria-label="Carregando dashboard">
      <PageHeadingSkeleton />
      <KpiSkeletons />
      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[390px] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[390px] rounded-xl" />
      </div>
      <Skeleton className="h-[320px] rounded-xl" />
    </div>
  );
}

function AreaContentSkeleton() {
  return (
    <div className="space-y-6" aria-label="Carregando Ã¡rea">
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
        <PageHeadingSkeleton />
      </div>
      <KpiSkeletons />
      <Skeleton className="h-7 w-40" />
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[320px] rounded-xl" />
        <Skeleton className="h-[320px] rounded-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function SummaryContentSkeleton() {
  return (
    <div className="space-y-6" aria-label="Carregando resumo executivo">
      <PageHeadingSkeleton />
      <KpiSkeletons />
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[360px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function Vision360ContentSkeleton() {
  return (
    <div className="space-y-6" aria-label="Carregando visÃ£o 360 graus">
      <PageHeadingSkeleton />
      <KpiSkeletons />
      <div className="grid gap-4 xl:grid-cols-5">
        <Skeleton className="h-[420px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[420px] rounded-xl xl:col-span-3" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[340px] rounded-xl" />
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
    </div>
  );
}

function DenseContentSkeleton() {
  return (
    <div className="space-y-6" aria-label="Carregando dados">
      <PageHeadingSkeleton />
      <KpiSkeletons />
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-36 rounded-lg" />
        ))}
      </div>
      <div className="space-y-2 rounded-xl border border-border/50 bg-card p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function CockpitContentSkeleton() {
  return (
    <div className="space-y-6" aria-label="Carregando cockpit operacional">
      <Skeleton className="h-16 w-full rounded-none" />
      <PageHeadingSkeleton />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonForKind({ kind }: { kind: RouteSkeletonKind }) {
  if (kind === "dashboard") return <DashboardContentSkeleton />;
  if (kind === "area") return <AreaContentSkeleton />;
  if (kind === "executive-summary") return <SummaryContentSkeleton />;
  if (kind === "vision-360") return <Vision360ContentSkeleton />;
  if (kind === "dense") return <DenseContentSkeleton />;
  if (kind === "cockpit") return <CockpitContentSkeleton />;
  return <DashboardContentSkeleton />;
}

export function RouteLoadingFallback() {
  const [location] = useLocation();
  const kind = getRouteSkeletonKind(location);

  return (
    <DashboardLayout>
      <SkeletonForKind kind={kind} />
    </DashboardLayout>
  );
}
