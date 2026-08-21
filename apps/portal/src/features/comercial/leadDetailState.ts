type QueryState = {
  hasError: boolean;
  hasData: boolean;
  code?: string;
};

type LeadDetailStateInput = {
  contactCode?: string;
  queries: QueryState[];
};

export function resolveLeadDetailErrorState(
  input: LeadDetailStateInput
): "not-found" | "unavailable" | "retryable" | null {
  if (
    input.contactCode === "NOT_FOUND" ||
    input.contactCode === "BAD_REQUEST"
  ) {
    return "not-found";
  }

  const authorizationCodes = new Set(["FORBIDDEN", "UNAUTHORIZED"]);
  if (
    input.queries.some(
      query =>
        query.hasError && query.code && authorizationCodes.has(query.code)
    )
  ) {
    return "unavailable";
  }

  const blockingQueries = input.queries.filter(
    query => query.hasError && !query.hasData
  );
  if (blockingQueries.length === 0) return null;

  const nonRetryableCodes = new Set(["BAD_REQUEST"]);
  if (
    blockingQueries.some(
      query => query.code && nonRetryableCodes.has(query.code)
    )
  ) {
    return "unavailable";
  }

  return "retryable";
}
