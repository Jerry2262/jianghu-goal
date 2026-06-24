import { afterEach, describe, expect, it, vi } from "vitest";
import { startPrototype } from "../../src/ui/controller";

describe("startPrototype", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("aborts the replaced controller and keeps the active one isolated", () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const root = document.createElement("div");

    const cleanup1 = startPrototype(root);
    expect(abortSpy).not.toHaveBeenCalled();

    const firstButton = root.querySelector(".hand button.card[data-card-id]");
    expect(firstButton).toBeInstanceOf(HTMLButtonElement);

    const cleanup2 = startPrototype(root);
    expect(abortSpy).toHaveBeenCalledTimes(1);

    const initialButtons = root.querySelectorAll(".hand button.card[data-card-id]");
    const initialLog = root.querySelector(".log");

    expect(initialButtons).toHaveLength(5);
    expect(initialLog?.textContent).toContain("Choose up to three cards");

    firstButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const buttonsAfterDetachedClick = root.querySelectorAll(".hand button.card[data-card-id]");
    const logAfterDetachedClick = root.querySelector(".log");

    expect(buttonsAfterDetachedClick).toHaveLength(initialButtons.length);
    expect(logAfterDetachedClick?.textContent).toContain("Choose up to three cards");
    expect(abortSpy).toHaveBeenCalledTimes(1);

    const currentButton = root.querySelector(".hand button.card[data-card-id]");
    expect(currentButton).toBeInstanceOf(HTMLButtonElement);

    currentButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const buttonsAfterCurrentClick = root.querySelectorAll(".hand button.card[data-card-id]");
    const logAfterCurrentClick = root.querySelector(".log");

    expect(buttonsAfterCurrentClick).toHaveLength(initialButtons.length - 1);
    expect(logAfterCurrentClick?.textContent?.startsWith("Played ")).toBe(true);

    cleanup1();
    expect(abortSpy).toHaveBeenCalledTimes(1);

    cleanup2();
    expect(abortSpy).toHaveBeenCalledTimes(2);
  });
});
