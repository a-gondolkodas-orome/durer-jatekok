# Dürer Games — Project Context

## What this project is

A public, static site (no server, hosted on GitHub Pages) featuring interactive
2-player math games from the **Hungarian Dürer math competition**. Each game is
essentially a math problem with a provably optimal winning strategy. Visitors
can play against the computer (choosing a role) or against another human in the
same browser. The computer plays optimally, so the visitor can only win by also
playing optimally.

The goal is to eventually include all past Dürer competition games. Currently
roughly half are implemented.

## Tech stack

- **React 19** with **React Router 7** — SPA, client-side only
- **Vite** — build tool
- **Tailwind CSS 4** — styling
- **Vitest** + **@testing-library/react** — unit and component tests
- **ESLint** — linting
- **lodash** — utility library; feel free to use lodash functions if it helps readability, it's already used extensively in the project

No backend, no database, no auth. Deployed as a static build to GitHub Pages.

## Architecture

Games live under `src/components/games/`, one folder per game. The game list is
registered in `gameList.ts`.

**Shared infrastructure:**
- `game-parts/` — common UI elements (rules section, role chooser, restart
  button, etc.)
- `strategy-game-factory.tsx` — game flow engine via `strategyGameFactory`: handles
  turn-taking, end-of-game detection, restart/clean state. Defines a
  well-specified API that every game must implement.

**Per-game responsibility:**
Each game folder implements the optimal strategy (computer AI) and game-specific
UI independently, conforming to the `strategyGameFactory` API (role labels,
rules, permissible moves, initial state, etc.). Strategy is implemented however
is simplest: on-the-fly calculation/logic when feasible, or precomputed optimal
moves stored in a JSON file when performance requires it.

Traffic is expected to remain low — no scalability concerns.

## Testing

Any logic change (not just styling) to `strategy-game-factory.tsx` or the overview page
must be covered by new unit tests. Prefer adding tests before or alongside the
change, not as an afterthought.

Game-specific logic is also worth testing when the winning strategy is
non-trivial.

## Planned future directions

### Primary (ongoing)
- **Add remaining Dürer competition games** — the main ongoing effort; goal is
  to cover all past competition games
- **Refactoring and style improvements** — keep the codebase clean, consistent,
  and easy to maintain

## Adding a new game

Follow the steps in [README.md § Adding a new
game](README.md#adding-a-new-game). Use `strategyGameFactory` (see
`strategy-game-factory.tsx`) — copy a similar existing game as a starting point.

### strategyGameFactory API

Required params: `presentation`, `BoardClient`, `gameplay`, `variants`.

```typescript
strategyGameFactory({
  presentation: {
    rule,                      // i18n rules text shown in collapsible section
    roleLabels?,               // optional: [{ hu, en }, { hu, en }] — defaults to "1st/2nd player"
    getPlayerStepDescription,  // ({ board, ctx }) => { hu, en } — shown as turn instruction
  },
  BoardClient,                 // React component receiving { board, ctx, events, moves }
  gameplay: {
    moves,                     // { [name]: apply | { apply, validate? } } — see below
    endOfTurnMove?,            // optional move name auto-executed after moves with autoEndOfTurn: true
  },
  variants,                    // see below
})
```

**`variants`** — array of `{ botStrategy?, generateStartBoard?, label?,
isDefault? }`. The default variant (marked `isDefault: true`, or the only entry
if there is just one) must define `generateStartBoard`. If `botStrategy` is
omitted on a variant, the default variant's `botStrategy` is used as fallback.
If multiple variants are provided, exactly one must be `isDefault: true`. A
single-entry array needs no `isDefault` flag.

**`moves`** — each move is either a plain apply function
`(board, { ctx, events }, ...args) => { nextBoard }` (shorthand), or a long-form
object `{ apply, validate? }` colocating it with a legality predicate. Always
pass the current `board` as first arg when chaining moves within a turn. `apply`
trusts its arguments and applies them blindly; legality is enforced by
`validate` (below) and/or the `BoardClient`'s `disabled` gating.

**`validate`** (optional, per move) — a pure, side-effect-free legality predicate
`(board, { ctx }, ...args) => boolean` sitting right next to its `apply`. When
present, the engine rejects any dispatch whose args fail it (in dev it throws
loudly to surface the bug; in prod it warns, fires an `illegal-move` analytics
event, and no-ops so a stray call cannot corrupt the board). The function
shorthand means "always legal", so this is fully opt-in and games that predate
it keep working unchanged. The validator is the **single source of truth** for
legality: the engine also exposes it on the wrapped move with `ctx` already
bound, so the `BoardClient` drives button `disabled` state via
`moves.<name>.validate(board, ...args)` (combined with `ctx.isClientMoveAllowed`
for turn ownership); bots and — being React-free — a possible future
server-side authoritative check can reuse the same predicate. Do **not** put the
"whose turn is it" check (`ctx.isClientMoveAllowed`) inside `validate`; that is
the engine's concern, not per-move legality. See `coins-in-3-piles` (two-phase
turn) and `cube-coloring` (reuses the existing `isAllowedStep` helper) for
examples.

**`ctx`** fields available in moves and `BoardClient`:
- `currentPlayer`: 0/1 — use this for game logic in both modes
- `isClientMoveAllowed`: boolean — guard all player interactions with this
- `isHumanVsHumanGame`: boolean — branch mode-specific rendering if needed
- `chosenRoleIndex`: null/0/1 — only meaningful in vsComputer mode
- `turnState`: use for multi-stage turns or other state that needs to be
  remembered during a turn if needed, i.e. to expose it from BoardClient to
  getPlayerStepDescription

**`events`**: `endTurn()`, `endGame(winnerIndex?)`, `setTurnState(stage)`.

### New game checklist

- Game works correctly in both `vsComputer` and `vsHuman` mode
- Starting positions representative of the game's complexity; each player wins
  with ~50% probability across random starting boards
- Player cannot win with a non-winning strategy (i.e. AI is truly optimal)
- Clear what the player should do next (`getPlayerStepDescription`)
- Interactions disabled during the other player's turn (`ctx.isClientMoveAllowed`)
- Mobile-friendly and keyboard-navigable
- AI appears to "think" in multi-move turns (use `setTimeout`)

### Bot / variant conventions

These are deliberate design choices — treat them as expected, don't "fix" them:

- **Test bots carry no `notAlwaysOptimal` flag.** Being easy to beat is the whole
  point of a "Test" bot. The `notAlwaysOptimal` flag (which renders the ⓘ marker
  in `game-controls.tsx`) is only for a *smart/optimal* bot that in a few
  positions may fail to punish a mistake.
- **The "Teszt / Test" variant name is intentional** — it means "test your
  understanding of the rules before a real game", matching competition usage. Do
  not rename it to "Easy".
- **A role that always wins regardless of the start board is acceptable** and does
  not violate the ~50/50 win-probability guideline above.

## Dark mode

The site supports dark mode. Use `dark:` Tailwind variants for dark-mode-specific overrides. For card/panel backgrounds, prefer `bg-surface-elevated` (a custom token) over raw color classes — it adapts automatically to both light and dark themes.

## Styling / colours

Keep styling simple and consistent. Use plain Tailwind colour names — `blue`,
`red`, `green`, `slate` — rather than the fancy variants (`sky`, `rose`,
`emerald`, etc.). Only reach for a less common colour when there is a real
reason, such as matching an existing element. Don't introduce colour variety
for its own sake.

## Internationalisation (i18n)

See [README.md § Internationalisation
(i18n)](README.md#internationalisation-i18n). Use the `t()` helper from
`translate.js`.

## Maintenance philosophy

This is a volunteer side-project with limited time. Prefer simple, consistent,
easy-to-maintain code. New games should be straightforward to add by following
the existing pattern. Avoid over-engineering.
