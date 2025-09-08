# Ultimate Sudoku – MVP Requirements & Roadmap (v0.9)

Note (2025‑09‑02): Ultimate Sudoku Levels implemented per ADR‑0007 (Epic #399). Classic tier engine remains documented below for historical context and seed compatibility; see ADR‑0007 for the new levels design.

## Index / High-Level Summary

1. **MVP Snapshot** – Gameplay, Controls, Modes, Difficulty, Hints (Phase 1)
2. **Difficulty Generation & Rating Engine** – Strategy Ladder, Tier Thresholds, Performance, Daily Rules (Phase 1)
3. **Local & Cloud Storage** – Keys, Behaviors, Sync Rules, Roadmap (Phase 1 foundation + Phase 2+ enhancements)
4. **Refined MVP Decisions** – Confetti, Reroll, Haptics, Lives (Phase 1 finalized)
5. **Wireframes (ASCII + Specs)** – Game Board, Daily Calendar, Stats, Settings, Help (Phase 1)
6. **Accessibility** – Keyboard, contrast, screen‑reader labels (Phase 1)
7. **Developer Tools (Internal)** – Seeded loader, inspector, QA helpers (Phase 1 for dev only)
8. **Roadmap** – MVP (Phase 1) vs Phase 2+ (clear scoping)
9. **Acceptance Criteria (MVP)** – Given/When/Then

---

## 1) MVP Snapshot (Phase 1)

### Gameplay & Controls

- **Grid**: Classic **9×9** only (MVP).
- **Input**: On-screen **numpad 1–9** with **Lock/Unlock**; keyboard & touch.
- **Eraser**: Works for **numbers & notes**.
- **Tools**: Undo/Redo, Hint, Lock, Notes, Erase, toggle Error Highlighting, Auto-candidates (configurable), Auto-advance (configurable).
- **Seed numbers (givens)**: Subtle/visible styling; tap/click to copy that digit to the active input.
- **Timer** with manual pause & idle auto-pause.
- **Lives**:
  - **Zen/Practice** (Phase 2+): Slider 1–10 + 11 (Unlimited).
  - **Classic & Daily**: Pre-determined per difficulty (Phase 1).
- **Game Seed**: Footer displays unique seed ID for puzzle reproduction. Tap = copy to clipboard (Phase 1).

### Modes

- **Classic** 9×9: free play with selectable difficulty (Phase 1).
- **Daily** 9×9: deterministic per UTC date; full calendar with archive & completion markers; fixed lives per difficulty (Phase 1).
- **Zen Mode**: (Phase 2+)
- **Practice Mode**: (Phase 2+) – customizable runs separate from Classic (lives slider enabled)
- **Variants (Wordoku, etc.)**: (Phase 2+)

### Difficulty Tiers (Phase 1)

- **Easy (Relaxed)**, **Medium (Balanced)**, **Hard (Tricky)**, **Expert**, **Master**, **Extreme**.

### Hints (Phase 1)

- Two systems:
  1. **Direct Number Placement** (+30s time penalty)
  2. **Logic-based Guidance** (+30s time penalty)
- Limits: Easy 5, Medium 3, Hard 2, Expert 1, Master 0, Extreme 0.

---

## 2) Difficulty Generation & Rating Engine (Phase 1)

### 2.1 Strategy Ladder

- **L0 – Basics**: Naked/Hidden Single, Full House.
- **L1 – Fundamentals**: Locked Candidates, Naked/Hidden Pair.
- **L2 – Intermediates**: Naked/Hidden Triple, Line–Box interactions.
- **L3 – Advanced**: X-Wing, XY-Wing, Swordfish, Basic Coloring, Simple UR.
- **L4 – Expert**: XYZ-Wing, W-Wing, advanced UR, simple chains (up to length 5), Remote Pairs.
- **L5 – Master/Extreme**: Finned/Sashimi Fish (≤ Swordfish), XY-Chain, Advanced AIC/Forcing chains up to length 7.

### 2.2 Tier Thresholds

- Easy: ≥34 clues, basics only.
- Medium: 28–33 clues, pairs/triples.
- Hard: 24–27 clues, X/XY-Wings.
- Expert: 22–25 clues, chains up to length 5.
- Master: 20–23 clues, XY-Chains + advanced UR.
- Extreme: 17–20 clues, long chains ≤7, Finned Fish.

### 2.3 Performance

- Generation: ≤2s Easy–Hard; ≤3s Expert–Extreme (95th percentile ≤5s).
- Validation: ≤800ms per rating run.

### 2.4 Daily Puzzles (Phase 1)

- Deterministic seed = `YYYYMMDD + patternId + difficulty`.
- **Weekly difficulty patterns**: rotate from 4 predefined mixes; `patternId` recorded per week/date.
- Full calendar view; archive playable by date.
- Fixed lives by difficulty (Easy 6 → Extreme 1).

---

## 3) Local & Cloud Storage

### Local Storage (Phase 1)

- Always active; offline-first; compressed; conflict detection; storage health monitoring.
- **Keys & Contents**:
  - `sudoku-progress`: current board, solution, initial givens, elapsed time, difficulty, hints used/limit, game type, **sessionId**, **lastModified**.
  - `sudoku-settings`: gameplay & appearance prefs, calendar prefs, **per-field timestamps**, **settingsVersion**, **lastSyncAttempt**.
  - `sudoku-stats`: totals (wins/losses/completed), best times per difficulty (no-hint only), counters, recent daily results, **schemaVersion**, **lastCalculated**.
  - `sudoku-daily-YYYYMMDD`: cached daily puzzle by date (30‑day expiration).

### Cloud Storage

- Baseline sync (Phase 1) with field‑level conflict resolution and RLS; rate limiting; audit logging.
- Sync prefs: Gameplay (default ON), Calendar (default ON), Appearance (default OFF), Analytics (default OFF).
- Enhancements (Phase 2+): compression, progressive sync, conflict resolution UI, analytics, advanced offline sync.

---

## 4) Refined MVP Decisions (Phase 1 unless marked)

- **Symmetry**: 180° rotational (Finalized)
- **Rule-prevent**: Allow + highlight (Finalized)
- **Auto-candidates**: ON for Easy/Medium, OFF for Hard+; three-state user override (Finalized)
- **Lives slider**: Only Zen/Practice (Phase 2+); Classic/Daily fixed (Phase 1)
- **Daily reroll**: Removed (Finalized)
- **Confetti**: Present only if no hints used (Phase 1); expanded celebrations (Phase 2+)
- **Haptics**: Enabled for placements/errors (Phase 1)

---

## 5) Wireframes (ASCII + Specs)

### 5.1 Game Board (MVP)

See also: Epic #21 responsive layout summary (docs/epics/0021-responsive-layout-summary.md)

```
 -------------------------------------------------
| [Home]        Classic – Hard                   |
| Lives ♥♥♥                           Timer 03:42|
 -------------------------------------------------
|                Sudoku 9×9 Grid                 |
|   (aligned above numbers)                      |
 -------------------------------------------------
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
 -------------------------------------------------
| Hint | Undo | Redo |   | Lock | Notes | Erase  |
 -------------------------------------------------
|                   482913                        |
|            (tap to copy on value)               |
 -------------------------------------------------
```

### 5.2 Daily Calendar

```
 ------------------------------
| Current Streak: 5   Best: 12 |
 ------------------------------
| Su | Mo | Tu | We | Th | Fr | Sa |
|  1 |  2 |  3 |  4 |  5 |  6 |  7 |
|  8 |  9 | 10 | 11 | 12 | 13 | 14 |
| ...                            |
 ------------------------------
Legend: ● = completed, ○ = missed, ▲ = in-progress
```

### 5.3 Stats

```
 ---------------- Stats -----------------
| Wins: 124 | Losses: 45 | Win Rate: 73% |
 -----------------------------------------
| Difficulty | Played | Wins | % | Best |
| Easy       |   30   |  25  |83%| 2:31 |
| Medium     |   40   |  30  |75%| 4:12 |
| Hard       |   50   |  32  |64%| 7:45 |
 -----------------------------------------
Time Distribution Graph: [histogram]
Game History List:
- Daily, Hard, Win, 06:32, 1 hint, 0 mistakes
- Classic, Medium, Loss, 04:01, 3 mistakes
```

### 5.4 Settings

```
 ---------------- Settings -----------------
| Gameplay                                     |
| [ ] Error Highlighting (?)                   |
| [ ] Auto-candidates (ON/OFF/Default) (?)     |
| [ ] Auto-advance (?)                         |
| [ ] Haptics (?)                              |
|                                              |
| Appearance                                   |
| [ ] Dark Mode (?)                            |
| Accent Color: [ Indigo ▾ ] (?)               |
| Grid Size:  [——|——] (1–5) (?)                |
| Input Number Size: [——|——] (1–5) (?)         |
| Notes Size:           [——|——] (1–5) (?)      |
|                                              |
| Calendar                                     |
| Week starts on: [ Mon ▾ ] (?)                |
| Show: [✓ Completed] [✓ Incomplete] [✓ All]   |
 -------------------------------------------
Tooltip examples:
- Error Highlighting: Highlights invalid moves
- Auto-candidates: Auto-fill pencil marks
- Auto-advance: Cursor moves after entry
- Haptics: Vibrations on placement/error
- Dark Mode: Switch to a darker theme
- Accent Color: Choose a highlight color
- Grid/Input/Notes Size: Adjust visual sizes
- Week starts on: Choose Monday or Sunday
- Show filters: Control what appears on calendar
```

### 5.5 Help/About

```
 ---------------- Help/About ----------------
| How to Play: Basics + Strategy Index       |
| Techniques Primer                          |
| Controls Guide                             |
| Stats Explainer                            |
| Glossary: Single, Pair, Wing, Chain, etc.  |
| Credits                                    |
| Version Info                               |
 --------------------------------------------
```

---

## 6) Roadmap

### MVP Scope (Phase 1)

- Core 9×9 gameplay & controls
- Classic mode with selectable difficulty
- Daily mode with full calendar & archive (weekly difficulty patterns)
- Difficulty engine with finalized L5 subset
- Local + Cloud storage (baseline + monitoring)
- Confetti (basic), haptics, timer, stats
- Home button navigation + Help/About
- Footer game seed (copy)

### Phase 2+

- Zen Mode (unlimited play with custom sliders)
- Practice Mode (customizable runs with lives slider)
- Wordoku/other variants; size and rule variants
- Expanded hints (Highlight Candidates, Escalating Assistance)
- Easter eggs & seasonal themes (Pi Day, May 4, etc.)
- Expanded confetti/celebrations
- Data compression across all storage
- Progressive sync & analytics reporting
- Conflict resolution UI
- Service worker offline sync & advanced cross-device session management
- Left-handed tool order toggle

---

## 7) Accessibility (Phase 1)

- **Keyboard**: Arrow keys move; digits enter; `N` toggles notes; `Backspace` erase; visible focus ring.
- **Contrast & Color**: High-contrast defaults; color-blind safe palettes.
- **Screen Readers**: ARIA labels for cells (row/col, value/empty), controls, and status messages.

---

## 8) Developer Tools (Internal)

- **Shortcut**: Ctrl+Shift+D / Cmd+Shift+D toggles dev panel (dev builds only).
- **Seeded Loader**: enter seed + difficulty; start seeded game immediately.
- **Cell Inspector**: overlay to view candidates/state; tap a cell for details.
- **Quick Actions**: Solve with time, Fail/Lose, trigger confetti; accent cycler.
- **Persistence**: panel position + open sections saved locally.

---

## 9) Acceptance Criteria (MVP) — Given / When / Then

### 9.1 Gameplay & Controls

- **Place Digit (numpad)**: Given selected empty cell and unlocked digit → When tapping digit → Then value placed (auto‑advance respected).
- **Place Digit (keyboard)**: Given selected empty cell → When pressing 1–9 → Then value placed.
- **Notes Toggle (keyboard)**: Given selected cell → When pressing `N` → Then notes mode toggles; entries add/toggle pencil marks.
- **Numpad Lock**: Given lock on digit 7 → When tapping multiple cells → Then 7 placed until lock changes.
- **Eraser (value)**: Given value + notes → When erasing → Then value and cell notes cleared.
- **Eraser (notes only)**: Given notes only + digit 3 selected → When erasing → Then note 3 toggled; with no digit selected → all notes cleared.
- **Undo/Redo**: Given prior actions → When Undo → Then last action reverted; Redo reapplies.
- **Seed‑Copy (in‑grid)**: Given a given digit → When tapped → Then active digit set; board unchanged.
- **Seed‑Copy (footer tool)**: Given seed shown → When tap copy → Then seed string copied; confirmation toast shows.
- **Timer & Pause**: Given active game → When pause → Then overlay shows; timer stops; resume continues.
- **Idle Auto‑Pause**: Given ON and inactivity threshold → When idle duration elapses or app is backgrounded → Then game pauses.

### 9.2 Modes

- **Start Classic**: Given main menu → When Classic→Expert → Then Expert puzzle loads. (Tracked: #259; seed policy #114)
- **Daily Determinism (UTC)**: Given date X (UTC) → When opening Daily → Then same puzzle loads across devices. (Tracked: #38; route wiring and not-found: #260)
- **Daily Calendar Access**: Given calendar → When tapping past date → Then that day’s puzzle opens; future locked.
- **Lives (Classic/Daily)**: Given fixed lives → When wrong value placed → Then lives decrement; at 0 → loss state.
- **Zen/Practice Lives Slider Hidden**: Given Classic/Daily → When opening Settings → Then Lives slider not editable/visible.

### 9.3 Difficulty Engine

- **Uniqueness**: Given any generated puzzle → When validated → Then exactly one solution.
- **Tier Conformance**: Given Expert puzzle → When rated → Then max technique ≤ L4; chain length ≤ 5; counts within thresholds.
- **Performance Budget**: Given batch generation → When running 1k per tier → Then averages/95th within targets.

### 9.4 Hints

- **Hint Availability**: Given Hard puzzle → When opening hint → Then remaining count shows 2; disables at 0.
- **Direct Hint Effect**: Given solvable cell → When Direct Hint → Then correct value placed; +30s applied; toast shown.
- **Logic Hint Effect**: Given solvable cell → When Logic Hint → Then cell + candidate highlighted; label shown; +30s applied.
- **Best Time Restriction**: Given any hint used → When finishing → Then best time not updated for that difficulty.

### 9.5 Stats & Reporting

- **Win Rate Calculation**: Given multiple games → When viewing stats → Then Win Rate = Wins/Played overall and per difficulty.
- **By‑Difficulty Chart**: Given completions → When opening stats → Then Played/Wins/Win%/Best Time visible per difficulty.
- **Time Distribution**: Given ≥5 completions → When viewing histogram → Then distribution matches data and updates after games.
- **Game History Entry**: Given completion → When saving → Then history includes type, variant, difficulty, time, win/loss, hints, mistakes.
- **Daily Streak**: Given consecutive daily completions by UTC date → When viewing calendar → Then streak increases; missing a day resets.

### 9.6 Storage & Sync

- **Local Persistence**: Given mid‑game → When app reloads → Then progress, settings, stats restored.
- **Cloud Baseline Sync**: Given signed‑in user on A → When completing game → Then data syncs; device B reflects on next open/sync.
- **Conflict Resolution**: Given differing settings A vs B → When syncing → Then newer per‑field timestamps win; major conflicts notify user.

### 9.7 UI/UX & Accessibility

- **Confetti Gate**: Given win with 0 hints → When completion triggers → Then confetti + results banner (time, difficulty, lives, “unassisted”).
- **Haptics**: Given supported device → When placing digit or triggering error → Then brief haptic pulse occurs.
- **Keyboard Navigation**: Given keyboard → When using arrows → Then focus moves with visible ring.
- **Color & Contrast**: Given default/dark themes → When rendering UI → Then key elements meet WCAG AA contrast.
- **Screen Reader Labels**: Given focused cell → When read → Then row/column and value/empty (+ candidate count if applicable).

---

## 10) Tracking (Issues/Epics)

- Classic difficulty selection + engine integration: #259 (Epic: #14)
- Daily route 404 fix + not-found boundary: #260 (Epics: #22, #15)
- Seed footer underline removal + non-shifting toast: #261 (Epic: #14)
- Responsive layout polish (web): #262 (Epic: #21)
- Related: Seed policy and valid puzzles: #114; Daily UTC seed/patterns: #38

### 9.8 Navigation & Help

- **Main Menu Links**: Given home screen → When selecting Play Classic / Daily / Stats / Settings / Help → Then correct screen opens.
- **Back/Home**: Given any sub‑screen → When Home → Then return to main menu without losing unsaved progress.
- **Help Content**: Given Help open → When browsing → Then Rules, Techniques, Controls, Stats explainer visible.
- **About Content**: Given About open → Then version, credits, contact link visible.
