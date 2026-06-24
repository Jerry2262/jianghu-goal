import { describe, expect, it } from "vitest";
import type { Card } from "../../src/domain/types";
import { createDeckState, drawForMoment, endMoment, playCard } from "../../src/domain/deck";

const cards: Card[] = Array.from({ length: 6 }, (_, index) => ({
  id: `card-${index + 1}`,
  name: `Card ${index + 1}`,
  type: "martial",
  sectId: "wudang",
  cost: index === 0 ? 0 : 1,
  tags: ["pass"],
  text: "Test card"
}));

describe("deck", () => {
  it("draws five cards and starts each key moment with three momentum", () => {
    const state = drawForMoment(createDeckState(cards));

    expect(state.hand).toHaveLength(5);
    expect(state.momentum).toBe(3);
    expect(state.playsRemaining).toBe(3);
  });

  it("moves played cards to discard and spends momentum", () => {
    let state = drawForMoment(createDeckState(cards));
    state = playCard(state, state.hand[1].id);

    expect(state.momentum).toBe(2);
    expect(state.playsRemaining).toBe(2);
    expect(state.discard.map((card) => card.id)).toContain("card-2");
  });

  it("discards unplayed hand at moment end", () => {
    let state = drawForMoment(createDeckState(cards));
    state = playCard(state, state.hand[0].id);
    state = endMoment(state);

    expect(state.hand).toHaveLength(0);
    expect(state.discard.length + state.drawPile.length + state.exhaust.length).toBe(6);
  });
});
