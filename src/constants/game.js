export const SCREEN = {
  START: "start",
  PLAYING: "playing",
  GAME_OVER: "gameOver",
};

export const GAME_TITLE = "Uzay Avcısı";

export const INITIAL_LIVES = 3;
export const MAX_LIVES = 5;
export const POINTS_PER_METEOR = 10;
export const POINTS_PER_ENEMY = 30;
export const POINTS_PER_BOSS = 180;
/** Her N puanda 1 level (eski skor ölçeği) */
export const SCORE_PER_LEVEL = 80;

export const PLAYER = {
  width: 64,
  height: 74,
  bottom: 24,
};

export const LASER = {
  width: 5,
  height: 24,
  speed: 720,
  fireIntervalMs: 250,
};

export const WEAPON = {
  maxLevel: 2,
  /** level -> ateş aralığı (ms) */
  fireIntervalMs: [250, 210, 170],
};

export const METEOR = {
  size: 86,
  sizeJitter: 18,
  baseSpeed: 72,
  maxSpeed: 220,
  /** Daha seyrek meteor */
  baseSpawnMs: 3200,
  minSpawnMs: 1400,
};

/** Ara sıra saldıran düşman gemileri */
export const ENEMY = {
  width: 56,
  height: 56,
  baseSpeed: 55,
  maxSpeed: 175,
  /** Meteor yerine daha sık gemi */
  baseSpawnMs: 1600,
  minSpawnMs: 700,
  fireIntervalMs: 1400,
  laserSpeed: 280,
  laserWidth: 4,
  laserHeight: 16,
  dropChance: 0.1,
  variantCount: 8,
  groupGapMs: 340,
};

export const BOSS = {
  width: 118,
  height: 118,
  parkY: 64,
  enterSpeed: 78,
  weaveAmp: 96,
  fireIntervalMs: 780,
  laserSpeed: 320,
};

export const MISSILE = {
  width: 12,
  height: 26,
  speed: 200,
};

/** Aşama dalgaları — kota kadar gemi, sonra o aşamanın boss’u */
export const STAGES = [
  {
    name: "Keşif",
    bossName: "Kızıl Serçe",
    bossVariant: 0,
    enemyQuota: 8,
    waveMin: 2,
    waveMax: 2,
    meteorChance: 0.38,
    bossHp: 16,
    missileMs: 3200,
    missileCount: 1,
    missileHoming: 40,
  },
  {
    name: "Pusula",
    bossName: "Buz Devri",
    bossVariant: 1,
    enemyQuota: 12,
    waveMin: 2,
    waveMax: 3,
    meteorChance: 0.28,
    bossHp: 22,
    missileMs: 2400,
    missileCount: 1,
    missileHoming: 80,
  },
  {
    name: "Kuşatma",
    bossName: "Zehir Kale",
    bossVariant: 2,
    enemyQuota: 14,
    waveMin: 2,
    waveMax: 3,
    meteorChance: 0.24,
    bossHp: 28,
    missileMs: 1900,
    missileCount: 2,
    missileHoming: 100,
  },
  {
    name: "Kor Ateş",
    bossName: "Lav Gaga",
    bossVariant: 3,
    enemyQuota: 16,
    waveMin: 3,
    waveMax: 3,
    meteorChance: 0.2,
    bossHp: 34,
    missileMs: 1500,
    missileCount: 2,
    missileHoming: 130,
  },
  {
    name: "Mor Fırtına",
    bossName: "Mor İmparator",
    bossVariant: 4,
    enemyQuota: 18,
    waveMin: 3,
    waveMax: 3,
    meteorChance: 0.16,
    bossHp: 40,
    missileMs: 1200,
    missileCount: 3,
    missileHoming: 160,
  },
  {
    name: "Çelik Hat",
    bossName: "Buzul Zırh",
    bossVariant: 5,
    enemyQuota: 20,
    waveMin: 3,
    waveMax: 3,
    meteorChance: 0.12,
    bossHp: 48,
    missileMs: 980,
    missileCount: 3,
    missileHoming: 190,
  },
];

export function stageConfig(stage) {
  const idx = Math.max(0, (stage || 1) - 1);
  const base = STAGES[idx % STAGES.length];
  const loop = Math.floor(idx / STAGES.length);
  return {
    ...base,
    id: stage,
    enemyQuota: base.enemyQuota + loop * 4,
    bossHp: base.bossHp + loop * 12,
    waveMin: base.waveMin,
    waveMax: 3,
    missileMs: Math.max(700, base.missileMs - loop * 80),
    missileCount: Math.min(4, base.missileCount + Math.floor(loop / 2)),
    missileHoming: base.missileHoming + loop * 20,
  };
}

export const ENEMY_MODES = [
  "weave",
  "straight",
  "dive",
  "strafe",
  "burst",
  "twin",
  "spray",
  "sniper",
];

export const POWERUP = {
  size: 34,
  speed: 95,
  dropChance: 0.055,
  /** Silah seyrek; can / kalkan da az */
  weights: {
    life: 0.32,
    shield: 0.32,
    weapon: 0.36,
  },
};

export const POWERUP_TYPE = {
  LIFE: "life",
  SHIELD: "shield",
  WEAPON: "weapon",
};

export const DIFFICULTIES = [
  {
    id: "easy",
    label: "Kolay",
    speedMul: 0.78,
    spawnMul: 1.35,
    scoreMul: 1,
  },
  {
    id: "normal",
    label: "Normal",
    speedMul: 1,
    spawnMul: 1,
    scoreMul: 1.15,
  },
  {
    id: "hard",
    label: "Zor",
    speedMul: 1.28,
    spawnMul: 0.72,
    scoreMul: 1.4,
  },
];

export const DEFAULT_DIFFICULTY = "normal";

export const HIGH_SCORE_KEY = "@ufo_shooter/high_score";
export const LEADERBOARD_KEY = "@ufo_shooter/leaderboard_v1";
export const PLAYER_NAME_KEY = "@ufo_shooter/player_name";
export const DEFAULT_PLAYER_NAME = "Pilot";

/** Seçilebilir gemiler — görseller assets/ altında */
export const SHIPS = [
  {
    id: "aurora",
    name: "Aurora",
    body: "#38bdf8",
    wing: "#0ea5e9",
    tip: "#e0f2fe",
    engine: "#67e8f9",
    laser: "#7dd3fc",
  },
  {
    id: "ember",
    name: "Ember",
    body: "#f97316",
    wing: "#ea580c",
    tip: "#ffedd5",
    engine: "#fb923c",
    laser: "#fdba74",
  },
  {
    id: "violet",
    name: "Nova",
    body: "#a78bfa",
    wing: "#8b5cf6",
    tip: "#ede9fe",
    engine: "#c4b5fd",
    laser: "#ddd6fe",
  },
  {
    id: "jade",
    name: "Jade",
    body: "#34d399",
    wing: "#10b981",
    tip: "#d1fae5",
    engine: "#6ee7b7",
    laser: "#a7f3d0",
  },
];

export function levelFromScore(score) {
  return Math.floor(score / SCORE_PER_LEVEL) + 1;
}
