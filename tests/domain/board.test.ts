import { describe, expect, it } from "vitest";
import { createInitialBoard, moveBall, isAdjacentPass, pressureAt } from "../../src/domain/board";
import type { BoardCell } from "../../src/domain/types";

describe("board", () => {
  it("creates a 5x3 tactical board with the ball in midfield center", () => {
    const board = createInitialBoard();

    expect(board.ball).toEqual({ lane: "center", column: "midfield" });
    expect(board.allies).toEqual({
      "lin-qing": { lane: "center", column: "midfield" },
      "zhou-yun": { lane: "top", column: "attack" },
      "han-shi": { lane: "bottom", column: "buildup" },
      "mo-ren": { lane: "center", column: "defense" }
    });
    expect(board.opponents).toEqual({
      marker: { lane: "center", column: "attack" }
    });
    expect(board.pressureMarkers).toEqual([]);
  });

  it("allows same-lane and one-lane diagonal passes", () => {
    expect(isAdjacentPass({ lane: "center", column: "midfield" }, { lane: "center", column: "attack" })).toBe(true);
    expect(isAdjacentPass({ lane: "center", column: "midfield" }, { lane: "top", column: "attack" })).toBe(true);
    expect(isAdjacentPass({ lane: "bottom", column: "defense" }, { lane: "top", column: "box" })).toBe(false);
  });

  it("returns false for invalid pass cells", () => {
    expect(
      isAdjacentPass({ lane: "center", column: "midfield" }, { lane: "center", column: "bad" } as unknown as BoardCell)
    ).toBe(false);
    expect(
      isAdjacentPass({ lane: "bad", column: "midfield" } as unknown as BoardCell, { lane: "center", column: "attack" })
    ).toBe(false);
  });

  it("moves the ball to a legal adjacent cell", () => {
    const board = moveBall(createInitialBoard(), { lane: "top", column: "attack" });

    expect(board.ball).toEqual({ lane: "top", column: "attack" });
  });

  it("rejects invalid board cells when moving the ball", () => {
    expect(() => moveBall(createInitialBoard(), { lane: "bottom", column: "bad" } as unknown as BoardCell)).toThrow(
      "Invalid board cell"
    );
  });

  it("clones the destination and nested collections when moving the ball", () => {
    const board = createInitialBoard();
    const destination = { lane: "top", column: "attack" } as const;

    const next = moveBall(board, destination);

    expect(next.ball).toEqual({ lane: "top", column: "attack" });
    expect(next.ball).not.toBe(destination);
    expect(next.allies).not.toBe(board.allies);
    expect(next.opponents).not.toBe(board.opponents);
    expect(next.pressureMarkers).not.toBe(board.pressureMarkers);

    const mutableDestination: BoardCell = { lane: "top", column: "attack" };
    const moved = moveBall(board, mutableDestination);
    mutableDestination.lane = "center";
    mutableDestination.column = "defense";

    expect(moved.ball).toEqual({ lane: "top", column: "attack" });
  });

  it("rejects illegal ball movement", () => {
    expect(() => moveBall(createInitialBoard(), { lane: "bottom", column: "box" })).toThrow(
      "Illegal ball movement from center/midfield to bottom/box"
    );
  });

  it("checks pressure at a discrete cell", () => {
    const board = { ...createInitialBoard(), pressureMarkers: [{ lane: "center" as const, column: "midfield" as const }] };

    expect(pressureAt(board, { lane: "center", column: "midfield" })).toBe(true);
    expect(pressureAt(board, { lane: "top", column: "midfield" })).toBe(false);
  });
});
