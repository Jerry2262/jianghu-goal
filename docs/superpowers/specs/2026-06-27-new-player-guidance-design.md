# New Player Guidance Design

## Goal

Help a first-time player understand the immediate next action and complete the smallest playable loop in the current prototype:

1. Read the current objective.
2. Understand the key moment.
3. Play a sensible card.
4. See that the hand, momentum, and log changed.
5. Know what to do next.

This is not a full tutorial mode. It is lightweight guidance embedded in the main screen.

## Player-Facing Changes

Add a compact guidance panel near the current match information. The panel uses Chinese text only and explains:

- `目标`: 小组赛拿积分，争取前二晋级。
- `当前`: 这是一个关键回合。
- `下一步`: 选择一张手牌打出；新手优先选择 0 费或 1 费牌。
- `资源`: 气势是出牌费用，每个关键回合初始 3 点。
- `棋盘`: `B` 表示球的位置。

The bottom log becomes step-aware:

- At start: tells the player to play one 0-cost or 1-cost card first.
- After one card: confirms the play and tells the player they may continue or try another card.
- After three cards or no playable cards: tells the player this key moment is resolved for the prototype loop.

## Minimal Loop

The prototype loop remains intentionally small:

1. Start with five cards and 3 momentum.
2. Player clicks a card.
3. The card is removed from hand.
4. Momentum and remaining plays update.
5. The log gives the next instruction.

The loop does not yet simulate scoring, advance to the next key moment, or finish the match. Those are later systems.

## UI Structure

Keep the existing three-column layout. Add the guidance content inside the left panel above the standings, so the player sees instructions before the table.

The guidance panel should be text-dense but short. It must not be a modal or overlay.

## Testing

Update UI tests to verify:

- The guidance panel renders Chinese next-step text.
- The first instruction tells a new player to play a 0-cost or 1-cost card.
- After playing a card, the log changes to a follow-up instruction.
- Existing XSS-safe text rendering behavior remains intact.

Run `npm test` and `npm run build` before merging.
