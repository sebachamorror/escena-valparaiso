import { describe, expect, it } from "vitest";
import { formatDate, formatMonth, initials, joinEs, normalize, plural } from "@/lib/format";

describe("format", () => {
  it("formatea fechas ISO en español de Chile", () => {
    expect(formatDate("2026-09-05")).toBe("5 de septiembre de 2026");
    expect(formatMonth("2026-08-01")).toBe("agosto de 2026");
    expect(formatDate(null)).toBeNull();
  });
  it("normaliza acentos", () => {
    expect(normalize("Viña del Mar")).toBe("vina del mar");
  });
  it("iniciales para el avatar", () => {
    expect(initials("Hugo Hernández Urtubia")).toBe("HH");
    expect(initials("Ayayai")).toBe("AY");
  });
  it("une listas en español", () => {
    expect(joinEs(["a", "b", "c"])).toBe("a, b y c");
    expect(plural(1, "comuna", "comunas")).toBe("1 comuna");
  });
});
