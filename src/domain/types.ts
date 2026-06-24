export const BOARD_COLUMNS = ["defense", "buildup", "midfield", "attack", "box"] as const;
export const BOARD_LANES = ["top", "center", "bottom"] as const;

export type BoardColumn = (typeof BOARD_COLUMNS)[number];
export type BoardLane = (typeof BOARD_LANES)[number];

export type Position = "forward" | "midfielder" | "defender" | "goalkeeper";
export type CardType = "martial" | "disciple" | "formation" | "status";
export type CardTag = "pass" | "shot" | "defense" | "movement" | "pressure" | "chaos" | "spirit";

export interface BoardCell {
  lane: BoardLane;
  column: BoardColumn;
}

export interface Sect {
  id: string;
  name: string;
  playable: boolean;
  style: string;
}

export interface Disciple {
  id: string;
  name: string;
  sectId: string;
  position: Position;
  technique: number;
  movement: number;
  spirit: number;
  trait: string;
  stamina: number;
  maxStamina: number;
}

interface BaseCard {
  id: string;
  name: string;
  cost: number;
  tags: CardTag[];
  text: string;
  exhausts?: boolean;
}

export interface MartialCard extends BaseCard {
  type: "martial";
  sectId: string;
}

export interface FormationCard extends BaseCard {
  type: "formation";
  sectId: string;
}

export interface DiscipleCard extends BaseCard {
  type: "disciple";
  ownerDiscipleId: string;
}

export interface StatusCard extends BaseCard {
  type: "status";
}

export type Card = MartialCard | FormationCard | DiscipleCard | StatusCard;

export interface OpponentSect {
  id: string;
  name: string;
  rating: number;
  style: string;
}
