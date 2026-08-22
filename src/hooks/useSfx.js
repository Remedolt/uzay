import { Audio } from "expo-av";
import { useCallback, useEffect, useRef } from "react";

const SFX = {
  laser: require("../../assets/sfx/laser.wav"),
  explode: require("../../assets/sfx/explode.wav"),
  hit: require("../../assets/sfx/hit.wav"),
  gameover: require("../../assets/sfx/gameover.wav"),
  select: require("../../assets/sfx/select.wav"),
  levelup: require("../../assets/sfx/levelup.wav"),
  pickup: require("../../assets/sfx/pickup.wav"),
};

const MUSIC_TRACKS = [
  require("../../assets/sfx/music-1.wav"),
  require("../../assets/sfx/music-2.wav"),
  require("../../assets/sfx/music-3.wav"),
  require("../../assets/sfx/music-4.wav"),
  require("../../assets/sfx/music-5.wav"),
  require("../../assets/sfx/music-6.wav"),
];

const MUSIC_VOLUME = 0.16;

function trackIndex(stage) {
  const n = MUSIC_TRACKS.length;
  return ((Math.max(1, stage || 1) - 1) % n + n) % n;
}

export function useSfx() {
  const soundsRef = useRef({});
  const musicRef = useRef(null);
  const tracksRef = useRef([]);
  const indexRef = useRef(0);
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });
        const entries = Object.entries(SFX);
        const loaded = {};
        await Promise.all(
          entries.map(async ([key, source]) => {
            const { sound } = await Audio.Sound.createAsync(source, {
              volume: key === "laser" ? 0.18 : 0.4,
            });
            loaded[key] = sound;
          })
        );

        const tracks = await Promise.all(
          MUSIC_TRACKS.map(async (source) => {
            const { sound } = await Audio.Sound.createAsync(source, {
              volume: MUSIC_VOLUME,
              isLooping: true,
            });
            return sound;
          })
        );

        if (!cancelled) {
          soundsRef.current = loaded;
          tracksRef.current = tracks;
          musicRef.current = tracks[0];
          readyRef.current = true;
        } else {
          await Promise.all([
            ...Object.values(loaded).map((s) => s.unloadAsync()),
            ...tracks.map((s) => s.unloadAsync()),
          ]);
        }
      } catch {
        // ses yoksa oyun devam eder
      }
    })();

    return () => {
      cancelled = true;
      Object.values(soundsRef.current).forEach((s) => {
        s.unloadAsync?.();
      });
      tracksRef.current.forEach((s) => s.unloadAsync?.());
      soundsRef.current = {};
      tracksRef.current = [];
      musicRef.current = null;
      readyRef.current = false;
    };
  }, []);

  const play = useCallback(async (key) => {
    const sound = soundsRef.current[key];
    if (!sound) return;
    try {
      await sound.replayAsync();
    } catch {
      // ignore
    }
  }, []);

  const stopMusic = useCallback(async () => {
    const tracks = tracksRef.current;
    await Promise.all(
      tracks.map(async (music) => {
        try {
          const status = await music.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await music.stopAsync();
            await music.setPositionAsync(0);
          }
        } catch {
          // ignore
        }
      })
    );
  }, []);

  const setStageMusic = useCallback(async (stage, isBoss = false) => {
    const tracks = tracksRef.current;
    if (!tracks.length) return;
    const idx = trackIndex(stage);
    const next = tracks[idx];
    const prev = musicRef.current;
    const vol = isBoss ? MUSIC_VOLUME * 1.08 : MUSIC_VOLUME;

    try {
      if (prev && prev !== next) {
        const prevStatus = await prev.getStatusAsync();
        if (prevStatus.isLoaded && prevStatus.isPlaying) {
          await prev.stopAsync();
          await prev.setPositionAsync(0);
        }
      }

      musicRef.current = next;
      indexRef.current = idx;
      const status = await next.getStatusAsync();
      if (!status.isLoaded) return;
      await next.setVolumeAsync(vol);
      try {
        await next.setRateAsync(1, true);
      } catch {
        // web rate desteği yoksa devam
      }
      if (!status.isPlaying) {
        await next.playAsync();
      }
    } catch {
      // ignore
    }
  }, []);

  const startMusic = useCallback(
    async (stage = 1, isBoss = false) => {
      await setStageMusic(stage, isBoss);
    },
    [setStageMusic]
  );

  return { play, startMusic, stopMusic, setStageMusic };
}
