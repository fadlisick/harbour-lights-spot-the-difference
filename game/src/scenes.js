// scenes.js — the art of Harbour Lights: Spot the Difference.
// One draw function per level. Each draws the SAME scene twice: the left
// panel with no differences applied, the right panel with every difference
// in `diffs` applied. A difference is data-driven: each drawable element
// checks whether its diff id is in the set and changes only that element,
// so the two panels stay near-identical by construction.
// All randomness comes from a fixed seed, so every load renders identically.

export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sky(ctx, W, H, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 6 * s, x + 9 * s, y);
  ctx.stroke();
}

function pine(ctx, x, y, s, color) {
  poly(ctx, [[x, y - 46 * s], [x - 20 * s, y + 6 * s], [x + 20 * s, y + 6 * s]], color);
  poly(ctx, [[x, y - 30 * s], [x - 16 * s, y + 18 * s], [x + 16 * s, y + 18 * s]], color);
  rect(ctx, x - 3 * s, y + 14 * s, 6 * s, 12 * s, '#5a3d24');
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? r : r * 0.38;
    const px = x + Math.cos(ang) * rad;
    const py = y + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- level 1
function drawHarbour(ctx, W, H, diffs) {
  const has = (id) => diffs.has(id);
  sky(ctx, W, H, [[0, '#2b3a67'], [0.45, '#e8836b'], [0.62, '#f7b267'], [1, '#274060']]);
  // setting sun (colour change is diff d2? no — sun stays; lighthouse lamp changes)
  circle(ctx, 448, 128, 34, '#ffd166');
  circle(ctx, 448, 128, 46, 'rgba(255,209,102,0.25)');
  // clouds
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.ellipse(150, 84, 62, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(210, 92, 44, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(330, 60, 48, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // gulls: diff d1 removes the middle gull on the right panel
  gull(ctx, 300, 62, 1, '#2c2c34');
  if (!has('gull')) gull(ctx, 418, 66, 1, '#2c2c34');
  gull(ctx, 492, 52, 0.8, '#2c2c34');
  gull(ctx, 250, 96, 0.7, '#3a3a44');
  // distant headland
  poly(ctx, [[0, 210], [120, 168], [260, 206], [0, 226]], '#3d4a6b');
  poly(ctx, [[300, 214], [430, 176], [560, 210], [560, 226], [300, 226]], '#35415f');
  // harbour buildings with lit windows; diff d7 removes one lit window
  rect(ctx, 470, 168, 66, 58, '#232c44');
  rect(ctx, 470, 168, 66, 8, '#1a2233');
  rect(ctx, 482, 186, 12, 14, '#ffd166');
  rect(ctx, 500, 186, 12, 14, has('window') ? '#232c44' : '#ffd166');
  rect(ctx, 518, 186, 12, 14, '#ffd166');
  rect(ctx, 482, 206, 12, 14, '#ffd166');
  rect(ctx, 500, 206, 12, 14, '#ffd166');
  rect(ctx, 518, 206, 12, 14, '#ffd166');
  // lighthouse
  rect(ctx, 74, 96, 34, 130, '#f4f1ea');
  rect(ctx, 74, 118, 34, 12, '#d94f3d');
  rect(ctx, 74, 152, 34, 12, '#d94f3d');
  rect(ctx, 74, 186, 34, 12, '#d94f3d');
  rect(ctx, 68, 84, 46, 14, '#2c2c34');
  // lighthouse lamp: diff d2 changes its colour (warm yellow vs red)
  circle(ctx, 91, 78, 10, has('lamp') ? '#ff5a4e' : '#ffe066');
  circle(ctx, 91, 78, 17, has('lamp') ? 'rgba(255,90,78,0.30)' : 'rgba(255,224,102,0.35)');
  // light beam
  ctx.fillStyle = has('lamp') ? 'rgba(255,90,78,0.10)' : 'rgba(255,224,102,0.16)';
  poly(ctx, [[108, 74], [230, 46], [230, 102], [108, 84]], ctx.fillStyle);
  // flag on the lighthouse: diff d6 flips it
  ctx.strokeStyle = '#2c2c34';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(91, 84);
  ctx.lineTo(91, 58);
  ctx.stroke();
  if (has('flag')) poly(ctx, [[91, 58], [66, 63], [91, 70]], '#d94f3d');
  else poly(ctx, [[91, 58], [116, 63], [91, 70]], '#d94f3d');
  // sea
  const sea = ctx.createLinearGradient(0, 226, 0, H);
  sea.addColorStop(0, '#e8836b');
  sea.addColorStop(0.25, '#c96f5e');
  sea.addColorStop(1, '#1d2f52');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 226, W, H - 226);
  // sun glitter on the water
  ctx.fillStyle = 'rgba(255,209,102,0.5)';
  for (let i = 0; i < 7; i++) {
    const y = 244 + i * 20;
    ctx.fillRect(420 - i * 6, y, 56 + i * 8, 3);
  }
  // wave lines
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 2;
  for (const [x, y, w] of [[60, 268, 90], [220, 300, 110], [380, 262, 80], [120, 348, 100], [300, 366, 120], [460, 330, 90]]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + w / 2, y - 6, x + w, y);
    ctx.stroke();
  }
  // big sailboat: diff d3 changes the sail colour
  poly(ctx, [[268, 250], [268, 150], [338, 250]], has('sail') ? '#2a9d8f' : '#f4f1ea');
  poly(ctx, [[262, 250], [262, 172], [206, 250]], '#e8e0cf');
  ctx.strokeStyle = '#2c2c34';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(265, 148);
  ctx.lineTo(265, 256);
  ctx.stroke();
  poly(ctx, [[196, 252], [352, 252], [336, 268], [212, 268]], '#7a4a2b');
  rect(ctx, 250, 236, 34, 16, '#5a3d24');
  // small rowboat
  poly(ctx, [[120, 316], [180, 316], [168, 330], [132, 330]], '#8c5a2e');
  ctx.strokeStyle = '#2c2c34';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 316);
  ctx.lineTo(150, 292);
  ctx.stroke();
  // crates on the quay: diff d5 moves one crate
  rect(ctx, 36, 330, 34, 30, '#b08954');
  rect(ctx, 36, 330, 34, 5, '#8a6a3e');
  rect(ctx, 72, 342, 30, 18, '#b08954');
  const crateX = has('crate') ? 210 : 176;
  rect(ctx, crateX, 336, 30, 24, '#b08954');
  rect(ctx, crateX, 336, 30, 5, '#8a6a3e');
  // quay
  rect(ctx, 0, 360, W, 40, '#3a3f4d');
  rect(ctx, 0, 360, W, 5, '#4d5265');
  // buoy: diff d4 adds a second buoy on the right panel
  circle(ctx, 430, 330, 10, '#ff5a4e');
  rect(ctx, 426, 312, 8, 10, '#ff5a4e');
  if (has('buoy')) {
    circle(ctx, 500, 346, 9, '#ff5a4e');
    rect(ctx, 496, 330, 8, 9, '#ff5a4e');
  }
  // foreground rope coil
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(520, 384, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(520, 384, 7, 0, Math.PI * 2);
  ctx.stroke();
}

// ---------------------------------------------------------------- level 2
function drawMarket(ctx, W, H, diffs) {
  const has = (id) => diffs.has(id);
  sky(ctx, W, H, [[0, '#12142b'], [0.55, '#2a2350'], [1, '#120e26']]);
  // moon + stars
  circle(ctx, 486, 62, 26, '#f4ead8');
  circle(ctx, 476, 56, 22, 'rgba(18,20,43,0.55)');
  const rng = makeRng(202);
  for (let i = 0; i < 26; i++) {
    const x = 20 + rng() * 520;
    const y = 14 + rng() * 120;
    if (x > 440 && x < 530 && y < 110) continue;
    star(ctx, x, y, 1.6 + rng() * 1.8, 'rgba(255,255,255,0.85)');
  }
  // string lights across the top; diff d5 changes one bulb's colour
  ctx.strokeStyle = '#0c0c18';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.quadraticCurveTo(280, 78, 560, 26);
  ctx.stroke();
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const x = t * 560;
    const y = 30 + Math.sin(t * Math.PI) * 44 - 4;
    const colors = ['#ffd166', '#ff5a4e', '#2a9d8f', '#e8836b'];
    circle(ctx, x, y + 10, 6, i === 6 && has('bulb') ? '#7bd88a' : colors[i % 4]);
  }
  // rooftops
  poly(ctx, [[0, 150], [120, 118], [240, 150], [0, 168]], '#1d1a3a');
  poly(ctx, [[320, 150], [450, 112], [560, 148], [560, 168], [320, 168]], '#1d1a3a');
  // stall 1 (left): striped awning; diff d6 changes the stripe count
  const stripes = has('awning') ? 4 : 6;
  for (let i = 0; i < stripes; i++) {
    rect(ctx, 36 + i * (150 / stripes), 168, 150 / stripes, 26, i % 2 === 0 ? '#d94f3d' : '#f4ead8');
  }
  rect(ctx, 36, 194, 150, 8, '#5a3d24');
  rect(ctx, 44, 202, 134, 64, '#6b4a2f');
  rect(ctx, 44, 202, 134, 6, '#8a6a3e');
  // fruit crates on stall 1; diff d3 changes the fruit colour
  circle(ctx, 70, 226, 9, has('fruit') ? '#e63946' : '#f4842b');
  circle(ctx, 90, 226, 9, has('fruit') ? '#e63946' : '#f4842b');
  circle(ctx, 80, 214, 9, has('fruit') ? '#e63946' : '#f4842b');
  circle(ctx, 130, 226, 9, '#7fb069');
  circle(ctx, 150, 226, 9, '#7fb069');
  circle(ctx, 140, 214, 9, '#7fb069');
  // stall sign: diff d2 changes the number (7 vs 1)
  rect(ctx, 96, 150, 30, 16, '#f4ead8');
  ctx.fillStyle = '#232c44';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(has('sign') ? '1' : '7', 111, 159);
  // stall 2 (right): lanterns; diff d1 removes one lantern
  for (let i = 0; i < 3; i++) {
    rect(ctx, 356 + i * (150 / 3), 168, 150 / 3, 26, i % 2 === 0 ? '#2a9d8f' : '#e8836b');
  }
  rect(ctx, 356, 194, 150, 8, '#5a3d24');
  rect(ctx, 364, 202, 134, 64, '#6b4a2f');
  rect(ctx, 364, 202, 134, 6, '#8a6a3e');
  // hanging lanterns under stall 2's awning
  circle(ctx, 392, 216, 11, '#ff5a4e');
  circle(ctx, 392, 216, 15, 'rgba(255,90,78,0.25)');
  if (!has('lantern')) {
    circle(ctx, 448, 216, 11, '#ffd166');
    circle(ctx, 448, 216, 15, 'rgba(255,209,102,0.25)');
  }
  circle(ctx, 504, 216, 11, '#ff5a4e');
  circle(ctx, 504, 216, 15, 'rgba(255,90,78,0.25)');
  // jars on stall 2
  rect(ctx, 384, 232, 18, 22, '#c96f5e');
  rect(ctx, 410, 232, 18, 22, '#7fb069');
  rect(ctx, 436, 232, 18, 22, '#c96f5e');
  rect(ctx, 462, 232, 18, 22, '#e8b4b8');
  // big paper lanterns strung between stalls
  ctx.strokeStyle = '#0c0c18';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(210, 176);
  ctx.lineTo(210, 210);
  ctx.stroke();
  circle(ctx, 210, 224, 16, '#ff5a4e');
  ctx.beginPath();
  ctx.moveTo(330, 176);
  ctx.lineTo(330, 210);
  ctx.stroke();
  circle(ctx, 330, 224, 16, '#ffd166');
  // cobbled street
  rect(ctx, 0, 266, W, 134, '#2b2740');
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 9; c++) {
      ctx.beginPath();
      ctx.ellipse(34 + c * 62 + (r % 2) * 30, 284 + r * 28, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // umbrella leaning on stall 1: diff d7 rotates it
  ctx.save();
  ctx.translate(268, 300);
  ctx.rotate(has('umbrella') ? -0.9 : -0.25);
  ctx.strokeStyle = '#8a6a3e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 62);
  ctx.stroke();
  poly(ctx, [[-4, 0], [4, 0], [16, -26], [-16, -26]], '#d94f3d');
  ctx.restore();
  // cat: diff d4 adds a cat on the right panel
  if (has('cat')) {
    ctx.fillStyle = '#1a1a22';
    ctx.beginPath();
    ctx.ellipse(300, 348, 20, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 316, 332, 10, '#1a1a22');
    poly(ctx, [[310, 324], [312, 314], [316, 323]], '#1a1a22');
    poly(ctx, [[320, 323], [324, 314], [326, 324]], '#1a1a22');
    ctx.strokeStyle = '#1a1a22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(282, 350);
    ctx.quadraticCurveTo(268, 338, 272, 326);
    ctx.stroke();
  }
  // shopping basket left on the street
  rect(ctx, 96, 330, 44, 22, '#b08954');
  ctx.strokeStyle = '#8a6a3e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(106, 330);
  ctx.quadraticCurveTo(118, 312, 130, 330);
  ctx.stroke();
  // warm light pools
  ctx.fillStyle = 'rgba(255,209,102,0.10)';
  ctx.beginPath();
  ctx.ellipse(120, 300, 110, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(440, 300, 110, 26, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------- level 3
function drawObservatory(ctx, W, H, diffs) {
  const has = (id) => diffs.has(id);
  sky(ctx, W, H, [[0, '#070a1c'], [0.6, '#101736'], [1, '#1c2340']]);
  // milky way band
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.save();
  ctx.translate(280, 120);
  ctx.rotate(-0.5);
  ctx.fillRect(-260, -26, 520, 52);
  ctx.restore();
  const rng = makeRng(303);
  for (let i = 0; i < 60; i++) {
    const x = 10 + rng() * 540;
    const y = 8 + rng() * 150;
    star(ctx, x, y, 1 + rng() * 1.6, `rgba(255,255,255,${0.4 + rng() * 0.6})`);
  }
  // constellation: diff d1 removes one star of the little dipper
  const dipper = [[120, 52], [148, 44], [176, 50], [198, 66], [214, 88], [196, 100], [172, 92]];
  ctx.strokeStyle = 'rgba(180,200,255,0.5)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  dipper.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.stroke();
  dipper.forEach(([x, y], i) => {
    if (i === 3 && has('constellation')) return;
    star(ctx, x, y, 3.2, '#dfe8ff');
  });
  // crescent moon: diff d7 changes the phase (crescent vs half)
  circle(ctx, 470, 66, 26, '#f4ead8');
  if (has('moon')) {
    circle(ctx, 470, 66, 26, '#f4ead8');
    circle(ctx, 452, 60, 24, '#101736');
  } else {
    circle(ctx, 452, 60, 24, '#101736');
  }
  // shooting star
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(330, 40);
  ctx.lineTo(368, 62);
  ctx.stroke();
  circle(ctx, 330, 40, 2.5, '#fff');
  // mountains
  poly(ctx, [[0, 260], [130, 150], [250, 260]], '#232c4a');
  poly(ctx, [[180, 260], [330, 128], [470, 260]], '#1a2340');
  poly(ctx, [[380, 260], [500, 170], [560, 260]], '#232c4a');
  // snow caps
  poly(ctx, [[130, 150], [112, 172], [130, 166], [148, 174]], '#e8ecf7');
  poly(ctx, [[330, 128], [310, 152], [330, 146], [350, 154]], '#e8ecf7');
  // observatory dome
  circle(ctx, 268, 236, 52, '#c9cedb');
  rect(ctx, 216, 236, 104, 40, '#aab0c2');
  rect(ctx, 216, 236, 104, 6, '#8b91a5');
  // dome slit + telescope: diff d2 rotates the telescope
  ctx.save();
  ctx.translate(268, 224);
  ctx.rotate(has('telescope') ? 0.5 : -0.35);
  rect(ctx, -6, -64, 12, 64, '#3a4258');
  poly(ctx, [[-9, -64], [9, -64], [6, -78], [-6, -78]], '#2c3247');
  ctx.restore();
  // dome light stays warm; the small round window changes colour instead
  circle(ctx, 268, 200, 7, '#ffd166');
  circle(ctx, 268, 200, 12, 'rgba(255,209,102,0.3)');
  // door + window
  rect(ctx, 258, 252, 20, 24, '#2c3247');
  circle(ctx, 228, 252, 6, has('dome') ? '#7bd88a' : '#ffd166');
  // satellite dish: diff d5 flips its direction
  ctx.strokeStyle = '#8b91a5';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(420, 276);
  ctx.lineTo(420, 226);
  ctx.stroke();
  ctx.save();
  ctx.translate(420, 222);
  if (has('dish')) ctx.scale(-1, 1);
  ctx.beginPath();
  ctx.arc(0, 0, 22, -Math.PI * 0.75, Math.PI * 0.1);
  ctx.fillStyle = '#c9cedb';
  ctx.fill();
  ctx.restore();
  // pine forest; diff d3 removes one pine
  pine(ctx, 60, 300, 1.1, '#16281c');
  pine(ctx, 110, 308, 0.9, '#1a2f21');
  if (!has('pine')) pine(ctx, 160, 302, 1.2, '#16281c');
  pine(ctx, 500, 306, 1.1, '#1a2f21');
  pine(ctx, 540, 298, 0.9, '#16281c');
  pine(ctx, 36, 330, 0.8, '#1a2f21');
  // cabin with window: diff d6 turns its light off
  rect(ctx, 66, 330, 66, 44, '#4a3423');
  poly(ctx, [[60, 330], [99, 306], [138, 330]], '#2e2015');
  rect(ctx, 78, 346, 14, 14, has('cabin') ? '#2e2015' : '#ffd166');
  rect(ctx, 106, 346, 14, 14, has('cabin') ? '#2e2015' : '#ffd166');
  rect(ctx, 92, 356, 12, 18, '#241a10');
  // ground
  rect(ctx, 0, 372, W, 28, '#0c1226');
  // fireflies / ground glow
  ctx.fillStyle = 'rgba(255,209,102,0.5)';
  circle(ctx, 200, 384, 2, 'rgba(255,209,102,0.7)');
  circle(ctx, 380, 390, 2, 'rgba(255,209,102,0.7)');
  circle(ctx, 470, 382, 2, 'rgba(255,209,102,0.7)');
}

export const LEVELS = [
  {
    id: 'harbour',
    name: 'Harbour at Dusk',
    tagline: 'Fishing boats, a lighthouse and gulls at sunset.',
    timeLimit: 120,
    seed: 11,
    draw: drawHarbour,
    diffs: [
      { id: 'gull', x: 418, y: 66, r: 24, label: 'a gull in the sky' },
      { id: 'lamp', x: 91, y: 78, r: 22, label: 'the lighthouse lamp' },
      { id: 'sail', x: 300, y: 200, r: 30, label: 'the big sail' },
      { id: 'buoy', x: 500, y: 346, r: 22, label: 'a buoy in the water' },
      { id: 'crate', x: 191, y: 348, r: 24, label: 'a crate on the quay' },
      { id: 'flag', x: 91, y: 63, r: 20, label: 'the lighthouse flag' },
      { id: 'window', x: 506, y: 193, r: 20, label: 'a lit window' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    tagline: 'Lanterns, fruit stalls and one very quiet cat.',
    timeLimit: 100,
    seed: 202,
    draw: drawMarket,
    diffs: [
      { id: 'lantern', x: 448, y: 216, r: 22, label: 'a hanging lantern' },
      { id: 'sign', x: 111, y: 158, r: 20, label: 'the stall number' },
      { id: 'fruit', x: 80, y: 220, r: 24, label: 'the fruit in the crate' },
      { id: 'cat', x: 300, y: 342, r: 26, label: 'a cat on the street' },
      { id: 'bulb', x: 280, y: 84, r: 20, label: 'a bulb on the string lights' },
      { id: 'awning', x: 111, y: 181, r: 26, label: 'the awning stripes' },
      { id: 'umbrella', x: 268, y: 300, r: 26, label: 'the leaning umbrella' },
    ],
  },
  {
    id: 'observatory',
    name: 'Mountain Observatory',
    tagline: 'A telescope, a little dipper and a cold clear sky.',
    timeLimit: 90,
    seed: 303,
    draw: drawObservatory,
    diffs: [
      { id: 'constellation', x: 198, y: 66, r: 22, label: 'a star in the dipper' },
      { id: 'telescope', x: 268, y: 190, r: 28, label: 'the telescope' },
      { id: 'pine', x: 160, y: 290, r: 26, label: 'a pine tree' },
      { id: 'dome', x: 228, y: 252, r: 20, label: 'the dome window' },
      { id: 'dish', x: 420, y: 222, r: 26, label: 'the satellite dish' },
      { id: 'cabin', x: 99, y: 353, r: 24, label: 'the cabin windows' },
      { id: 'moon', x: 470, y: 66, r: 28, label: 'the moon' },
    ],
  },
];
