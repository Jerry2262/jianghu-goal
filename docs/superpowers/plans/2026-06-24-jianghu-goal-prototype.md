# Jianghu Goal Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-playable prototype that validates Jianghu Goal's 5x3 tactical board, card-driven key moments, group-stage tournament, and short run loop.

**Architecture:** Use a small TypeScript domain core with deterministic functions for tournament, deck, board, match, and run state. Keep UI as a thin browser layer that renders domain state and dispatches player choices into pure reducers, so the core gameplay can be tested without a browser.

**Tech Stack:** TypeScript, Vite, Vitest, jsdom, vanilla HTML/CSS.

---

## File Structure

- `package.json`: npm scripts and dev dependencies.
- `index.html`: Vite entry document.
- `tsconfig.json`: TypeScript compiler settings.
- `vitest.config.ts`: Vitest configuration using jsdom.
- `src/main.ts`: browser entry point.
- `src/styles.css`: pixel/ink visual styling for the prototype UI.
- `src/domain/types.ts`: shared domain types and constants.
- `src/content/demo.ts`: demo sects, disciples, cards, opponents, and key moments.
- `src/domain/tournament.ts`: group table, tie-breakers, knockout progression.
- `src/domain/deck.ts`: draw pile, hand, discard, exhaust, and shuffle utilities.
- `src/domain/board.ts`: 5x3 board helpers, lane/column movement, pressure checks.
- `src/domain/match.ts`: key moment resolution, score, sudden death, match result.
- `src/domain/run.ts`: full run state, rewards, reputation, and stage transitions.
- `src/domain/progression.ts`: between-match events, rewards, unlocks, and one-item inheritance.
- `src/ui/render.ts`: pure DOM rendering for app state.
- `src/ui/controller.ts`: UI event handling and state transitions.
- `tests/domain/*.test.ts`: unit tests for domain modules.
- `tests/ui/render.test.ts`: DOM rendering smoke tests.

---

### Task 1: Project Scaffold And Test Harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/main.ts`
- Create: `src/styles.css`
- Create: `tests/smoke.test.ts`

- [ ] **Step 1: Create npm package metadata**

Create `package.json`:

```json
{
  "name": "jianghu-goal",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "jsdom": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Create TypeScript and Vitest config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src", "tests", "vitest.config.ts"]
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts"]
  }
});
```

- [ ] **Step 3: Create browser entry files**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jianghu Goal</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Create `src/main.ts`:

```ts
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root");
}

app.innerHTML = `
  <section class="shell">
    <h1>Jianghu Goal</h1>
    <p>Prototype booted.</p>
  </section>
`;
```

Create `src/styles.css`:

```css
:root {
  color: #1f261f;
  background: #e8dfca;
  font-family: ui-monospace, "Cascadia Mono", "SFMono-Regular", Menlo, Consolas, monospace;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button {
  font: inherit;
}

.shell {
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 24px 0;
}
```

- [ ] **Step 4: Write smoke test**

Create `tests/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("runs TypeScript tests", () => {
    expect("Jianghu Goal").toContain("Goal");
  });
});
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`

Expected: npm creates `package-lock.json` and installs Vite, TypeScript, Vitest, and jsdom.

- [ ] **Step 6: Run tests**

Run: `npm test`

Expected: PASS with `tests/smoke.test.ts`.

- [ ] **Step 7: Commit scaffold**

```bash
git add package.json package-lock.json index.html tsconfig.json vitest.config.ts src/main.ts src/styles.css tests/smoke.test.ts
git commit -m "chore: scaffold jianghu goal prototype"
```

---

### Task 2: Domain Types And Demo Content

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/content/demo.ts`
- Create: `tests/domain/content.test.ts`

- [ ] **Step 1: Write failing content tests**

Create `tests/domain/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { BOARD_COLUMNS, BOARD_LANES } from "../../src/domain/types";
import { demoCards, demoDisciples, demoOpponents, demoSects } from "../../src/content/demo";

describe("demo content", () => {
  it("uses the agreed 5x3 board shape", () => {
    expect(BOARD_COLUMNS).toEqual(["defense", "buildup", "midfield", "attack", "box"]);
    expect(BOARD_LANES).toEqual(["top", "center", "bottom"]);
  });

  it("contains one playable sect and three group-stage opponents for the first prototype", () => {
    expect(demoSects.filter((sect) => sect.playable)).toHaveLength(1);
    expect(demoOpponents).toHaveLength(3);
  });

  it("keeps the first prototype card pool small", () => {
    expect(demoCards.length).toBeGreaterThanOrEqual(12);
    expect(demoCards.length).toBeLessThanOrEqual(15);
  });

  it("gives every disciple one linked disciple card", () => {
    for (const disciple of demoDisciples) {
      expect(demoCards.some((card) => card.ownerDiscipleId === disciple.id)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/domain/content.test.ts`

Expected: FAIL because `src/domain/types.ts` and `src/content/demo.ts` do not exist.

- [ ] **Step 3: Implement shared domain types**

Create `src/domain/types.ts`:

```ts
export const BOARD_COLUMNS = ["defense", "buildup", "midfield", "attack", "box"] as const;
export const BOARD_LANES = ["top", "center", "bottom"] as const;

export type BoardColumn = (typeof BOARD_COLUMNS)[number];
export type BoardLane = (typeof BOARD_LANES)[number];
export type TeamId = "player" | "opponent";

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

export interface Card {
  id: string;
  name: string;
  type: CardType;
  sectId?: string;
  ownerDiscipleId?: string;
  cost: number;
  tags: CardTag[];
  text: string;
  exhausts?: boolean;
}

export interface OpponentSect {
  id: string;
  name: string;
  rating: number;
  style: string;
}
```

- [ ] **Step 4: Implement demo content**

Create `src/content/demo.ts`:

```ts
import type { Card, Disciple, OpponentSect, Sect } from "../domain/types";

export const demoSects: Sect[] = [
  { id: "wudang", name: "Wudang", playable: true, style: "Controlled passing and pressure release" },
  { id: "shaolin", name: "Shaolin", playable: false, style: "Defensive duels and box survival" },
  { id: "beggar", name: "Beggar Sect", playable: false, style: "Scrambles, steals, and chaos chains" },
  { id: "iron-palm", name: "Iron Palm Hall", playable: false, style: "Direct pressure and hard shots" }
];

export const demoOpponents: OpponentSect[] = [
  { id: "shaolin", name: "Shaolin", rating: 2, style: "Blocks shots and wins contact" },
  { id: "beggar", name: "Beggar Sect", rating: 2, style: "Creates loose balls and steals momentum" },
  { id: "iron-palm", name: "Iron Palm Hall", rating: 3, style: "Pressures the box with power shots" }
];

export const demoDisciples: Disciple[] = [
  { id: "lin-qing", name: "Lin Qing", sectId: "wudang", position: "midfielder", technique: 3, movement: 2, spirit: 2, trait: "Gains momentum after two passes in one moment", stamina: 5, maxStamina: 5 },
  { id: "zhou-yun", name: "Zhou Yun", sectId: "wudang", position: "forward", technique: 3, movement: 3, spirit: 2, trait: "Shots cost 1 less momentum in stoppage time", stamina: 4, maxStamina: 4 },
  { id: "han-shi", name: "Han Shi", sectId: "wudang", position: "defender", technique: 2, movement: 2, spirit: 3, trait: "Blocks generate 1 momentum", stamina: 5, maxStamina: 5 },
  { id: "mo-ren", name: "Mo Ren", sectId: "wudang", position: "goalkeeper", technique: 2, movement: 1, spirit: 4, trait: "First save each match restores 1 reputation on a clean sheet", stamina: 4, maxStamina: 4 }
];

export const demoCards: Card[] = [
  { id: "tai-chi-deflection", name: "Tai Chi Deflection", type: "martial", sectId: "wudang", cost: 1, tags: ["defense", "movement"], text: "Cancel one pressure marker and move the ball one lane." },
  { id: "cloud-step-pass", name: "Cloud Step Pass", type: "martial", sectId: "wudang", cost: 1, tags: ["pass", "movement"], text: "Pass through a marked lane if the receiver has movement 3+." },
  { id: "soft-overcomes-hard", name: "Soft Overcomes Hard", type: "martial", sectId: "wudang", cost: 2, tags: ["defense", "spirit"], text: "Convert opponent pressure into 2 momentum." },
  { id: "crane-wing-shift", name: "Crane Wing Shift", type: "formation", sectId: "wudang", cost: 1, tags: ["movement"], text: "Move two allied disciples one lane." },
  { id: "threaded-through-ball", name: "Threaded Through Ball", type: "martial", sectId: "wudang", cost: 2, tags: ["pass"], text: "Move the ball from midfield to attack if a passing lane is open." },
  { id: "calm-first-touch", name: "Calm First Touch", type: "martial", sectId: "wudang", cost: 0, tags: ["pass", "spirit"], text: "Gain 1 momentum if the ball is under pressure." },
  { id: "lin-qing-orbit-pass", name: "Lin Qing: Orbit Pass", type: "disciple", ownerDiscipleId: "lin-qing", cost: 1, tags: ["pass"], text: "Complete a safe pass and gain 1 momentum if this is the second pass this moment." },
  { id: "zhou-yun-cloud-shot", name: "Zhou Yun: Cloud Shot", type: "disciple", ownerDiscipleId: "zhou-yun", cost: 2, tags: ["shot"], text: "Create a shot from attack or box. Technique 3+ adds +1 shot power." },
  { id: "han-shi-sleeve-block", name: "Han Shi: Sleeve Block", type: "disciple", ownerDiscipleId: "han-shi", cost: 1, tags: ["defense"], text: "Block a shot lane. Spirit 3+ grants 1 momentum." },
  { id: "mo-ren-still-water-save", name: "Mo Ren: Still Water Save", type: "disciple", ownerDiscipleId: "mo-ren", cost: 2, tags: ["defense", "spirit"], text: "Prevent one goal unless the opponent has two pressure markers in the box." },
  { id: "marked-lane", name: "Marked Lane", type: "status", cost: 0, tags: ["pressure"], text: "This lane counts as pressured until cleared.", exhausts: true },
  { id: "muddy-pitch", name: "Muddy Pitch", type: "status", cost: 0, tags: ["chaos"], text: "Movement cards cost 1 extra this moment.", exhausts: true }
];
```

- [ ] **Step 5: Run content tests**

Run: `npm test -- tests/domain/content.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit domain content**

```bash
git add src/domain/types.ts src/content/demo.ts tests/domain/content.test.ts
git commit -m "feat: add prototype domain content"
```

---

### Task 3: Tournament Standings And Advancement

**Files:**
- Create: `src/domain/tournament.ts`
- Create: `tests/domain/tournament.test.ts`

- [ ] **Step 1: Write failing tournament tests**

Create `tests/domain/tournament.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createGroupTable, recordResult, rankedStandings, topTwoAdvance } from "../../src/domain/tournament";

describe("tournament", () => {
  it("awards 3 points for a win and 1 for a draw", () => {
    let table = createGroupTable(["player", "shaolin", "beggar", "iron-palm"]);
    table = recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: 2, awayGoals: 1 });
    table = recordResult(table, { homeId: "beggar", awayId: "iron-palm", homeGoals: 0, awayGoals: 0 });

    expect(table.player.points).toBe(3);
    expect(table.shaolin.points).toBe(0);
    expect(table.beggar.points).toBe(1);
    expect(table["iron-palm"].points).toBe(1);
  });

  it("ranks by points, goal difference, then goals scored", () => {
    let table = createGroupTable(["player", "shaolin", "beggar", "iron-palm"]);
    table = recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "beggar", awayId: "iron-palm", homeGoals: 3, awayGoals: 1 });
    table = recordResult(table, { homeId: "player", awayId: "beggar", homeGoals: 2, awayGoals: 2 });
    table = recordResult(table, { homeId: "shaolin", awayId: "iron-palm", homeGoals: 1, awayGoals: 1 });

    expect(rankedStandings(table).map((row) => row.teamId)).toEqual(["beggar", "player", "shaolin", "iron-palm"]);
  });

  it("returns top two advancing teams", () => {
    let table = createGroupTable(["player", "shaolin", "beggar", "iron-palm"]);
    table = recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: 2, awayGoals: 0 });
    table = recordResult(table, { homeId: "beggar", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });

    expect(topTwoAdvance(table)).toEqual(["player", "beggar"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/domain/tournament.test.ts`

Expected: FAIL because `src/domain/tournament.ts` does not exist.

- [ ] **Step 3: Implement tournament table**

Create `src/domain/tournament.ts`:

```ts
export interface MatchScore {
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
}

export interface Standing {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export type GroupTable = Record<string, Standing>;

export function createGroupTable(teamIds: string[]): GroupTable {
  return Object.fromEntries(
    teamIds.map((teamId) => [
      teamId,
      {
        teamId,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }
    ])
  );
}

export function recordResult(table: GroupTable, score: MatchScore): GroupTable {
  const next = structuredClone(table);
  applyTeamResult(next[score.homeId], score.homeGoals, score.awayGoals);
  applyTeamResult(next[score.awayId], score.awayGoals, score.homeGoals);
  return next;
}

export function rankedStandings(table: GroupTable): Standing[] {
  return Object.values(table).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId.localeCompare(b.teamId);
  });
}

export function topTwoAdvance(table: GroupTable): string[] {
  return rankedStandings(table)
    .slice(0, 2)
    .map((standing) => standing.teamId);
}

function applyTeamResult(row: Standing, goalsFor: number, goalsAgainst: number): void {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    row.wins += 1;
    row.points += 3;
  } else if (goalsFor === goalsAgainst) {
    row.draws += 1;
    row.points += 1;
  } else {
    row.losses += 1;
  }
}
```

- [ ] **Step 4: Run tournament tests**

Run: `npm test -- tests/domain/tournament.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit tournament logic**

```bash
git add src/domain/tournament.ts tests/domain/tournament.test.ts
git commit -m "feat: add group-stage tournament standings"
```

---

### Task 4: Deck, Hand, Discard, Exhaust, And Momentum

**Files:**
- Create: `src/domain/deck.ts`
- Create: `tests/domain/deck.test.ts`

- [ ] **Step 1: Write failing deck tests**

Create `tests/domain/deck.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Card } from "../../src/domain/types";
import { createDeckState, drawForMoment, playCard, endMoment } from "../../src/domain/deck";

const cards: Card[] = Array.from({ length: 6 }, (_, index) => ({
  id: `card-${index + 1}`,
  name: `Card ${index + 1}`,
  type: "martial",
  cost: index === 0 ? 0 : 1,
  tags: ["pass"],
  text: "Test card"
}));

describe("deck", () => {
  it("draws five cards and starts each key moment with three momentum", () => {
    const state = drawForMoment(createDeckState(cards));

    expect(state.hand).toHaveLength(5);
    expect(state.momentum).toBe(3);
    expect(state.playsRemaining).toBe(3);
  });

  it("moves played cards to discard and spends momentum", () => {
    let state = drawForMoment(createDeckState(cards));
    state = playCard(state, state.hand[1].id);

    expect(state.momentum).toBe(2);
    expect(state.playsRemaining).toBe(2);
    expect(state.discard.map((card) => card.id)).toContain("card-2");
  });

  it("discards unplayed hand at moment end", () => {
    let state = drawForMoment(createDeckState(cards));
    state = playCard(state, state.hand[0].id);
    state = endMoment(state);

    expect(state.hand).toHaveLength(0);
    expect(state.discard.length + state.drawPile.length + state.exhaust.length).toBe(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/domain/deck.test.ts`

Expected: FAIL because `src/domain/deck.ts` does not exist.

- [ ] **Step 3: Implement deck state**

Create `src/domain/deck.ts`:

```ts
import type { Card } from "./types";

export interface DeckState {
  drawPile: Card[];
  hand: Card[];
  discard: Card[];
  exhaust: Card[];
  momentum: number;
  playsRemaining: number;
}

export function createDeckState(cards: Card[]): DeckState {
  return {
    drawPile: [...cards],
    hand: [],
    discard: [],
    exhaust: [],
    momentum: 0,
    playsRemaining: 0
  };
}

export function drawForMoment(state: DeckState): DeckState {
  let next = { ...state, drawPile: [...state.drawPile], hand: [], discard: [...state.discard], exhaust: [...state.exhaust], momentum: 3, playsRemaining: 3 };

  while (next.hand.length < 5) {
    if (next.drawPile.length === 0) {
      if (next.discard.length === 0) break;
      next = { ...next, drawPile: [...next.discard], discard: [] };
    }

    const card = next.drawPile.shift();
    if (card) {
      next.hand.push(card);
    }
  }

  return next;
}

export function playCard(state: DeckState, cardId: string): DeckState {
  const card = state.hand.find((candidate) => candidate.id === cardId);

  if (!card) {
    throw new Error(`Card not in hand: ${cardId}`);
  }

  if (state.playsRemaining <= 0) {
    throw new Error("No plays remaining");
  }

  if (card.cost > state.momentum) {
    throw new Error(`Not enough momentum for ${card.name}`);
  }

  return {
    ...state,
    hand: state.hand.filter((candidate) => candidate.id !== cardId),
    discard: card.exhausts ? state.discard : [...state.discard, card],
    exhaust: card.exhausts ? [...state.exhaust, card] : state.exhaust,
    momentum: state.momentum - card.cost,
    playsRemaining: state.playsRemaining - 1
  };
}

export function gainMomentum(state: DeckState, amount: number): DeckState {
  return { ...state, momentum: state.momentum + amount };
}

export function endMoment(state: DeckState): DeckState {
  return {
    ...state,
    hand: [],
    discard: [...state.discard, ...state.hand],
    momentum: 0,
    playsRemaining: 0
  };
}
```

- [ ] **Step 4: Run deck tests**

Run: `npm test -- tests/domain/deck.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit deck logic**

```bash
git add src/domain/deck.ts tests/domain/deck.test.ts
git commit -m "feat: add deck and momentum loop"
```

---

### Task 5: Tactical Board Helpers

**Files:**
- Create: `src/domain/board.ts`
- Create: `tests/domain/board.test.ts`

- [ ] **Step 1: Write failing board tests**

Create `tests/domain/board.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/domain/board.test.ts`

Expected: FAIL because `src/domain/board.ts` does not exist.

- [ ] **Step 3: Implement board helpers**

Create `src/domain/board.ts`:

```ts
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
```

- [ ] **Step 4: Run board tests**

Run: `npm test -- tests/domain/board.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit board helpers**

```bash
git add src/domain/board.ts tests/domain/board.test.ts
git commit -m "feat: add tactical board helpers"
```

---

### Task 6: Match Engine And Key Moment Resolution

**Files:**
- Create: `src/domain/match.ts`
- Create: `tests/domain/match.test.ts`

- [ ] **Step 1: Write failing match tests**

Create `tests/domain/match.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createMatchState, resolveMoment, finishMatch } from "../../src/domain/match";

describe("match engine", () => {
  it("adds a goal when an attacking moment succeeds with a shot card", () => {
    let match = createMatchState("group", "shaolin");
    match = resolveMoment(match, { outcome: "player-goal" });

    expect(match.playerGoals).toBe(1);
    expect(match.opponentGoals).toBe(0);
    expect(match.resolvedMoments).toBe(1);
  });

  it("records opponent goals on failed defense", () => {
    let match = createMatchState("group", "shaolin");
    match = resolveMoment(match, { outcome: "opponent-goal" });

    expect(match.opponentGoals).toBe(1);
  });

  it("allows group-stage draws without sudden death", () => {
    const match = createMatchState("group", "shaolin");
    const result = finishMatch({ ...match, resolvedMoments: 4, playerGoals: 1, opponentGoals: 1 });

    expect(result.winner).toBe("draw");
    expect(result.needsSuddenDeath).toBe(false);
  });

  it("requires sudden death for knockout draws", () => {
    const match = createMatchState("knockout", "iron-palm");
    const result = finishMatch({ ...match, resolvedMoments: 4, playerGoals: 1, opponentGoals: 1 });

    expect(result.winner).toBe("draw");
    expect(result.needsSuddenDeath).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/domain/match.test.ts`

Expected: FAIL because `src/domain/match.ts` does not exist.

- [ ] **Step 3: Implement match engine**

Create `src/domain/match.ts`:

```ts
export type MatchStage = "group" | "knockout";
export type MomentOutcome = "player-goal" | "opponent-goal" | "save" | "turnover" | "fatigue";
export type Winner = "player" | "opponent" | "draw";

export interface MatchState {
  stage: MatchStage;
  opponentId: string;
  playerGoals: number;
  opponentGoals: number;
  resolvedMoments: number;
  maxMoments: number;
}

export interface MomentResolution {
  outcome: MomentOutcome;
}

export interface MatchResult {
  winner: Winner;
  playerGoals: number;
  opponentGoals: number;
  needsSuddenDeath: boolean;
}

export function createMatchState(stage: MatchStage, opponentId: string): MatchState {
  return {
    stage,
    opponentId,
    playerGoals: 0,
    opponentGoals: 0,
    resolvedMoments: 0,
    maxMoments: 4
  };
}

export function resolveMoment(match: MatchState, resolution: MomentResolution): MatchState {
  const next = { ...match, resolvedMoments: match.resolvedMoments + 1 };

  if (resolution.outcome === "player-goal") {
    next.playerGoals += 1;
  }

  if (resolution.outcome === "opponent-goal") {
    next.opponentGoals += 1;
  }

  return next;
}

export function finishMatch(match: MatchState): MatchResult {
  const winner = getWinner(match.playerGoals, match.opponentGoals);

  return {
    winner,
    playerGoals: match.playerGoals,
    opponentGoals: match.opponentGoals,
    needsSuddenDeath: winner === "draw" && match.stage === "knockout"
  };
}

function getWinner(playerGoals: number, opponentGoals: number): Winner {
  if (playerGoals > opponentGoals) return "player";
  if (opponentGoals > playerGoals) return "opponent";
  return "draw";
}
```

- [ ] **Step 4: Run match tests**

Run: `npm test -- tests/domain/match.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit match engine**

```bash
git add src/domain/match.ts tests/domain/match.test.ts
git commit -m "feat: add key moment match engine"
```

---

### Task 7: Run State, Reputation, And Stage Progression

**Files:**
- Create: `src/domain/run.ts`
- Create: `tests/domain/run.test.ts`

- [ ] **Step 1: Write failing run tests**

Create `tests/domain/run.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRunState, applyGroupResult, canAdvanceFromGroup, applyKnockoutResult } from "../../src/domain/run";

describe("run state", () => {
  it("starts with reputation and a four-team group table", () => {
    const run = createRunState();

    expect(run.reputation).toBe(5);
    expect(Object.keys(run.groupTable)).toHaveLength(4);
    expect(run.stage).toBe("group");
  });

  it("reduces reputation by one after a group-stage loss", () => {
    const run = applyGroupResult(createRunState(), { homeId: "player", awayId: "shaolin", homeGoals: 0, awayGoals: 1 });

    expect(run.reputation).toBe(4);
  });

  it("qualifies the player when they are top two", () => {
    let run = createRunState();
    run = applyGroupResult(run, { homeId: "player", awayId: "shaolin", homeGoals: 2, awayGoals: 0 });
    run = applyGroupResult(run, { homeId: "player", awayId: "beggar", homeGoals: 1, awayGoals: 1 });
    run = applyGroupResult(run, { homeId: "player", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });

    expect(canAdvanceFromGroup(run)).toBe(true);
  });

  it("ends the run after a knockout loss", () => {
    const run = applyKnockoutResult(createRunState(), "opponent");

    expect(run.stage).toBe("ended");
    expect(run.endedReason).toBe("lost knockout match");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/domain/run.test.ts`

Expected: FAIL because `src/domain/run.ts` does not exist.

- [ ] **Step 3: Implement run state**

Create `src/domain/run.ts`:

```ts
import { demoOpponents } from "../content/demo";
import { createGroupTable, recordResult, topTwoAdvance, type GroupTable, type MatchScore } from "./tournament";
import type { Winner } from "./match";

export type RunStage = "group" | "semifinal" | "final" | "won" | "ended";

export interface RunState {
  stage: RunStage;
  reputation: number;
  groupTable: GroupTable;
  groupMatchesPlayed: number;
  endedReason?: string;
}

export function createRunState(): RunState {
  return {
    stage: "group",
    reputation: 5,
    groupTable: createGroupTable(["player", ...demoOpponents.map((opponent) => opponent.id)]),
    groupMatchesPlayed: 0
  };
}

export function applyGroupResult(run: RunState, score: MatchScore): RunState {
  const playerLost = (score.homeId === "player" && score.homeGoals < score.awayGoals) || (score.awayId === "player" && score.awayGoals < score.homeGoals);
  const nextReputation = playerLost ? run.reputation - 1 : run.reputation;
  const next: RunState = {
    ...run,
    reputation: nextReputation,
    groupTable: recordResult(run.groupTable, score),
    groupMatchesPlayed: run.groupMatchesPlayed + 1
  };

  if (next.reputation <= 0) {
    return { ...next, stage: "ended", endedReason: "reputation reached zero" };
  }

  if (next.groupMatchesPlayed >= 3 && !canAdvanceFromGroup(next)) {
    return { ...next, stage: "ended", endedReason: "failed group qualification" };
  }

  if (next.groupMatchesPlayed >= 3) {
    return { ...next, stage: "semifinal" };
  }

  return next;
}

export function canAdvanceFromGroup(run: RunState): boolean {
  return topTwoAdvance(run.groupTable).includes("player");
}

export function applyKnockoutResult(run: RunState, winner: Winner): RunState {
  if (winner !== "player") {
    return { ...run, stage: "ended", endedReason: "lost knockout match" };
  }

  if (run.stage === "semifinal") {
    return { ...run, stage: "final" };
  }

  if (run.stage === "final") {
    return { ...run, stage: "won" };
  }

  return run;
}
```

- [ ] **Step 4: Run run-state tests**

Run: `npm test -- tests/domain/run.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit run state**

```bash
git add src/domain/run.ts tests/domain/run.test.ts
git commit -m "feat: add tournament run state"
```

---

### Task 8: Browser UI For Playable Prototype

**Files:**
- Create: `src/ui/render.ts`
- Create: `src/ui/controller.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Create: `tests/ui/render.test.ts`

- [ ] **Step 1: Write failing UI render test**

Create `tests/ui/render.test.ts`:

```ts
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
        { id: "calm-first-touch", name: "Calm First Touch", type: "martial", cost: 0, tags: ["pass"], text: "Gain 1 momentum if pressured." }
      ]
    });

    expect(root.textContent).toContain("Jianghu Goal");
    expect(root.textContent).toContain("Reputation: 5");
    expect(root.textContent).toContain("Group Stage");
    expect(root.textContent).toContain("Calm First Touch");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ui/render.test.ts`

Expected: FAIL because `src/ui/render.ts` does not exist.

- [ ] **Step 3: Implement render function**

Create `src/ui/render.ts`:

```ts
import type { Card } from "../domain/types";
import type { RunState } from "../domain/run";
import { rankedStandings } from "../domain/tournament";

export interface AppViewState {
  run: RunState;
  message: string;
  hand: Card[];
}

export function renderApp(root: HTMLElement, state: AppViewState): void {
  const stageLabel = state.run.stage === "group" ? "Group Stage" : state.run.stage;
  const standings = rankedStandings(state.run.groupTable);

  root.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <h1>Jianghu Goal</h1>
        <div class="resource">Reputation: ${state.run.reputation}</div>
      </header>
      <section class="layout">
        <aside class="panel">
          <h2>${stageLabel}</h2>
          <ol class="standings">
            ${standings.map((row) => `<li>${row.teamId}: ${row.points} pts (${row.goalDifference})</li>`).join("")}
          </ol>
        </aside>
        <section class="pitch" aria-label="Tactical board">
          ${Array.from({ length: 15 }, (_, index) => `<div class="cell">${index === 7 ? "B" : ""}</div>`).join("")}
        </section>
        <aside class="panel">
          <h2>Hand</h2>
          <div class="hand">
            ${state.hand.map((card) => `<button class="card" data-card-id="${card.id}"><strong>${card.name}</strong><span>${card.cost} momentum</span><p>${card.text}</p></button>`).join("")}
          </div>
        </aside>
      </section>
      <footer class="log">${state.message}</footer>
    </section>
  `;
}
```

- [ ] **Step 4: Implement controller**

Create `src/ui/controller.ts`:

```ts
import { demoCards } from "../content/demo";
import { createDeckState, drawForMoment, playCard, type DeckState } from "../domain/deck";
import { createRunState, type RunState } from "../domain/run";
import { renderApp } from "./render";

interface ControllerState {
  run: RunState;
  deck: DeckState;
  message: string;
}

export function startPrototype(root: HTMLElement): void {
  let state: ControllerState = {
    run: createRunState(),
    deck: drawForMoment(createDeckState(demoCards.filter((card) => card.type !== "status"))),
    message: "Choose up to three cards to resolve the key moment."
  };

  const rerender = () => {
    renderApp(root, { run: state.run, hand: state.deck.hand, message: state.message });
  };

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest<HTMLButtonElement>("[data-card-id]");
    if (!button) return;

    try {
      const cardId = button.dataset.cardId;
      if (!cardId) {
        throw new Error("Missing card id");
      }

      const label = button.textContent ? button.textContent.trim() : "card";
      state = {
        ...state,
        deck: playCard(state.deck, cardId),
        message: `Played ${label}.`
      };
    } catch (error) {
      state = {
        ...state,
        message: error instanceof Error ? error.message : "Could not play card."
      };
    }

    rerender();
  });

  rerender();
}
```

- [ ] **Step 5: Wire browser entry**

Replace `src/main.ts` with:

```ts
import "./styles.css";
import { startPrototype } from "./ui/controller";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root");
}

startPrototype(app);
```

- [ ] **Step 6: Expand styles**

Append to `src/styles.css`:

```css
.topbar,
.layout,
.panel,
.pitch,
.log {
  border: 2px solid #2f3b2f;
  background: rgba(246, 239, 220, 0.86);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.topbar h1 {
  margin: 0;
  font-size: 28px;
}

.resource {
  font-weight: 700;
}

.layout {
  display: grid;
  grid-template-columns: 240px minmax(360px, 1fr) 300px;
  gap: 12px;
  padding: 12px;
  margin-top: 12px;
}

.panel {
  padding: 12px;
}

.panel h2 {
  margin: 0 0 10px;
  font-size: 18px;
}

.standings {
  margin: 0;
  padding-left: 24px;
}

.pitch {
  display: grid;
  grid-template-columns: repeat(5, minmax(54px, 1fr));
  grid-template-rows: repeat(3, 76px);
  gap: 6px;
  padding: 12px;
  background: #9fac7f;
}

.cell {
  display: grid;
  place-items: center;
  border: 1px dashed rgba(31, 38, 31, 0.5);
  background: rgba(232, 223, 202, 0.42);
  font-weight: 800;
}

.hand {
  display: grid;
  gap: 8px;
}

.card {
  min-height: 96px;
  padding: 10px;
  text-align: left;
  border: 2px solid #2f3b2f;
  background: #f3ead5;
  color: #1f261f;
  cursor: pointer;
}

.card strong,
.card span {
  display: block;
}

.card p {
  margin: 6px 0 0;
  line-height: 1.35;
}

.log {
  margin-top: 12px;
  padding: 12px 16px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 7: Run UI tests**

Run: `npm test -- tests/ui/render.test.ts`

Expected: PASS.

- [ ] **Step 8: Run full verification**

Run: `npm test`

Expected: PASS for all test files.

Run: `npm run build`

Expected: TypeScript and Vite build complete without errors.

- [ ] **Step 9: Commit browser prototype**

```bash
git add src/main.ts src/styles.css src/ui/render.ts src/ui/controller.ts tests/ui/render.test.ts
git commit -m "feat: add playable browser prototype shell"
```

---

### Task 9: Rewards, Events, And Minimal Legacy Progression

**Files:**
- Create: `src/domain/progression.ts`
- Create: `tests/domain/progression.test.ts`
- Modify: `src/domain/run.ts`
- Modify: `tests/domain/run.test.ts`

- [ ] **Step 1: Write failing progression tests**

Create `tests/domain/progression.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { demoCards } from "../../src/content/demo";
import { createLegacyState, generatePostMatchRewards, inheritOneReward, resolveEvent } from "../../src/domain/progression";

describe("progression", () => {
  it("generates three post-match reward choices", () => {
    const rewards = generatePostMatchRewards(demoCards, 1);

    expect(rewards).toHaveLength(3);
    expect(rewards.every((reward) => reward.kind === "card" || reward.kind === "recovery" || reward.kind === "legacy")).toBe(true);
  });

  it("resolves a between-match event into a concrete effect", () => {
    const result = resolveEvent("wandering-monk", "learn-defense");

    expect(result.message).toContain("defensive technique");
    expect(result.reward.kind).toBe("card");
  });

  it("inherits exactly one selected reward after a run", () => {
    const legacy = inheritOneReward(createLegacyState(), { kind: "card", cardId: "tai-chi-deflection" });

    expect(legacy.inheritedCardIds).toEqual(["tai-chi-deflection"]);
    expect(legacy.inheritedDiscipleIds).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/domain/progression.test.ts`

Expected: FAIL because `src/domain/progression.ts` does not exist.

- [ ] **Step 3: Implement progression module**

Create `src/domain/progression.ts`:

```ts
import type { Card } from "./types";

export type Reward =
  | { kind: "card"; cardId: string }
  | { kind: "recovery"; staminaAmount: number }
  | { kind: "legacy"; legacyPoints: number };

export type EventId = "wandering-monk" | "muddy-pitch" | "private-duel";
export type EventChoice = "learn-defense" | "rest" | "accept-risk";

export interface EventResult {
  message: string;
  reward: Reward;
}

export interface LegacyState {
  unlockedCardIds: string[];
  inheritedCardIds: string[];
  inheritedDiscipleIds: string[];
  facilityLevels: {
    scriptureHall: number;
    trainingGround: number;
    infirmary: number;
  };
}

export function createLegacyState(): LegacyState {
  return {
    unlockedCardIds: [],
    inheritedCardIds: [],
    inheritedDiscipleIds: [],
    facilityLevels: {
      scriptureHall: 0,
      trainingGround: 0,
      infirmary: 0
    }
  };
}

export function generatePostMatchRewards(cards: Card[], seed: number): Reward[] {
  const martialCards = cards.filter((card) => card.type === "martial");
  const firstCard = martialCards[seed % martialCards.length];
  const secondCard = martialCards[(seed + 2) % martialCards.length];

  return [
    { kind: "card", cardId: firstCard.id },
    { kind: "card", cardId: secondCard.id },
    { kind: "recovery", staminaAmount: 2 }
  ];
}

export function resolveEvent(eventId: EventId, choice: EventChoice): EventResult {
  if (eventId === "wandering-monk" && choice === "learn-defense") {
    return {
      message: "The wandering monk teaches a defensive technique.",
      reward: { kind: "card", cardId: "tai-chi-deflection" }
    };
  }

  if (eventId === "muddy-pitch" && choice === "rest") {
    return {
      message: "The team rests and recovers before playing on the muddy pitch.",
      reward: { kind: "recovery", staminaAmount: 2 }
    };
  }

  return {
    message: "The disciple accepts the risk and earns legacy.",
    reward: { kind: "legacy", legacyPoints: 1 }
  };
}

export function inheritOneReward(legacy: LegacyState, reward: Reward): LegacyState {
  if (reward.kind === "card") {
    return { ...legacy, inheritedCardIds: [reward.cardId] };
  }

  return legacy;
}
```

- [ ] **Step 4: Extend run state with legacy resources**

Modify `src/domain/run.ts` by adding these imports:

```ts
import { createLegacyState, type LegacyState, type Reward } from "./progression";
```

Update `RunState`:

```ts
export interface RunState {
  stage: RunStage;
  reputation: number;
  groupTable: GroupTable;
  groupMatchesPlayed: number;
  legacy: LegacyState;
  pendingRewards: Reward[];
  endedReason?: string;
}
```

Update `createRunState`:

```ts
export function createRunState(): RunState {
  return {
    stage: "group",
    reputation: 5,
    groupTable: createGroupTable(["player", ...demoOpponents.map((opponent) => opponent.id)]),
    groupMatchesPlayed: 0,
    legacy: createLegacyState(),
    pendingRewards: []
  };
}
```

- [ ] **Step 5: Extend run tests for legacy defaults**

Append to `tests/domain/run.test.ts`:

```ts
it("starts with empty legacy and no pending rewards", () => {
  const run = createRunState();

  expect(run.legacy.inheritedCardIds).toEqual([]);
  expect(run.pendingRewards).toEqual([]);
});
```

- [ ] **Step 6: Run progression and run tests**

Run: `npm test -- tests/domain/progression.test.ts tests/domain/run.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit progression logic**

```bash
git add src/domain/progression.ts tests/domain/progression.test.ts src/domain/run.ts tests/domain/run.test.ts
git commit -m "feat: add prototype rewards and legacy progression"
```

---

### Task 10: Final Verification And Local Playtest

**Files:**
- Modify only files required to fix verification failures found in this task.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: PASS for all domain and UI tests.

- [ ] **Step 2: Build production bundle**

Run: `npm run build`

Expected: TypeScript compilation and Vite build complete without errors.

- [ ] **Step 3: Start local dev server**

Run: `npm run dev`

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 4: Manual playtest checklist**

Use the local URL from Step 3 and verify:

- The page renders `Jianghu Goal`.
- The group table is visible.
- Reputation starts at 5.
- The 5x3 board is visible.
- At least one card can be clicked.
- Clicking a card spends momentum or shows a clear error message.
- The layout remains readable at desktop width and a narrow mobile width.

- [ ] **Step 5: Stop the dev server**

Stop the running Vite process with `Ctrl+C`.

- [ ] **Step 6: Commit verification fixes**

If Step 1-4 required code changes, commit them:

```bash
git add src tests package.json package-lock.json index.html tsconfig.json vitest.config.ts
git commit -m "fix: polish prototype verification"
```

If no code changes were required, record the passing commands in the implementation summary instead of creating an empty commit.

---

## Self-Review

Spec coverage:

- Short run under 30 minutes: covered by run structure and UI shell tasks.
- Small group stage plus knockout: covered by Task 3 and Task 7.
- 5x3 board: covered by Task 2 and Task 5.
- Key moments and match resolution: covered by Task 6.
- Deckbuilder hand, discard, exhaust, and momentum: covered by Task 4.
- Sect, disciple, and card content: covered by Task 2.
- Between-match events, rewards, and one-item inheritance: covered by Task 9.
- Browser-playable validation prototype: covered by Task 8.
- Final test/build/playtest verification: covered by Task 10.

Known limits of this plan:

- Task 8 creates a playable shell with card clicking, but not every individual card effect. That is intentional for the first prototype milestone.
- Task 9 implements minimal rewards, events, and one-card inheritance in the domain core. A richer reward screen can follow after match interaction tests are useful.
- Pixel art assets are represented by CSS and text in this plan. Real pixel sprites should be added only after interaction tests show the loop is promising.
