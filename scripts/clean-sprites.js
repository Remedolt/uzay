const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "assets");
const files = fs
  .readdirSync(dir)
  .filter((f) => /^(ship|meteor)-.*\.png$/i.test(f));

function isBg(r, g, b, a) {
  if (a < 8) return true;
  const brightness = (r + g + b) / 3;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  if (brightness >= 200 && sat <= 45) return true;
  if (brightness >= 175 && sat <= 20) return true;
  return false;
}

async function clean(file) {
  const input = path.join(dir, file);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const out = Buffer.from(data);
  const visited = new Uint8Array(w * h);
  const stack = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!isBg(out[i], out[i + 1], out[i + 2], out[i + 3])) return;
    visited[idx] = 1;
    stack.push(idx);
  };

  for (let x = 0; x < w; x += 1) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y += 1) {
    push(0, y);
    push(w - 1, y);
  }

  while (stack.length) {
    const idx = stack.pop();
    const i = idx * 4;
    out[i + 3] = 0;
    const x = idx % w;
    const y = (idx / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let i = 0; i < out.length; i += 4) {
    const a = out[i + 3];
    if (a === 0) continue;
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const brightness = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (brightness > 220 && sat < 30 && a < 180) out[i + 3] = 0;
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(input);

  console.log("cleaned", file);
}

(async () => {
  for (const f of files) await clean(f);
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
