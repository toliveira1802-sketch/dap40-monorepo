import { describe, expect, it } from "vitest";
import {
  assertAnnaHumanApproval,
  getPipelineStage,
  isValidPipelineStage,
} from "@dap40/types";
import { canAccess, getAccessLevel, resolveHomePath } from "./access";

describe("CRM domain", () => {
  it("validates pipeline stages", () => {
    expect(isValidPipelineStage("stage_novo_lead")).toBe(true);
    expect(isValidPipelineStage("invalid")).toBe(false);
    expect(getPipelineStage("stage_perdido")?.isLost).toBe(true);
  });

  it("requires human Anna approval actions", () => {
    expect(() => assertAnnaHumanApproval("accepted")).not.toThrow();
    expect(() => assertAnnaHumanApproval("rejected")).not.toThrow();
  });
});

describe("CRM access matrix on unified portal", () => {
  it("MASTER/DEV sees CRM admin", () => {
    expect(getAccessLevel("MASTER", "CRM")).toBe("admin");
    expect(getAccessLevel("DEV", "CRM")).toBe("admin");
    expect(canAccess(getAccessLevel("MASTER", "CRM"), "read")).toBe(true);
  });

  it("CONSULTOR acessa CRM/ERP via grant", () => {
    const grants = { CRM: "write" as const, ERP: "write" as const };
    expect(getAccessLevel("CONSULTOR", "CRM", grants)).toBe("write");
    expect(getAccessLevel("CONSULTOR", "ERP", grants)).toBe("write");
    expect(resolveHomePath("CONSULTOR")).toBe("/hub");
  });

  it("MECANICO não acessa CRM sem grant", () => {
    expect(getAccessLevel("MECANICO", "CRM")).toBe("none");
    expect(canAccess(getAccessLevel("MECANICO", "CRM"), "read")).toBe(false);
  });

  it("ADMINISTRADOR acessa CRM via grant read", () => {
    expect(getAccessLevel("ADMINISTRADOR", "CRM", { CRM: "read" })).toBe(
      "read"
    );
  });
});
