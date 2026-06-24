# Jianghu Goal Design

## Summary

The game is a small playable demo for a football-themed martial arts deckbuilding roguelite. The player is the master and head coach of a minor sect. They lead disciples through a short jianghu football season by combining sect martial arts cards, disciple cards, and simplified board positioning.

The first version is intentionally small. Its goal is to verify whether the core match loop is fun before expanding content, story, or long-term management systems.

Working title and spec name: **Jianghu Goal**.

## Design Goals

- Deliver one full run in under 30 minutes.
- Make each match short, dense, and decision-heavy.
- Use football as a tactical structure, not a full 90-minute simulation.
- Use martial arts sects to give card archetypes clear identity.
- Keep the first demo small enough to build, test, and revise quickly.
- Use simple pixel art with an ink-wash board-game feel.

## Player Role

The player is a sect master and head coach. They are responsible for:

- Choosing match tactics.
- Building and improving the deck.
- Training and selecting disciples.
- Navigating short between-match events.
- Carrying sect legacy between runs.

The player does not directly control a single footballer in real time.

## Run Structure

A run represents one short jianghu football season.

- Target duration: 20-30 minutes.
- Match count: up to 5 matches: 3 group-stage matches, then semifinal and final if the player advances.
- Season format: a compact tournament with a small group stage followed by knockout matches.
- Between-match events: short decisions that grant cards, improve disciples, change reputation, or create risk.
- Success condition: qualify from the group stage, then win the final cup match against the final sect.
- Failure condition: sect reputation reaches zero, the player fails to qualify from the group stage, or the player loses a knockout match.

Tournament structure:

- Group stage: 4 teams, including the player's sect.
- Group stage schedule: 3 matches, one against each other group team.
- Points: win = 3, draw = 1, loss = 0.
- Advancement: top 2 teams advance to knockout matches.
- Tie-breakers: points, then goal difference, then goals scored, then a sudden-death playoff key moment if still tied.
- Knockout stage: semifinal and final.
- Optional demo shortcut: if time is tight, the semifinal can be represented by one high-stakes match and the final by the boss sect match.

After each match, the player chooses a reward such as:

- A new martial arts card.
- A disciple improvement.
- A temporary buff or injury recovery.
- Legacy resources for future runs.

## Match Structure

Matches do not simulate all 90 minutes. Each match is made of key football moments.

- Target match duration: 2-4 minutes, with room to be even shorter.
- Key moments per match: 4-6.
- Each key moment presents a tactical situation with time, score, possession, board state, and objective.
- The player plays 1-3 cards to resolve the moment.
- Results can include goals, saves, turnovers, fatigue, injuries, momentum gain, or reputation changes.

Example key moments:

- Minute 32: the team wins possession high up the right side. Create a shot within two actions.
- Minute 76: the opponent uses an Iron Palm charge. Protect the penalty area.
- Stoppage time: score is 1-1. Resolve a goalmouth scramble.

## Match Resolution

Each match starts with a score, usually 0-0. Key moments are resolved one at a time, and their outcomes directly update the score or match state.

Prototype defaults:

- A match has 4 key moments in the first prototype, expandable to 6.
- Each key moment advances the displayed match clock to a scripted time such as minute 18, 39, 67, or 88.
- The match ends when all key moments are resolved.
- Each attacking key moment has an objective such as create a shot, score, or keep possession.
- Each defensive key moment has an objective such as prevent a shot, block a shot, or force a turnover.

Moment outcomes:

- **Goal:** add 1 to the scoring team.
- **Shot saved or blocked:** no score change; may grant momentum or reduce stamina.
- **Turnover:** possession flips and may change the next key moment setup.
- **Failed defense:** opponent scores or gains an easier future attacking moment.
- **Injury or fatigue:** affects disciple availability in later moments or matches.

At match end:

- Higher score wins.
- In group-stage matches, a win grants 3 points, a draw grants 1 point, and a loss grants 0 points.
- A group-stage draw does not trigger extra time.
- Losing a group-stage match costs 1 reputation and continues the run if reputation remains above zero.
- At the end of the group stage, the top 2 teams advance.
- In knockout matches, a draw triggers one sudden-death key moment.
- Losing a knockout match ends the run.

This gives the prototype a deterministic match loop without needing full-time simulation.

## Tactical Board

The game is card-first, with board positioning as a supporting layer.

The board should be small and readable. It exists to preserve football spatial logic without turning the game into a full tactics simulator.

Prototype board:

- Grid: 5 columns by 3 lanes.
- Direction: the player attacks from left to right.
- Lanes: top, center, bottom.
- Columns: defense, buildup, midfield, attack, box.
- Each cell can hold a small number of tokens: ball, allied disciple, opponent, or pressure marker.
- Passing lanes are legal paths between occupied cells, usually same-lane or one-lane diagonal.
- Pressure zones are discrete cells marked by opponents, weather, or tactics.

Simple board sketch:

```text
              Defense  Buildup  Midfield  Attack  Box
Top lane      [  ]     [  ]     [  ]      [  ]    [  ]
Center lane   [  ]     [  ]     [B ]      [  ]    [G ]
Bottom lane   [  ]     [  ]     [  ]      [  ]    [  ]
```

`B` is the ball. `G` is the goal target. Allies, opponents, and pressure markers occupy cells around this structure.

The board communicates:

- Ball position.
- Attacking and defending disciples.
- Pressure zones.
- Passing lanes.
- Shooting or blocking opportunities.

Cards can move the ball, shift disciples, create lanes, close lanes, or trigger martial arts effects based on position.

## Card System

The deck mixes sect martial arts cards and disciple cards.

### Card Types

- **Martial arts cards:** The main deck identity. These come from the player's sect style.
- **Disciple cards:** Cards generated by specific disciples. A disciple card is the playable expression of that disciple's personal technique, trait, or clutch action.
- **Formation cards:** A small number of cards that change positioning, tempo, or team-wide effects.
- **Status and event cards:** Temporary cards introduced by weather, injuries, pressure, opponent tactics, or jianghu events.

### Hand And Draw Loop

Prototype defaults:

- Draw 5 cards at the start of each key moment.
- The player may play up to 3 cards in that key moment.
- Unplayed cards are discarded at the end of the key moment.
- Played cards also go to discard unless the card says it exhausts.
- When the draw pile is empty, shuffle discard into a new draw pile.
- Exhausted cards are removed until the end of the match.
- Status and event cards are added to the draw pile or hand for a specific match, then removed after that match unless stated otherwise.

This keeps each key moment self-contained while preserving deckbuilder rhythm across a match.

### Starting Deck

A first demo deck should contain about 10-12 cards:

- 6-8 martial arts cards.
- 2-3 disciple cards.
- 1-2 formation or common cards.

The player can add, upgrade, remove, or replace cards during the run. Deck growth should be controlled so that the deck stays readable.

## Resources

The first demo uses three core resources:

- **Momentum:** Main card-playing resource. Earned by successful passes, tackles, saves, or chain plays.
- **Stamina:** Disciple endurance. Overusing a disciple can cause fatigue, injury, or weaker future actions.
- **Reputation:** Run-level health and season evaluation. Losses and failed events reduce it.

These resources should create tradeoffs inside short matches without slowing the game down.

### Momentum Economy

Prototype defaults:

- Start each key moment with 3 momentum.
- Basic cards cost 0-1 momentum.
- Strong tactical cards cost 2 momentum.
- Ultimate or match-changing cards cost 3 momentum.
- Unspent momentum does not carry between key moments by default.
- Some cards or traits can bank 1 momentum into the next key moment.

Momentum gains:

- Complete a safe pass: +1 momentum.
- Win a tackle or force a turnover: +1 momentum.
- Save or block a shot: +1 momentum.
- Complete a three-card chain with matching tags: +1 bonus momentum.

Chain bonus should stay small in the prototype. It should reward coherent play without creating runaway turns.

## Sects

The demo target is three playable sects. A smaller first prototype can start with one playable sect and one opponent sect.

### Wudang

Style: controlled passing, pressure release, defensive counterplay.

Role in demo: stable and readable starter archetype.

Example card ideas:

- Tai Chi Deflection: cancel pressure and move the ball one lane.
- Cloud Step Pass: pass through a marked lane if the receiver has enough stamina.
- Soft Overcomes Hard: convert opponent pressure into momentum.

### Shaolin

Style: defense, physical duels, penalty-area survival.

Role in demo: high tolerance and strong defensive identity.

Example card ideas:

- Golden Bell Block: prevent a shot or tackle result.
- Iron Shirt Hold-Up: keep possession under contact.
- Vajra Header: high-power shot or clearance when near the box.

### Beggar Sect

Style: chaos, steals, scrambles, risk-reward chains.

Role in demo: volatile archetype with strong comeback potential.

Example card ideas:

- Dog-Beating Scramble: force a turnover check and create a loose ball.
- Broken Bowl Feint: turn a failed pass into a contested rebound.
- Street Swarm: gain momentum for each nearby disciple.

## Disciple System

Each disciple is a footballer with martial arts flavor.

Each disciple has:

- Position: forward, midfielder, defender, or goalkeeper.
- Attributes: technique, movement, and spirit.
- One personal trait.
- One or more disciple cards.

Attribute effects:

- **Technique:** improves passing, shooting, and precise card effects. Cards that create shots or pass through pressure usually scale with technique.
- **Movement:** improves repositioning, pressing, and reaching loose balls. Cards that shift disciples or attack open lanes usually scale with movement.
- **Spirit:** improves clutch play, pressure resistance, and momentum generation. Cards used in late moments, defensive stands, or comeback states usually scale with spirit.

Attributes should be expressed through simple thresholds or modifiers, not heavy probability simulation. For example, a card may gain a bonus if the acting disciple has technique 3+, or may cost 1 less stamina if movement is higher than the opponent's pressure.

Example traits:

- Stronger in stoppage time.
- Gains momentum after consecutive passes.
- Recovers stamina after a successful tackle.
- Risks injury when using high-power techniques.

Disciple development should make a run feel personal, but the first demo should avoid a complex academy or transfer system.

## Between-Match Events

Events are short choices between matches. They should support replayability and reinforce the sect fantasy.

Example events:

- A wandering monk offers to teach a defensive technique.
- A rival sect challenges one disciple to a private duel before the match.
- Rain turns the pitch muddy, reducing movement but improving scramble cards.
- A young disciple asks to start despite low stamina.

Demo target: no more than 10 event templates.

## Legacy Progression

The long-term structure uses unlocks and inheritance as the main progression, with light sect building as support.

### Primary: Unlocks

Run results can unlock:

- New sects.
- New martial arts cards.
- New disciple backgrounds.
- New event modifiers.
- New opponent rules.

### Primary: Inheritance

After a run, the player may keep one meaningful piece of legacy:

- One legendary disciple.
- One upgraded ultimate technique.
- One sect trait.

Inheritance should create future choices without making later runs trivial.

### Secondary: Sect Facilities

Facilities exist only as light support:

- Scripture Hall: increases opening card choices.
- Training Ground: improves early disciple development.
- Infirmary: improves recovery or lowers injury risk.

Facilities should provide small options or recovery, not large permanent stat scaling.

## Visual Direction

The visual direction is simple pixel art with an ink-wash board-game feel.

Practical direction:

- Small pixel characters for disciples.
- A compact tactical board that resembles a martial arts strategy board.
- Card frames inspired by ink-wash paper and sect manuals.
- Minimal pixel illustrations for sects, techniques, events, and rewards.
- Clear UI readability over visual complexity.

The demo should avoid expensive animation and large illustration demands.

## Demo Scope

The first demo should validate the core loop before content expansion.

Target scope:

- 3 sects: Wudang, Shaolin, Beggar Sect.
- 20-30 cards.
- 8-12 disciples.
- One short tournament with 3 group-stage matches plus up to 2 knockout matches.
- A small 4-team group table using points, goal difference, and goals scored.
- 4-6 key moments per match.
- Up to 10 event templates.
- Simple pixel art and ink-wash board UI.

Smaller first prototype:

- 1 playable sect.
- 3 lightweight opponent sects.
- About 15 cards.
- 3 group-stage matches, with knockout matches stubbed or represented by one final boss match.
- Minimal event layer.

## Out Of Scope For Demo

- Full 90-minute match simulation.
- Real-time player control.
- Multiplayer.
- Complete multi-division league simulation.
- Full transfer market.
- Deep academy management.
- Long story campaign.
- Large character roster.
- Complex economy.

## Validation Questions And Test Criteria

The demo should answer these questions:

1. Are key moments clear and tactically interesting?
2. Do cards, positioning, sect identity, and disciple traits meaningfully interact?
3. Does a 20-30 minute run make the player want to start another run?
4. Does legacy progression create anticipation without becoming permanent stat inflation?

If the answer to the first two questions is no, the project should revise the match loop before adding more content.

Prototype test criteria:

- A new tester understands the objective of a key moment within 15 seconds without designer explanation.
- For most key moments, the tester can identify at least two plausible plays.
- Average key moment decision time stays under 45 seconds after the first match.
- At least half of tested turns involve board position affecting the chosen card.
- At least one disciple trait or disciple card changes a meaningful decision during a run.
- A full first-prototype run stays under 30 minutes.
- After a completed run, the tester can name one thing they would try differently in the next run.
