import { describe, expect, it } from "vitest";
import { startPrototype } from "../../src/ui/controller";

describe("startPrototype", () => {
  it("does not stack click handling across repeated starts", () => {
    const root = document.createElement("div");
    const cleanupFirst = startPrototype(root);
    const firstButton = root.querySelector(".hand button.card[data-card-id]");

    expect(firstButton).toBeInstanceOf(HTMLButtonElement);

    const cleanupSecond = startPrototype(root);
    const detachedButton = firstButton;
    const initialVisibleButtons = root.querySelectorAll(".hand button.card[data-card-id]");
    const initialLog = root.querySelector(".log");

    expect(initialVisibleButtons).toHaveLength(5);
    expect(initialLog?.textContent).toContain("Choose up to three cards");

    detachedButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const buttonsAfterDetachedClick = root.querySelectorAll(".hand button.card[data-card-id]");
    const logAfterDetachedClick = root.querySelector(".log");

    expect(buttonsAfterDetachedClick).toHaveLength(initialVisibleButtons.length);
    expect(logAfterDetachedClick?.textContent).toContain("Choose up to three cards");

    const currentButton = root.querySelector(".hand button.card[data-card-id]");
    expect(currentButton).toBeInstanceOf(HTMLButtonElement);

    currentButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const buttonsAfterCurrentClick = root.querySelectorAll(".hand button.card[data-card-id]");
    const logAfterCurrentClick = root.querySelector(".log");

    expect(buttonsAfterCurrentClick).toHaveLength(initialVisibleButtons.length - 1);
    expect(logAfterCurrentClick?.textContent?.startsWith("Played ")).toBe(true);

    cleanupFirst();
    cleanupSecond();
  });
});
