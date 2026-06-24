import { demoCards } from "../content/demo";
import { createDeckState, drawForMoment, playCard, type DeckState } from "../domain/deck";
import { createRunState, type RunState } from "../domain/run";
import { renderApp } from "./render";

interface ControllerState {
  run: RunState;
  deck: DeckState;
  message: string;
}

const activeCleanups = new WeakMap<HTMLElement, () => void>();

function renderStartupError(root: HTMLElement, message: string): void {
  const shell = document.createElement("section");
  shell.className = "shell";

  const error = document.createElement("div");
  error.className = "log";
  error.textContent = message;

  shell.append(error);
  root.replaceChildren(shell);
}

export function startPrototype(root: HTMLElement): () => void {
  const previousCleanup = activeCleanups.get(root);
  if (previousCleanup) {
    previousCleanup();
  }

  const abortController = new AbortController();

  let state: ControllerState;

  try {
    state = {
      run: createRunState(),
      deck: drawForMoment(createDeckState(demoCards.filter((card) => card.type !== "status"))),
      message: "Choose up to three cards to resolve the key moment."
    };
  } catch (error) {
    renderStartupError(root, error instanceof Error ? error.message : "Could not start prototype.");
    return () => abortController.abort();
  }

  const rerender = () => {
    renderApp(root, { run: state.run, hand: state.deck.hand, message: state.message });
  };

  const handleClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest(".hand button.card[data-card-id]");
    if (!(button instanceof HTMLButtonElement)) return;

    const cardId = button.dataset.cardId;
    if (!cardId) {
      state = {
        ...state,
        message: "Missing card id"
      };
      rerender();
      return;
    }

    const label = button.querySelector("strong")?.textContent?.trim() ?? "card";

    try {
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
  };

  root.addEventListener("click", handleClick, { signal: abortController.signal });
  rerender();

  const cleanup = () => {
    if (activeCleanups.get(root) === cleanup) {
      activeCleanups.delete(root);
    }

    abortController.abort();
  };

  activeCleanups.set(root, cleanup);
  return cleanup;
}
