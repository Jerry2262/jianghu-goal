import { describe, expect, it } from "vitest";
import type { Card } from "../../src/domain/types";
import { createDeckState, drawForMoment, endMoment, gainMomentum, playCard } from "../../src/domain/deck";

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
  it("rejects duplicate card ids when creating a deck", () => {
    const duplicateCards: Card[] = [
      cards[0],
      {
        ...cards[1],
        id: cards[0].id
      }
    ];

    expect(() => createDeckState(duplicateCards)).toThrow(`Duplicate card id: ${cards[0].id}`);
  });

  it("rejects invalid card costs when creating a deck", () => {
    expect(() =>
      createDeckState([
        {
          ...cards[0],
          cost: -1
        }
      ])
    ).toThrow("Invalid card cost for Card 1");

    expect(() =>
      createDeckState([
        {
          ...cards[0],
          cost: 1.5
        }
      ])
    ).toThrow("Invalid card cost for Card 1");
  });

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

  it("keeps unrelated hand cards when playing one card", () => {
    const state = drawForMoment(createDeckState(cards));
    const startingHandIds = state.hand.map((card) => card.id);

    const next = playCard(state, startingHandIds[0]);

    expect(next.hand).toHaveLength(state.hand.length - 1);
    expect(next.hand.map((card) => card.id)).toEqual(startingHandIds.slice(1));
  });

  it("sends exhausted cards to exhaust instead of discard", () => {
    const exhaustedCard: Card = {
      id: "exhaust-card",
      name: "Exhaust Card",
      type: "martial",
      sectId: "wudang",
      cost: 0,
      tags: ["pass"],
      text: "Test card",
      exhausts: true
    };

    const state = drawForMoment(createDeckState([exhaustedCard]));
    const next = playCard(state, exhaustedCard.id);

    expect(next.discard).not.toContainEqual(exhaustedCard);
    expect(next.exhaust).toContainEqual(exhaustedCard);
  });

  it("rejects drawing a new moment while cards remain in hand", () => {
    const state = drawForMoment(createDeckState(cards));

    expect(() => drawForMoment(state)).toThrow("Cannot draw a new moment with cards still in hand");
  });

  it("rejects invalid momentum gains", () => {
    const state = createDeckState(cards);

    expect(() => gainMomentum(state, -1)).toThrow("Invalid momentum gain");
    expect(() => gainMomentum(state, 1.5)).toThrow("Invalid momentum gain");
  });

  it("discards unplayed hand at moment end", () => {
    let state = drawForMoment(createDeckState(cards));
    state = playCard(state, state.hand[0].id);
    state = endMoment(state);

    expect(state.hand).toHaveLength(0);
    expect(state.discard.length + state.drawPile.length + state.exhaust.length).toBe(6);
  });
});
