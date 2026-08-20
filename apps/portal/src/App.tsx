import { Suspense, type ComponentType } from "react";
import { Route, Switch, Redirect } from "wouter";
import { Toaster } from "sonner";
import type { AccessSystem } from "@dap40/types";
import { Layout } from "./features/shared/layout/Layout";
import {
  AuthProvider,
  RequireAuth,
  RequirePortal,
  PublicOnly,
  CHANGE_PASSWORD_PATH,
} from "./features/shared/auth";
import HubPage from "./features/shared/HubPage";
import {
  publicFeatureRoutes,
  protectedFeatureRoutes,
} from "./lib/routeRegistry";
import type { PortalRoute } from "./lib/portalRoutes";

function LoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-dap-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-dap-gray border-t-dap-red" />
    </div>
  );
}

function withPortalGrant(system: AccessSystem | undefined, Page: ComponentType) {
  if (!system) return Page;
  return function GrantedPage() {
    return (
      <RequirePortal system={system}>
        <Page />
      </RequirePortal>
    );
  };
}

function renderFeatureRoute(route: PortalRoute) {
  const Page = withPortalGrant(route.system, route.component);
  return <Route key={route.path} path={route.path} component={Page} />;
}

function ShellRoutes() {
  return (
    <RequireAuth>
      <Layout>
        <Toaster position="top-right" richColors theme="dark" />
        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            <Route path="/hub" component={HubPage} />
            {protectedFeatureRoutes.map(renderFeatureRoute)}
            <Route>
              <Redirect to="/hub" />
            </Route>
          </Switch>
        </Suspense>
      </Layout>
    </RequireAuth>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Switch>
        {publicFeatureRoutes.map(route => {
          const Page = route.component;
          // /trocar-senha exige sessão — PublicOnly quebraria o fluxo must_change.
          if (route.path === CHANGE_PASSWORD_PATH) {
            return <Route key={route.path} path={route.path} component={Page} />;
          }
          return (
            <Route key={route.path} path={route.path}>
              <PublicOnly>
                <Page />
              </PublicOnly>
            </Route>
          );
        })}
        <Route>
          <ShellRoutes />
        </Route>
      </Switch>
    </AuthProvider>
  );
}

export default App;
