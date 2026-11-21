// Harbour Lights: Spot the Difference — the hand-in program.
// Node 22, standard library only. It copies this repository's game/ and
// screenshots/ into /output (or MAKEFUN_OUTPUT_DIR outside the grader) and
// writes /output/dossier.json with the vendored make.fun library, so the
// gate can check the game and the judge can read its outline.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The gate's caps, as the kit's reference lists them: at most 4 screenshots
// of 256 KiB each, at most 993 files / 48 MiB under game/, paths under
// 1000 bytes, dossier text capped at 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// The grader collects /output as another user, so every file it holds must
// be world-readable and every folder world-traversable. Fix the modes of
// everything copied in — but never the /output directory itself, which the
// harness owns (chmod on it raises PermissionError).
function fixModes(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      chmodSync(path, 0o755);
      fixModes(path);
    } else {
      chmodSync(path, 0o644);
    }
  }
}
fixModes(out);
