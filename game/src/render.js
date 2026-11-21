// render.js — paints the two panels and the HUD. One job: turn the game
// state into pixels and DOM text. It never owns state and never reads input.

import { LEVELS } from './scenes.js';

export const PANEL_W = 560;
export const PANEL_H = 400;

export function drawPanels(state, leftCtx, rightCtx, now) {
  const level = LEVELS[state.levelIndex];
  const diffSet = new Set();
  // Wrong-click shake: nudge both panels for a few frames.
  let sx = 0;
  let sy = 0;
  if (state.shakeUntil && now < state.shakeUntil) {
    sx = (Math.random() - 0.5) * 5;
    sy = (Math.random() - 0.5) * 5;
  }
  leftCtx.save();
  leftCtx.translate(sx, sy);
  // Left panel: the original scene, no differences.
  level.draw(leftCtx, PANEL_W, PANEL_H, diffSet);
  leftCtx.restore();
  // Right panel: the same scene with all seven differences applied.
  for (const d of level.diffs) diffSet.add(d.id);
  rightCtx.save();
  rightCtx.translate(sx, sy);
  level.draw(rightCtx, PANEL_W, PANEL_H, diffSet);
  rightCtx.restore();

  // Ring markers on every difference already found, on both panels.
  for (const foundId of state.found) {
    const d = level.diffs.find((x) => x.id === foundId);
    if (!d) continue;
    drawFoundRing(leftCtx, d);
    drawFoundRing(rightCtx, d);
  }

  // Hint pulse: a growing ring around one unfound difference.
  if (state.hint && now < state.hint.until) {
    const d = level.diffs.find((x) => x.id === state.hint.diffId);
    if (d) {
      const p = (now - state.hint.since) / 2000;
      const alpha = 0.9 * (1 - p);
      for (const c of [leftCtx, rightCtx]) {
        c.save();
        c.strokeStyle = `rgba(255, 209, 102, ${alpha})`;
        c.lineWidth = 4;
        c.beginPath();
        c.arc(d.x, d.y, d.r + 4 + p * 26, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }
  }

  // Keyboard crosshair, mirrored on both panels.
  if (state.screen === 'playing' && state.crosshair.visible && !state.shotMode) {
    drawCrosshair(leftCtx, state.crosshair);
    drawCrosshair(rightCtx, state.crosshair);
  }
}

function drawFoundRing(c, d) {
  c.save();
  c.strokeStyle = '#ffd166';
  c.lineWidth = 4;
  c.beginPath();
  c.arc(d.x, d.y, d.r + 2, 0, Math.PI * 2);
  c.stroke();
  c.strokeStyle = '#d94f3d';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(d.x, d.y, d.r + 6, 0, Math.PI * 2);
  c.stroke();
  // small check mark in the ring's corner
  c.strokeStyle = '#ffd166';
  c.lineWidth = 3;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(d.x + d.r * 0.45, d.y - d.r * 0.55);
  c.lineTo(d.x + d.r * 0.65, d.y - d.r * 0.3);
  c.lineTo(d.x + d.r * 1.0, d.y - d.r * 0.75);
  c.stroke();
  c.restore();
}

function drawCrosshair(c, pos) {
  c.save();
  c.strokeStyle = 'rgba(255,255,255,0.95)';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.moveTo(pos.x - 20, pos.y);
  c.lineTo(pos.x - 8, pos.y);
  c.moveTo(pos.x + 8, pos.y);
  c.lineTo(pos.x + 20, pos.y);
  c.moveTo(pos.x, pos.y - 20);
  c.lineTo(pos.x, pos.y - 8);
  c.moveTo(pos.x, pos.y + 8);
  c.lineTo(pos.x, pos.y + 20);
  c.stroke();
  c.restore();
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function updateHud(state, els) {
  const level = LEVELS[state.levelIndex];
  const total = level.diffs.length;
  const found = state.found.size;
  const left = total - found;
  els.counter.textContent = `Found ${found}/${total} · ${left} to go`;
  els.timer.textContent = fmtTime(state.timeLeft);
  els.score.textContent = `Score ${state.score}`;
  els.levelName.textContent = `Level ${state.levelIndex + 1} — ${level.name}`;
  els.hints.textContent = `Hints ${state.hintsLeft}`;
  const pct = Math.max(0, Math.min(1, state.timeLeft / level.timeLimit));
  els.timeBar.style.width = `${pct * 100}%`;
  els.timeBar.classList.toggle('low', state.timeLeft <= 10 && state.screen === 'playing');
  els.message.textContent = state.message;
}
