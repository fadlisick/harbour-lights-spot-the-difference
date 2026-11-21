// audio.js — every sound in Harbour Lights is synthesised live with
// WebAudio. No audio files, no network. The context is created lazily on
// the first user gesture (browsers block audio before that) and every call
// is a safe no-op when audio is unavailable or muted.

let ctx = null;
let muted = false;

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
}

function tone(freq, dur, type, gain, when = 0, slideTo = null) {
  const ac = ensureCtx();
  if (!ac || muted) return;
  try {
    if (ac.state === 'suspended') void ac.resume();
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    // Audio must never break the game.
  }
}

export const sfx = {
  // Satisfying two-note pop when a difference is found.
  pop() {
    tone(660, 0.09, 'sine', 0.22);
    tone(990, 0.16, 'sine', 0.2, 0.07);
  },
  // Low buzz for a wrong click.
  miss() {
    tone(160, 0.18, 'sawtooth', 0.08, 0, 110);
  },
  // Soft click for buttons and the crosshair.
  click() {
    tone(520, 0.05, 'triangle', 0.12);
  },
  // Rising chime when a hint fires.
  hint() {
    tone(880, 0.12, 'sine', 0.14);
    tone(1174, 0.2, 'sine', 0.12, 0.09);
  },
  // Little arpeggio when a level is cleared.
  levelClear() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.16, i * 0.09));
  },
  // Warm fanfare for finishing all three levels.
  win() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.3, 'triangle', 0.16, i * 0.11));
    tone(262, 0.6, 'sine', 0.1, 0.1);
  },
  // Sad descending notes when time runs out.
  gameOver() {
    [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'sine', 0.14, i * 0.14));
  },
  // Short tick in the last ten seconds.
  tick() {
    tone(1200, 0.04, 'square', 0.05);
  },
  isMuted() {
    return muted;
  },
  toggleMute() {
    muted = !muted;
    return muted;
  },
  // Warm the context up after a real gesture so the first pop is instant.
  unlock() {
    ensureCtx();
  },
};
