# New Player Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lightweight Chinese guidance that tells a new player what to do next and helps them complete the prototype's smallest play loop.

**Architecture:** Keep guidance in the existing UI layer. `renderApp()` renders static “how to play” guidance and the controller owns step-aware log messages derived from deck state after each card play.

**Tech Stack:** TypeScript, DOM rendering, Vitest/jsdom, Vite.

---

## File Structure

- Modify `src/ui/render.ts`: add a compact guidance section above standings in the left panel.
- Modify `src/ui/controller.ts`: replace generic log strings with step-aware guidance messages.
- Modify `src/styles.css`: add compact styles for the guidance section.
- Modify `tests/ui/render.test.ts`: assert guidance panel and Chinese next-step copy render.
- Modify `tests/ui/controller.test.ts`: assert start and after-play log instructions.

## Task 1: Static Guidance Panel

**Files:**
- Modify: `tests/ui/render.test.ts`
- Modify: `src/ui/render.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Write the failing render test**

Update `tests/ui/render.test.ts` first test to assert the guidance panel copy:

```ts
expect(root.textContent).toContain("目标");
expect(root.textContent).toContain("小组赛拿积分，争取前二晋级");
expect(root.textContent).toContain("下一步");
expect(root.textContent).toContain("优先选择 0 费或 1 费牌");
expect(root.textContent).toContain("B 表示球的位置");
```

- [ ] **Step 2: Run render test to verify it fails**

Run: `npm test -- tests/ui/render.test.ts`

Expected: FAIL because the new guidance text is not rendered yet.

- [ ] **Step 3: Implement the guidance panel**

In `src/ui/render.ts`, add this block after `standingsPanel` and `standingsHeading` are created, before the standings list:

```ts
const guidance = document.createElement("section");
guidance.className = "guidance";

const guidanceHeading = document.createElement("h3");
guidanceHeading.textContent = "怎么打";

const guidanceList = document.createElement("dl");

const guidanceItems = [
  ["目标", "小组赛拿积分，争取前二晋级。"],
  ["当前", "这是一个关键回合。"],
  ["下一步", "选择一张手牌打出；新手优先选择 0 费或 1 费牌。"],
  ["资源", "气势是出牌费用，每个关键回合初始 3 点。"],
  ["棋盘", "B 表示球的位置。"]
] as const;

for (const [label, text] of guidanceItems) {
  const term = document.createElement("dt");
  term.textContent = label;

  const description = document.createElement("dd");
  description.textContent = text;

  guidanceList.append(term, description);
}

guidance.append(guidanceHeading, guidanceList);
```

Then change the panel append from:

```ts
standingsPanel.append(standingsHeading, standingsList);
```

to:

```ts
standingsPanel.append(guidance, standingsHeading, standingsList);
```

- [ ] **Step 4: Add guidance styles**

Append to `src/styles.css`:

```css
.guidance {
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(47, 59, 47, 0.45);
}

.guidance h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.guidance dl {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 6px 8px;
  margin: 0;
}

.guidance dt {
  font-weight: 800;
}

.guidance dd {
  margin: 0;
  line-height: 1.4;
}
```

- [ ] **Step 5: Run render test to verify it passes**

Run: `npm test -- tests/ui/render.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/ui/render.test.ts src/ui/render.ts src/styles.css
git commit -m "feat: add new player guidance panel"
```

## Task 2: Step-Aware Log Instructions

**Files:**
- Modify: `tests/ui/controller.test.ts`
- Modify: `src/ui/controller.ts`

- [ ] **Step 1: Write failing controller expectations**

In `tests/ui/controller.test.ts`, change the initial log expectations to:

```ts
expect(initialLog?.textContent).toContain("先打出一张 0 费或 1 费牌");
```

Change the detached click expectation to the same text:

```ts
expect(logAfterDetachedClick?.textContent).toContain("先打出一张 0 费或 1 费牌");
```

Change the after-play expectation to:

```ts
expect(logAfterCurrentClick?.textContent).toContain("已打出");
expect(logAfterCurrentClick?.textContent).toContain("还可以继续");
```

- [ ] **Step 2: Run controller test to verify it fails**

Run: `npm test -- tests/ui/controller.test.ts`

Expected: FAIL because the controller still uses the old generic messages.

- [ ] **Step 3: Implement step-aware messages**

In `src/ui/controller.ts`, add:

```ts
function openingInstruction(): string {
  return "先打出一张 0 费或 1 费牌，观察手牌和气势如何变化。";
}

function playedInstruction(label: string, deck: DeckState): string {
  if (deck.playsRemaining <= 0) {
    return `已打出：${label}。这个关键回合的三次出牌已用完，最小循环已经跑通。`;
  }

  if (deck.hand.length === 0) {
    return `已打出：${label}。手牌已用完，最小循环已经跑通。`;
  }

  return `已打出：${label}。还可以继续打牌，也可以先观察气势和手牌变化。`;
}
```

Use `openingInstruction()` in initial state:

```ts
message: openingInstruction()
```

After `playCard()`, store the next deck before assigning state:

```ts
const nextDeck = playCard(state.deck, cardId);
state = {
  ...state,
  deck: nextDeck,
  message: playedInstruction(label, nextDeck)
};
```

- [ ] **Step 4: Run controller test to verify it passes**

Run: `npm test -- tests/ui/controller.test.ts`

Expected: PASS.

- [ ] **Step 5: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and Vite build completes.

- [ ] **Step 6: Commit**

```bash
git add tests/ui/controller.test.ts src/ui/controller.ts
git commit -m "feat: guide first prototype loop"
```

## Self-Review

- Spec coverage: Task 1 covers the always-visible Chinese guidance panel; Task 2 covers next-step log guidance and the minimal loop feedback.
- Placeholder scan: no TBD/TODO/fill-in steps remain.
- Type consistency: `playedInstruction()` accepts `DeckState`, matching the existing controller import.
