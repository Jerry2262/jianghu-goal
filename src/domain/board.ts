import { BOARD_COLUMNS, BOARD_LANES, type BoardCell } from "./types";

export interface BoardState {
  ball: BoardCell;
  allies: Record<string, BoardCell>;
  opponents: Record<string, BoardCell>;
  pressureMarkers: BoardCell[];
}

export function createInitialBoard(): BoardState {
  return {
    ball: { lane: "center", column: "midfield" },
    allies: {
      "lin-qing": { lane: "center", column: "midfield" },
      "zhou-yun": { lane: "top", column: "attack" },
      "han-shi": { lane: "bottom", column: "buildup" },
      "mo-ren": { lane: "center", column: "defense" }
    },
    opponents: {
      marker: { lane: "center", column: "attack" }
    },
    pressureMarkers: []
  };
}

export function isAdjacentPass(from: BoardCell, to: BoardCell): boolean {
  const columnDistance = Math.abs(BOARD_COLUMNS.indexOf(from.column) - BOARD_COLUMNS.indexOf(to.column));
  const laneDistance = Math.abs(BOARD_LANES.indexOf(from.lane) - BOARD_LANES.indexOf(to.lane));
  return columnDistance === 1 && laneDistance <= 1;
}

export function moveBall(board: BoardState, to: BoardCell): BoardState {
  if (!isAdjacentPass(board.ball, to)) {
    throw new Error(`Illegal ball movement from ${board.ball.lane}/${board.ball.column} to ${to.lane}/${to.column}`);
  }

  return { ...board, ball: to };
}

export function pressureAt(board: BoardState, cell: BoardCell): boolean {
  return board.pressureMarkers.some((marker) => marker.lane === cell.lane && marker.column === cell.column);
}
