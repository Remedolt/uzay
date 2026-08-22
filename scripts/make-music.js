/**
 * Aşama müziği — yumuşak pad + sine bas, kısa chiptune arpej yok.
 * node scripts/make-music.js
 */
const fs = require("fs");
const path = require("path");

const sr = 22050;
const outDir = path.join(__dirname, "..", "assets", "sfx");

const TRACKS = [
  {
    file: "music-1.wav",
    bpm: 92,
    kick: 0.22,
    hat: 0.02,
    snare: 0,
    pad: 0.13,
    bass: 0.17,
    lead: 0.09,
    arp: 0,
    echo: 0.22,
    chords: ["Am", "F", "C", "G"],
    melody: [0, null, 3, 7, 5, null, 3, 0, 7, 5, 3, null, 0, null, null, null],
  },
  {
    file: "music-2.wav",
    bpm: 100,
    kick: 0.32,
    hat: 0.035,
    snare: 0.08,
    pad: 0.12,
    bass: 0.18,
    lead: 0.1,
    arp: 0.03,
    echo: 0.18,
    chords: ["Am", "Em", "F", "G"],
    melody: [0, 3, 5, 7, 3, null, 0, -2, 0, 5, 7, 10, 7, 5, 3, 0],
  },
  {
    file: "music-3.wav",
    bpm: 108,
    kick: 0.38,
    hat: 0.045,
    snare: 0.12,
    pad: 0.11,
    bass: 0.18,
    lead: 0.11,
    arp: 0.045,
    echo: 0.16,
    chords: ["Am", "G", "F", "Em"],
    melody: [7, 5, 3, 0, 5, 7, 10, 7, 12, 10, 7, 5, 3, 5, 0, null],
  },
  {
    file: "music-4.wav",
    bpm: 114,
    kick: 0.42,
    hat: 0.05,
    snare: 0.14,
    pad: 0.12,
    bass: 0.19,
    lead: 0.1,
    arp: 0.05,
    echo: 0.2,
    chords: ["Am", "F", "Dm", "E"],
    melody: [0, 3, 7, 8, 7, 5, 3, 0, 8, 7, 5, 3, 0, -1, 0, 3],
  },
  {
    file: "music-5.wav",
    bpm: 120,
    kick: 0.46,
    hat: 0.055,
    snare: 0.16,
    pad: 0.11,
    bass: 0.2,
    lead: 0.11,
    arp: 0.055,
    echo: 0.15,
    chords: ["Am", "E", "F", "E"],
    melody: [12, 7, 8, 7, 5, 3, 0, 3, 7, 8, 12, 10, 8, 7, 3, 0],
  },
  {
    file: "music-6.wav",
    bpm: 124,
    kick: 0.5,
    hat: 0.06,
    snare: 0.18,
    pad: 0.12,
    bass: 0.2,
    lead: 0.12,
    arp: 0.06,
    echo: 0.14,
    chords: ["Am", "G", "Em", "F"],
    melody: [0, 7, 12, 10, 7, 5, 3, 7, 12, 15, 12, 10, 7, 10, 7, 0],
  },
];

const CHORDS = {
  Am: [0, 3, 7],
  Em: [-5, -2, 2],
  F: [-4, 0, 3],
  C: [3, 7, 10],
  G: [-2, 2, 5],
  Dm: [-7, -4, 0],
  E: [-5, -1, 2],
};

function freq(semi) {
  return 110 * Math.pow(2, semi / 12);
}

function env(t, dur, attack, release) {
  if (t < 0 || t > dur) return 0;
  if (t < attack) return t / attack;
  const tail = dur - t;
  if (tail < release) return Math.max(0, tail / release);
  return 1;
}

function sine(f, t) {
  return Math.sin(2 * Math.PI * f * t);
}

function warm(f, t) {
  const maxH = Math.min(10, Math.floor(sr / (2 * f) * 0.4));
  let v = 0;
  for (let h = 1; h <= maxH; h += 1) v += sine(f * h, t) / h;
  return v * 0.55;
}

function addKick(samples, start, gain) {
  const n = samples.length;
  const dur = 0.2;
  let phase = 0;
  const a = Math.floor(start * sr);
  const b = Math.min(n, Math.floor((start + dur) * sr));
  for (let i = a; i < b; i += 1) {
    const t = (i - a) / sr;
    const f = 130 * Math.exp(-t * 16) + 38;
    phase += (2 * Math.PI * f) / sr;
    samples[i] += Math.sin(phase) * Math.exp(-t * 13) * gain;
  }
}

function addNoise(samples, start, dur, gain, hipass) {
  const n = samples.length;
  const a = Math.floor(start * sr);
  const b = Math.min(n, Math.floor((start + dur) * sr));
  let prev = 0;
  let hp = 0;
  for (let i = a; i < b; i += 1) {
    const t = (i - a) / sr;
    const e = env(t, dur, 0.004, dur * 0.7);
    const white = Math.random() * 2 - 1;
    hp = 0.93 * (hp + white - prev);
    prev = white;
    samples[i] += (hipass ? hp : white) * gain * e;
  }
}

function writeTrack(cfg) {
  const beat = 60 / cfg.bpm;
  const bars = 8;
  const duration = bars * 4 * beat;
  const n = Math.floor(sr * duration);
  const samples = new Float32Array(n);
  const beats = bars * 4;
  const barsPerChord = bars / cfg.chords.length;

  const chordAt = (step) => {
    const bar = Math.floor(step / 4);
    const idx = Math.min(
      cfg.chords.length - 1,
      Math.floor(bar / barsPerChord)
    );
    return CHORDS[cfg.chords[idx]] || CHORDS.Am;
  };

  for (let step = 0; step < beats; step += 1) {
    const t = step * beat;
    const chord = chordAt(step);
    const root = chord[0];

    if (step % 4 === 0) addKick(samples, t, cfg.kick);
    if (cfg.snare && step % 4 === 2) {
      addNoise(samples, t, 0.09, cfg.snare * 0.35, true);
      addKick(samples, t, cfg.snare * 0.18);
    }
    if (cfg.hat && step % 2 === 1) addNoise(samples, t, 0.035, cfg.hat, true);

    const bassLen = beat * (step % 4 === 0 ? 1.7 : 0.95);
    const bassNote = step % 4 === 2 ? chord[2] : root;
    const ba = Math.floor(t * sr);
    const bb = Math.min(n, Math.floor((t + bassLen) * sr));
    for (let i = ba; i < bb; i += 1) {
      const u = (i - ba) / sr;
      const e = env(u, bassLen, 0.02, 0.12);
      const f = freq(bassNote - 12);
      samples[i] += (sine(f, u) + sine(f * 2, u) * 0.22) * cfg.bass * e;
    }

    if (step % 4 === 0) {
      const padLen = beat * 4 * 0.98;
      const pa = Math.floor(t * sr);
      const pb = Math.min(n, Math.floor((t + padLen) * sr));
      for (let i = pa; i < pb; i += 1) {
        const u = (i - pa) / sr;
        const e = env(u, padLen, 0.12, 0.35);
        let v = 0;
        for (let k = 0; k < chord.length; k += 1) {
          const f = freq(chord[k] + 12);
          v += sine(f, u) + sine(f * 1.003, u) * 0.7;
        }
        samples[i] += (v / 6) * cfg.pad * e;
      }
    }

    if (cfg.arp && step % 2 === 0) {
      const tone = chord[(step / 2) % chord.length] + 24;
      const len = beat * 0.45;
      const aa = Math.floor((t + beat * 0.5) * sr);
      const ab = Math.min(n, Math.floor((t + beat * 0.5 + len) * sr));
      for (let i = aa; i < ab; i += 1) {
        const u = (i - aa) / sr;
        samples[i] += warm(freq(tone), u) * cfg.arp * env(u, len, 0.01, 0.12);
      }
    }

    const m = cfg.melody[step % cfg.melody.length];
    if (m != null) {
      const hold = cfg.melody[(step + 1) % cfg.melody.length] == null ? 1.6 : 0.85;
      const len = beat * hold;
      const la = Math.floor(t * sr);
      const lb = Math.min(n, Math.floor((t + len) * sr));
      for (let i = la; i < lb; i += 1) {
        const u = (i - la) / sr;
        const e = env(u, len, 0.02, 0.18);
        const f = freq(m + 12);
        samples[i] +=
          (sine(f, u) + sine(f * 2, u) * 0.18) * cfg.lead * e;
      }
    }
  }

  const delay = Math.floor(beat * 1.5 * sr);
  const mix = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    mix[i] = samples[i] + (i >= delay ? samples[i - delay] * cfg.echo : 0);
  }

  const fade = Math.floor(0.12 * sr);
  for (let i = 0; i < fade; i += 1) {
    const w = i / fade;
    mix[i] = mix[i] * w + mix[n - fade + i] * (1 - w);
    mix[n - fade + i] *= w;
  }

  let peak = 0.0001;
  for (let i = 0; i < n; i += 1) peak = Math.max(peak, Math.abs(mix[i]));
  const gain = 0.62 / peak;
  for (let i = 0; i < n; i += 1) mix[i] = Math.tanh(mix[i] * gain);

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
    const s = Math.max(-1, Math.min(1, mix[i]));
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(path.join(outDir, cfg.file), buffer);
  console.log(cfg.file, duration.toFixed(1) + "s");
}

fs.mkdirSync(outDir, { recursive: true });
TRACKS.forEach(writeTrack);
fs.copyFileSync(path.join(outDir, "music-1.wav"), path.join(outDir, "music.wav"));
console.log("music.wav <- music-1.wav");
