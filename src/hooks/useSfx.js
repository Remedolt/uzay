import { Asset } from "expo-asset";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { useCallback, useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

const SFX = {
  laser: require("../../assets/sfx/laser.mp3"),
  explode: require("../../assets/sfx/explode.mp3"),
  hit: require("../../assets/sfx/hit.mp3"),
  gameover: require("../../assets/sfx/gameover.mp3"),
  select: require("../../assets/sfx/select.mp3"),
  levelup: require("../../assets/sfx/levelup.mp3"),
  pickup: require("../../assets/sfx/pickup.mp3"),
};

const MUSIC_TRACKS = [
  require("../../assets/sfx/race-to-space.mp3"),
];

const MUSIC_VOLUME = 0.34;
const WEB = Platform.OS === "web";

function trackIndex(stage) {
  const n = MUSIC_TRACKS.length;
  return ((Math.max(1, stage || 1) - 1) % n + n) % n;
}

function sourceUri(mod) {
  if (!mod) return "";
  if (typeof mod === "string") return mod;
  if (typeof mod.uri === "string") return mod.uri;
  try {
    const asset = Asset.fromModule(mod);
    return asset.localUri || asset.uri || "";
  } catch {
    return "";
  }
}

function sfxVolume(key) {
  return key === "laser" ? 0.285 : 0.62;
}

let webCtx = null;

function resumeWebAudio() {
  if (!WEB || typeof window === "undefined") return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!webCtx) webCtx = new AC();
  if (webCtx.state === "suspended") {
    webCtx.resume().catch(() => {});
  }
  try {
    const buf = webCtx.createBuffer(1, 1, 22050);
    const src = webCtx.createBufferSource();
    src.buffer = buf;
    src.connect(webCtx.destination);
    src.start(0);
  } catch {
  }
}

function makeHtmlAudio(mod, { loop = false, volume = 1 } = {}) {
  const Ctor =
    typeof window !== "undefined" && typeof window.Audio === "function"
      ? window.Audio
      : null;
  if (!Ctor) return null;
  const el = new Ctor();
  el.preload = "auto";
  el.loop = loop;
  el.volume = Math.max(0, Math.min(1, volume));
  el.playsInline = true;
  try {
    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "true");
  } catch {
  }
  const uri = sourceUri(mod);
  if (uri) el.src = uri;
  try {
    el.load();
  } catch {
  }
  return el;
}

function playHtml(el, { restart = true } = {}) {
  if (!el) return Promise.resolve();
  const kick = () => {
    try {
      el.muted = false;
      if (restart && el.currentTime > 0.05) el.currentTime = 0;
    } catch {
    }
    try {
      const p = el.play();
      if (p && typeof p.catch === "function") return p.catch(() => {});
    } catch {
    }
    return Promise.resolve();
  };
  try {
    if (el.readyState >= 2) return Promise.resolve(kick());
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        kick().then(resolve);
      };
      el.addEventListener("canplay", finish, { once: true });
      el.addEventListener("loadeddata", finish, { once: true });
      el.addEventListener("error", finish, { once: true });
      try {
        el.load();
      } catch {
      }
      setTimeout(finish, 700);
    });
  } catch {
    return kick();
  }
}

async function configureSession() {
  try {
    await Audio.setIsEnabledAsync(true);
  } catch {
  }
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch {
  }
}

async function loadNative(mod, status = {}) {
  const extra = {
    shouldPlay: false,
    volume: status.volume ?? 1,
    isLooping: !!status.isLooping,
    progressUpdateIntervalMillis: 1000,
  };
  const asset = Asset.fromModule(mod);
  try {
    await asset.downloadAsync();
  } catch {
  }
  const uri = asset.localUri || asset.uri;
  if (uri) {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri, overrideFileExtensionAndroid: "mp3" },
        extra,
        null,
        true
      );
      return sound;
    } catch {
    }
  }
  try {
    const { sound } = await Audio.Sound.createAsync(mod, extra, null, true);
    return sound;
  } catch {
    return null;
  }
}

async function restartNative(sound) {
  if (!sound) return false;
  try {
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return false;
    await sound.setPositionAsync(0);
    await sound.playAsync();
    return true;
  } catch {
    try {
      await sound.replayAsync();
      return true;
    } catch {
      return false;
    }
  }
}

export function useSfx() {
  const soundsRef = useRef({});
  const webSfxRef = useRef(null);
  const webMusicRef = useRef(null);
  const musicRef = useRef(null);
  const musicIdxRef = useRef(-1);
  const readyRef = useRef(false);
  const unlockedRef = useRef(false);
  const wantedRef = useRef({ on: false, stage: 1, boss: false });
  const loadingMusicRef = useRef(false);
  const unlockRef = useRef(() => {});
  const loadPromiseRef = useRef(null);

  const ensureWebSfx = () => {
    if (webSfxRef.current) return webSfxRef.current;
    const pack = {};
    for (const [key, mod] of Object.entries(SFX)) {
      pack[key] = makeHtmlAudio(mod, { volume: sfxVolume(key) });
    }
    webSfxRef.current = pack;
    return pack;
  };

  const applyWebMusic = useCallback(async () => {
    if (!WEB || !unlockedRef.current) return;
    const want = wantedRef.current;
    if (!want.on) {
      const cur = webMusicRef.current;
      if (cur) {
        try {
          cur.pause();
          cur.currentTime = 0;
        } catch {
        }
      }
      return;
    }
    const idx = trackIndex(want.stage);
    const vol = want.boss ? MUSIC_VOLUME * 1.08 : MUSIC_VOLUME;
    try {
      const asset = Asset.fromModule(MUSIC_TRACKS[idx]);
      await asset.downloadAsync();
    } catch {
    }
    let el = webMusicRef.current;
    const sameTrack = el && el._trackIdx === idx;
    if (!sameTrack) {
      if (el) {
        try {
          el.pause();
        } catch {
        }
      }
      el = makeHtmlAudio(MUSIC_TRACKS[idx], { loop: true, volume: vol });
      if (el) el._trackIdx = idx;
      webMusicRef.current = el;
      await playHtml(el, { restart: true });
      return;
    }
    el.volume = vol;
    el.loop = true;
    // Aşama değişince başa alma — sadece durmuşsa devam ettir / bitince loop zaten var
    if (el.paused) {
      await playHtml(el, { restart: false });
    }

  const applyWanted = useCallback(async () => {
    if (WEB) {
      await applyWebMusic();
      return;
    }
    const want = wantedRef.current;
    if (!want.on || !readyRef.current || loadingMusicRef.current) return;

    const idx = trackIndex(want.stage);
    const vol = want.boss ? MUSIC_VOLUME * 1.08 : MUSIC_VOLUME;

    try {
      if (musicRef.current && musicIdxRef.current === idx) {
        const status = await musicRef.current.getStatusAsync();
        if (status.isLoaded) {
          await musicRef.current.setVolumeAsync(vol);
          // Aynı track — aşamada yeniden başlatma; sadece durmuşsa devam
          if (!status.isPlaying) {
            try {
              await musicRef.current.playAsync();
            } catch {
              await restartNative(musicRef.current);
            }
          }
        }
        return;
      }

      loadingMusicRef.current = true;
      const prev = musicRef.current;
      const next = await loadNative(MUSIC_TRACKS[idx], {
        volume: vol,
        isLooping: true,
      });
      if (prev) {
        try {
          await prev.stopAsync();
        } catch {
        }
        try {
          await prev.unloadAsync();
        } catch {
        }
      }
      musicRef.current = next;
      musicIdxRef.current = next ? idx : -1;
      loadingMusicRef.current = false;

      if (trackIndex(wantedRef.current.stage) !== idx) {
        await applyWanted();
        return;
      }
      if (!wantedRef.current.on || !next) return;
      await next.setVolumeAsync(
        wantedRef.current.boss ? MUSIC_VOLUME * 1.08 : MUSIC_VOLUME
      );
      await restartNative(next);
    } catch {
      loadingMusicRef.current = false;
    }
  }, [applyWebMusic]);

  const loadNativeSfx = useCallback(async () => {
    if (readyRef.current) return;
    if (loadPromiseRef.current) return loadPromiseRef.current;
    loadPromiseRef.current = (async () => {
      await configureSession();
      const loaded = {};
      for (const [key, source] of Object.entries(SFX)) {
        loaded[key] = await loadNative(source, { volume: sfxVolume(key) });
      }
      soundsRef.current = loaded;
      readyRef.current = Object.values(loaded).some(Boolean);
      if (!readyRef.current) loadPromiseRef.current = null;
    })();
    return loadPromiseRef.current;
  }, []);

  const unlock = useCallback(() => {
    if (WEB) {
      try {
        resumeWebAudio();
        const pack = ensureWebSfx();
        const first = !unlockedRef.current;
        unlockedRef.current = true;
        if (first) playHtml(pack.select);
        void applyWebMusic();
      } catch {
        unlockedRef.current = true;
      }
      return;
    }

    if (unlockedRef.current) {
      void configureSession().then(() => applyWanted());
      return;
    }
    unlockedRef.current = true;
    void (async () => {
      await configureSession();
      if (!readyRef.current) await loadNativeSfx();
      await restartNative(soundsRef.current.select);
      await applyWanted();
    })();
  }, [applyWanted, applyWebMusic, loadNativeSfx]);

  unlockRef.current = unlock;

  useEffect(() => {
    if (WEB) {
      if (typeof window === "undefined") return undefined;
      const kick = () => unlockRef.current();
      window.addEventListener("pointerdown", kick, { capture: true });
      window.addEventListener("touchstart", kick, { capture: true });
      window.addEventListener("click", kick, { capture: true });
      return () => {
        window.removeEventListener("pointerdown", kick, true);
        window.removeEventListener("touchstart", kick, true);
        window.removeEventListener("click", kick, true);
        Object.values(webSfxRef.current || {}).forEach((el) => {
          try {
            el.pause();
            el.src = "";
          } catch {
          }
        });
        if (webMusicRef.current) {
          try {
            webMusicRef.current.pause();
            webMusicRef.current.src = "";
          } catch {
          }
        }
      };
    }

    let cancelled = false;
    (async () => {
      await loadNativeSfx();
      if (cancelled) return;
      if (unlockedRef.current) await applyWanted();
    })();

    const appSub = AppState.addEventListener("change", (next) => {
      if (next !== "active") return;
      configureSession().then(() => {
        if (unlockedRef.current) applyWanted();
      });
    });

    return () => {
      cancelled = true;
      appSub.remove();
      Object.values(soundsRef.current).forEach((s) => s?.unloadAsync?.());
      musicRef.current?.unloadAsync?.();
      soundsRef.current = {};
      musicRef.current = null;
      musicIdxRef.current = -1;
      readyRef.current = false;
    };
  }, [applyWanted, loadNativeSfx]);

  const play = useCallback(async (key) => {
    if (WEB) {
      if (!unlockedRef.current) unlockRef.current();
      playHtml(ensureWebSfx()[key]);
      return;
    }
    await restartNative(soundsRef.current[key]);
  }, []);

  const stopMusic = useCallback(async () => {
    wantedRef.current.on = false;
    if (WEB) {
      await applyWebMusic();
      return;
    }
    const music = musicRef.current;
    if (!music) return;
    try {
      const status = await music.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await music.stopAsync();
        await music.setPositionAsync(0);
      }
    } catch {
    }
  }, [applyWebMusic]);

  const setStageMusic = useCallback(
    async (stage, isBoss = false) => {
      wantedRef.current = { on: true, stage, boss: isBoss };
      if (WEB) {
        if (unlockedRef.current) await applyWebMusic();
        return;
      }
      await applyWanted();
    },
    [applyWanted, applyWebMusic]
  );

  const startMusic = useCallback(
    async (stage = 1, isBoss = false) => {
      await setStageMusic(stage, isBoss);
    },
    [setStageMusic]
  );

  return { play, unlock, startMusic, stopMusic, setStageMusic };
}
