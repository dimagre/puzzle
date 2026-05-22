import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { uahToKopecks } from "@/lib/payments/monobank";

describe("uahToKopecks", () => {
  it("converts integer amounts", () => {
    expect(uahToKopecks(new Prisma.Decimal("100"))).toBe(10000);
  });

  it("converts amounts with two decimals", () => {
    expect(uahToKopecks(new Prisma.Decimal("100.50"))).toBe(10050);
  });

  it("pads single-decimal amounts", () => {
    expect(uahToKopecks(new Prisma.Decimal("100.5"))).toBe(10050);
  });

  it("rounds long fractions to two digits", () => {
    expect(uahToKopecks(new Prisma.Decimal("100.999"))).toBe(10099);
  });

  it("handles zero", () => {
    expect(uahToKopecks(new Prisma.Decimal("0"))).toBe(0);
  });
});
