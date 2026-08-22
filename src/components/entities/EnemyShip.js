import { Image, Platform, StyleSheet, View } from "react-native";
import { BOSS_SHIP_IMAGES, ENEMY_SHIP_IMAGES } from "../../assets";

const ENEMY_GLOW = [
  "#f87171",
  "#fb7185",
  "#c084fc",
  "#34d399",
  "#22d3ee",
  "#f472b6",
  "#fbbf24",
  "#e2e8f0",
];

const BOSS_GLOW = [
  "#f87171",
  "#22d3ee",
  "#34d399",
  "#fbbf24",
  "#c084fc",
  "#e2e8f0",
];

export function EnemyShip({
  x,
  y,
  width,
  height,
  variant = 0,
  isBoss = false,
  hp,
  maxHp,
}) {
  const palette = isBoss ? BOSS_GLOW : ENEMY_GLOW;
  const images = isBoss ? BOSS_SHIP_IMAGES : ENEMY_SHIP_IMAGES;
  const img = images[variant % images.length] || images[0];
  const glow = palette[variant % palette.length];
  const ratio =
    isBoss && maxHp > 0 ? Math.max(0, Math.min(1, (hp ?? maxHp) / maxHp)) : 0;

  return (
    <View
      style={[styles.wrap, { left: x, top: y, width, height }]}
      pointerEvents="none"
    >
      {isBoss ? (
        <View style={styles.hpTrack}>
          <View style={[styles.hpFill, { width: `${ratio * 100}%` }]} />
        </View>
      ) : null}
      <View
        style={[
          styles.halo,
          { backgroundColor: glow, shadowColor: glow },
        ]}
      />
      <Image
        source={img}
        defaultSource={images[0]}
        style={[
          styles.image,
          { width, height },
          Platform.OS === "web"
            ? { filter: `drop-shadow(0 0 7px ${glow})` }
            : null,
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    overflow: "visible",
    zIndex: 1,
  },
  image: {
    backgroundColor: "transparent",
  },
  halo: {
    position: "absolute",
    width: "58%",
    height: "58%",
    borderRadius: 18,
    opacity: 0.28,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 12,
  },
  hpTrack: {
    position: "absolute",
    top: -10,
    left: "8%",
    right: "8%",
    height: 6,
    borderRadius: 4,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.55)",
    overflow: "hidden",
    zIndex: 2,
  },
  hpFill: {
    height: "100%",
    backgroundColor: "#f87171",
  },
});
