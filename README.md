# Padam Nokkiye (പടം നോക്കിയേ)

Offline-first Malayalam movie charades game for Sargam 2026. Single booth device, forehead-hold guessing format, tap or tilt input.

## Status

MVP is playable via tap. **Tilt input is broken — do not enable Tilt + Tap at the event until this is resolved.** See [Known Issues](#known-issues).

## Architecture

Two-owner split, enforced by interface contract — see `PERSON_A_GAMEPLAY_PLAYBOOK.pdf` and `PERSON_B_UI_PWA_PLAYBOOK.pdf` for full role scope.

```
Full Dataset → Filtering → Deck (shuffle/reshuffle) → Game Engine (state, score, timer) → UI (app.js)
```

| File | Owns | 
|---|---|
| `movieDataset.js` | Static movie data (`{ t, era, diff }`) |
| `filtering.js` | Era/difficulty filtering, never mutates source |
| `deck.js` | Shuffle, current-card retrieval, reshuffle on exhaustion |
| `timer.js` | Countdown only — no UI concerns |
| `gameEngine.js` | Single entry point. Wraps state/filtering/deck/timer. This is the only module the UI should import from. |
| `gameState.js` | Central state shape, reset guarantees |
| `tilt.js` | Optional tilt input — **currently unwired and buggy, see below** |
| `app.js` | UI glue: DOM refs, screen switching, calls into `gameEngine.js` |
| `index.html` / `style.css` | Three screens: Setup, Game, End |

### Interface contract (Person A → Person B)

```
getFilteredMovies()
startGame()
getCurrentMovie()
handleCorrect()
handlePass()
getScore()
getPlayedHistory()
endGame()
resetGame()
```

Do not change function names, state shape, or the dataset schema without updating both sides.

## Known Issues

### Tilt input not detecting motion (open)

Symptom: with Tilt + Tap selected, tilting the phone produces no Correct/Pass trigger.

Debugging so far, in order:
1. Confirmed `startTiltInput()` was never imported/called from `app.js` — listener was never attached. Fixed by wiring it into `startGameSession()`, gated on `configState.inputMode === "tilt"`.
2. Found calibration locked to the *first* `deviceorientation` event received — which fires while the phone is still in-hand at Start, not at the guesser's forehead. Replaced with an explicit `calibrate()` step: a ~400ms sampled-average window triggered after Start, with a "Get ready..." beat on screen before the round begins.
3. Removed leftover `console.log('[TILT DEBUG]', ...)` that was firing every event.
4. Currently debugging: detection is **intermittent** — some tilts register, some don't, no confirmed pattern yet. Leading suspects, not yet confirmed:
   - State machine stuck in `tilted_down`/`tilted_up` because `RETURN_THRESHOLD` (15°) isn't reliably reached between gestures on a real forehead-hold — next tilt silently no-ops until state resets.
   - Calibration window (`calibrate()`, ~400ms average) capturing the phone mid-settle rather than at rest, producing a baseline that drifts round to round.
   - Possible debounce collision between `tilt.js`'s own state gate and `gameEngine.js`'s separate 250ms `ACTION_DEBOUNCE_MS`.

**Next step:** log `deltaBeta` + `state` in `tilt.js` and the debounce check in `gameEngine.js`'s `handleCorrect()`/`handlePass()`, run repeated deliberate tilts, and check what's true at each failure — needed to tell these three apart before changing anything.

**Do not test over `http://<lan-ip>`** — Android Chrome requires a secure context (`https://` or `localhost`) for `DeviceOrientationEvent` to fire at all. Confirm the test URL before assuming a code bug.

**Cleanup owed before ship:** ensure `tiltHandle.stop()` is called on round end / Play Again / Change Filters. If the listener isn't torn down between rounds, player 2 inherits player 1's calibration.

## Fallback plan

Per the playbooks' emergency scope-cut rule: if tilt isn't reliable by Day 6–7, cut it. Tap-only is fully functional and is the P0 requirement — tilt is P2/stretch. Do not let this bug block the event build.

## Not in scope (by design)

No backend, no database, no auth, no accounts, no multiplayer networking, no external movie APIs, no AI services. Static offline-first web app only.