import { describe, expect, it } from "vitest";
import { createInitialBoard, moveBall, isAdjacentPass, pressureAt } from "../../src/domain/board";

describe("board", () => {
  it("creates a 5x3 tactical board with the ball in midfield center", () => {
    const board = createInitialBoard();

    expect(board.ball).toEqual({ lane: "center", column: "midfield" });
    expect(board.pressureMarkers).toEqual([]);
  });

  it("allows same-lane and one-lane diagonal passes", () => {
    expect(isAdjacentPass({ lane: "center", column: "midfield" }, { lane: "center", column: "attack" })).toBe(true);
    expect(isAdjacentPass({ lane: "center", column: "midfield" }, { lane: "top", column: "attack" })).toBe(true);
    expect(isAdjacentPass({ lane: "bottom", column: "defense" }, { lane: "top", column: "box" })).toBe(false);
  });

  it("moves the ball to a legal adjacent cell", () => {
    const board = moveBall(createInitialBoard(), { lane: "top", column: "attack" });

    expect(board.ball).toEqual({ lane: "top", column: "attack" });
  });

  it("checks pressure at a discrete cell", () => {
    const board = { ...createInitialBoard(), pressureMarkers: [{ lane: "center" as const, column: "midfield" as const }] };

    expect(pressureAt(board, { lane: "center", column: "midfield" })).toBe(true);
    expect(pressureAt(board, { lane: "top", column: "midfield" })).toBe(false);
  });
});
