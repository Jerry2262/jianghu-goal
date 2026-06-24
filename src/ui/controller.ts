import { demoCards } from "../content/demo";
import { createDeckState, drawForMoment, playCard, type DeckState } from "../domain/deck";
import { createRunState, type RunState } from "../domain/run";
import { renderApp } from "./render";

interface ControllerState {
  run: RunState;
  deck: DeckState;
  message: string;
}

export function startPrototype(root: HTMLElement): void {
  let state: ControllerState = {
    run: createRunState(),
    deck: drawForMoment(createDeckState(demoCards.filter((card) => card.type !== "status"))),
    message: "Choose up to three cards to resolve the key moment."
  };

  const rerender = () => {
    renderApp(root, { run: state.run, hand: state.deck.hand, message: state.message });
  };

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest<HTMLButtonElement>("[data-card-id]");
    if (!button) return;

    try {
      const cardId = button.dataset.cardId;
      if (!cardId) {
        throw new Error("Missing card id");
      }

      const label = button.textContent ? button.textContent.trim() : "card";
      state = {
        ...state,
        deck: playCard(state.deck, cardId),
        message: `Played ${label}.`
      };
    } catch (error) {
      state = {
        ...state,
        message: error instanceof Error ? error.message : "Could not play card."
      };
    }

    rerender();
  });

  rerender();
}
