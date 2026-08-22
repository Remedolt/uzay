/**
 * Kısa, loop'lanabilir heyecanlı müzik (düşük sesle çalınacak).
 */
const fs = require("fs");
const path = require("path");

const sr = 22050;
const bpm = 132;
const beat = 60 / bpm;
const bars = 8;
const duration = bars * 4 * beat;
const n = Math.floor(sr * duration);
const samples = new Float32Array(n);

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

function addTone(freq, start, len, gain, type = "sine") {
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
}

function addNoise(start, len, gain) {
  const a = Math.floor(start * sr);
  const b = Math.min(n, Math.floor((start + len) * sr));
  for (let i = a; i < b; i += 1) {
    const t = (i - a) / sr;
    const e = env(t, 0.002, 0.04, len);
    samples[i] += (Math.random() * 2 - 1) * gain * e;
  }
}

// Minor tense progression feel: A minor-ish ostinato
const melody = [0, 3, 7, 12, 10, 7, 3, 0, 5, 8, 12, 15, 12, 8, 5, 3];
const bass = [0, 0, -5, -5, -2, -2, -7, -7];

for (let step = 0; step < bars * 4; step += 1) {
  const t = step * beat;
  const m = melody[step % melody.length];
  const b = bass[Math.floor(step / 2) % bass.length];

  addTone(noteFreq(b), t, beat * 0.9, 0.16, "tri");
  addTone(noteFreq(m + 12), t, beat * 0.45, 0.11, "saw");
  addTone(noteFreq(m + 19), t + beat * 0.5, beat * 0.35, 0.07, "square");

  if (step % 2 === 0) addNoise(t, 0.05, 0.05);
  if (step % 4 === 0) addTone(noteFreq(-12), t, 0.08, 0.12, "sine");
}

// Soft sidechain-ish normalize
let peak = 0.0001;
for (let i = 0; i < n; i += 1) peak = Math.max(peak, Math.abs(samples[i]));
const norm = 0.72 / peak;
for (let i = 0; i < n; i += 1) samples[i] *= norm;

const outDir = path.join(__dirname, "..", "assets", "sfx");
fs.mkdirSync(outDir, { recursive: true });
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
fs.writeFileSync(path.join(outDir, "music.wav"), buffer);
console.log("music.wav", (duration).toFixed(2) + "s");
