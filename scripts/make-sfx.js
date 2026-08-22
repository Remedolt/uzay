/**
 * Basit 16-bit mono WAV ses dosyaları üretir (royalty-free, prosedürel).
 */
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "assets", "sfx");
fs.mkdirSync(outDir, { recursive: true });

function writeWav(file, samples, sampleRate = 22050) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(path.join(outDir, file), buffer);
  console.log("wrote", file, samples.length);
}

function tone(freq, dur, sampleRate, gain = 0.35, type = "sine") {
  const n = Math.floor(sampleRate * dur);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / sampleRate;
    const env = Math.min(1, i / (0.01 * sampleRate)) * Math.exp(-3.2 * t / dur);
    let v = 0;
    if (type === "sine") v = Math.sin(2 * Math.PI * freq * t);
    else if (type === "square") v = Math.sign(Math.sin(2 * Math.PI * freq * t));
    else if (type === "noise") v = Math.random() * 2 - 1;
    else if (type === "saw") v = 2 * ((t * freq) % 1) - 1;
    samples[i] = v * gain * env;
  }
  return samples;
}

function concat(...parts) {
  let len = 0;
  for (const p of parts) len += p.length;
  const out = new Float32Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function mix(a, b, gainB = 1) {
  const n = Math.max(a.length, b.length);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    out[i] = (a[i] || 0) + (b[i] || 0) * gainB;
  }
  return out;
}

const sr = 22050;

// Kısa lazer peşi
writeWav(
  "laser.wav",
  mix(
    tone(880, 0.07, sr, 0.28, "saw"),
    tone(1320, 0.05, sr, 0.18, "sine"),
    1
  )
);

// Meteor patlaması
{
  const noise = tone(1, 0.28, sr, 0.45, "noise");
  for (let i = 0; i < noise.length; i += 1) {
    const t = i / sr;
    noise[i] *= Math.exp(-8 * t);
  }
  const boom = mix(noise, tone(90, 0.22, sr, 0.4, "sine"));
  writeWav("explode.wav", boom);
}

// Can kaybı / hasar
writeWav(
  "hit.wav",
  concat(
    tone(220, 0.1, sr, 0.4, "square"),
    tone(140, 0.16, sr, 0.35, "saw")
  )
);

// Game over
writeWav(
  "gameover.wav",
  concat(
    tone(330, 0.18, sr, 0.35, "sine"),
    tone(247, 0.2, sr, 0.35, "sine"),
    tone(185, 0.35, sr, 0.4, "sine")
  )
);

// Gemi seç / UI
writeWav("select.wav", tone(660, 0.06, sr, 0.25, "sine"));

// Level up
writeWav(
  "levelup.wav",
  concat(
    tone(523, 0.08, sr, 0.3, "sine"),
    tone(659, 0.08, sr, 0.3, "sine"),
    tone(784, 0.12, sr, 0.32, "sine")
  )
);

console.log("sfx ready in", outDir);
