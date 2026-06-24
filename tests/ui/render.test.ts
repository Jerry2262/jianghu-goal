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

    expect(root.textContent).toContain("Jianghu Goal");
    expect(root.textContent).toContain("Reputation: 5");
    expect(root.textContent).toContain("Group Stage");
    expect(root.textContent).toContain("Calm First Touch");
  });
});
