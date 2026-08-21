import { describe, expect, it } from "vitest";
import { resolveLeadDetailErrorState } from "./leadDetailState";

describe("Lead Detail error state", () => {
  it("prioritizes a missing contact over related query failures", () => {
    expect(
      resolveLeadDetailErrorState({
        contactCode: "NOT_FOUND",
        queries: [
          {
            hasError: true,
            hasData: false,
            code: "INTERNAL_SERVER_ERROR",
          },
        ],
      })
    ).toBe("not-found");
  });

  it("treats an invalid contact id as not found", () => {
    expect(
      resolveLeadDetailErrorState({
        contactCode: "BAD_REQUEST",
        queries: [],
      })
    ).toBe("not-found");
  });

  it("keeps rendering cached data after a refetch error", () => {
    expect(
      resolveLeadDetailErrorState({
        queries: [
          {
            hasError: true,
            hasData: true,
            code: "INTERNAL_SERVER_ERROR",
          },
        ],
      })
    ).toBeNull();
  });

  it("does not offer retry for authorization failures", () => {
    expect(
      resolveLeadDetailErrorState({
        queries: [{ hasError: true, hasData: false, code: "FORBIDDEN" }],
      })
    ).toBe("unavailable");
  });

  it("blocks cached data after authorization is revoked", () => {
    expect(
      resolveLeadDetailErrorState({
        queries: [{ hasError: true, hasData: true, code: "FORBIDDEN" }],
      })
    ).toBe("unavailable");
  });

  it("offers retry for an initial transient failure", () => {
    expect(
      resolveLeadDetailErrorState({
        queries: [
          {
            hasError: true,
            hasData: false,
            code: "INTERNAL_SERVER_ERROR",
          },
        ],
      })
    ).toBe("retryable");
  });
});
