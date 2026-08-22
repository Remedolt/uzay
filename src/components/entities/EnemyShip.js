import { Image, Platform, StyleSheet, View } from "react-native";
import { BOSS_SHIP_IMAGES, ENEMY_SHIP_IMAGES } from "../../assets";

const BOSS_GLOW = [
  "#f87171",
  "#22d3ee",
  "#34d399",
  "#fbbf24",
  "#c084fc",
  "#e2e8f0",
];

function RaiderShip({
  x,
  y,
  width,
  height,
  vx = 1,
  hp = 1,
  maxHp = 1,
  variant = 6,
}) {
  const right = vx >= 0;
  const img =
    ENEMY_SHIP_IMAGES[variant % ENEMY_SHIP_IMAGES.length] ||
    ENEMY_SHIP_IMAGES[6];
  const ratio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 1;

  return (
    <View
      style={[styles.wrap, { left: x, top: y, width, height }]}
      pointerEvents="none"
    >
      <View style={styles.raiderHpTrack}>
        <View
          style={[
            styles.hpFill,
            { width: `${ratio * 100}%`, backgroundColor: "#fbbf24" },
          ]}
        />
      </View>
      <Image
        source={img}
        defaultSource={ENEMY_SHIP_IMAGES[6]}
        style={[
          styles.image,
          {
            width,
            height,
            transform: [{ rotate: right ? "90deg" : "-90deg" }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

export function EnemyShip({
  x,
  y,
  width,
  height,
  variant = 0,
  isBoss = false,
  isRaider = false,
  vx = 0,
  hp,
  maxHp,
}) {
  if (isRaider) {
    return (
      <RaiderShip
        x={x}
        y={y}
        width={width}
        height={height}
        vx={vx}
        hp={hp}
        maxHp={maxHp}
        variant={variant}
      />
    );
  }

  const images = isBoss ? BOSS_SHIP_IMAGES : ENEMY_SHIP_IMAGES;
  const img = images[variant % images.length] || images[0];
  const glow = BOSS_GLOW[variant % BOSS_GLOW.length];
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
      {isBoss ? (
        <View
          style={[
            styles.halo,
            { backgroundColor: glow, shadowColor: glow },
          ]}
        />
      ) : null}
      <Image
        source={img}
        defaultSource={images[0]}
        style={[
          styles.image,
          { width, height },
          isBoss && Platform.OS === "web"
            ? { filter: `drop-shadow(0 0 2px ${glow})` }
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
    width: "28%",
    height: "28%",
    borderRadius: 16,
    opacity: 0.08,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
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
  raiderHpTrack: {
    position: "absolute",
    top: -8,
    width: "54%",
    height: 4,
    borderRadius: 3,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.45)",
    overflow: "hidden",
    zIndex: 2,
  },
  hpFill: {
    height: "100%",
    backgroundColor: "#f87171",
  },
});
