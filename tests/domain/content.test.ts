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
      expect(
        demoCards.some((card) => card.type === "disciple" && card.ownerDiscipleId === disciple.id)
      ).toBe(true);
    }
  });

  it("keeps sect, disciple, and card IDs unique", () => {
    expect(new Set(demoSects.map((sect) => sect.id)).size).toBe(demoSects.length);
    expect(new Set(demoDisciples.map((disciple) => disciple.id)).size).toBe(demoDisciples.length);
    expect(new Set(demoCards.map((card) => card.id)).size).toBe(demoCards.length);
  });

  it("links each opponent to a non-playable sect", () => {
    const sectById = new Map(demoSects.map((sect) => [sect.id, sect] as const));

    for (const opponent of demoOpponents) {
      const sect = sectById.get(opponent.id);
      expect(sect).toBeDefined();
      expect(sect?.playable).toBe(false);
    }
  });

  it("keeps every disciple tied to a known sect", () => {
    const sectIds = new Set(demoSects.map((sect) => sect.id));

    for (const disciple of demoDisciples) {
      expect(sectIds.has(disciple.sectId)).toBe(true);
    }
  });

  it("keeps every card linked to a known sect or disciple", () => {
    const sectIds = new Set(demoSects.map((sect) => sect.id));
    const discipleIds = new Set(demoDisciples.map((disciple) => disciple.id));

    for (const card of demoCards) {
      if (card.type === "martial" || card.type === "formation") {
        expect(sectIds.has(card.sectId)).toBe(true);
      }

      if (card.type === "disciple") {
        expect(discipleIds.has(card.ownerDiscipleId)).toBe(true);
      }

      if (card.type === "status") {
        expect("sectId" in card).toBe(false);
        expect("ownerDiscipleId" in card).toBe(false);
      }
    }
  });

  it("uses Chinese-only display text for player-facing demo content", () => {
    const hasAsciiLetter = /[A-Za-z]/;

    for (const sect of demoSects) {
      expect(sect.name).not.toMatch(hasAsciiLetter);
      expect(sect.style).not.toMatch(hasAsciiLetter);
    }

    for (const opponent of demoOpponents) {
      expect(opponent.name).not.toMatch(hasAsciiLetter);
      expect(opponent.style).not.toMatch(hasAsciiLetter);
    }

    for (const disciple of demoDisciples) {
      expect(disciple.name).not.toMatch(hasAsciiLetter);
      expect(disciple.trait).not.toMatch(hasAsciiLetter);
    }

    for (const card of demoCards) {
      expect(card.name).not.toMatch(hasAsciiLetter);
      expect(card.text).not.toMatch(hasAsciiLetter);
    }
  });
});
