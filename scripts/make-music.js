/**
 * Aşama başına loop'lanabilir kısa müzik.
 * node scripts/make-music.js
 */
const fs = require("fs");
const path = require("path");

const sr = 22050;
const outDir = path.join(__dirname, "..", "assets", "sfx");

const TRACKS = [
  {
    file: "music-1.wav",
    bpm: 112,
    root: 0,
    melody: [0, 3, 7, 10, 7, 3, 5, 0, 7, 12, 10, 7, 5, 3, 0, 3],
    bass: [0, 0, -5, -5, -2, -2, -7, -7],
    drums: 0.35,
    lead: "sine",
    bassType: "tri",
  },
  {
    file: "music-2.wav",
    bpm: 122,
    root: 5,
    melody: [0, 2, 7, 12, 9, 7, 4, 2, 7, 11, 14, 12, 9, 7, 4, 0],
    bass: [0, 0, 7, 7, 5, 5, -2, -2],
    drums: 0.4,
    lead: "tri",
    bassType: "sine",
  },
  {
    file: "music-3.wav",
    bpm: 132,
    root: -2,
    melody: [0, 3, 7, 12, 10, 7, 3, 0, 5, 8, 12, 15, 12, 8, 5, 3],
    bass: [0, 0, -5, -5, -2, -2, -7, -7],
    drums: 0.62,
    lead: "saw",
    bassType: "tri",
  },
  {
    file: "music-4.wav",
    bpm: 140,
    root: 3,
    melody: [0, 1, 7, 8, 12, 8, 7, 1, 3, 7, 10, 13, 10, 7, 3, 0],
    bass: [0, 0, -1, -1, -5, -5, -8, -8],
    drums: 0.78,
    lead: "saw",
    bassType: "square",
  },
  {
    file: "music-5.wav",
    bpm: 148,
    root: 8,
    melody: [0, 1, 4, 7, 8, 11, 7, 4, 1, 0, 7, 13, 12, 8, 4, 1],
    bass: [0, -1, -5, -1, 3, 3, -4, -4],
    drums: 0.85,
    lead: "square",
    bassType: "saw",
  },
  {
    file: "music-6.wav",
    bpm: 156,
    root: -5,
    melody: [0, 0, 7, 5, 3, 3, 10, 7, 0, 12, 7, 5, 3, 10, 7, 0],
    bass: [0, 0, 0, -2, -5, -5, -7, -7],
    drums: 1,
    lead: "square",
    bassType: "square",
  },
];

function noteFreq(semitone) {
  return 110 * Math.pow(2, semitone / 12);
}

function env(t, attack, release, len) {
  if (t < 0 || t > len) return 0;
  if (t < attack) return t / attack;
  const tail = len - t;
  if (tail < release) return Math.max(0, tail / release);
  return 1;
}

function writeTrack(cfg) {
  const beat = 60 / cfg.bpm;
  const bars = 8;
  const duration = bars * 4 * beat;
  const n = Math.floor(sr * duration);
  const samples = new Float32Array(n);

  const addTone = (freq, start, len, gain, type = "sine") => {
    const a = Math.floor(start * sr);
    const b = Math.min(n, Math.floor((start + len) * sr));
    for (let i = a; i < b; i += 1) {
      const t = (i - a) / sr;
      const e = env(t, 0.01, 0.08, len);
      const ph = 2 * Math.PI * freq * t;
      let v = Math.sin(ph);
      if (type === "square") v = Math.sign(Math.sin(ph));
      if (type === "saw") v = 2 * ((freq * t) % 1) - 1;
      if (type === "tri") v = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
      samples[i] += v * gain * e;
    }
  };

  const addNoise = (start, len, gain) => {
    const a = Math.floor(start * sr);
    const b = Math.min(n, Math.floor((start + len) * sr));
    for (let i = a; i < b; i += 1) {
      const t = (i - a) / sr;
      const e = env(t, 0.002, 0.05, len);
      samples[i] += (Math.random() * 2 - 1) * gain * e;
    }
  };

  for (let step = 0; step < bars * 4; step += 1) {
    const t = step * beat;
    const m = cfg.melody[step % cfg.melody.length] + cfg.root;
    const b = cfg.bass[Math.floor(step / 2) % cfg.bass.length] + cfg.root;
    const drum = cfg.drums;

    addTone(noteFreq(b), t, beat * 0.92, 0.15 + drum * 0.04, cfg.bassType);
    addTone(noteFreq(m + 12), t, beat * 0.42, 0.1, cfg.lead);
    addTone(noteFreq(m + 19), t + beat * 0.5, beat * 0.32, 0.055 + drum * 0.02, "tri");

    if (step % 2 === 0) addNoise(t, 0.045, 0.04 * drum);
    if (step % 4 === 0) {
      addTone(noteFreq(cfg.root - 12), t, 0.07, 0.1 + drum * 0.06, "sine");
      addNoise(t, 0.03, 0.07 * drum);
    }
    if (drum > 0.7 && step % 4 === 2) addNoise(t, 0.025, 0.05 * drum);
  }

  let peak = 0.0001;
  for (let i = 0; i < n; i += 1) peak = Math.max(peak, Math.abs(samples[i]));
  const norm = 0.7 / peak;
  for (let i = 0; i < n; i += 1) samples[i] *= norm;

  const dataSize = n * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sr, 24);
  buffer.writeUInt32LE(sr * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < n; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(path.join(outDir, cfg.file), buffer);
  console.log(cfg.file, duration.toFixed(2) + "s");
}

fs.mkdirSync(outDir, { recursive: true });
TRACKS.forEach(writeTrack);
fs.copyFileSync(path.join(outDir, "music-1.wav"), path.join(outDir, "music.wav"));
console.log("music.wav <- music-1.wav");
