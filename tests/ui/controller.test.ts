import { describe, expect, it } from "vitest";
import { startPrototype } from "../../src/ui/controller";

describe("startPrototype", () => {
  it("does not stack click handling across repeated starts", () => {
    const root = document.createElement("div");
    const cleanupFirst = startPrototype(root);
    const cleanupSecond = startPrototype(root);

    const initialButtons = root.querySelectorAll(".hand button.card[data-card-id]");
    const firstButton = initialButtons[0];

    expect(firstButton).toBeInstanceOf(HTMLButtonElement);

    firstButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const nextButtons = root.querySelectorAll(".hand button.card[data-card-id]");
    const log = root.querySelector(".log");

    expect(nextButtons).toHaveLength(initialButtons.length - 1);
    expect(log?.textContent?.startsWith("Played ")).toBe(true);

    cleanupFirst();
    cleanupSecond();
  });
});
