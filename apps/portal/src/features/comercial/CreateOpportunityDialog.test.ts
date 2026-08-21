import { describe, expect, it } from "vitest";
import { parseBrlReais } from "./CreateOpportunityDialog";

describe("parseBrlReais", () => {
  it("aceita vazio como zero", () => {
    expect(parseBrlReais("")).toBe(0);
    expect(parseBrlReais("   ")).toBe(0);
  });

  it("parseia milhares no formato BR", () => {
    expect(parseBrlReais("1.234,56")).toBeCloseTo(1234.56);
    expect(parseBrlReais("12.345")).toBe(12345);
  });

  it("parseia decimal com vírgula ou ponto", () => {
    expect(parseBrlReais("10,5")).toBeCloseTo(10.5);
    expect(parseBrlReais("10.5")).toBeCloseTo(10.5);
  });
});
