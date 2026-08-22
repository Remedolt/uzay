import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SPACE_BG,
  SPACE_BG_ALT,
  SPACE_CITY_FAR,
  SPACE_CITY_ICE,
  SPACE_CITY_LAVA,
  SPACE_CITY_NEON,
  SPACE_CITY_STEEL,
  SPACE_CITY_TOXIC,
} from "../../assets";

function seeded(seed) {
  let s = seed % 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeStars(count, seed, sizeMin, sizeMax) {
  const rnd = seeded(seed);
  return Array.from({ length: count }, () => ({
    x: rnd() * 100,
    y: rnd() * 130,
    size: sizeMin + rnd() * (sizeMax - sizeMin),
    o: 0.28 + rnd() * 0.65,
    tw: 0.6 + rnd() * 2.4,
    hue: rnd() > 0.82 ? "#7dd3fc" : rnd() > 0.65 ? "#fde68a" : "#f8fafc",
  }));
}

const FAR_STARS = makeStars(42, 11, 1, 1.8);
const MID_STARS = makeStars(28, 29, 1.2, 2.4);
const NEAR_STARS = makeStars(14, 47, 1.8, 3.2);
const DUST = makeStars(18, 73, 1, 2.2);

const STAGE_LOOK = [
  { far: SPACE_CITY_FAR, tint: [56, 189, 248], nebula: [99, 102, 241] },
  { far: SPACE_CITY_ICE, tint: [125, 211, 252], nebula: [14, 165, 233] },
  { far: SPACE_CITY_TOXIC, tint: [74, 222, 128], nebula: [34, 197, 94] },
  { far: SPACE_CITY_LAVA, tint: [251, 146, 60], nebula: [239, 68, 68] },
  { far: SPACE_CITY_NEON, tint: [192, 132, 252], nebula: [168, 85, 247] },
  { far: SPACE_CITY_STEEL, tint: [203, 213, 225], nebula: [148, 163, 184] },
];

function wrap(v, span) {
  return ((v % span) + span) % span;
}

function StarLayer({ stars, height, drift, t, speed, extra = 1 }) {
  return stars.map((star, i) => {
    const twinkle = 0.45 + (Math.sin(t * star.tw + i) * 0.5 + 0.5) * 0.55;
    const y = wrap((star.y / 100) * height + drift * speed, height + 48) - 24;
    return (
      <View
        key={`${star.x}-${i}`}
        style={{
          position: "absolute",
          left: `${star.x}%`,
          top: y,
          width: star.size * extra,
          height: star.size * extra,
          borderRadius: 99,
          backgroundColor: star.hue,
          opacity: star.o * twinkle,
        }}
      />
    );
  });
}

/**
 * Derin uzay: nebula önde, sahne rengi, kayan yıldızlar.
 */
export function SpaceBackground({
  scrollY = 0,
  level = 1,
  score: _score = 0,
  playing = false,
  phase = "wave",
}) {
  const { height, width } = useWindowDimensions();
  const [clock, setClock] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = Date.now();
    let acc = 0;
    const tick = () => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += dt;
      if (acc >= 0.05) {
        setClock((c) => c + acc);
        acc = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const themeIdx = Math.abs((level || 1) - 1) % STAGE_LOOK.length;
  const look = STAGE_LOOK[themeIdx];
  const prevIdxRef = useRef(themeIdx);
  const [fade, setFade] = useState(1);
  const [prevIdx, setPrevIdx] = useState(themeIdx);

  useEffect(() => {
    if (themeIdx === prevIdxRef.current) return;
    setPrevIdx(prevIdxRef.current);
    prevIdxRef.current = themeIdx;
    setFade(0);
    let raf = 0;
    let start = Date.now();
    const run = () => {
      const p = Math.min(1, (Date.now() - start) / 900);
      setFade(p);
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [themeIdx]);

  const boss = phase === "boss";
  const fly = playing ? 1 : 0.38;
  const t = clock * fly + scrollY * 0.00028;
  const pulse = 0.5 + Math.sin(t * (boss ? 1.4 : 0.45)) * 0.5;
  const driftY = Math.sin(t * 0.32) * 18;
  const driftX = Math.sin(t * 0.23) * 12;
  const nebulaScroll = clock * (playing ? 22 : 7) + scrollY * 0.08;
  const farDrift = clock * (playing ? 16 : 5) + scrollY * 0.05;
  const midDrift = clock * (playing ? 34 : 9) + scrollY * 0.12;
  const nearDrift = clock * (playing ? 58 : 14) + scrollY * 0.22;

  const rgba = (rgb, a) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
  const tintA = (playing ? 0.07 : 0.05) + (boss ? 0.05 : 0) + pulse * 0.03;
  const nebulaA = 0.14 + pulse * 0.1 + (boss ? 0.08 : 0);
  const prevLook = STAGE_LOOK[prevIdx];

  const planet = useMemo(
    () => ({
      size: Math.min(width, height) * (playing ? 0.42 : 0.5),
    }),
    [width, height, playing]
  );

  const tileH = Math.max(height * 1.35, 820);
  const nebulaY = -((nebulaScroll % tileH) + tileH) % tileH;

  return (
    <View style={styles.root} pointerEvents="none">
      <View style={styles.deep} />

      <Image
        source={SPACE_BG}
        style={[
          styles.nebulaTile,
          {
            height: tileH,
            top: nebulaY,
            opacity: 0.92,
            transform: [{ translateX: driftX * 0.4 }],
          },
        ]}
        resizeMode="cover"
      />
      <Image
        source={SPACE_BG}
        style={[
          styles.nebulaTile,
          {
            height: tileH,
            top: nebulaY + tileH,
            opacity: 0.92,
            transform: [{ translateX: driftX * 0.4 }],
          },
        ]}
        resizeMode="cover"
      />
      <Image
        source={SPACE_BG_ALT}
        style={[
          styles.cover,
          {
            opacity: 0.32 + pulse * 0.14,
            transform: [
              { scale: 1.22 },
              { translateX: -driftX },
              { translateY: driftY },
            ],
          },
        ]}
        resizeMode="cover"
      />

      <View
        style={[
          styles.wash,
          {
            backgroundColor: rgba(look.nebula, nebulaA),
            opacity: fade,
          },
        ]}
      />
      {fade < 1 ? (
        <View
          style={[
            styles.wash,
            { backgroundColor: rgba(prevLook.nebula, nebulaA * (1 - fade)) },
          ]}
        />
      ) : null}

      <View
        style={[
          styles.planet,
          {
            width: planet.size,
            height: planet.size,
            borderRadius: planet.size / 2,
            right: -planet.size * 0.38,
            top: height * 0.12 + Math.sin(t * 0.25) * 16,
            backgroundColor: rgba(look.tint, boss ? 0.28 : 0.2),
            shadowColor: rgba(look.tint, 1),
            opacity: 0.55 + pulse * 0.2,
          },
        ]}
      />
      <View
        style={[
          styles.planetCore,
          {
            width: planet.size * 0.42,
            height: planet.size * 0.42,
            borderRadius: planet.size,
            right: -planet.size * 0.12,
            top: height * 0.18 + Math.sin(t * 0.25) * 16,
            backgroundColor: rgba(look.tint, 0.45),
          },
        ]}
      />

      <StarLayer
        stars={FAR_STARS}
        height={height}
        drift={farDrift}
        t={t}
        speed={0.35}
      />
      <StarLayer
        stars={MID_STARS}
        height={height}
        drift={midDrift}
        t={t}
        speed={0.7}
      />
      <StarLayer
        stars={NEAR_STARS}
        height={height}
        drift={nearDrift}
        t={t}
        speed={1.15}
        extra={playing ? 1.15 : 1}
      />

      {DUST.map((mote, i) => {
        const y = wrap((mote.y / 100) * height + nearDrift * 1.4, height + 60) - 30;
        return (
          <View
            key={`d-${i}`}
            style={{
              position: "absolute",
              left: `${mote.x}%`,
              top: y,
              width: mote.size,
              height: mote.size * (playing ? 5 : 2.2),
              borderRadius: 4,
              backgroundColor: "#e2e8f0",
              opacity: playing ? 0.16 : 0.07,
            }}
          />
        );
      })}

      {[0, 1, 2].map((i) => {
        const span = height + 160;
        const y =
          wrap(clock * (playing ? 220 + i * 40 : 40) + i * 210, span) - 80;
        return (
          <View
            key={`sk-${i}`}
            style={[
              styles.streak,
              {
                left: `${18 + i * 28}%`,
                height: playing ? 52 + i * 10 : 18,
                opacity: playing ? 0.28 : 0.08,
                transform: [{ translateY: y }],
              },
            ]}
          />
        );
      })}

      <Image
        source={look.far}
        style={[
          styles.horizon,
          {
            opacity: (playing ? 0.22 : 0.16) * fade,
            transform: [{ translateY: Math.sin(t * 0.2) * 6 }],
          },
        ]}
        resizeMode="cover"
      />

      <View style={[styles.haze, { backgroundColor: rgba(look.tint, tintA) }]} />
      <View style={[styles.horizonGlow, { backgroundColor: rgba(look.tint, 0.18) }]} />
      <View style={styles.vignette} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  deep: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020617",
  },
  nebulaTile: {
    position: "absolute",
    left: "-8%",
    width: "116%",
  },
  cover: {
    position: "absolute",
    width: "130%",
    height: "130%",
    left: "-15%",
    top: "-15%",
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    ...(Platform.OS === "web" ? { mixBlendMode: "screen" } : null),
  },
  haze: {
    ...StyleSheet.absoluteFillObject,
  },
  planet: {
    position: "absolute",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 48,
  },
  planetCore: {
    position: "absolute",
    opacity: 0.7,
  },
  streak: {
    position: "absolute",
    width: 2,
    backgroundColor: "#e0f2fe",
    borderRadius: 2,
  },
  horizon: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "42%",
  },
  horizonGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "28%",
    opacity: 0.55,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    ...(Platform.OS === "web"
      ? {
          backgroundImage:
            "radial-gradient(ellipse at 50% 42%, rgba(2,6,23,0) 38%, rgba(2,6,23,0.42) 100%)",
        }
      : { backgroundColor: "rgba(2, 6, 23, 0.12)" }),
  },
});
