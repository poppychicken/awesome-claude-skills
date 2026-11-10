#!/usr/bin/env node
/**
 * Recolour images to the Pop Consulting hero blend with a gradient map.
 *
 * Each pixel's brightness is stretched to the image's own range (1st-99.5th percentile), then
 * mapped onto: deep Abyss (shadows) -> Abyss -> Marine -> Teal -> Reef (highlights).
 * Shapes and lighting are kept; only the colours change.
 *
 * Usage (from consultancy-site/):
 *   node scripts/gradient-map.cjs <input.jpg> <output.jpg> [more input/output pairs...]
 */
const sharp = require('sharp');

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const STOPS = [
  [0, '#061a2b'],
  [0.18, '#0e3a5c'], // Abyss
  [0.45, '#1a6fa3'], // Marine
  [0.75, '#38b3c6'], // Teal
  [1, '#9be8d8'], // Reef
].map(([p, c]) => [p, hex(c)]);

const LUT = Array.from({ length: 256 }, (_, v) => {
  const t = v / 255;
  for (let i = 1; i < STOPS.length; i++) {
    const [p0, c0] = STOPS[i - 1];
    const [p1, c1] = STOPS[i];
    if (t <= p1) {
      const k = (t - p0) / (p1 - p0);
      return c0.map((x, j) => Math.round(x + (c1[j] - x) * k));
    }
  }
  return STOPS.at(-1)[1];
});

async function gradientMap(input, output) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const Y = new Uint8Array(data.length / 3);
  const hist = new Array(256).fill(0);
  for (let i = 0, k = 0; i < data.length; i += 3, k++) {
    Y[k] = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    hist[Y[k]]++;
  }
  const percentile = (q) => {
    let n = 0;
    for (let v = 0; v < 256; v++) if ((n += hist[v]) >= q * Y.length) return v;
    return 255;
  };
  const lo = percentile(0.01);
  const hi = percentile(0.995);
  const out = Buffer.alloc(data.length);
  for (let i = 0, k = 0; i < data.length; i += 3, k++) {
    const y = Math.max(0, Math.min(255, Math.round(((Y[k] - lo) / Math.max(1, hi - lo)) * 255)));
    [out[i], out[i + 1], out[i + 2]] = LUT[y];
  }
  const res = await sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(output);
  console.log(`${input} -> ${output} (${res.width}x${res.height}, ${Math.round(res.size / 1024)} KB)`);
}

const args = process.argv.slice(2);
if (args.length < 2 || args.length % 2) {
  console.error('Usage: node scripts/gradient-map.cjs <input> <output> [<input> <output> ...]');
  process.exit(1);
}
(async () => {
  for (let i = 0; i < args.length; i += 2) await gradientMap(args[i], args[i + 1]);
})();
