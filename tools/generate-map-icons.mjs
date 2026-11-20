#!/usr/bin/env node
/* Generates schematic map icons (PNG, same basename as the .rms) for the
   DynamicRMS mod plus the mod thumbnail. Pure node: PNG via zlib, JPEG via
   jpeg-js when installed (npm i jpeg-js in tools/, optional).

   Icon convention (verified against subscribed mods 18.11.2026): a square PNG
   named exactly like the .rms sits next to it in
   resources/_common/random-map-scripts/ and shows as the map picture in UI. */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = path.join(root, 'mod', 'DynamicRMS', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

/* ---------- PNG writer: RGBA8, filter 0 ---------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function pngEncode(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- tiny canvas ---------- */
function canvas(w, h, [r, g, b]) {
  const px = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    px[i * 4] = r; px[i * 4 + 1] = g; px[i * 4 + 2] = b; px[i * 4 + 3] = 255;
  }
  return { w, h, px };
}
function blend(cv, x, y, [r, g, b], a) {
  if (x < 0 || y < 0 || x >= cv.w || y >= cv.h || a <= 0) return;
  const i = (y * cv.w + x) * 4, ia = a / 255;
  cv.px[i] = Math.round(r * ia + cv.px[i] * (1 - ia));
  cv.px[i + 1] = Math.round(g * ia + cv.px[i + 1] * (1 - ia));
  cv.px[i + 2] = Math.round(b * ia + cv.px[i + 2] * (1 - ia));
}
function fillCircle(cv, cx, cy, rad, color) {
  for (let y = Math.floor(cy - rad) - 1; y <= cy + rad + 1; y++)
    for (let x = Math.floor(cx - rad) - 1; x <= cx + rad + 1; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      blend(cv, x, y, color, Math.round(255 * Math.min(1, Math.max(0, rad - d + 0.5))));
    }
}
function fillDiamond(cv, cx, cy, rad, color, outline) {
  for (let y = Math.floor(cy - rad) - 2; y <= cy + rad + 2; y++)
    for (let x = Math.floor(cx - rad) - 2; x <= cx + rad + 2; x++) {
      const d = Math.abs(x + 0.5 - cx) + Math.abs(y + 0.5 - cy);
      const ao = Math.round(255 * Math.min(1, Math.max(0, rad + 1.0 - d))); // outline band
      if (ao > 0) blend(cv, x, y, outline, ao);
      const af = Math.round(255 * Math.min(1, Math.max(0, rad - 1.4 - d))); // fill inside
      if (af > 0) blend(cv, x, y, color, af);
    }
}
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function speckle(cv, rng, cx, cy, rIn, rOut, color, count, size) {
  for (let i = 0; i < count; i++) {
    const ang = rng() * Math.PI * 2;
    const rad = rIn + rng() * (rOut - rIn);
    fillCircle(cv, cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, size * (0.5 + rng()), color);
  }
}

/* ---------- FrozenLake: concentric winter lake, schematic top-down ---------- */
const PLAYER_COLORS = [
  [71, 108, 202], [202, 57, 57], [222, 205, 61], [74, 168, 84],
  [64, 190, 190], [160, 90, 190], [150, 150, 150], [230, 145, 60],
];
function drawFrozenLake(size) {
  const cv = canvas(size, size, [58, 92, 62]); // solid forest green, no texture
  const c = size / 2;
  const u = c / 62; // lake outer radius is 48 tiles + margin

  // lake: icy shore ring, water, autumn-snow island (clean, without speckles)
  fillCircle(cv, c, c, 48 * u, [225, 232, 238]);
  fillCircle(cv, c, c, 36 * u, [205, 224, 236]);
  fillCircle(cv, c, c, 31 * u, [86, 138, 172]);
  fillCircle(cv, c, c, 26 * u, [216, 211, 196]);

  // frost aura carrier (army tent) at the very center
  fillDiamond(cv, c, c, 4.2 * u, [122, 88, 58], [52, 38, 26]);

  // players around the lake (random_placement)
  const pr = 56 * u;
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
    fillDiamond(cv, c + Math.cos(ang) * pr, c + Math.sin(ang) * pr, 5.2 * u, PLAYER_COLORS[i], [20, 24, 22]);
  }
  return cv;
}


/* ---------- SilentWoods: open temperate woods with cave hills ---------- */
function drawSilentWoods(size) {
  const cv = canvas(size, size, [116, 140, 86]); // grass base
  const c = size / 2;
  const rng = mulberry32(20261121);

  // cosmetic ground variety
  for (let i = 0; i < 10; i++) {
    const ang = rng() * Math.PI * 2, rad = rng() * c * 0.92;
    fillCircle(cv, c + Math.cos(ang) * rad, c + Math.sin(ang) * rad, size * (0.02 + rng() * 0.03), [104, 132, 78]);
  }

  // forest patches (dark green blobs, kept off the starts)
  const starts = [];
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
    starts.push([c + Math.cos(ang) * c * 0.66, c + Math.sin(ang) * c * 0.66]);
  }
  for (let i = 0; i < 14; i++) {
    const ang = rng() * Math.PI * 2, rad = c * (0.18 + rng() * 0.78);
    const fx = c + Math.cos(ang) * rad, fy = c + Math.sin(ang) * rad;
    let ok = true;
    for (const [sx, sy] of starts) if (Math.hypot(fx - sx, fy - sy) < c * 0.22) ok = false;
    if (!ok) continue;
    fillCircle(cv, fx, fy, size * (0.05 + rng() * 0.05), [44, 72, 44]);
    fillCircle(cv, fx + (rng() - 0.5) * size * 0.05, fy + (rng() - 0.5) * size * 0.05, size * (0.03 + rng() * 0.03), [38, 64, 40]);
  }

  // cave hills: dark dirt caps with gold/stone specks (2 gold + 1 stone per two starts)
  const caves = [[0.30, 0.36, 'g'], [0.66, 0.30, 'g'], [0.72, 0.68, 's'], [0.34, 0.70, 'g'], [0.52, 0.50, 's'], [0.18, 0.56, 'g']];
  for (const [fx, fy, kind] of caves) {
    const cx = fx * size, cy = fy * size;
    fillCircle(cv, cx, cy, size * 0.032, [96, 74, 52]);
    fillCircle(cv, cx, cy, size * 0.012, kind === 'g' ? [224, 186, 70] : [158, 158, 158]);
  }

  // player hilltops: tan hill disc + player color diamond
  for (let i = 0; i < 8; i++) {
    const [sx, sy] = starts[i];
    fillCircle(cv, sx, sy, size * 0.055, [180, 160, 120]);
    fillDiamond(cv, sx, sy, 4.6 * (size / 1024), PLAYER_COLORS[i], [20, 24, 22]);
  }
  return cv;
}

/* ---------- outputs ---------- */

/* ---------- outputs ---------- */
const icon = drawFrozenLake(1024);
fs.writeFileSync(path.join(iconsDir, 'FrozenLake.png'), pngEncode(icon.w, icon.h, icon.px));
console.log('icon:', path.join(iconsDir, 'FrozenLake.png'));


/* SilentWoods icon */
const swIcon = drawSilentWoods(1024);
fs.writeFileSync(path.join(iconsDir, 'SilentWoods.png'), pngEncode(swIcon.w, swIcon.h, swIcon.px));
console.log('icon:', path.join(iconsDir, 'SilentWoods.png'));

/* thumbnail 1280x720: the same composition on a dark slate backdrop */
const TW = 1280, TH = 720;
const thumb = canvas(TW, TH, [24, 30, 34]);
const small = drawFrozenLake(640);
const ox = Math.floor((TW - small.w) / 2), oy = Math.floor((TH - small.h) / 2);
for (let y = 0; y < small.h; y++)
  for (let x = 0; x < small.w; x++) {
    const i = (y * small.w + x) * 4;
    blend(thumb, ox + x, oy + y, [small.px[i], small.px[i + 1], small.px[i + 2]], 255);
  }
const thumbPng = path.join(iconsDir, 'thumbnail.png');
fs.writeFileSync(thumbPng, pngEncode(TW, TH, thumb.px));
console.log('thumbnail (png):', thumbPng);

/* JPEG for the portal when jpeg-js is available; otherwise keep the PNG */
try {
  const { encode } = (await import('jpeg-js')).default ?? await import('jpeg-js');
  fs.writeFileSync(
    path.join(iconsDir, 'thumbnail.jpg'),
    encode({ data: thumb.px, width: TW, height: TH }, 90).data,
  );
  console.log('thumbnail (jpg):', path.join(iconsDir, 'thumbnail.jpg'));
} catch {
  console.log('jpeg-js not installed - thumbnail stays PNG; convert to JPEG for the portal');
}
