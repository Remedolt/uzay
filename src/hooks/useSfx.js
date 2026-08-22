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

const MUSIC = require("../../assets/sfx/music.wav");
const MUSIC_VOLUME = 0.12;

export function useSfx() {
  const soundsRef = useRef({});
  const musicRef = useRef(null);
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

        const { sound: music } = await Audio.Sound.createAsync(MUSIC, {
          volume: MUSIC_VOLUME,
          isLooping: true,
        });

        if (!cancelled) {
          soundsRef.current = loaded;
          musicRef.current = music;
          readyRef.current = true;
        } else {
          await Promise.all([
            ...Object.values(loaded).map((s) => s.unloadAsync()),
            music.unloadAsync(),
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
      musicRef.current?.unloadAsync?.();
      soundsRef.current = {};
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

  const startMusic = useCallback(async () => {
    const music = musicRef.current;
    if (!music) return;
    try {
      await music.setVolumeAsync(MUSIC_VOLUME);
      const status = await music.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await music.playAsync();
      }
    } catch {
      // ignore
    }
  }, []);

  const stopMusic = useCallback(async () => {
    const music = musicRef.current;
    if (!music) return;
    try {
      const status = await music.getStatusAsync();
      if (status.isLoaded) {
        await music.stopAsync();
        await music.setPositionAsync(0);
      }
    } catch {
      // ignore
    }
  }, []);

  return { play, startMusic, stopMusic };
}
