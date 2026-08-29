import { METEOR, SCORE_PER_LEVEL, stageScale, levelFromScore } from "./constants/game";

export function aabbIntersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function isOffScreenBottom(entity, screenHeight) {
  return entity.y > screenHeight;
}

export function isOffScreenTop(entity) {
  return entity.y + entity.height < 0;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function randomX(maxWidth, entityWidth) {
  return Math.random() * Math.max(0, maxWidth - entityWidth);
}

export { levelFromScore };

export function difficultyFromLevel(stage) {
  const tier = Math.max(0, (stage || 1) - 1);
  const late = stageScale(stage);
  const speed = Math.min(
    METEOR.maxSpeed * late,
    (METEOR.baseSpeed + tier * 16) * late
  );
  const spawnMs = Math.max(
    METEOR.minSpawnMs / late,
    (METEOR.baseSpawnMs - tier * 85) / late
  );
  return {
    speed,
    spawnMs,
    level: stage,
    scoreMul: 1 + Math.min(0.8, tier * 0.06) + (late > 1 ? 0.2 : 0),
    late,
  };
}

export function difficultyFromScore(score) {
  return difficultyFromLevel(levelFromScore(score));
}

export { SCORE_PER_LEVEL };
