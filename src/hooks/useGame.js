import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  BOSS,
  DEFAULT_PLAYER_NAME,
  ENEMY,
  ENEMY_MODES,
  INITIAL_LIVES,
  LASER,
  MAX_LIVES,
  METEOR,
  MISSILE,
  PLAYER,
  POINTS_PER_BOSS,
  POINTS_PER_ENEMY,
  POINTS_PER_METEOR,
  POWERUP,
  POWERUP_TYPE,
  SCREEN,
  SHIPS,
  WEAPON,
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
  shielded: false,
  weaponLevel: 0,
  scoreSaved: false,
  spawned: 0,
  quota: stageConfig(1).enemyQuota,
};

function pickPowerUpType() {
  const r = Math.random();
  const { life, shield } = POWERUP.weights;
  if (r < life) return POWERUP_TYPE.LIFE;
  if (r < life + shield) return POWERUP_TYPE.SHIELD;
  return POWERUP_TYPE.WEAPON;
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
        lives: INITIAL_LIVES,
        level: 1,
        stage: 1,
        stageName: stageConfig(1).name,
        phase: "wave",
        banner: "AŞAMA 1",
        bannerSub: stageConfig(1).name,
        shielded: false,
        weaponLevel: 0,
        scoreSaved: false,
        spawned: 0,
        quota: stageConfig(1).enemyQuota,
      };
    case "score":
      return {
        ...state,
        score: action.score,
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
      };
    case "phase":
      return {
        ...state,
        phase: action.phase,
        banner: action.banner ?? state.banner,
        bannerSub: action.bannerSub ?? state.bannerSub,
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
        spawned: 0,
        quota: action.quota ?? state.quota,
      };
    case "hit":
      return {
        ...state,
        lives: action.lives,
        shielded: false,
        weaponLevel: 0,
      };
    case "shieldBreak":
      return { ...state, shielded: false };
    case "grantLife":
      return { ...state, lives: Math.min(MAX_LIVES, state.lives + 1) };
    case "grantShield":
      return { ...state, shielded: true };
    case "grantWeapon":
      return {
        ...state,
        weaponLevel: Math.min(WEAPON.maxLevel, state.weaponLevel + 1),
      };
    case "gameOver":
      return {
        ...state,
        screen: SCREEN.GAME_OVER,
        score: action.score,
        lives: 0,
        shielded: false,
        weaponLevel: 0,
        scoreSaved: false,
        highScore: Math.max(state.highScore, action.score),
        level: action.stage || state.stage || 1,
        stage: action.stage || state.stage || 1,
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
        weaponLevel: 0,
        scoreSaved: false,
        phase: "wave",
        banner: "",
        bannerSub: "",
        stage: 1,
        stageName: stageConfig(1).name,
        level: 1,
        spawned: 0,
        quota: stageConfig(1).enemyQuota,
      };
    default:
      return state;
  }
}

let nextId = 1;
function uid() {
  nextId += 1;
  return nextId;
}

export function useGame(layout) {
  const [hud, dispatch] = useReducer(hudReducer, initialHud);
  const [shipId, setShipIdState] = useState(SHIPS[0].id);
  const [playerName, setPlayerNameState] = useState(DEFAULT_PLAYER_NAME);
  const { play, startMusic, stopMusic } = useSfx();
  const playRef = useRef(play);
  playRef.current = play;
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
  });
  const lasersRef = useRef([]);
  const meteorsRef = useRef([]);
  const enemiesRef = useRef([]);
  const enemyLasersRef = useRef([]);
  const missilesRef = useRef([]);
  const powerupsRef = useRef([]);
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
    playerRef.current.y = layout.height - PLAYER.height - PLAYER.bottom;
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
    if (layout.width) {
      playerRef.current.x = (layout.width - PLAYER.width) / 2;
      playerRef.current.y = layout.height - PLAYER.height - PLAYER.bottom;
    }
  }, [layout.width, layout.height]);

  const startGame = useCallback(
    (selectedShipId) => {
      if (selectedShipId) setShipIdState(selectedShipId);
      resetWorld();
      dispatch({ type: "start" });
      startMusic();
    },
    [resetWorld, startMusic]
  );

  const goToStart = useCallback(() => {
    stopMusic();
    resetWorld();
    dispatch({ type: "toStart" });
  }, [resetWorld, stopMusic]);

  const movePlayerTo = useCallback(
    (localX) => {
      const half = PLAYER.width / 2;
      playerRef.current.x = clamp(
        localX - half,
        0,
        Math.max(0, layout.width - PLAYER.width)
      );
    },
    [layout.width]
  );

  const spawnLaser = useCallback(() => {
    const p = playerRef.current;
    const level = hudRef.current.weaponLevel || 0;
    const cx = p.x + p.width / 2 - LASER.width / 2;
    const y = p.y - LASER.height;
    const shipIdNow = shipIdRef.current;
    const mk = (x) => ({
      id: uid(),
      x,
      y,
      width: LASER.width,
      height: LASER.height,
      shipId: shipIdNow,
    });

    if (level <= 0) {
      lasersRef.current.push(mk(cx));
    } else if (level === 1) {
      lasersRef.current.push(mk(cx - 12), mk(cx + 12));
    } else {
      lasersRef.current.push(mk(cx - 16), mk(cx), mk(cx + 16));
    }

    laserSfxGateRef.current += 1;
    if (laserSfxGateRef.current % 2 === 0) playRef.current("laser");
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

  const spawnEnemy = useCallback(
    (speed) => {
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

      enemiesRef.current.push({
        id: uid(),
        x,
        y: -ENEMY.height,
        width: ENEMY.width,
        height: ENEMY.height,
        speed: Math.min(ENEMY.maxSpeed, speed * speedMul),
        baseX: x,
        phase: Math.random() * Math.PI * 2,
        weaveAmp,
        fireAcc: fireInterval * (0.2 + Math.random() * 0.5),
        fireInterval,
        laserSpeed,
        mode,
        variant: Math.floor(Math.random() * ENEMY.variantCount),
        burstLeft: 0,
        isBoss: false,
      });
      spawnedRef.current += 1;
      dispatch({
        type: "wave",
        spawned: spawnedRef.current,
        quota: stageConfig(stageRef.current).enemyQuota,
      });
    },
    [layout.width]
  );

  const spawnBoss = useCallback(
    (speed) => {
      const cfg = stageConfig(stageRef.current);
      const x = Math.max(0, (layout.width - BOSS.width) / 2);
      enemiesRef.current.push({
        id: uid(),
        x,
        y: -BOSS.height,
        width: BOSS.width,
        height: BOSS.height,
        speed: BOSS.enterSpeed,
        baseX: x,
        phase: 0,
        weaveAmp: BOSS.weaveAmp,
        fireAcc: 400,
        fireInterval: Math.max(480, cfg.bossHp > 30 ? 620 : BOSS.fireIntervalMs),
        laserSpeed: BOSS.laserSpeed,
        mode: "boss",
        variant: cfg.bossVariant ?? 0,
        bossVariant: cfg.bossVariant ?? 0,
        burstLeft: 0,
        isBoss: true,
        hp: cfg.bossHp,
        maxHp: cfg.bossHp,
        parked: false,
        missileAcc: 600,
        missileMs: cfg.missileMs,
        missileCount: cfg.missileCount,
        missileHoming: cfg.missileHoming,
      });
    },
    [layout.width]
  );

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
      return "absorb";
    }
    return "damage";
  }, []);

  const tick = useCallback(
    (dt) => {
      if (!layout.width || !layout.height) return;

      const score = hudRef.current.score;
      const stage = stageRef.current;
      const cfg = stageConfig(stage);
      const weaponLevel = hudRef.current.weaponLevel || 0;
      const { speed, spawnMs, scoreMul } = difficultyFromLevel(stage);

      if (iFrameRef.current > 0) iFrameRef.current -= dt * 1000;

      if (bannerAccRef.current > 0) {
        bannerAccRef.current -= dt * 1000;
        if (bannerAccRef.current <= 0 && phaseRef.current !== "clear") {
          dispatch({ type: "banner", banner: "", bannerSub: "" });
        }
      }

      scrollRef.current += speed * (0.45 + stage * 0.08) * dt;

      const fireMs =
        WEAPON.fireIntervalMs[
          Math.min(weaponLevel, WEAPON.fireIntervalMs.length - 1)
        ] || LASER.fireIntervalMs;
      fireAccRef.current += dt * 1000;
      if (fireAccRef.current >= fireMs) {
        fireAccRef.current = 0;
        spawnLaser();
      }

      const phase = phaseRef.current;

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
            ENEMY.minSpawnMs,
            ENEMY.baseSpawnMs - (stage - 1) * 70
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
        }
      }

      const lasers = lasersRef.current;
      const meteors = meteorsRef.current;
      const enemies = enemiesRef.current;
      const enemyLasers = enemyLasersRef.current;
      const missiles = missilesRef.current;
      const powerups = powerupsRef.current;
      const player = playerRef.current;

      for (const laser of lasers) laser.y -= LASER.speed * dt;
      for (const meteor of meteors) {
        meteor.y += meteor.speed * dt;
        meteor.rotation += meteor.spin * dt;
      }
      for (const drop of powerups) drop.y += drop.speed * dt;

      const pushMissile = (enemy, ox = 0) => {
        const cx = enemy.x + enemy.width / 2 - MISSILE.width / 2 + ox;
        const pcx = player.x + player.width / 2;
        const dx = pcx - (cx + MISSILE.width / 2);
        missiles.push({
          id: uid(),
          x: cx,
          y: enemy.y + enemy.height * 0.7,
          width: MISSILE.width,
          height: MISSILE.height,
          speed: MISSILE.speed + Math.min(80, stage * 8),
          vx: clamp(dx * 0.9, -140, 140),
          homing: enemy.missileHoming || 60,
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

      for (const enemy of enemies) {
        if (enemy.isBoss) {
          if (!enemy.parked) {
            enemy.y += enemy.speed * dt;
            if (enemy.y >= BOSS.parkY) {
              enemy.y = BOSS.parkY;
              enemy.parked = true;
            }
          } else {
            enemy.phase += dt * 1.6;
            const weave = Math.sin(enemy.phase) * enemy.weaveAmp;
            enemy.x = clamp(
              layout.width / 2 - enemy.width / 2 + weave,
              0,
              Math.max(0, layout.width - enemy.width)
            );
          }
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

        if (enemy.burstLeft > 0) {
          if (enemy.fireAcc >= 110) {
            enemy.fireAcc = 0;
            enemy.burstLeft -= 1;
            pushEnemyLaser(enemy);
          }
        } else if (enemy.fireAcc >= interval && enemy.y > 16) {
          enemy.fireAcc = 0;
          if (enemy.mode === "boss") {
            const kind = enemy.bossVariant ?? enemy.variant ?? 0;
            if (kind === 1) {
              const dx =
                player.x + player.width / 2 - (enemy.x + enemy.width / 2);
              pushEnemyLaser(enemy, -14, clamp(dx * 0.6, -80, 80));
              pushEnemyLaser(enemy, 14, clamp(dx * 0.6, -80, 80));
              pushEnemyLaser(enemy, 0, clamp(dx * 1.3, -180, 180));
            } else if (kind === 2) {
              enemy.burstLeft = 4;
              pushEnemyLaser(enemy, -18);
              pushEnemyLaser(enemy, 18);
            } else if (kind === 3) {
              pushEnemyLaser(enemy, -22, -70);
              pushEnemyLaser(enemy, 0, 0);
              pushEnemyLaser(enemy, 22, 70);
              pushMissile(enemy);
            } else if (kind === 4) {
              enemy.burstLeft = 5;
              pushEnemyLaser(enemy, -10);
              pushEnemyLaser(enemy, 10);
              pushMissile(enemy, -16);
              pushMissile(enemy, 16);
            } else if (kind === 5) {
              const dx =
                player.x + player.width / 2 - (enemy.x + enemy.width / 2);
              pushEnemyLaser(enemy, -24, -110);
              pushEnemyLaser(enemy, -8, clamp(dx, -160, 160));
              pushEnemyLaser(enemy, 8, clamp(dx, -160, 160));
              pushEnemyLaser(enemy, 24, 110);
              pushMissile(enemy, -20);
              pushMissile(enemy, 0);
              pushMissile(enemy, 20);
            } else {
              const pattern = Math.floor(enemy.phase * 2) % 3;
              if (pattern === 0) {
                pushEnemyLaser(enemy, -16);
                pushEnemyLaser(enemy, 16);
              } else if (pattern === 1) {
                enemy.burstLeft = 3;
                pushEnemyLaser(enemy);
              } else {
                const dx =
                  player.x + player.width / 2 - (enemy.x + enemy.width / 2);
                pushEnemyLaser(enemy, 0, clamp(dx * 1.15, -160, 160));
                pushEnemyLaser(enemy, -12, -80);
                pushEnemyLaser(enemy, 12, 80);
              }
            }
          } else if (enemy.mode === "burst") {
            enemy.burstLeft = 2;
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
          } else {
            pushEnemyLaser(enemy);
          }
        }

        if (enemy.isBoss && enemy.parked) {
          enemy.missileAcc = (enemy.missileAcc || 0) + dt * 1000;
          if (enemy.missileAcc >= (enemy.missileMs || 2200)) {
            enemy.missileAcc = 0;
            const n = enemy.missileCount || 1;
            const spread = 20;
            for (let k = 0; k < n; k += 1) {
              pushMissile(enemy, (k - (n - 1) / 2) * spread);
            }
          }
        }
      }

      for (const el of enemyLasers) {
        el.y += (el.speed || ENEMY.laserSpeed) * dt;
        if (el.vx) el.x += el.vx * dt;
      }
      for (const missile of missiles) {
        const pcx = player.x + player.width / 2;
        const mx = missile.x + missile.width / 2;
        const pull = (pcx - mx) * ((missile.homing || 60) / 80);
        missile.vx = clamp((missile.vx || 0) + pull * dt * 8, -200, 200);
        missile.x += missile.vx * dt;
        missile.y += (missile.speed || MISSILE.speed) * dt;
      }

      let gained = 0;
      let livesLost = 0;
      let destroyedCount = 0;
      let bossKilled = false;

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
            break;
          }
        }
        if (destroyed) continue;

        if (isOffScreenBottom(meteor, layout.height)) continue;
        const result = resolveHazardHit(aabbIntersects(hitbox, player));
        if (result === "damage") livesLost += 1;
        else remainingMeteors.push(meteor);
      }

      const remainingEnemies = [];
      for (const enemy of enemies) {
        let dead = false;
        for (let i = lasers.length - 1; i >= 0; i -= 1) {
          if (!aabbIntersects(lasers[i], enemy)) continue;
          lasers.splice(i, 1);
          if (enemy.isBoss) {
            enemy.hp = (enemy.hp || 1) - 1;
            if (enemy.hp <= 0) {
              dead = true;
              bossKilled = true;
              destroyedCount += 1;
              gained += Math.round(POINTS_PER_BOSS * scoreMul);
              spawnPowerUp(enemy, 1);
            }
          } else {
            dead = true;
            destroyedCount += 1;
            gained += Math.round(POINTS_PER_ENEMY * scoreMul);
            spawnPowerUp(enemy, ENEMY.dropChance);
          }
          break;
        }
        if (dead) continue;

        if (!enemy.isBoss && isOffScreenBottom(enemy, layout.height)) continue;
        const result = resolveHazardHit(aabbIntersects(enemy, player));
        if (result === "damage") livesLost += 1;
        remainingEnemies.push(enemy);
      }

      const remainingEnemyLasers = [];
      for (const el of enemyLasers) {
        if (isOffScreenBottom(el, layout.height)) continue;
        if (el.x + el.width < 0 || el.x > layout.width) continue;
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
        let shot = false;
        for (let i = lasers.length - 1; i >= 0; i -= 1) {
          if (!aabbIntersects(lasers[i], missile)) continue;
          lasers.splice(i, 1);
          shot = true;
          destroyedCount += 1;
          break;
        }
        if (shot) continue;
        if (isOffScreenBottom(missile, layout.height)) continue;
        if (missile.x + missile.width < 0 || missile.x > layout.width) continue;
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
            dispatch({ type: "grantShield" });
          else dispatch({ type: "grantWeapon" });
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
        bannerAccRef.current = 2000;
        dispatch({
          type: "phase",
          phase: "boss",
          banner: cfg.bossName || "BOSS",
          bannerSub: `${cfg.name} bossu`,
        });
        spawnBoss(speed);
        playRef.current("levelup");
      }

      if (bossKilled) {
        phaseRef.current = "clear";
        clearAccRef.current = 0;
        bannerAccRef.current = 2000;
        missilesRef.current = [];
        enemyLasersRef.current = [];
        enemiesRef.current = remainingEnemies.filter((e) => !e.isBoss);
        dispatch({
          type: "phase",
          phase: "clear",
          banner: `AŞAMA ${stage} TAMAM`,
          bannerSub: "Sonraki aşama yükleniyor",
        });
      }

      if (destroyedCount > 0) playRef.current("explode");

      if (gained > 0) {
        dispatch({ type: "score", score: score + gained });
      }

      if (livesLost > 0) {
        livesLost = 1;
        iFrameRef.current = 900;
        const lives = hudRef.current.lives - livesLost;
        if (lives <= 0) {
          endGame(score + gained);
          return;
        }
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
      spawnBoss,
      spawnEnemy,
      spawnLaser,
      spawnMeteor,
      spawnPowerUp,
    ]
  );

  useGameLoop(tick, { paused: hud.screen !== SCREEN.PLAYING });

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
    scrollY: scrollRef.current,
    startGame,
    goToStart,
    movePlayerTo,
    fire: spawnLaser,
  };
}
