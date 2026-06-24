import { describe, expect, it } from "vitest";
import { BOARD_COLUMNS, BOARD_LANES } from "../../src/domain/types";
import { demoCards, demoDisciples, demoOpponents, demoSects } from "../../src/content/demo";

describe("demo content", () => {
  it("uses the agreed 5x3 board shape", () => {
    expect(BOARD_COLUMNS).toEqual(["defense", "buildup", "midfield", "attack", "box"]);
    expect(BOARD_LANES).toEqual(["top", "center", "bottom"]);
  });

  it("contains one playable sect and three group-stage opponents for the first prototype", () => {
    expect(demoSects.filter((sect) => sect.playable)).toHaveLength(1);
    expect(demoOpponents).toHaveLength(3);
  });

  it("keeps the first prototype card pool small", () => {
    expect(demoCards.length).toBeGreaterThanOrEqual(12);
    expect(demoCards.length).toBeLessThanOrEqual(15);
  });

  it("gives every disciple one linked disciple card", () => {
    for (const disciple of demoDisciples) {
      expect(demoCards.some((card) => card.ownerDiscipleId === disciple.id)).toBe(true);
    }
  });
});
