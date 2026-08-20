import React, { Suspense } from "react";
import { Route, Switch, Redirect } from "wouter";
import { Layout } from "./features/shared/layout/Layout";
import { Toaster } from "sonner";

// 12 Operation Screens (ERP)
import DashboardPage from "./features/operacao/Dashboard";
import PatioHubPage from "./features/operacao/PatioHub";
import YardPage from "./features/operacao/Yard";
import PatioMapPage from "./features/operacao/PatioMap";
import ServiceOrdersPage from "./features/operacao/ServiceOrders";
import NewServiceOrderWizardPage from "./features/operacao/NewServiceOrderWizard";
import ServiceOrderWorkspacePage from "./features/operacao/ServiceOrderWorkspace";
import AppointmentsPage from "./features/operacao/Appointments";
import OccurrencesPage from "./features/operacao/Occurrences";
import VehiclesPage from "./features/operacao/Vehicles";
import TeamPage from "./features/operacao/Team";
import MechanicAgendaPage from "./features/operacao/MechanicAgenda";

function LoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-dap-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-dap-gray border-t-dap-red" />
    </div>
  );
}

export function App() {
  return (
    <Layout>
      <Toaster position="top-right" richColors theme="dark" />
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          {/* Dashboard */}
          <Route path="/" component={DashboardPage} />
          <Route path="/dashboard" component={DashboardPage} />

          {/* Patio Hub & Tabs */}
          <Route path="/patio/kanban" component={YardPage} />
          <Route path="/patio/mapa" component={PatioMapPage} />
          <Route path="/patio/ordens" component={ServiceOrdersPage} />
          <Route path="/patio" component={PatioHubPage} />

          {/* Map Direct Routes */}
          <Route path="/mapa" component={PatioMapPage} />

          {/* Service Orders */}
          <Route path="/ordens-servico/nova" component={NewServiceOrderWizardPage} />
          <Route path="/ordens-servico/workspace/:id" component={ServiceOrderWorkspacePage} />
          <Route path="/ordens-servico/:id" component={ServiceOrderWorkspacePage} />
          <Route path="/ordens-servico" component={ServiceOrdersPage} />

          {/* Appointments / Occurrences / Vehicles / Team / Mechanic Agenda */}
          <Route path="/agendamentos" component={AppointmentsPage} />
          <Route path="/ocorrencias" component={OccurrencesPage} />
          <Route path="/veiculos" component={VehiclesPage} />
          <Route path="/equipe" component={TeamPage} />
          <Route path="/agenda-mecanicos" component={MechanicAgendaPage} />
          <Route path="/mecanicos" component={MechanicAgendaPage} />

          {/* Fallback */}
          <Route>
            <Redirect to="/dashboard" />
          </Route>
        </Switch>
      </Suspense>
    </Layout>
  );
}

export default App;
