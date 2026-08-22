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

function RaiderShip({ x, y, width, height, vx = 1, hp = 1, maxHp = 1 }) {
  const right = vx >= 0;
  const ratio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 1;

  return (
    <View
      style={[styles.wrap, { left: x, top: y, width, height }]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.hpTrack,
          { width: "70%", left: "15%" },
        ]}
      >
        <View style={[styles.hpFill, { width: `${ratio * 100}%`, backgroundColor: "#fbbf24" }]} />
      </View>
      <View
        style={[
          styles.raiderTrail,
          right ? styles.trailLeft : styles.trailRight,
        ]}
      />
      <View style={styles.raiderHull}>
        <View style={[styles.raiderStripe, right && styles.raiderStripeFlip]} />
        <View
          style={[
            styles.raiderBridge,
            right ? { right: "14%" } : { left: "14%" },
          ]}
        />
        <View
          style={[
            styles.raiderNose,
            right ? { right: 2 } : { left: 2 },
          ]}
        />
      </View>
      <View style={styles.raiderFinTop} />
      <View style={styles.raiderFinBot} />
      <View style={[styles.raiderGun, right ? { right: "28%" } : { left: "28%" }]} />
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
            ? { filter: `drop-shadow(0 0 8px ${glow})` }
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
    width: "62%",
    height: "62%",
    borderRadius: 22,
    opacity: 0.32,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 14,
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
  raiderTrail: {
    position: "absolute",
    width: 28,
    height: 10,
    borderRadius: 8,
    backgroundColor: "#f59e0b",
    opacity: 0.7,
    shadowColor: "#fbbf24",
    shadowOpacity: 0.95,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  trailLeft: {
    left: -16,
  },
  trailRight: {
    right: -16,
  },
  raiderHull: {
    width: "92%",
    height: "58%",
    borderRadius: 7,
    backgroundColor: "#1e293b",
    borderWidth: 1.5,
    borderColor: "#fbbf24",
    overflow: "hidden",
  },
  raiderStripe: {
    position: "absolute",
    top: "32%",
    left: "8%",
    right: "8%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#f59e0b",
    opacity: 0.85,
  },
  raiderStripeFlip: {},
  raiderBridge: {
    position: "absolute",
    top: "18%",
    width: "22%",
    height: "64%",
    borderRadius: 4,
    backgroundColor: "#67e8f9",
    opacity: 0.8,
  },
  raiderNose: {
    position: "absolute",
    top: "28%",
    width: 10,
    height: "44%",
    borderRadius: 2,
    backgroundColor: "#fde68a",
  },
  raiderFinTop: {
    position: "absolute",
    top: 2,
    width: "38%",
    height: 6,
    borderRadius: 2,
    backgroundColor: "#334155",
    borderWidth: 1,
    borderColor: "#94a3b8",
  },
  raiderFinBot: {
    position: "absolute",
    bottom: 2,
    width: "38%",
    height: 6,
    borderRadius: 2,
    backgroundColor: "#334155",
    borderWidth: 1,
    borderColor: "#94a3b8",
  },
  raiderGun: {
    position: "absolute",
    bottom: -2,
    width: 5,
    height: 12,
    borderRadius: 1,
    backgroundColor: "#fca5a5",
  },
});
