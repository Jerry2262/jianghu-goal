import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/domain/run";
import { renderApp } from "../../src/ui/render";

describe("renderApp", () => {
  it("renders tournament, reputation, board, and hand areas", () => {
    const root = document.createElement("div");

    renderApp(root, {
      run: createRunState(),
      message: "Choose a card",
      hand: [
        { id: "calm-first-touch", name: "Calm First Touch", type: "martial", sectId: "wudang", cost: 0, tags: ["pass"], text: "Gain 1 momentum if pressured." }
      ]
    });

    const pitch = root.querySelector(".pitch") ?? root.querySelector('[aria-label="Tactical board"]');
    const cells = root.querySelectorAll(".cell");
    const cardButton = root.querySelector(".card");
    const log = root.querySelector(".log");

    expect(root.textContent).toContain("Jianghu Goal");
    expect(root.textContent).toContain("Reputation: 5");
    expect(root.textContent).toContain("Group Stage");
    expect(root.textContent).toContain("Calm First Touch");
    expect(pitch).toBeTruthy();
    expect(cells).toHaveLength(15);
    const ballCells = Array.from(cells).filter((cell) => cell.textContent === "B");
    expect(ballCells).toHaveLength(1);
    expect(cardButton).toBeInstanceOf(HTMLButtonElement);
    expect(cardButton?.getAttribute("data-card-id")).toBe("calm-first-touch");
    expect(log?.textContent).toContain("Choose a card");
  });
});
