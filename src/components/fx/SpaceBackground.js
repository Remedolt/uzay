import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  SPACE_BG,
  SPACE_BG_ALT,
  SPACE_CITY_FAR,
  SPACE_CITY_ICE,
  SPACE_CITY_LAVA,
  SPACE_CITY_MID,
  SPACE_CITY_NEAR,
  SPACE_CITY_NEON,
  SPACE_CITY_STEEL,
  SPACE_CITY_TOXIC,
} from "../../assets";

const STARS = [
  [8, 12, 2, 0.55],
  [22, 28, 1, 0.4],
  [71, 18, 2, 0.5],
  [88, 35, 1, 0.35],
  [15, 62, 1, 0.45],
  [42, 48, 2, 0.4],
  [63, 72, 1, 0.5],
  [91, 58, 2, 0.35],
  [35, 85, 1, 0.4],
  [55, 22, 1, 0.45],
  [78, 81, 2, 0.4],
  [28, 41, 1, 0.35],
  [48, 8, 1, 0.5],
  [12, 78, 2, 0.3],
  [82, 12, 1, 0.45],
];

const CITY_THEMES = [
  {
    far: SPACE_CITY_FAR,
    tint: [14, 116, 144],
  },
  {
    far: SPACE_CITY_ICE,
    tint: [56, 189, 248],
  },
  {
    far: SPACE_CITY_TOXIC,
    tint: [34, 197, 94],
  },
  {
    far: SPACE_CITY_LAVA,
    tint: [234, 88, 12],
  },
  {
    far: SPACE_CITY_NEON,
    tint: [192, 38, 211],
  },
  {
    far: SPACE_CITY_STEEL,
    tint: [148, 163, 184],
  },
];

function ParallaxCity({ source, offset, tileH, opacity, dim }) {
  const y = -((offset % tileH) + tileH) % tileH;
  return (
    <>
      <Image
        source={source}
        style={[
          styles.cityTile,
          dim,
          { height: tileH, top: y, opacity },
        ]}
        resizeMode="cover"
      />
      <Image
        source={source}
        style={[
          styles.cityTile,
          dim,
          { height: tileH, top: y + tileH, opacity },
        ]}
        resizeMode="cover"
      />
    </>
  );
}

export function SpaceBackground({
  scrollY = 0,
  level = 1,
  score = 0,
  playing = false,
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

  const progress = Math.min(1, score / 900 + (level - 1) * 0.07);
  const themeIdx = Math.abs((level || 1) - 1) % CITY_THEMES.length;
  const theme = CITY_THEMES[themeIdx];
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
      const p = Math.min(1, (Date.now() - start) / 700);
      setFade(p);
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [themeIdx]);

  const fly = playing ? 1.25 : 0.42;
  const t = clock * fly + scrollY * 0.00035;
  const tileH = Math.max(720, height * 1.2);

  const farScroll = clock * (playing ? 38 : 10) + scrollY * 0.12;
  const midScroll = clock * (playing ? 78 : 18) + scrollY * 0.28;
  const nearScroll = clock * (playing ? 145 : 32) + scrollY * 0.55;

  const driftY = Math.sin(t * 0.55) * 22;
  const driftX = Math.sin(t * 0.4) * 14;
  const scale = 1.18 + progress * 0.04;

  const district = theme;
  const tintA = playing ? 0.2 : 0.12;
  const tint = `rgba(${district.tint[0]}, ${district.tint[1]}, ${district.tint[2]}, ${tintA})`;
  const prevTheme = CITY_THEMES[prevIdx];

  return (
    <View style={styles.root} pointerEvents="none">
      <View style={styles.deep} />

      <Image
        source={SPACE_BG}
        style={[
          styles.cover,
          {
            opacity: 0.55,
            transform: [
              { scale },
              { translateX: driftX },
              { translateY: driftY },
            ],
          },
        ]}
        resizeMode="cover"
      />
      <Image
        source={SPACE_BG_ALT}
        style={[
          styles.cover,
          {
            opacity: 0.18 + progress * 0.12,
            transform: [
              { scale: scale + 0.06 },
              { translateX: -driftX },
              { translateY: driftY * 1.2 },
            ],
          },
        ]}
        resizeMode="cover"
      />

      {fade < 1 && prevTheme ? (
        <ParallaxCity
          source={prevTheme.far}
          offset={farScroll}
          tileH={tileH}
          opacity={(playing ? 0.5 : 0.38) * (1 - fade)}
          dim={{ width: width * 1.08, left: -width * 0.04 }}
        />
      ) : null}
      <ParallaxCity
        source={theme.far}
        offset={farScroll}
        tileH={tileH}
        opacity={(playing ? 0.5 : 0.38) * fade}
        dim={{ width: width * 1.08, left: -width * 0.04 }}
      />
      <ParallaxCity
        source={SPACE_CITY_MID}
        offset={midScroll}
        tileH={tileH}
        opacity={playing ? 0.32 : 0.22}
        dim={{ width: width * 1.12, left: -width * 0.06 }}
      />

      <View style={[styles.tint, { backgroundColor: tint }]} />

      {STARS.map(([x, y, size, opacity], i) => {
        const twinkle = 0.5 + (Math.sin(t * 2.1 + i) * 0.5 + 0.5) * 0.5;
        return (
          <View
            key={`st-${i}`}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: 99,
              backgroundColor: "#fff",
              opacity: opacity * twinkle * 0.85,
            }}
          />
        );
      })}

      {[0, 1, 2, 3, 4].map((i) => {
        const cycle = 900 + i * 80;
        const speed = playing ? 70 + progress * 50 : 22;
        const y = ((clock * speed * (1 + i * 0.1) * 55 + i * 140) % cycle) - 120;
        return (
          <View
            key={`sk-${i}`}
            style={[
              styles.streak,
              {
                left: `${8 + i * 18}%`,
                opacity: playing ? 0.14 : 0.05,
                height: playing ? 36 + progress * 22 : 14,
                transform: [{ translateY: y }],
              },
            ]}
          />
        );
      })}

      <ParallaxCity
        source={SPACE_CITY_NEAR}
        offset={nearScroll}
        tileH={tileH}
        opacity={playing ? 0.55 : 0.32}
        dim={{ width, left: 0 }}
      />

      <View style={styles.centerClear} />
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
  cover: {
    position: "absolute",
    width: "130%",
    height: "130%",
    left: "-15%",
    top: "-15%",
  },
  cityTile: {
    position: "absolute",
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  streak: {
    position: "absolute",
    width: 1.5,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
  },
  centerClear: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.18)",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.28)",
  },
});
