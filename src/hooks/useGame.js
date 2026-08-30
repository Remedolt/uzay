import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  BOSS,
  DEFAULT_PLAYER_NAME,
  DONMA,
  DRONE,
  ENEMY,
  ENEMY_MODES,
  INITIAL_LIVES,
  KAMIKAZE,
  LASER,
  MAX_LIVES,
  METEOR,
  MISSILE,
  PLASMA,
  PLAYER,
  PLAYER_ROCKET,
  POINTS_PER_BOSS,
  POINTS_PER_ENEMY,
  POINTS_PER_KAMIKAZE,
  POINTS_PER_METEOR,
  POINTS_PER_RAIDER,
  POWERUP,
  POWERUP_TYPE,
  RAIDER,
  SCREEN,
  SHIPS,
  ULTIMATE,
  WEAPON,
  PATLAT_CHARGE_DIVISOR,
  getShip,
  stageScale,
  stageConfig,
} from "../constants/game";
import {
  loadHighScore,
  loadLeaderboard,
  loadPlayerName,
  savePlayerName,
  saveScoreEntry,
} from "../storage/highScore";
import {
  aabbIntersects,
  clamp,
  difficultyFromLevel,
  isOffScreenBottom,
  isOffScreenTop,
  randomX,
} from "../utils";
import { useGameLoop } from "./useGameLoop";
import { useSfx } from "./useSfx";

const initialHud = {
  screen: SCREEN.START,
  score: 0,
  lives: INITIAL_LIVES,
  highScore: 0,
  leaderboard: [],
  level: 1,
  stage: 1,
  stageName: stageConfig(1).name,
  phase: "wave",
  banner: "",
  bannerSub: "",
  bannerKind: "",
  shielded: false,
  shieldHp: 0,
  weaponLevel: 0,
  scoreSaved: false,
  spawned: 0,
  quota: stageConfig(1).enemyQuota,
  ultimate: 0,
  zeus: 0,
  paused: false,
  droneCount: 0,
  missiles: 0,
};

function pickPowerUpType() {
  const r = Math.random();
  const { life, shield, weapon, drone } = POWERUP.weights;
  if (r < life) return POWERUP_TYPE.LIFE;
  if (r < life + shield) return POWERUP_TYPE.SHIELD;
  if (r < life + shield + (weapon || 0)) return POWERUP_TYPE.WEAPON;
  return POWERUP_TYPE.DRONE;
}

function hudReducer(state, action) {
  switch (action.type) {
    case "hydrateHighScore":
      return {
        ...state,
        highScore: action.highScore,
        leaderboard: action.leaderboard || state.leaderboard,
      };
    case "start":
      return {
        ...state,
        screen: SCREEN.PLAYING,
        score: 0,
        lives: action.lives ?? INITIAL_LIVES,
        level: 1,
        stage: 1,
        stageName: stageConfig(1).name,
        phase: "wave",
        banner: "AŞAMA 1",
        bannerSub: stageConfig(1).name,
        bannerKind: "",
        shielded: !!action.shielded,
        shieldHp: action.shieldHp || 0,
        weaponLevel: 0,
        scoreSaved: false,
        spawned: 0,
        quota: stageConfig(1).enemyQuota,
        ultimate: 0,
        zeus: 0,
        paused: false,
        droneCount: 0,
        missiles: 0,
      };
    case "score":
      return {
        ...state,
        score: action.score,
        ultimate:
          action.ultimate == null ? state.ultimate : action.ultimate,
        zeus: action.zeus == null ? state.zeus : action.zeus,
        missiles:
          action.missiles == null ? state.missiles : action.missiles,
      };
    case "ultimate":
      return {
        ...state,
        ultimate: Math.max(0, Math.min(1, action.value)),
      };
    case "zeus":
      return {
        ...state,
        zeus: Math.max(0, Math.min(1, action.value)),
      };
    case "wave":
      return {
        ...state,
        spawned: action.spawned,
        quota: action.quota ?? state.quota,
      };
    case "banner":
      return {
        ...state,
        banner: action.banner || "",
        bannerSub: action.bannerSub || "",
        bannerKind: action.bannerKind || "",
      };
    case "phase":
      return {
        ...state,
        phase: action.phase,
        banner: action.banner ?? state.banner,
        bannerSub: action.bannerSub ?? state.bannerSub,
        bannerKind: action.bannerKind ?? state.bannerKind,
      };
    case "stage":
      return {
        ...state,
        stage: action.stage,
        level: action.stage,
        stageName: action.stageName,
        phase: action.phase || "wave",
        banner: action.banner || "",
        bannerSub: action.bannerSub || "",
        bannerKind: action.bannerKind || "",
        spawned: 0,
        quota: action.quota ?? state.quota,
      };
    case "hit":
      return {
        ...state,
        lives: action.lives,
        shielded: false,
        shieldHp: 0,
        weaponLevel: 0,
      };
    case "shieldBreak": {
      const hp = Math.max(0, (state.shieldHp || 1) - 1);
      return { ...state, shieldHp: hp, shielded: hp > 0 };
    }
    case "grantLife":
      return { ...state, lives: Math.min(MAX_LIVES, state.lives + 1) };
    case "grantShield":
      return {
        ...state,
        shielded: true,
        shieldHp: action.hits || 1,
      };
    case "grantWeapon": {
      if (state.weaponLevel >= WEAPON.maxLevel) return state;
      return {
        ...state,
        weaponLevel: state.weaponLevel + 1,
      };
    }
    case "grantDrone":
      return {
        ...state,
        droneCount: Math.min(DRONE.max, (state.droneCount || 0) + 1),
      };
    case "setDrones":
      return {
        ...state,
        droneCount: Math.max(0, Math.min(DRONE.max, action.droneCount || 0)),
      };
    case "grantRocket":
      return {
        ...state,
        missiles: Math.min(
          PLAYER_ROCKET.maxAmmo,
          (state.missiles || 0) + 1
        ),
      };
    case "setMissiles":
      return {
        ...state,
        missiles: Math.max(
          0,
          Math.min(PLAYER_ROCKET.maxAmmo, action.missiles ?? 0)
        ),
      };
    case "gameOver":
      return {
        ...state,
        screen: SCREEN.GAME_OVER,
        score: action.score,
        lives: 0,
        shielded: false,
        shieldHp: 0,
        weaponLevel: 0,
        scoreSaved: false,
        highScore: Math.max(state.highScore, action.score),
        level: action.stage || state.stage || 1,
        stage: action.stage || state.stage || 1,
        ultimate: 0,
        zeus: 0,
        paused: false,
        droneCount: 0,
        missiles: 0,
      };
    case "scoreSaved":
      return {
        ...state,
        scoreSaved: true,
        highScore: Math.max(state.highScore, action.score ?? state.score),
        leaderboard: action.leaderboard || state.leaderboard,
      };
    case "toStart":
      return {
        ...state,
        screen: SCREEN.START,
        shielded: false,
        shieldHp: 0,
        weaponLevel: 0,
        scoreSaved: false,
        phase: "wave",
        banner: "",
        bannerSub: "",
        bannerKind: "",
        stage: 1,
        stageName: stageConfig(1).name,
        level: 1,
        spawned: 0,
        quota: stageConfig(1).enemyQuota,
        ultimate: 0,
        zeus: 0,
        droneCount: 0,
        missiles: 0,
        paused: false,
      };
    case "pause":
      return { ...state, paused: true };
    case "resume":
      return { ...state, paused: false };
    default:
      return state;
  }
}

let nextId = 1;
function uid() {
  nextId += 1;
  return nextId;
}

function fireBossPattern(enemy, player, pushEnemyLaser, pushMissile, pushPlasma) {
  const kind = enemy.attackKind ?? enemy.bossVariant ?? enemy.variant ?? 0;
  const dx = player.x + player.width / 2 - (enemy.x + enemy.width / 2);
  const plasma = enemy.usesPlasma || kind % 3 === 2;
  switch (kind % 9) {
    case 1:
      pushEnemyLaser(enemy, -14, clamp(dx * 0.6, -80, 80));
      pushEnemyLaser(enemy, 14, clamp(dx * 0.6, -80, 80));
      pushEnemyLaser(enemy, 0, clamp(dx * 1.3, -180, 180));
      break;
    case 2:
      enemy.burstLeft = 3;
      enemy.burstKind = "plasma";
      pushPlasma(enemy, -16);
      pushPlasma(enemy, 16);
      break;
    case 3:
      pushEnemyLaser(enemy, -22, -70);
      pushPlasma(enemy, 0);
      pushEnemyLaser(enemy, 22, 70);
      pushMissile(enemy);
      break;
    case 4:
      enemy.burstLeft = 5;
      enemy.burstKind = "";
      pushEnemyLaser(enemy, -10);
      pushEnemyLaser(enemy, 10);
      pushMissile(enemy, -16);
      pushMissile(enemy, 16);
      break;
    case 5:
      pushPlasma(enemy, -22, -40);
      pushPlasma(enemy, 0);
      pushPlasma(enemy, 22, 40);
      pushMissile(enemy, -18);
      pushMissile(enemy, 18);
      break;
    case 6: {
      const t = enemy.phase || 0;
      pushEnemyLaser(enemy, -10, Math.sin(t) * 170);
      pushEnemyLaser(enemy, 10, Math.cos(t) * 170);
      pushPlasma(enemy, 0, Math.sin(t * 1.5) * 90);
      break;
    }
    case 7:
      pushEnemyLaser(enemy, -30, -150);
      pushEnemyLaser(enemy, 30, 150);
      pushEnemyLaser(enemy, -12, 70);
      pushEnemyLaser(enemy, 12, -70);
      break;
    case 8:
      enemy.burstLeft = 2;
      enemy.burstKind = "plasma";
      for (let s = -2; s <= 2; s += 1) {
        pushPlasma(enemy, s * 12, s * 46);
      }
      break;
    default: {
      const pattern = Math.floor((enemy.phase || 0) * 2) % 3;
      if (plasma) {
        pushPlasma(enemy, -14);
        pushPlasma(enemy, 14);
      } else if (pattern === 0) {
        pushEnemyLaser(enemy, -16);
        pushEnemyLaser(enemy, 16);
      } else if (pattern === 1) {
        enemy.burstLeft = 3;
        enemy.burstKind = "";
        pushEnemyLaser(enemy);
      } else {
        pushEnemyLaser(enemy, 0, clamp(dx * 1.15, -160, 160));
        pushEnemyLaser(enemy, -12, -80);
        pushEnemyLaser(enemy, 12, 80);
      }
    }
  }
}

function playerRestY(layout) {
  return layout.height - PLAYER.height - PLAYER.bottom;
}

export function useGame(layout) {
  const [hud, dispatch] = useReducer(hudReducer, initialHud);
  const [shipId, setShipIdState] = useState(SHIPS[0].id);
  const [playerName, setPlayerNameState] = useState(DEFAULT_PLAYER_NAME);
  const { play, unlock, startMusic, stopMusic, setStageMusic } = useSfx();
  const playRef = useRef(play);
  playRef.current = play;
  const setStageMusicRef = useRef(setStageMusic);
  setStageMusicRef.current = setStageMusic;
  const hudRef = useRef(hud);
  hudRef.current = hud;
  const shipIdRef = useRef(shipId);
  shipIdRef.current = shipId;
  const playerNameRef = useRef(playerName);
  playerNameRef.current = playerName;

  const playerRef = useRef({
    x: 0,
    y: 0,
    width: PLAYER.width,
    height: PLAYER.height,
    bank: 0,
  });
  const lasersRef = useRef([]);
  const meteorsRef = useRef([]);
  const enemiesRef = useRef([]);
  const enemyLasersRef = useRef([]);
  const missilesRef = useRef([]);
  const powerupsRef = useRef([]);
  const dronesRef = useRef([]);
  const fireAccRef = useRef(0);
  const spawnAccRef = useRef(0);
  const enemyAccRef = useRef(0);
  const scrollRef = useRef(0);
  const laserSfxGateRef = useRef(0);
  const phaseRef = useRef("wave");
  const stageRef = useRef(1);
  const spawnedRef = useRef(0);
  const groupRef = useRef({ left: 0, acc: 0, speed: 80 });
  const bannerAccRef = useRef(0);
  const clearAccRef = useRef(0);
  const iFrameRef = useRef(0);
  const ultimateRef = useRef(0);
  const zeusRef = useRef(0);
  const empPendingRef = useRef(false);
  const zeusPendingRef = useRef(false);
  const freezeRemainRef = useRef(0);
  const empBurstRef = useRef({ t: 0, x: 0, y: 0 });
  const bossBurstRef = useRef({ t: 0, x: 0, y: 0 });
  const shakeRef = useRef({ t: 0, x: 0, y: 0, power: 0 });
  const droneCountRef = useRef(0);
  const rocketAmmoRef = useRef(0);
  const rocketGateRef = useRef(0);
  const [, setRenderTick] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    Promise.all([loadHighScore(), loadLeaderboard(), loadPlayerName()]).then(
      ([highScore, leaderboard, name]) => {
        dispatch({ type: "hydrateHighScore", highScore, leaderboard });
        setPlayerNameState(name);
        playerNameRef.current = name;
      }
    );
  }, []);

  useEffect(() => {
    if (!layout.width) return;
    playerRef.current.x = (layout.width - PLAYER.width) / 2;
    playerRef.current.targetX = playerRef.current.x;
    playerRef.current.y = playerRestY(layout);
    playerRef.current.targetY = playerRef.current.y;
    playerRef.current.bank = 0;
  }, [layout.width, layout.height]);

  const setShipId = useCallback((id) => {
    setShipIdState(id);
    playRef.current("select");
  }, []);

  const setPlayerName = useCallback((name) => {
    const clean = String(name || "").slice(0, 12);
    setPlayerNameState(clean);
    playerNameRef.current = clean;
  }, []);

  const resetWorld = useCallback(() => {
    lasersRef.current = [];
    meteorsRef.current = [];
    enemiesRef.current = [];
    enemyLasersRef.current = [];
    missilesRef.current = [];
    powerupsRef.current = [];
    dronesRef.current = [];
    fireAccRef.current = 0;
    spawnAccRef.current = 0;
    enemyAccRef.current = 0;
    scrollRef.current = 0;
    phaseRef.current = "wave";
    stageRef.current = 1;
    spawnedRef.current = 0;
    groupRef.current = { left: 0, acc: 0, speed: 80 };
    bannerAccRef.current = 2200;
    clearAccRef.current = 0;
    iFrameRef.current = 0;
    ultimateRef.current = 0;
    zeusRef.current = 0;
    empPendingRef.current = false;
    zeusPendingRef.current = false;
    freezeRemainRef.current = 0;
    empBurstRef.current = { t: 0, x: 0, y: 0 };
    bossBurstRef.current = { t: 0, x: 0, y: 0 };
    shakeRef.current = { t: 0, x: 0, y: 0, power: 0 };
    droneCountRef.current = 0;
    rocketAmmoRef.current = 0;
    if (layout.width) {
      const x = (layout.width - PLAYER.width) / 2;
      playerRef.current.x = x;
      playerRef.current.targetX = x;
      playerRef.current.y = playerRestY(layout);
      playerRef.current.targetY = playerRef.current.y;
      playerRef.current.bank = 0;
    }
  }, [layout.width, layout.height]);

  const startGame = useCallback(
    (selectedShipId) => {
      if (selectedShipId) setShipIdState(selectedShipId);
      const ship = getShip(selectedShipId || shipIdRef.current);
      resetWorld();
      dispatch({
        type: "start",
        lives: ship.lives,
        shielded: ship.startShield,
        shieldHp: ship.startShield ? ship.shieldMax : 0,
      });
      unlock();
      void startMusic(1, false);
      if (typeof setTimeout !== "undefined") {
        setTimeout(() => {
          void startMusic(1, false);
        }, 150);
        setTimeout(() => {
          void startMusic(1, false);
        }, 600);
      }
    },
    [resetWorld, startMusic, unlock]
  );

  const goToStart = useCallback(() => {
    stopMusic();
    resetWorld();
    dispatch({ type: "toStart" });
  }, [resetWorld, stopMusic]);

  const movePlayerTo = useCallback(
    (localX, localY, fromTouch = false) => {
      if (hudRef.current.paused) return;
      const half = PLAYER.width / 2;
      playerRef.current.targetX = clamp(
        localX - half,
        0,
        Math.max(0, layout.width - PLAYER.width)
      );
      if (typeof localY !== "number" || !layout.height) return;
      const offset = fromTouch ? PLAYER.touchOffsetY : 0;
      const minY = 92;
      const maxY = playerRestY(layout);
      playerRef.current.targetY = clamp(
        localY - PLAYER.height / 2 - offset,
        minY,
        maxY
      );
    },
    [layout.width, layout.height]
  );

  const fireUltimate = useCallback(() => {
    if (hudRef.current.paused) return;
    if (hudRef.current.screen !== SCREEN.PLAYING) return;
    if (ultimateRef.current < 1) return;
    empPendingRef.current = true;
  }, []);

  const fireZeus = useCallback(() => {
    if (hudRef.current.paused) return;
    if (hudRef.current.screen !== SCREEN.PLAYING) return;
    if (zeusRef.current < 1) return;
    zeusPendingRef.current = true;
  }, []);

  const togglePause = useCallback(() => {
    if (hudRef.current.screen !== SCREEN.PLAYING) return;
    dispatch({ type: hudRef.current.paused ? "resume" : "pause" });
  }, []);

  const resumeGame = useCallback(() => {
    dispatch({ type: "resume" });
  }, []);

  const spawnLaser = useCallback(() => {
    if (hudRef.current.paused) return;
    const p = playerRef.current;
    const level = hudRef.current.weaponLevel || 0;
    const cx = p.x + p.width / 2 - LASER.width / 2;
    const y = p.y - LASER.height;
    const shipIdNow = shipIdRef.current;
    const ship = getShip(shipIdNow);
    const mk = (x, extra = {}) => ({
      id: uid(),
      x,
      y,
      width: extra.width || LASER.width,
      height: extra.height || LASER.height,
      shipId: shipIdNow,
      speed: LASER.speed * (ship.laserSpeedMul || 1) * (extra.speedMul || 1),
      damage: extra.damage || ship.damage || 1,
    });

    if (level <= 0) {
      lasersRef.current.push(mk(cx));
    } else if (level === 1) {
      lasersRef.current.push(mk(cx - 12), mk(cx + 12));
    } else if (level === 2) {
      lasersRef.current.push(mk(cx - 16), mk(cx), mk(cx + 16));
    } else {
      lasersRef.current.push(
        mk(cx - 24),
        mk(cx - 8),
        mk(cx + 8),
        mk(cx + 24)
      );
    }

    laserSfxGateRef.current += 1;
    if (laserSfxGateRef.current % 2 === 0) playRef.current("laser");
  }, []);

  const fireMissile = useCallback(() => {
    /* Füze sistemi kaldırıldı — DONMA kullanılıyor. */
  }, []);

  const spawnMeteor = useCallback(
    (speed) => {
      const jitter = Math.floor(Math.random() * (METEOR.sizeJitter + 1));
      const size = METEOR.size + jitter - Math.floor(METEOR.sizeJitter / 2);
      meteorsRef.current.push({
        id: uid(),
        x: randomX(layout.width, size),
        y: -size,
        width: size,
        height: size,
        hitPad: size * 0.18,
        speed,
        variant: Math.floor(Math.random() * 3),
        spin: (Math.random() - 0.5) * 90,
        rotation: Math.random() * 360,
      });
    },
    [layout.width]
  );

  const spawnRaider = useCallback(() => {
    const fromLeft = Math.random() < 0.5;
    const band = Math.max(72, Math.min(220, layout.height * 0.32));
    const y = 64 + Math.random() * band;
    const variants = RAIDER.variants || [6];
    const variant = variants[Math.floor(Math.random() * variants.length)];
    const vx = (fromLeft ? 1 : -1) * (RAIDER.speed + stageRef.current * 8) * stageScale(stageRef.current);
    enemiesRef.current.push({
      id: uid(),
      x: fromLeft ? -RAIDER.width : layout.width,
      y,
      baseY: y,
      width: RAIDER.width,
      height: RAIDER.height,
      vx,
      speed: 0,
      phase: Math.random() * Math.PI * 2,
      weaveAmp: 0,
      fireAcc: 40,
      fireInterval: RAIDER.fireIntervalMs,
      laserSpeed: RAIDER.laserSpeed,
      mode: "raider",
      variant,
      burstLeft: 0,
      isBoss: false,
      isRaider: true,
      hp: RAIDER.hp,
      maxHp: RAIDER.hp,
    });
    spawnedRef.current += 1;
    dispatch({
      type: "wave",
      spawned: spawnedRef.current,
      quota: stageConfig(stageRef.current).enemyQuota,
    });
  }, [layout.width, layout.height]);

  const spawnKamikaze = useCallback(
    (speed) => {
      const late = stageScale(stageRef.current);
      const w = KAMIKAZE.width;
      const h = KAMIKAZE.height;
      const player = playerRef.current;
      const jitter = (Math.random() - 0.5) * Math.min(120, layout.width * 0.18);
      const x = clamp(
        (player?.x ?? layout.width / 2) + PLAYER.width / 2 - w / 2 + jitter,
        0,
        Math.max(0, layout.width - w)
      );
      const y = -h - 8;
      const spd = Math.min(
        KAMIKAZE.maxSpeed * late,
        Math.max(320, speed * KAMIKAZE.speedMul)
      );
      const pcx = (player?.x ?? x) + PLAYER.width / 2;
      const pcy =
        (player?.y ?? layout.height * 0.78) + PLAYER.height / 2;
      const dx = pcx - (x + w / 2);
      const dy = Math.max(layout.height * 0.5, pcy - (y + h / 2));
      const dist = Math.hypot(dx, dy) || 1;
      enemiesRef.current.push({
        id: uid(),
        x,
        y,
        width: w,
        height: h,
        speed: spd,
        vx: (dx / dist) * spd,
        vy: (dy / dist) * spd,
        mode: "kamikaze",
        isKamikaze: true,
        isBoss: false,
        hp: KAMIKAZE.hp,
        maxHp: KAMIKAZE.hp,
        fireAcc: 0,
        fireInterval: 99999,
        variant: 0,
      });
      spawnedRef.current += 1;
      dispatch({
        type: "wave",
        spawned: spawnedRef.current,
        quota: stageConfig(stageRef.current).enemyQuota,
      });
    },
    [layout.width, layout.height]
  );

  const spawnEnemy = useCallback(
    (speed) => {
      const cfg = stageConfig(stageRef.current);
      if ((cfg.kamikazeChance || 0) > 0 && Math.random() < cfg.kamikazeChance) {
        spawnKamikaze(speed);
        return;
      }
      if ((cfg.raiderChance || 0) > 0 && Math.random() < cfg.raiderChance) {
        spawnRaider();
        return;
      }
      const mode =
        ENEMY_MODES[Math.floor(Math.random() * ENEMY_MODES.length)];
      const x = randomX(layout.width, ENEMY.width);
      let speedMul = 0.85;
      let weaveAmp = 36 + Math.random() * 40;
      let fireInterval = ENEMY.fireIntervalMs;
      let laserSpeed = ENEMY.laserSpeed;

      if (mode === "straight") {
        weaveAmp = 0;
        fireInterval = 1100;
      } else if (mode === "dive") {
        speedMul = 1.25;
        weaveAmp = 12;
        fireInterval = 1600;
      } else if (mode === "strafe") {
        weaveAmp = 70 + Math.random() * 50;
        speedMul = 0.7;
        fireInterval = 1000;
      } else if (mode === "burst") {
        fireInterval = 2200;
      } else if (mode === "twin") {
        fireInterval = 1300;
      } else if (mode === "spray") {
        fireInterval = 1500;
      } else if (mode === "sniper") {
        fireInterval = 1900;
        laserSpeed = ENEMY.laserSpeed * 1.45;
        speedMul = 0.6;
        weaveAmp = 20;
      }

      const stage = stageRef.current || 1;
      const late = stageScale(stage);
      fireInterval = Math.max(520, Math.round(fireInterval / late));
      laserSpeed = laserSpeed * late;
      const chance = Math.min(
        0.14,
        (ENEMY.shieldChance || 0.08) + (stage - 1) * 0.01
      );
      const shieldHp =
        Math.random() < chance ? (Math.random() < 0.25 ? 2 : 1) : 0;
      const caster =
        Math.random() <
        Math.min(0.28, (ENEMY.plasmaChance || 0.16) + (stage - 1) * 0.012);
      if (caster) {
        fireInterval = 1680;
        speedMul *= 0.86;
      }

      enemiesRef.current.push({
        id: uid(),
        x,
        y: -ENEMY.height,
        width: ENEMY.width,
        height: ENEMY.height,
        speed: Math.min(ENEMY.maxSpeed * late, speed * speedMul),
        baseX: x,
        phase: Math.random() * Math.PI * 2,
        weaveAmp,
        fireAcc: fireInterval * (0.2 + Math.random() * 0.5),
        fireInterval,
        laserSpeed,
        mode,
        weapon: caster ? "plasma" : "laser",
        variant: caster ? 5 : Math.floor(Math.random() * ENEMY.variantCount),
        burstLeft: 0,
        isBoss: false,
        shieldHp,
      });
      spawnedRef.current += 1;
      dispatch({
        type: "wave",
        spawned: spawnedRef.current,
        quota: stageConfig(stageRef.current).enemyQuota,
      });
    },
    [layout.width, spawnRaider, spawnKamikaze]
  );

  const spawnBoss = useCallback(() => {
    const cfg = stageConfig(stageRef.current);
    const count = cfg.bossCount || 1;
    const intervals = [760, 680, 820, 740, 620, 880, 660, 720, 800];
    for (let slot = 0; slot < count; slot += 1) {
      const scale = count === 2 && slot === 1 ? 0.88 : 1;
      const w = Math.round(BOSS.width * scale);
      const h = Math.round(BOSS.height * scale);
      const homeX =
        count === 1
          ? Math.max(0, (layout.width - w) / 2)
          : slot === 0
            ? Math.max(8, layout.width * 0.26 - w / 2)
            : Math.max(
                8,
                Math.min(layout.width - w - 8, layout.width * 0.74 - w / 2)
              );
      const attackKind =
        (cfg.bossVariant + slot * 3 + (cfg.id || 1) + slot) % 9;
      const hp =
        count === 2
          ? Math.max(12, Math.round(cfg.bossHp * 0.7))
          : cfg.bossHp;
      const fireMs = Math.round(
        (intervals[attackKind] || BOSS.fireIntervalMs) * (count === 2 ? 1.12 : 1)
      );
      enemiesRef.current.push({
        id: uid(),
        x: homeX,
        y: -h - slot * 40,
        width: w,
        height: h,
        speed: BOSS.enterSpeed,
        homeX,
        homeY: BOSS.parkY + (slot === 1 ? 22 : 0),
        phase: slot * 1.7,
        phaseOff: slot * 2.2,
        weaveAmp: count === 2 ? 48 : BOSS.weaveAmp,
        bobAmp: (BOSS.bobAmp || 24) + slot * 6,
        moveRate: (BOSS.moveRate || 1.5) + slot * 0.22,
        fireAcc: 280 + slot * 180,
        fireInterval: fireMs,
        laserSpeed: BOSS.laserSpeed + slot * 20,
        mode: "boss",
        variant: ((cfg.bossVariant ?? 0) + slot * 2) % 6,
        bossVariant: cfg.bossVariant ?? 0,
        attackKind,
        usesPlasma: attackKind % 3 === 2 || attackKind === 5,
        burstLeft: 0,
        burstKind: "",
        isBoss: true,
        hp,
        maxHp: hp,
        parked: false,
        missileAcc: 400 + slot * 280,
        missileMs: cfg.missileMs + slot * 180,
        missileCount: Math.max(1, (cfg.missileCount || 1) - (count === 2 ? 1 : 0)),
        missileHoming: cfg.missileHoming,
      });
    }
  }, [layout.width]);

  const spawnPowerUp = useCallback((at, dropChance = POWERUP.dropChance) => {
    if (Math.random() > dropChance) return;
    const type = pickPowerUpType();
    const size = POWERUP.size;
    powerupsRef.current.push({
      id: uid(),
      type,
      x: at.x + at.width / 2 - size / 2,
      y: at.y + at.height / 2 - size / 2,
      width: size,
      height: size,
      speed: POWERUP.speed,
    });
  }, []);

  const endGame = useCallback(
    async (finalScore) => {
      playRef.current("gameover");
      stopMusic();
      dispatch({
        type: "gameOver",
        score: finalScore,
        stage: stageRef.current,
      });
    },
    [stopMusic]
  );

  const saveRun = useCallback(async (name) => {
    if (hudRef.current.scoreSaved) return hudRef.current.leaderboard;
    const clean = await savePlayerName(name);
    setPlayerNameState(clean);
    playerNameRef.current = clean;
    const score = hudRef.current.score;
    const stage = hudRef.current.stage || 1;
    const leaderboard = await saveScoreEntry({
      score,
      level: stage,
      name: clean,
    });
    dispatch({ type: "scoreSaved", score, leaderboard });
    playRef.current("levelup");
    return leaderboard;
  }, []);

  const resolveHazardHit = useCallback((hitPlayer) => {
    if (!hitPlayer) return "keep";
    if (iFrameRef.current > 0) return "iframe";
    if (hudRef.current.shielded) {
      dispatch({ type: "shieldBreak" });
      playRef.current("hit");
      iFrameRef.current = 700;
      const s = shakeRef.current;
      s.t = Math.max(s.t, 0.18);
      s.power = Math.max(s.power || 0, 22);
      return "absorb";
    }
    return "damage";
  }, []);

  const tick = useCallback(
    (frameDt) => {
      if (!layout.width || !layout.height) return;

      const score = hudRef.current.score;
      const stage = stageRef.current;
      const cfg = stageConfig(stage);
      const weaponLevel = hudRef.current.weaponLevel || 0;
      const { speed, spawnMs, scoreMul, late } = difficultyFromLevel(stage);

      if (iFrameRef.current > 0) iFrameRef.current -= frameDt * 1000;

      const ship = getShip(shipIdRef.current);
      const maxX = Math.max(0, layout.width - PLAYER.width);
      const maxY = playerRestY(layout);
      const minY = 92;
      const phase = phaseRef.current;

      const moveStep = (ship.moveSpeed || 700) * frameDt;
      const targetX = clamp(playerRef.current.targetX ?? playerRef.current.x, 0, maxX);
      const targetY = clamp(
        playerRef.current.targetY ?? playerRef.current.y,
        minY,
        maxY
      );
      const dx = targetX - playerRef.current.x;
      const dy = targetY - playerRef.current.y;
      const stepX = clamp(dx, -moveStep, moveStep);
      playerRef.current.x = clamp(
        playerRef.current.x + stepX,
        0,
        maxX
      );
      playerRef.current.y = clamp(
        playerRef.current.y + clamp(dy, -moveStep, moveStep),
        minY,
        maxY
      );
      // Hafif yatış — sağa/sola giderken kanat hissi
      const steer =
        moveStep > 0.001 ? clamp(stepX / moveStep, -1, 1) : 0;
      const targetBank = steer * 8;
      const bank = playerRef.current.bank || 0;
      playerRef.current.bank =
        bank + (targetBank - bank) * Math.min(1, frameDt * 12);

      if (empBurstRef.current.t > 0) {
        empBurstRef.current.t = Math.min(1, empBurstRef.current.t + frameDt * 1.85);
        if (empBurstRef.current.t >= 1) empBurstRef.current.t = 0;
      }
      if (bossBurstRef.current.t > 0) {
        bossBurstRef.current.t = Math.min(1, bossBurstRef.current.t + frameDt * 2.4);
        if (bossBurstRef.current.t >= 1) bossBurstRef.current.t = 0;
      }
      if (shakeRef.current.t > 0) {
        shakeRef.current.t -= frameDt;
        const mag = Math.max(0, shakeRef.current.t) * (shakeRef.current.power || 42);
        shakeRef.current.x = (Math.random() - 0.5) * mag;
        shakeRef.current.y = (Math.random() - 0.5) * mag;
        if (shakeRef.current.t <= 0) {
          shakeRef.current.x = 0;
          shakeRef.current.y = 0;
          shakeRef.current.power = 0;
        }
      }

      if (bannerAccRef.current > 0) {
        bannerAccRef.current -= frameDt * 1000;
        if (bannerAccRef.current <= 0 && phase !== "clear") {
          dispatch({ type: "banner", banner: "", bannerSub: "", bannerKind: "" });
        }
      }

      const fireMs =
        (WEAPON.fireIntervalMs[
          Math.min(weaponLevel, WEAPON.fireIntervalMs.length - 1)
        ] || LASER.fireIntervalMs) * (ship.fireMul || 1);
      fireAccRef.current += frameDt * 1000;
      if (fireAccRef.current >= fireMs) {
        fireAccRef.current = 0;
        spawnLaser();
      }

      const spawnDrone = () => {
        if (dronesRef.current.length >= DRONE.max) return false;
        const used = new Set(dronesRef.current.map((d) => d.side));
        const side = used.has(-1) ? 1 : -1;
        const p = playerRef.current;
        dronesRef.current.push({
          id: uid(),
          x: p.x + p.width / 2 - DRONE.size / 2 + side * DRONE.offsetX,
          y: p.y + DRONE.offsetY,
          width: DRONE.size,
          height: DRONE.size,
          side,
          fireAcc: 160,
          shipId: shipIdRef.current,
        });
        droneCountRef.current = dronesRef.current.length;
        return true;
      };

      const hitDrone = (box) => {
        const drones = dronesRef.current;
        for (let i = drones.length - 1; i >= 0; i -= 1) {
          if (!aabbIntersects(box, drones[i])) continue;
          drones.splice(i, 1);
          droneCountRef.current = drones.length;
          return true;
        }
        return false;
      };

      for (let i = 0; i < dronesRef.current.length; i += 1) {
        const drone = dronesRef.current[i];
        const side = drone.side || (i % 2 === 0 ? -1 : 1);
        drone.side = side;
        drone.shipId = shipIdRef.current;
        drone.width = DRONE.size;
        drone.height = DRONE.size;
        const bob = Math.sin(scrollRef.current * 0.045 + i * 1.7) * DRONE.bob;
        const tx =
          playerRef.current.x +
          playerRef.current.width / 2 -
          DRONE.size / 2 +
          side * DRONE.offsetX;
        const ty = playerRef.current.y + DRONE.offsetY + bob;
        const follow = Math.min(1, 14 * frameDt);
        drone.x += (tx - drone.x) * follow;
        drone.y += (ty - drone.y) * follow;
        drone.x = clamp(drone.x, 0, Math.max(0, layout.width - DRONE.size));
        drone.fireAcc = (drone.fireAcc || 0) + frameDt * 1000;
        if (drone.fireAcc >= DRONE.fireIntervalMs) {
          drone.fireAcc = 0;
          lasersRef.current.push({
            id: uid(),
            x: drone.x + drone.width / 2 - DRONE.laserW / 2,
            y: drone.y - DRONE.laserH,
            width: DRONE.laserW,
            height: DRONE.laserH,
            shipId: shipIdRef.current,
            speed: LASER.speed * (ship.laserSpeedMul || 1) * 0.95,
            damage: Math.max(1, ship.damage || 1),
            fromDrone: true,
          });
        }
      }

      // Activate DONMA (time slow + frost) before world step
      let empThisTick = false;
      let zeusThisTick = false;
      if (empPendingRef.current) {
        empPendingRef.current = false;
        empThisTick = true;
        ultimateRef.current = 0;
        dispatch({ type: "ultimate", value: 0 });
        empBurstRef.current = {
          t: 0.02,
          x: playerRef.current.x + playerRef.current.width / 2,
          y: playerRef.current.y + playerRef.current.height / 2,
          kind: "emp",
        };
        shakeRef.current.t = 0.42;
        shakeRef.current.power = Math.max(shakeRef.current.power || 0, 42);
        playRef.current("explode");
        enemyLasersRef.current.length = 0;
        for (let i = missilesRef.current.length - 1; i >= 0; i -= 1) {
          if (!missilesRef.current[i].fromPlayer) missilesRef.current.splice(i, 1);
        }
      }
      if (zeusPendingRef.current) {
        zeusPendingRef.current = false;
        zeusRef.current = 0;
        dispatch({ type: "zeus", value: 0 });
        freezeRemainRef.current = DONMA.duration;
        empBurstRef.current = {
          t: 0.02,
          x: playerRef.current.x + playerRef.current.width / 2,
          y: playerRef.current.y + playerRef.current.height / 2,
          kind: "freeze",
        };
        shakeRef.current.t = 0.28;
        shakeRef.current.power = Math.max(shakeRef.current.power || 0, 18);
        playRef.current("levelup");
      }

      const freezing = freezeRemainRef.current > 0;
      if (freezing) {
        freezeRemainRef.current = Math.max(
          0,
          freezeRemainRef.current - frameDt
        );
      }
      const dt = freezing ? frameDt * DONMA.timeScale : frameDt;

      scrollRef.current += speed * (0.45 + stage * 0.08) * dt;
      spawnAccRef.current += dt * 1000;
      const meteorSpawnMs = spawnMs * 1.8;
      if (spawnAccRef.current >= meteorSpawnMs) {
        spawnAccRef.current = 0;
        if (phase === "wave" && Math.random() < cfg.meteorChance) {
          spawnMeteor(speed);
        }
      }

      if (phase === "wave") {
        const group = groupRef.current;
        const remainingQuota = Math.max(0, cfg.enemyQuota - spawnedRef.current);

        if (remainingQuota <= 0) {
          group.left = 0;
        } else if (group.left > 0) {
          group.acc += dt * 1000;
          if (group.acc >= ENEMY.groupGapMs) {
            group.acc = 0;
            group.left -= 1;
            spawnEnemy(group.speed);
          }
        } else {
          const enemySpawnMs = Math.max(
            ENEMY.minSpawnMs / late,
            (ENEMY.baseSpawnMs - (stage - 1) * 70) / late
          );
          enemyAccRef.current += dt * 1000;
          if (enemyAccRef.current >= enemySpawnMs) {
            enemyAccRef.current = 0;
            const want =
              cfg.waveMin +
              Math.floor(Math.random() * (cfg.waveMax - cfg.waveMin + 1));
            const count = Math.min(want, remainingQuota);
            spawnEnemy(speed);
            group.left = Math.max(0, count - 1);
            group.acc = 0;
            group.speed = speed;
          }
        }
      }

      if (phase === "clear") {
        clearAccRef.current += dt * 1000;
        if (clearAccRef.current >= 2000) {
          const nextStage = stage + 1;
          const nextCfg = stageConfig(nextStage);
          stageRef.current = nextStage;
          spawnedRef.current = 0;
          phaseRef.current = "wave";
          groupRef.current = { left: 0, acc: 0, speed };
          enemyAccRef.current = 400;
          bannerAccRef.current = 2200;
          dispatch({
            type: "stage",
            stage: nextStage,
            stageName: nextCfg.name,
            phase: "wave",
            banner: `AŞAMA ${nextStage}`,
            bannerSub: nextCfg.name,
            quota: nextCfg.enemyQuota,
          });
          playRef.current("levelup");
          setStageMusicRef.current(nextStage, false);
        }
      }

      const lasers = lasersRef.current;
      const meteors = meteorsRef.current;
      const enemies = enemiesRef.current;
      const enemyLasers = enemyLasersRef.current;
      const missiles = missilesRef.current;
      const powerups = powerupsRef.current;
      const player = playerRef.current;

      for (const laser of lasers) laser.y -= (laser.speed || LASER.speed) * frameDt;
      for (const meteor of meteors) {
        meteor.y += meteor.speed * dt;
        meteor.rotation += meteor.spin * dt;
      }
      for (const drop of powerups) drop.y += drop.speed * dt;

      const pushMissile = (enemy, ox = 0) => {
        const cx = enemy.x + enemy.width / 2 + ox;
        const cy = enemy.y + enemy.height * 0.78;
        const pcx = player.x + player.width / 2;
        const pcy = player.y + player.height / 2;
        const dx = pcx - cx;
        const dy = Math.max(48, pcy - cy);
        const dist = Math.hypot(dx, dy) || 1;
        const launch = MISSILE.launchSpeed;
        const vx = (dx / dist) * launch * 0.4;
        const vy = launch;
        missiles.push({
          id: uid(),
          x: cx - MISSILE.width / 2,
          y: cy,
          width: MISSILE.width,
          height: MISSILE.height,
          vx,
          vy,
          speed: launch,
          maxSpeed: (MISSILE.speed + Math.min(90, stage * 10)) * late,
          accel: MISSILE.accel,
          turn: enemy.missileHoming || 90,
          life: 0,
          angle: Math.atan2(vx, vy),
        });
      };

      const pushEnemyLaser = (enemy, ox = 0, vx = 0) => {
        enemyLasers.push({
          id: uid(),
          x: enemy.x + enemy.width / 2 - ENEMY.laserWidth / 2 + ox,
          y: enemy.y + enemy.height * 0.72,
          width: ENEMY.laserWidth,
          height: ENEMY.laserHeight,
          speed: enemy.laserSpeed || ENEMY.laserSpeed,
          vx,
        });
      };

      const pushPlasma = (enemy, ox = 0, vx = 0) => {
        const size = PLASMA.size;
        const cx = enemy.x + enemy.width / 2 + ox;
        const cy = enemy.y + enemy.height * 0.72;
        const pcx = player.x + player.width / 2;
        const pcy = player.y + player.height / 2;
        const dx = pcx - cx;
        const dy = Math.max(36, pcy - cy);
        const dist = Math.hypot(dx, dy) || 1;
        const launch = PLASMA.speed * 0.55;
        const ivx = (dx / dist) * launch * 0.45 + vx * 0.35;
        missiles.push({
          id: uid(),
          kind: "plasma",
          x: cx - size / 2,
          y: cy,
          width: size,
          height: size,
          vx: ivx,
          vy: launch,
          speed: launch,
          maxSpeed: (PLASMA.speed + Math.min(40, stage * 4)) * late,
          accel: 90,
          turn: enemy.missileHoming
            ? Math.min((PLASMA.homing || 48) + 12, 72)
            : PLASMA.homing || 48,
          life: 0,
          angle: Math.atan2(ivx, launch),
          fromPlayer: false,
          damage: 1,
          pulse: 0,
        });
      };

      for (const enemy of enemies) {
        if (enemy.isBoss) {
          const homeY = enemy.homeY != null ? enemy.homeY : BOSS.parkY;
          if (!enemy.parked) {
            enemy.y += enemy.speed * dt;
            if (enemy.y >= homeY) {
              enemy.y = homeY;
              enemy.parked = true;
            }
          } else {
            enemy.phase += dt * (enemy.moveRate || BOSS.moveRate || 1.55);
            const weave = Math.sin(enemy.phase) * (enemy.weaveAmp || 70);
            const bob =
              Math.sin(enemy.phase * 0.9 + (enemy.phaseOff || 0)) *
              (enemy.bobAmp || BOSS.bobAmp || 24);
            const drift = Math.sin(enemy.phase * 0.33) * 16;
            const homeX =
              enemy.homeX != null
                ? enemy.homeX
                : layout.width / 2 - enemy.width / 2;
            enemy.x = clamp(
              homeX + weave + drift,
              0,
              Math.max(0, layout.width - enemy.width)
            );
            const maxY = Math.min(layout.height * 0.36, homeY + 52);
            enemy.y = clamp(homeY + bob, 24, maxY);
          }
        } else if (enemy.isKamikaze) {
          enemy.x += (enemy.vx || 0) * dt;
          enemy.y += Math.max(enemy.speed * 0.9, enemy.vy || enemy.speed) * dt;
          enemy.angle = Math.atan2(enemy.vx || 0, enemy.vy || enemy.speed);
        } else if (enemy.isRaider) {
          enemy.x += (enemy.vx || RAIDER.speed) * dt;
          enemy.phase += dt * 5;
          enemy.y = enemy.baseY + Math.sin(enemy.phase) * 10;
        } else {
          enemy.y += enemy.speed * dt;
          const phaseSpeed =
            enemy.mode === "strafe" ? 3.4 : enemy.mode === "dive" ? 1.2 : 2.2;
          enemy.phase += dt * phaseSpeed;
          const weave = Math.sin(enemy.phase) * (enemy.weaveAmp || 0);
          enemy.x = clamp(
            enemy.baseX + weave,
            0,
            Math.max(0, layout.width - enemy.width)
          );
        }

        enemy.fireAcc += dt * 1000;
        const interval = enemy.fireInterval || ENEMY.fireIntervalMs;

        if (enemy.isKamikaze) {
          continue;
        }

        if (enemy.burstLeft > 0) {
          const burstGap =
            enemy.burstKind === "plasma" || enemy.weapon === "plasma"
              ? 160
              : 110;
          if (enemy.fireAcc >= burstGap) {
            enemy.fireAcc = 0;
            enemy.burstLeft -= 1;
            if (enemy.burstKind === "plasma" || enemy.weapon === "plasma") {
              pushPlasma(enemy, (Math.random() - 0.5) * 18);
            } else {
              pushEnemyLaser(enemy);
            }
            if (enemy.burstLeft <= 0) enemy.burstKind = "";
          }
        } else if (enemy.fireAcc >= interval && enemy.y > 16) {
          const raiderOnScreen =
            !enemy.isRaider ||
            (enemy.x + enemy.width > 8 && enemy.x < layout.width - 8);
          if (raiderOnScreen) {
          enemy.fireAcc = 0;
          if (enemy.mode === "boss") {
            fireBossPattern(
              enemy,
              player,
              pushEnemyLaser,
              pushMissile,
              pushPlasma
            );
          } else if (enemy.weapon === "plasma" || enemy.mode === "plasma") {
            pushPlasma(enemy, Math.random() < 0.5 ? -10 : 10);
            if (Math.random() < 0.48) {
              pushPlasma(enemy, 0, (Math.random() - 0.5) * 70);
            }
          } else if (enemy.mode === "burst") {
            enemy.burstLeft = 2;
            enemy.burstKind = "";
            pushEnemyLaser(enemy);
          } else if (enemy.mode === "twin") {
            pushEnemyLaser(enemy, -10);
            pushEnemyLaser(enemy, 10);
          } else if (enemy.mode === "spray") {
            pushEnemyLaser(enemy, 0, 0);
            pushEnemyLaser(enemy, -6, -90);
            pushEnemyLaser(enemy, 6, 90);
          } else if (enemy.mode === "sniper") {
            const dx =
              player.x + player.width / 2 - (enemy.x + enemy.width / 2);
            pushEnemyLaser(enemy, 0, clamp(dx * 1.1, -140, 140));
          } else if (enemy.mode === "raider") {
            pushEnemyLaser(enemy);
          } else {
            pushEnemyLaser(enemy);
          }
          }
        }

        if (enemy.isBoss && enemy.parked) {
          enemy.missileAcc = (enemy.missileAcc || 0) + dt * 1000;
          if (enemy.missileAcc >= (enemy.missileMs || 2200)) {
            enemy.missileAcc = 0;
            const n = enemy.missileCount || 1;
            const spread = 20;
            const plasmaVolley = enemy.usesPlasma && Math.random() < 0.58;
            for (let k = 0; k < n; k += 1) {
              const ox = (k - (n - 1) / 2) * spread;
              if (plasmaVolley) pushPlasma(enemy, ox);
              else pushMissile(enemy, ox);
            }
          }
        }
      }

      for (const el of enemyLasers) {
        el.y += (el.speed || ENEMY.laserSpeed) * dt;
        if (el.vx) el.x += el.vx * dt;
      }
      for (const missile of missiles) {
        const mdt = missile.fromPlayer ? frameDt : dt;
        missile.life = (missile.life || 0) + mdt;
        const isPlasma = missile.kind === "plasma";
        if (isPlasma) missile.pulse = (missile.pulse || 0) + mdt * 9;
        const mx = missile.x + missile.width / 2;
        const my = missile.y + missile.height / 2;
        let tx;
        let ty;
        if (missile.fromPlayer) {
          let target =
            missile.targetId &&
            enemies.find((e) => e.id === missile.targetId && (e.hp == null || e.hp > 0));
          if (!target) {
            let best = Infinity;
            for (const e of enemies) {
              if (e.hp != null && e.hp <= 0) continue;
              const dx = e.x + e.width / 2 - mx;
              const dy = e.y + e.height / 2 - my;
              const d = dx * dx + dy * dy;
              if (d < best) {
                best = d;
                target = e;
              }
            }
            if (target) missile.targetId = target.id;
          }
          if (!target) {
            let best = Infinity;
            for (const m of meteors) {
              const dx = m.x + m.width / 2 - mx;
              const dy = m.y + m.height / 2 - my;
              const d = dx * dx + dy * dy;
              if (d < best) {
                best = d;
                target = m;
              }
            }
          }
          if (target) {
            tx = target.x + target.width / 2 - mx;
            ty = target.y + target.height / 2 - my;
          } else {
            tx = 0;
            ty = -1;
          }
        } else {
          tx = player.x + player.width / 2 - mx;
          ty = player.y + player.height / 2 - my;
        }
        const want = Math.atan2(tx, ty);
        let ang = Math.atan2(missile.vx || 0, missile.vy || (missile.fromPlayer ? -1 : 1));
        let diff = want - ang;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const turnRate = missile.turn || (isPlasma ? PLASMA.homing : 90);
        const maxTurn = (turnRate * Math.PI / 180) * mdt;
        ang += clamp(diff, -maxTurn, maxTurn);
        const cap =
          missile.maxSpeed ||
          (isPlasma
            ? missile.fromPlayer
              ? PLASMA.playerSpeed
              : PLASMA.speed
            : missile.fromPlayer
              ? PLAYER_ROCKET.speed
              : MISSILE.speed);
        const launch = missile.fromPlayer
          ? PLAYER_ROCKET.launchSpeed
          : isPlasma
            ? PLASMA.speed * 0.55
            : MISSILE.launchSpeed;
        const accel =
          missile.accel ||
          (missile.fromPlayer ? PLAYER_ROCKET.accel : isPlasma ? 90 : MISSILE.accel);
        missile.speed = Math.min(cap, (missile.speed || launch) + accel * mdt);
        missile.vx = Math.sin(ang) * missile.speed;
        missile.vy = Math.cos(ang) * missile.speed;
        missile.x += missile.vx * mdt;
        missile.y += missile.vy * mdt;
        if (isPlasma) {
          missile.x += Math.sin((missile.life || 0) * 8 + (missile.id || 0)) * 20 * mdt;
        }
        missile.angle = ang;
      }

      const addCharge = (amount) => {
        if (zeusThisTick) return;
        // DONMA/ZEUS hızlı; PATLAT ona göre %70 daha geç
        zeusRef.current = Math.min(1, zeusRef.current + amount);
        ultimateRef.current = Math.min(
          1,
          ultimateRef.current + amount / PATLAT_CHARGE_DIVISOR
        );
      };

      let gained = 0;
      let livesLost = 0;
      let destroyedCount = 0;
      let bossKilled = false;

      const killEnemy = (enemy, dmg, pierce = false) => {
        if (!pierce && enemy.shieldHp > 0) {
          enemy.shieldHp -= 1;
          return false;
        }
        if (enemy.isBoss) {
          enemy.hp = (enemy.hp || 1) - dmg;
          if (enemy.hp > 0) return false;
          bossKilled = true;
          destroyedCount += 1;
          gained += Math.round(POINTS_PER_BOSS * scoreMul);
          spawnPowerUp(enemy, 1);
          addCharge(ULTIMATE.perBoss);
          bossBurstRef.current = {
            t: 0.02,
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
          };
              shakeRef.current.t = Math.max(shakeRef.current.t, 0.3);
              shakeRef.current.power = Math.max(shakeRef.current.power || 0, 36);
          return true;
        }
        if (enemy.isRaider) {
          enemy.hp = (enemy.hp || 1) - dmg;
          if (enemy.hp > 0) return false;
          destroyedCount += 1;
          gained += Math.round(POINTS_PER_RAIDER * scoreMul);
          spawnPowerUp(enemy, 0.4);
          addCharge(ULTIMATE.perEnemy * 1.6);
          return true;
        }
        if (enemy.isKamikaze) {
          enemy.hp = (enemy.hp || 1) - dmg;
          if (enemy.hp > 0) return false;
          destroyedCount += 1;
          gained += Math.round(POINTS_PER_KAMIKAZE * scoreMul);
          spawnPowerUp(enemy, 0.35);
          addCharge(ULTIMATE.perEnemy * 1.4);
          return true;
        }
        destroyedCount += 1;
        gained += Math.round(POINTS_PER_ENEMY * scoreMul);
        spawnPowerUp(enemy, ENEMY.dropChance);
        addCharge(ULTIMATE.perEnemy);
        return true;
      };

      const remainingMeteors = [];
      for (const meteor of meteors) {
        const pad = meteor.hitPad || 0;
        const hitbox = {
          x: meteor.x + pad,
          y: meteor.y + pad,
          width: meteor.width - pad * 2,
          height: meteor.height - pad * 2,
        };
        let destroyed = false;
        for (let i = lasers.length - 1; i >= 0; i -= 1) {
          if (aabbIntersects(lasers[i], hitbox)) {
            lasers.splice(i, 1);
            destroyed = true;
            destroyedCount += 1;
            gained += Math.round(POINTS_PER_METEOR * scoreMul);
            spawnPowerUp(meteor, POWERUP.dropChance);
            addCharge(ULTIMATE.perMeteor);
            break;
          }
        }
        if (!destroyed) {
          for (let i = missiles.length - 1; i >= 0; i -= 1) {
            if (!missiles[i].fromPlayer) continue;
            if (!aabbIntersects(missiles[i], hitbox)) continue;
            missiles.splice(i, 1);
            destroyed = true;
            destroyedCount += 1;
            gained += Math.round(POINTS_PER_METEOR * scoreMul);
            spawnPowerUp(meteor, POWERUP.dropChance);
            addCharge(ULTIMATE.perMeteor);
            break;
          }
        }
        if (destroyed) continue;

        if (empThisTick || zeusThisTick) {
          destroyedCount += 1;
          gained += Math.round(POINTS_PER_METEOR * scoreMul);
          if (!zeusThisTick) addCharge(ULTIMATE.perMeteor);
          continue;
        }

        if (isOffScreenBottom(meteor, layout.height)) continue;
        if (hitDrone(hitbox)) {
          playRef.current("explode");
          continue;
        }
        const result = resolveHazardHit(aabbIntersects(hitbox, player));
        if (result === "damage") livesLost += 1;
        else remainingMeteors.push(meteor);
      }

      const remainingEnemies = [];
      for (const enemy of enemies) {
        let dead = false;
        for (let i = lasers.length - 1; i >= 0; i -= 1) {
          if (!aabbIntersects(lasers[i], enemy)) continue;
          const shot = lasers[i];
          lasers.splice(i, 1);
          if (killEnemy(enemy, shot.damage || 1)) dead = true;
          break;
        }
        if (!dead) {
          for (let i = missiles.length - 1; i >= 0; i -= 1) {
            if (!missiles[i].fromPlayer) continue;
            if (!aabbIntersects(missiles[i], enemy)) continue;
            const rocket = missiles[i];
            missiles.splice(i, 1);
            if (killEnemy(enemy, rocket.damage || PLAYER_ROCKET.damage))
              dead = true;
            break;
          }
        }
        if (!dead && (empThisTick || zeusThisTick)) {
          if (killEnemy(
            enemy,
            zeusThisTick ? 9999 : enemy.isBoss ? ULTIMATE.empBossDamage : 99,
            true
          ))
            dead = true;
        }
        if (dead) continue;

        if (enemy.isRaider) {
          if (enemy.x > layout.width + 72 || enemy.x + enemy.width < -72)
            continue;
        } else if (enemy.isKamikaze) {
          if (enemy.y > layout.height || enemy.x + enemy.width < -40 || enemy.x > layout.width + 40)
            continue;
        } else if (!enemy.isBoss && isOffScreenBottom(enemy, layout.height))
          continue;
        if (hitDrone(enemy)) {
          playRef.current("explode");
          if (enemy.isKamikaze) {
            killEnemy(enemy, 99, true);
            continue;
          }
        }
        if (enemy.isKamikaze && aabbIntersects(enemy, player)) {
          const ram = resolveHazardHit(true);
          if (ram === "damage") livesLost += 1;
          playRef.current("explode");
          continue;
        }
        const result = resolveHazardHit(aabbIntersects(enemy, player));
        if (result === "damage") livesLost += 1;
        remainingEnemies.push(enemy);
      }

      const remainingEnemyLasers = [];
      for (const el of enemyLasers) {
        if (isOffScreenBottom(el, layout.height)) continue;
        if (el.x + el.width < 0 || el.x > layout.width) continue;
        if (hitDrone(el)) {
          playRef.current("explode");
          continue;
        }
        const result = resolveHazardHit(aabbIntersects(el, player));
        if (result === "damage") {
          livesLost += 1;
          continue;
        }
        if (result === "absorb" || result === "iframe") continue;
        remainingEnemyLasers.push(el);
      }

      const remainingMissiles = [];
      for (const missile of missiles) {
        if (!missile.fromPlayer) {
          let shot = false;
          for (let i = lasers.length - 1; i >= 0; i -= 1) {
            if (!aabbIntersects(lasers[i], missile)) continue;
            lasers.splice(i, 1);
            shot = true;
            destroyedCount += 1;
            break;
          }
          if (shot) continue;
        }
        const maxLife =
          missile.kind === "plasma"
            ? missile.fromPlayer
              ? PLASMA.playerMaxLife
              : PLASMA.maxLife
            : missile.fromPlayer
              ? PLAYER_ROCKET.maxLife
              : MISSILE.maxLife;
        if ((missile.life || 0) > maxLife) continue;
        if (missile.y > layout.height + 48) continue;
        if (missile.y + missile.height < -48) continue;
        if (missile.x + missile.width < -48 || missile.x > layout.width + 48)
          continue;
        if (missile.fromPlayer) {
          remainingMissiles.push(missile);
          continue;
        }
        if (hitDrone(missile)) {
          playRef.current("explode");
          continue;
        }
        const result = resolveHazardHit(aabbIntersects(missile, player));
        if (result === "damage") {
          livesLost += 1;
          continue;
        }
        if (result === "absorb" || result === "iframe") continue;
        remainingMissiles.push(missile);
      }

      const remainingDrops = [];
      for (const drop of powerups) {
        if (isOffScreenBottom(drop, layout.height)) continue;
        if (aabbIntersects(drop, player)) {
          playRef.current("pickup");
          if (drop.type === POWERUP_TYPE.LIFE) dispatch({ type: "grantLife" });
          else if (drop.type === POWERUP_TYPE.SHIELD)
            dispatch({
              type: "grantShield",
              hits: getShip(shipIdRef.current).shieldMax || 1,
            });
          else if (drop.type === POWERUP_TYPE.DRONE) spawnDrone();
          else {
            const atMax =
              (hudRef.current.weaponLevel || 0) >= WEAPON.maxLevel;
            dispatch({ type: "grantWeapon" });
            if (atMax) spawnDrone();
          }
          continue;
        }
        remainingDrops.push(drop);
      }

      lasersRef.current = lasers.filter((laser) => !isOffScreenTop(laser));
      meteorsRef.current = remainingMeteors;
      enemiesRef.current = remainingEnemies;
      enemyLasersRef.current = remainingEnemyLasers;
      missilesRef.current = remainingMissiles;
      powerupsRef.current = remainingDrops;

      if (
        phase === "wave" &&
        spawnedRef.current >= cfg.enemyQuota &&
        remainingEnemies.length === 0
      ) {
        phaseRef.current = "boss";
        bannerAccRef.current = 1400;
        shakeRef.current.t = Math.max(shakeRef.current.t, 0.16);
        shakeRef.current.power = Math.max(shakeRef.current.power || 0, 14);
        dispatch({
          type: "phase",
          phase: "boss",
          bannerKind: "boss",
          banner: cfg.bossCount > 1 ? "ÇİFTE AMİRAL" : cfg.bossName || "AMİRAL GEMİSİ",
          bannerSub:
            cfg.bossCount > 1
              ? `${cfg.bossName} & ${cfg.bossNameB || "Gölge"}`
              : `${cfg.name} amiral gemisi`,
        });
        spawnBoss();
        playRef.current("levelup");
        setStageMusicRef.current(stage, true);
      }

      if (bossKilled && !remainingEnemies.some((e) => e.isBoss)) {
        phaseRef.current = "clear";
        clearAccRef.current = 0;
        bannerAccRef.current = 2000;
        missilesRef.current = remainingMissiles.filter((m) => m.fromPlayer);
        enemyLasersRef.current = [];
        enemiesRef.current = remainingEnemies.filter((e) => !e.isBoss);
        dispatch({
          type: "phase",
          phase: "clear",
          bannerKind: "",
          banner: `AŞAMA ${stage} TAMAM`,
          bannerSub: "Sonraki aşama yükleniyor",
        });
      }

      if (destroyedCount > 0) playRef.current("explode");

      if (gained > 0) {
        dispatch({
          type: "score",
          score: score + gained,
          ultimate: ultimateRef.current,
          zeus: zeusRef.current,
        });
      } else if (
        Math.abs((hudRef.current.ultimate || 0) - ultimateRef.current) > 0.001 ||
        Math.abs((hudRef.current.zeus || 0) - zeusRef.current) > 0.001
      ) {
        dispatch({
          type: "score",
          score,
          ultimate: ultimateRef.current,
          zeus: zeusRef.current,
        });
      }

      if (hudRef.current.droneCount !== dronesRef.current.length) {
        dispatch({
          type: "setDrones",
          droneCount: dronesRef.current.length,
        });
      }

      if (livesLost > 0) {
        livesLost = 1;
        iFrameRef.current = 900;
        const lives = hudRef.current.lives - livesLost;
        if (lives <= 0) {
          endGame(score + gained);
          return;
        }
        const s = shakeRef.current;
        s.t = Math.max(s.t, 0.24);
        s.power = Math.max(s.power || 0, 28);
        playRef.current("hit");
        dispatch({ type: "hit", lives });
      }

      setRenderTick();
    },
    [
      endGame,
      layout.height,
      layout.width,
      resolveHazardHit,
      spawnRaider,
      spawnBoss,
      spawnEnemy,
      spawnLaser,
      spawnMeteor,
      spawnPowerUp,
    ]
  );

  useGameLoop(tick, {
    paused: hud.screen !== SCREEN.PLAYING || hud.paused,
  });

  return {
    hud,
    shipId,
    setShipId,
    playerName,
    setPlayerName,
    saveRun,
    player: { ...playerRef.current, shipId, shielded: hud.shielded },
    lasers: lasersRef.current,
    meteors: meteorsRef.current,
    enemies: enemiesRef.current,
    enemyLasers: enemyLasersRef.current,
    missiles: missilesRef.current,
    powerups: powerupsRef.current,
    drones: dronesRef.current,
    scrollY: scrollRef.current,
    empBurst: empBurstRef.current,
    bossBurst: bossBurstRef.current,
    freezeActive: freezeRemainRef.current > 0,
    freezeRemain: freezeRemainRef.current,
    shake: { x: shakeRef.current.x, y: shakeRef.current.y },
    startGame,
    goToStart,
    movePlayerTo,
    fireUltimate,
    fireZeus,
    togglePause,
    resumeGame,
    fire: spawnLaser,
    fireMissile,
    unlockAudio: unlock,
  };
}
