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

function openingInstruction(): string {
  return "先打出一张 0 费或 1 费牌，观察手牌和气势如何变化。";
}

function playedInstruction(label: string, deck: DeckState): string {
  if (deck.playsRemaining <= 0) {
    return `已打出：${label}。这个关键回合的三次出牌已用完，最小循环已经跑通。`;
  }

  if (deck.hand.length === 0) {
    return `已打出：${label}。手牌已用完，最小循环已经跑通。`;
  }

  return `已打出：${label}。还可以继续打牌，也可以先观察气势和手牌变化。`;
}

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
      message: openingInstruction()
    };
  } catch (error) {
    renderStartupError(root, error instanceof Error ? error.message : "无法启动原型。");
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
        message: "缺少卡牌编号"
      };
      rerender();
      return;
    }

    const label = button.querySelector("strong")?.textContent?.trim() ?? "卡牌";

    try {
      const nextDeck = playCard(state.deck, cardId);
      state = {
        ...state,
        deck: nextDeck,
        message: playedInstruction(label, nextDeck)
      };
    } catch (error) {
      state = {
        ...state,
        message: error instanceof Error ? error.message : "无法打出这张牌。"
      };
    }

    rerender();
  };

  root.addEventListener("click", handleClick, { signal: abortController.signal });
  rerender();

  const cleanup = () => {
    if (activeCleanups.get(root) !== cleanup) {
      return;
    }

    activeCleanups.delete(root);
    abortController.abort();
  };

  activeCleanups.set(root, cleanup);
  return cleanup;
}
