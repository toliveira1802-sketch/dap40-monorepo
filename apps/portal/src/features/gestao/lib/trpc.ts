type QueryResult<T = undefined> = {
  data: T;
  isLoading: false;
  isFetching: false;
  isError: false;
  error: null;
  refetch: () => Promise<QueryResult<T>>;
};

type MutationOptions = {
  onSuccess?: (...args: unknown[]) => void | Promise<void>;
  onError?: (error: Error) => void;
};

type MutationResult = {
  mutate: (...args: unknown[]) => void;
  mutateAsync: (...args: unknown[]) => Promise<unknown>;
  isPending: false;
  isError: false;
  error: null;
  reset: () => void;
};

type Invalidateable = {
  invalidate: () => Promise<void>;
  useQuery: (...args: unknown[]) => QueryResult<unknown>;
  useMutation: (opts?: MutationOptions) => MutationResult;
};

function createQueryResult<T = undefined>(data: T = undefined as T): QueryResult<T> {
  const result: QueryResult<T> = {
    data,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: async () => result,
  };
  return result;
}

function createMutationResult(): MutationResult {
  return {
    mutate: () => undefined,
    mutateAsync: async () => undefined,
    isPending: false,
    isError: false,
    error: null,
    reset: () => undefined,
  };
}

function createProcedureProxy(): Invalidateable {
  return new Proxy({} as Invalidateable, {
    get(_target, prop) {
      if (prop === "useQuery") {
        return (..._args: unknown[]) => createQueryResult(undefined);
      }
      if (prop === "useMutation") {
        return (_opts?: MutationOptions) => createMutationResult();
      }
      if (prop === "invalidate") {
        return async () => undefined;
      }
      return createProcedureProxy();
    },
  });
}

type GestaoUtils = {
  cockpit: {
    dashboard: { invalidate: () => Promise<void> };
    list: { invalidate: () => Promise<void> };
    financialDecisions: { invalidate: () => Promise<void> };
    peopleWorkspace: { invalidate: () => Promise<void> };
  };
};

function createUtilsProxy(): GestaoUtils {
  return createProcedureProxy() as unknown as GestaoUtils;
}

type OccurrenceType =
  | "lateness"
  | "absence"
  | "medical_certificate"
  | "conversation"
  | "praise"
  | "guidance"
  | "warning"
  | "penalty"
  | "reminder";

type DecisionStatus = "draft" | "analyzing" | "decided" | "reviewing" | "closed";
type RiskLevel = "low" | "medium" | "high";
type AuditEventType =
  | "decision_created"
  | "scenario_added"
  | "scenario_selected"
  | "status_changed"
  | "impact_reviewed"
  | "decision_closed";

/** Structural stubs so RouterOutputs indexing type-checks without a real router. */
export type RouterOutputs = {
  cockpit: {
    dashboard: {
      workspace: { name: string };
      records: Array<{
        id: string;
        area: string;
        type: string;
        title: string;
        summary: string | null;
        priority: string;
        status: string;
        dueAt: number | null;
        templateKey: string | null;
        createdAt: Date;
      }>;
    };
    list: Array<{ id: string; title: string; type?: string }>;
    financialDecisions: Array<{
      record: { id: string; title: string };
      decision: {
        rationale: string | null;
        chosenScenarioId: string | null;
        decisionStatus: DecisionStatus;
        context: string | null;
        originalAmount: string | null;
        counterpartyName: string | null;
        reviewAt: number | null;
      };
      scenarios: Array<{
        id: string;
        isSelected: boolean;
        isBaseline: boolean;
        label: string;
        description: string | null;
        negotiatedAmount: string | null;
        savingsAmount: string | null;
        cashImpactNow: string | null;
        cashImpact30: string | null;
        cashImpact60: string | null;
        cashImpact90: string | null;
        marginImpactPct: string | null;
        operationalRisk: RiskLevel;
        terms: string | null;
        notes: string | null;
      }>;
      reviews: Array<{
        id: string;
        createdAt: Date;
        notes: string | null;
        impact: string | null;
      }>;
      timeline: Array<{
        id: string;
        eventType: AuditEventType;
        title: string;
        description: string | null;
        occurredAt: number;
      }>;
    }>;
    peopleWorkspace: {
      people: Array<{
        id: string;
        name: string;
        roleTitle: string | null;
        occurrences: Array<{
          record: { id: string; title: string; status: string };
          occurrence: {
            occurrenceType: OccurrenceType;
            followUpAt: number | null;
            details: string | null;
            nextStep: string | null;
            documentUrl: string | null;
            outcome: string | null;
            occurredAt: number;
          };
        }>;
      }>;
      reminders: Array<{
        id: string;
        title: string;
        summary: string | null;
        status: string;
        dueAt: number | null;
        createdAt: Date;
      }>;
    };
  };
};

type GestaoTrpcCockpit = {
  dashboard: {
    useQuery: (...args: unknown[]) => QueryResult<RouterOutputs["cockpit"]["dashboard"] | undefined>;
  };
  list: {
    useQuery: (...args: unknown[]) => QueryResult<RouterOutputs["cockpit"]["list"] | undefined>;
  };
  financialDecisions: {
    useQuery: (...args: unknown[]) => QueryResult<RouterOutputs["cockpit"]["financialDecisions"] | undefined>;
  };
  peopleWorkspace: {
    useQuery: (...args: unknown[]) => QueryResult<RouterOutputs["cockpit"]["peopleWorkspace"] | undefined>;
  };
  setStatus: { useMutation: (opts?: MutationOptions) => MutationResult };
  create: { useMutation: (opts?: MutationOptions) => MutationResult };
  createPerson: { useMutation: (opts?: MutationOptions) => MutationResult };
  resolveOccurrence: { useMutation: (opts?: MutationOptions) => MutationResult };
  addDecisionScenario: { useMutation: (opts?: MutationOptions) => MutationResult };
  chooseDecisionScenario: { useMutation: (opts?: MutationOptions) => MutationResult };
  addImpactReview: { useMutation: (opts?: MutationOptions) => MutationResult };
};

/** Lightweight tRPC client stub — no backend; Cockpit/PeopleWorkspace stay mountable. */
export const trpc = {
  useUtils: (): GestaoUtils => createUtilsProxy(),
  cockpit: createProcedureProxy() as unknown as GestaoTrpcCockpit,
};
