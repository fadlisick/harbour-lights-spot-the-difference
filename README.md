# Harbour Lights: Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/fadlisick/harbour-lights-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/fadlisick/harbour-lights-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A spot-the-difference game in three hand-drawn scenes: Harbour at Dusk, Night Market, and Mountain Observatory. Each level hides 7 differences between two near-identical pictures — find them all before the clock runs out.

## Play it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network, no assets to download. Everything (art, sounds) is drawn and synthesised in code.

## How to play

- **Click / tap** a difference on either picture, or steer the crosshair with the **arrow keys** and press **Enter / Space**.
- Found differences get a gold ring on both pictures. Each find scores 100 points; finds in a row build a combo.
- A wrong click costs 5 seconds. **H** spends a hint (3 per level, 10 seconds each, and it pulses the hiding place). **R** restarts the level, **P** pauses, **M** toggles sound.
- Beat the clock on all three levels to win: Harbour at Dusk (120s), Night Market (100s), Mountain Observatory (90s).

## How it is built

- `game/index.html` — page shell and HUD
- `game/styles.css` — the harbour-blue look
- `game/src/scenes.js` — the three scenes and their 7 differences each (all art drawn in code, deterministic seed)
- `game/src/game.js` — state machine, timer, scoring, screenshot staging (`?shot=cover|market|observatory|start|complete`)
- `game/src/render.js` — panels, ring markers, hint pulse, crosshair, HUD
- `game/src/input.js` — mouse, touch and keyboard
- `game/src/audio.js` — WebAudio synth sounds, no audio files

`main.ts` hands the game in to make.fun (Node 22, stdlib only): it copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=etjmfhb5&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
