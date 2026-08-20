import { PATIO_TABS } from "@/lib/navConfig";
import { cn } from "@/lib/utils";
import { lazy, Suspense } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import { Spinner } from "@/components/ui/spinner";

const YardPage = lazy(() => import("./Yard"));
const PatioMapPage = lazy(() => import("./PatioMap"));
const ServiceOrdersPage = lazy(() => import("./ServiceOrders"));

function PatioTabBar() {
  const [location, setLocation] = useLocation();
  const pathname = location.split("?")[0] || "/patio/kanban";

  return (
    <div className="mb-5 flex flex-wrap gap-1 rounded-sm border border-dap-red-deep/50 bg-dap-carbon p-1">
      {PATIO_TABS.map(tab => {
        const active = pathname === tab.path || pathname.startsWith(`${tab.path}/`);
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setLocation(tab.path)}
            className={cn(
              "min-w-[7.5rem] flex-1 rounded-sm px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors",
              active
                ? "bg-dap-red text-dap-white shadow-sm"
                : "text-dap-gray hover:bg-dap-graphite hover:text-dap-white"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default function PatioHubPage() {
  return (
    <div className="flex min-h-0 flex-col">
      <PatioTabBar />
      <Suspense
        fallback={
          <div className="grid min-h-[40vh] place-items-center">
            <Spinner className="size-5 text-dap-red" />
          </div>
        }
      >
        <Switch>
          <Route path="/patio/kanban" component={YardPage} />
          <Route path="/patio/mapa" component={PatioMapPage} />
          <Route path="/patio/ordens" component={ServiceOrdersPage} />
          <Route path="/patio">
            <Redirect to="/patio/kanban" />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
}
