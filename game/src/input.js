// input.js — mouse, touch and keyboard for Harbour Lights. One job:
// turn raw events into game calls. It never owns state; the game passes
// in handlers and this module wires them to the DOM.

import { PANEL_W, PANEL_H } from './render.js';

export function bindInput(deps) {
  const { leftCanvas, rightCanvas, onPick, onHint, onRestart, onNext, onPause, onSound, onAnyGesture } = deps;
  let crosshair = { x: PANEL_W / 2, y: PANEL_H / 2, visible: false };

  function canvasPos(canvas, ev) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = PANEL_W / rect.width;
    const scaleY = PANEL_H / rect.height;
    const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function pickFrom(canvas, ev) {
    ev.preventDefault();
    onAnyGesture();
    const p = canvasPos(canvas, ev);
    crosshair = { x: p.x, y: p.y, visible: true };
    onPick(p.x, p.y);
  }

  for (const canvas of [leftCanvas, rightCanvas]) {
    canvas.addEventListener('click', (ev) => pickFrom(canvas, ev));
    canvas.addEventListener('touchstart', (ev) => pickFrom(canvas, ev), { passive: false });
    canvas.addEventListener('mousemove', (ev) => {
      const p = canvasPos(canvas, ev);
      crosshair = { x: p.x, y: p.y, visible: true };
    });
  }

  document.addEventListener('keydown', (ev) => {
    if (ev.repeat && ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight' && ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown') return;
    const step = ev.shiftKey ? 4 : 14;
    switch (ev.key) {
      case 'ArrowLeft':
        crosshair.x = Math.max(0, crosshair.x - step);
        crosshair.visible = true;
        ev.preventDefault();
        break;
      case 'ArrowRight':
        crosshair.x = Math.min(PANEL_W, crosshair.x + step);
        crosshair.visible = true;
        ev.preventDefault();
        break;
      case 'ArrowUp':
        crosshair.y = Math.max(0, crosshair.y - step);
        crosshair.visible = true;
        ev.preventDefault();
        break;
      case 'ArrowDown':
        crosshair.y = Math.min(PANEL_H, crosshair.y + step);
        crosshair.visible = true;
        ev.preventDefault();
        break;
      case 'Enter':
      case ' ':
        onAnyGesture();
        onPick(crosshair.x, crosshair.y);
        ev.preventDefault();
        break;
      case 'h':
      case 'H':
        onHint();
        break;
      case 'r':
      case 'R':
        onRestart();
        break;
      case 'n':
      case 'N':
        onNext();
        break;
      case 'p':
      case 'P':
        onPause();
        break;
      case 'm':
      case 'M':
        onSound();
        break;
      default:
        break;
    }
  });

  // The game reads the crosshair each frame through this accessor.
  return {
    getCrosshair() {
      return crosshair;
    },
    resetCrosshair() {
      crosshair = { x: PANEL_W / 2, y: PANEL_H / 2, visible: false };
    },
  };
}
