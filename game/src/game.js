// game.js — the state machine of Harbour Lights: Spot the Difference.
// Owns the screens (start / playing / level complete / game over / win),
// the timer, the score, hints and the staged screenshot states (?shot=).
// Rendering lives in render.js, drawing in scenes.js, input in input.js,
// sounds in audio.js.

import { LEVELS } from './scenes.js';
import { drawPanels, updateHud, PANEL_W, PANEL_H } from './render.js';
import { bindInput } from './input.js';
import { sfx } from './audio.js';

const $ = (id) => document.getElementById(id);

const els = {
  left: $('panel-left'),
  right: $('panel-right'),
  counter: $('counter'),
  timer: $('timer'),
  score: $('score'),
  levelName: $('level-name'),
  hints: $('hints'),
  timeBar: $('time-bar'),
  message: $('message'),
  overlay: $('overlay'),
  overlayTitle: $('overlay-title'),
  overlayBody: $('overlay-body'),
  overlayBtn: $('overlay-btn'),
  hintBtn: $('hint-btn'),
  restartBtn: $('restart-btn'),
  soundBtn: $('sound-btn'),
  pauseBtn: $('pause-btn'),
};

const state = {
  screen: 'start', // start | playing | levelComplete | gameOver | win
  levelIndex: 0,
  found: new Set(),
  hintsLeft: 3,
  timeLeft: LEVELS[0].timeLimit,
  score: 0,
  combo: 0,
  message: 'Find 7 differences. Click a difference on either picture.',
  hint: null, // { diffId, since, until }
  shakeUntil: 0,
  crosshair: { x: PANEL_W / 2, y: PANEL_H / 2, visible: false },
  paused: false,
  shotMode: false,
  lastTickSecond: -1,
};

const leftCtx = els.left.getContext('2d');
const rightCtx = els.right.getContext('2d');

function level() {
  return LEVELS[state.levelIndex];
}

function startLevel(index) {
  state.levelIndex = index;
  state.found = new Set();
  state.hintsLeft = 3;
  state.timeLeft = level().timeLimit;
  state.combo = 0;
  state.hint = null;
  state.paused = false;
  state.screen = 'playing';
  state.message = `Level ${index + 1}: ${level().name} — find all ${level().diffs.length} differences!`;
  hideOverlay();
  updateHud(state, els);
}

function startGame() {
  state.score = 0;
  startLevel(0);
}

function showOverlay(title, body, btnLabel, onBtn) {
  els.overlayTitle.textContent = title;
  els.overlayBody.innerHTML = body;
  els.overlayBtn.textContent = btnLabel;
  els.overlay.classList.remove('hidden');
  els.overlayBtn.onclick = () => {
    sfx.unlock();
    sfx.click();
    onBtn();
  };
}

function hideOverlay() {
  els.overlay.classList.add('hidden');
}

function levelComplete() {
  state.screen = 'levelComplete';
  const timeBonus = Math.round(state.timeLeft) * 5;
  state.score += timeBonus;
  sfx.levelClear();
  const last = state.levelIndex === LEVELS.length - 1;
  if (last) {
    state.screen = 'win';
    sfx.win();
    showOverlay(
      'You found them all!',
      `All three scenes cleared — harbour, market and observatory.<br>` +
        `Time bonus +${timeBonus} · Final score <b>${state.score}</b><br>` +
        `Play again to beat your score, or press R to restart.`,
      'Play again',
      startGame,
    );
  } else {
    showOverlay(
      `${level().name} cleared!`,
      `All ${level().diffs.length} differences found · time bonus +${timeBonus}<br>` +
        `Score <b>${state.score}</b> — next up: <b>${LEVELS[state.levelIndex + 1].name}</b>`,
      'Next level',
      () => startLevel(state.levelIndex + 1),
    );
  }
  updateHud(state, els);
}

function gameOver() {
  state.screen = 'gameOver';
  sfx.gameOver();
  const missing = level().diffs.filter((d) => !state.found.has(d.id));
  showOverlay(
    'Out of time!',
    `The clock ran out on <b>${level().name}</b>.<br>` +
      `You found ${state.found.size} of ${level().diffs.length} — ` +
      `still hiding: ${missing.map((d) => d.label).join(', ')}.<br>` +
      `Score <b>${state.score}</b>`,
    'Try this level again',
    () => startLevel(state.levelIndex),
  );
  updateHud(state, els);
}

function onPick(x, y) {
  if (state.screen !== 'playing' || state.paused) return;
  const d = level().diffs.find(
    (diff) => !state.found.has(diff.id) && Math.hypot(diff.x - x, diff.y - y) <= diff.r + 8,
  );
  if (d) {
    state.found.add(d.id);
    state.combo += 1;
    const gained = 100 + 25 * (state.combo - 1);
    state.score += gained;
    sfx.pop();
    state.message =
      `Found it — ${d.label}! +${gained} points` +
      (state.combo > 1 ? ` · combo x${state.combo}` : '') +
      (state.found.size === level().diffs.length ? '' : ` — ${level().diffs.length - state.found.size} to go.`);
    if (state.found.size === level().diffs.length) levelComplete();
  } else {
    state.combo = 0;
    state.timeLeft = Math.max(0, state.timeLeft - 5);
    state.shakeUntil = performance.now() + 220;
    sfx.miss();
    state.message = 'Not a difference — 5 seconds lost. Look closer!';
  }
  updateHud(state, els);
}

function onHint() {
  if (state.screen !== 'playing' || state.paused) return;
  if (state.hintsLeft <= 0) {
    state.message = 'No hints left on this level.';
    updateHud(state, els);
    return;
  }
  const unfound = level().diffs.filter((d) => !state.found.has(d.id));
  if (unfound.length === 0) return;
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  state.hintsLeft -= 1;
  state.timeLeft = Math.max(0, state.timeLeft - 10);
  const now = performance.now();
  state.hint = { diffId: pick.id, since: now, until: now + 2000 };
  sfx.hint();
  state.message = `Hint: something is different near “${pick.label}” — 10 seconds for the clue.`;
  updateHud(state, els);
}

function onRestart() {
  if (state.screen === 'start') return;
  sfx.click();
  startLevel(state.levelIndex);
}

function onNext() {
  if (state.screen === 'levelComplete' && state.levelIndex < LEVELS.length - 1) {
    startLevel(state.levelIndex + 1);
  }
}

function onPause() {
  if (state.screen !== 'playing') return;
  state.paused = !state.paused;
  state.message = state.paused ? 'Paused — press P to keep hunting.' : 'Back to the hunt!';
  updateHud(state, els);
}

function onSound() {
  const muted = sfx.toggleMute();
  els.soundBtn.textContent = muted ? 'Sound: off (M)' : 'Sound: on (M)';
  state.message = muted ? 'Sound off.' : 'Sound on.';
  updateHud(state, els);
}

// ------------------------------------------------------- screenshot staging
// ?shot=cover|market|observatory|start|complete stages a deterministic
// mid-play state for screenshots. The timer is frozen in shot mode so the
// frame never changes between loads.
function applyShotParam() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  state.shotMode = true;
  const stage = (levelIndex, foundCount, secondsLeft) => {
    state.levelIndex = levelIndex;
    state.found = new Set(level().diffs.slice(0, foundCount).map((d) => d.id));
    state.hintsLeft = 3;
    state.timeLeft = secondsLeft;
    state.screen = 'playing';
    state.message = `Level ${levelIndex + 1}: ${level().name} — find all ${level().diffs.length} differences!`;
    hideOverlay();
  };
  if (shot === 'cover') stage(0, 3, 87);
  else if (shot === 'market') stage(1, 2, 64);
  else if (shot === 'observatory') stage(2, 4, 41);
  else if (shot === 'start') {
    state.screen = 'start';
    showStart();
  } else if (shot === 'complete') {
    state.levelIndex = 2;
    state.found = new Set(level().diffs.map((d) => d.id));
    state.timeLeft = 33;
    state.score = 2450;
    state.screen = 'levelComplete';
    showOverlay(
      'Mountain Observatory cleared!',
      `All 7 differences found · time bonus +165<br>Score <b>2450</b> — you found them all!`,
      'Play again',
      startGame,
    );
  }
  updateHud(state, els);
}

function showStart() {
  state.screen = 'start';
  showOverlay(
    'Harbour Lights',
    `A spot-the-difference game in three hand-drawn scenes.<br><br>` +
      `<b>How to play:</b> two pictures sit side by side — seven things differ. ` +
      `Click a difference on either picture (or steer with the arrow keys and press Enter). ` +
      `Each find scores 100 points, streaks build a combo. ` +
      `A wrong click costs 5 seconds; <b>H</b> spends a hint (3 per level, 10 seconds each). ` +
      `Beat the clock on all three levels to win.<br><br>` +
      `Levels: Harbour at Dusk (120s) · Night Market (100s) · Mountain Observatory (90s)`,
    'Start hunting',
    startGame,
  );
  updateHud(state, els);
}

// ------------------------------------------------------------- main loop
let lastNow = performance.now();

function frame(now) {
  const dt = Math.min(0.1, (now - lastNow) / 1000);
  lastNow = now;
  if (state.screen === 'playing' && !state.paused && !state.shotMode) {
    state.timeLeft -= dt;
    const sec = Math.ceil(state.timeLeft);
    if (sec <= 10 && sec !== state.lastTickSecond && state.timeLeft > 0) {
      state.lastTickSecond = sec;
      sfx.tick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      gameOver();
    }
  }
  state.crosshair = input.getCrosshair();
  drawPanels(state, leftCtx, rightCtx, now);
  updateHud(state, els);
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------- wire it up
const input = bindInput({
  leftCanvas: els.left,
  rightCanvas: els.right,
  onPick,
  onHint,
  onRestart,
  onNext,
  onPause,
  onSound,
  onAnyGesture: () => sfx.unlock(),
});

els.hintBtn.addEventListener('click', () => {
  sfx.unlock();
  onHint();
});
els.restartBtn.addEventListener('click', () => {
  sfx.unlock();
  onRestart();
});
els.pauseBtn.addEventListener('click', () => {
  sfx.unlock();
  onPause();
});
els.soundBtn.addEventListener('click', () => {
  sfx.unlock();
  onSound();
});

applyShotParam();
if (state.screen === 'start' && !state.shotMode) showStart();
if (state.screen === 'start' && state.shotMode) updateHud(state, els);
requestAnimationFrame(frame);
