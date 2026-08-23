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
export const POINTS_PER_RAIDER = 55;
export const POINTS_PER_BOSS = 180;
export const SCORE_PER_LEVEL = 80;

export const PLAYER = {
  width: 64,
  height: 74,
  bottom: 24,
  touchOffsetY: 96,
};

export const ULTIMATE = {
  perEnemy: 0.055,
  perMeteor: 0.02,
  perBoss: 0.22,
  empBossDamage: 14,
};

export const DRONE = {
  max: 2,
  size: 32,
  offsetX: 54,
  offsetY: 14,
  bob: 6,
  fireIntervalMs: 420,
  laserW: 3,
  laserH: 16,
};

export const LASER = {
  width: 5,
  height: 24,
  speed: 720,
  fireIntervalMs: 250,
};

export const WEAPON = {
  maxLevel: 3,
  fireIntervalMs: [250, 205, 165, 125],
};

export const METEOR = {
  size: 74,
  sizeJitter: 14,
  baseSpeed: 72,
  maxSpeed: 220,
  baseSpawnMs: 3200,
  minSpawnMs: 1400,
};

export const ENEMY = {
  width: 64,
  height: 64,
  baseSpeed: 55,
  maxSpeed: 175,
  baseSpawnMs: 1600,
  minSpawnMs: 700,
  fireIntervalMs: 1400,
  laserSpeed: 280,
  laserWidth: 4,
  laserHeight: 16,
  dropChance: 0.1,
  variantCount: 8,
  groupGapMs: 340,
  shieldChance: 0.08,
};

export const RAIDER = {
  width: 78,
  height: 78,
  speed: 220,
  fireIntervalMs: 920,
  laserSpeed: 300,
  hp: 3,
  variants: [4, 6, 7],
};

export const BOSS = {
  width: 118,
  height: 118,
  parkY: 56,
  enterSpeed: 78,
  weaveAmp: 88,
  bobAmp: 26,
  moveRate: 1.55,
  fireIntervalMs: 780,
  laserSpeed: 320,
};

export const MISSILE = {
  width: 11,
  height: 30,
  speed: 210,
  accel: 240,
  launchSpeed: 92,
  maxLife: 6.5,
};

export const PLAYER_ROCKET = {
  width: 12,
  height: 28,
  speed: 340,
  accel: 380,
  launchSpeed: 160,
  maxLife: 4.2,
  damage: 4,
  turn: 260,
  maxAmmo: 6,
};

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
    missileHoming: 88,
    raiderChance: 0,
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
    missileHoming: 110,
    raiderChance: 0.08,
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
    missileHoming: 135,
    raiderChance: 0.1,
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
    missileHoming: 160,
    raiderChance: 0.06,
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
    missileHoming: 190,
    raiderChance: 0.11,
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
    missileHoming: 230,
    raiderChance: 0.12,
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
    raiderChance: Math.min(0.18, (base.raiderChance || 0) + loop * 0.03),
    bossCount: (stage || 1) >= 10 ? 2 : 1,
    bossNameB: STAGES[(idx + 2) % STAGES.length].bossName,
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
  dropChance: 0.07,
  weights: {
    life: 0.22,
    shield: 0.22,
    weapon: 0.2,
    drone: 0.14,
    rocket: 0.22,
  },
};

export const POWERUP_TYPE = {
  LIFE: "life",
  SHIELD: "shield",
  WEAPON: "weapon",
  DRONE: "drone",
  ROCKET: "rocket",
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
export const FULLSCREEN_KEY = "@ufo_shooter/fullscreen";
export const DEFAULT_PLAYER_NAME = "Pilot";

export const SHIPS = [
  {
    id: "aurora",
    name: "Aurora",
    body: "#38bdf8",
    wing: "#0ea5e9",
    tip: "#e0f2fe",
    engine: "#67e8f9",
    laser: "#7dd3fc",
    speed: 5,
    shield: 2,
    health: 3,
    fire: 3,
    moveSpeed: 980,
    lives: 3,
    startShield: false,
    shieldMax: 1,
    fireMul: 0.96,
    laserSpeedMul: 1.12,
    damage: 1,
  },
  {
    id: "ember",
    name: "Ember",
    body: "#f97316",
    wing: "#ea580c",
    tip: "#ffedd5",
    engine: "#fb923c",
    laser: "#fdba74",
    speed: 3,
    shield: 2,
    health: 2,
    fire: 5,
    moveSpeed: 580,
    lives: 2,
    startShield: false,
    shieldMax: 1,
    fireMul: 0.7,
    laserSpeedMul: 1.32,
    damage: 2,
  },
  {
    id: "violet",
    name: "Nova",
    body: "#a78bfa",
    wing: "#8b5cf6",
    tip: "#ede9fe",
    engine: "#c4b5fd",
    laser: "#ddd6fe",
    speed: 4,
    shield: 1,
    health: 2,
    fire: 4,
    moveSpeed: 780,
    lives: 2,
    startShield: false,
    shieldMax: 1,
    fireMul: 0.8,
    laserSpeedMul: 1.22,
    damage: 1,
  },
  {
    id: "jade",
    name: "Jade",
    body: "#34d399",
    wing: "#10b981",
    tip: "#d1fae5",
    engine: "#6ee7b7",
    laser: "#a7f3d0",
    speed: 2,
    shield: 5,
    health: 5,
    fire: 2,
    moveSpeed: 420,
    lives: 5,
    startShield: true,
    shieldMax: 2,
    fireMul: 1.28,
    laserSpeedMul: 0.9,
    damage: 1,
  },
];

export function getShip(id) {
  return SHIPS.find((s) => s.id === id) || SHIPS[0];
}

export function levelFromScore(score) {
  return Math.floor(score / SCORE_PER_LEVEL) + 1;
}
