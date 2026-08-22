import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_PLAYER_NAME,
  HIGH_SCORE_KEY,
  LEADERBOARD_KEY,
  PLAYER_NAME_KEY,
} from "../constants/game";

const MAX_ENTRIES = 5;

export async function loadPlayerName() {
  try {
    const name = await AsyncStorage.getItem(PLAYER_NAME_KEY);
    return (name && name.trim()) || DEFAULT_PLAYER_NAME;
  } catch {
    return DEFAULT_PLAYER_NAME;
  }
}

export async function savePlayerName(name) {
  const clean = String(name || "")
    .trim()
    .slice(0, 12);
  try {
    await AsyncStorage.setItem(PLAYER_NAME_KEY, clean || DEFAULT_PLAYER_NAME);
  } catch {
    // ignore
  }
  return clean || DEFAULT_PLAYER_NAME;
}

export async function loadHighScore() {
  try {
    const board = await loadLeaderboard();
    if (board.length) return board[0].score;
    const raw = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

export async function loadLeaderboard() {
  try {
    const raw = await AsyncStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && Number.isFinite(Number(e.score)))
      .map((e) => ({
        name: e.name || DEFAULT_PLAYER_NAME,
        score: Number(e.score),
        level: Number(e.level) || 1,
        difficulty: e.difficulty || "normal",
        at: e.at || Date.now(),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export async function saveScoreEntry({ score, level, difficulty, name }) {
  try {
    const board = await loadLeaderboard();
    board.push({
      name: (name && String(name).trim().slice(0, 12)) || DEFAULT_PLAYER_NAME,
      score,
      level,
      difficulty: difficulty || "normal",
      at: Date.now(),
    });
    board.sort((a, b) => b.score - a.score);
    const next = board.slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
    await AsyncStorage.setItem(HIGH_SCORE_KEY, String(next[0]?.score ?? score));
    return next;
  } catch {
    return [];
  }
}

export async function saveHighScore(score) {
  return saveScoreEntry({
    score,
    level: 1,
    difficulty: "normal",
    name: DEFAULT_PLAYER_NAME,
  });
}
