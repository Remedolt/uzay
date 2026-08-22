const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "assets");
const files = fs
  .readdirSync(dir)
  .filter((f) => /^(ship|meteor)-.*\.png$/i.test(f));

async function knockWhite(file) {
  const input = path.join(dir, file);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const brightness = (r + g + b) / 3;
    const sat = max - min;

    if (brightness >= 245 && sat <= 35) {
      out[i + 3] = 0;
    } else if (brightness >= 230 && sat <= 25) {
      out[i + 3] = 0;
    } else if (brightness >= 215 && sat <= 18) {
      out[i + 3] = Math.min(out[i + 3], 30);
    } else if (brightness >= 200 && sat <= 12) {
      out[i + 3] = Math.min(out[i + 3], 70);
    }
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(input);

  console.log("fixed", file, `${info.width}x${info.height}`);
}

(async () => {
  console.log("files", files);
  for (const f of files) await knockWhite(f);
  console.log("done", files.length);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
