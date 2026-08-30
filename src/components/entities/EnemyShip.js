import { Image, Platform, StyleSheet, View } from "react-native";
import { BOSS_SHIP_IMAGES, ENEMY_SHIP_IMAGES, KAMIKAZE_SHIP_IMAGE } from "../../assets";

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
  isKamikaze = false,
  vx = 0,
  vy = 0,
  hp,
  maxHp,
  shieldHp = 0,
  weapon,
  usesPlasma = false,
  angle,
}) {
  if (isKamikaze) {
    const deg =
      typeof angle === "number"
        ? (angle * 180) / Math.PI
        : Math.atan2(vx || 0, vy || 1) * (180 / Math.PI);
    return (
      <View
        style={[styles.wrap, { left: x, top: y, width, height }]}
        pointerEvents="none"
      >
        <Image
          source={KAMIKAZE_SHIP_IMAGE}
          defaultSource={KAMIKAZE_SHIP_IMAGE}
          style={[
            styles.image,
            { width, height, transform: [{ rotate: `${deg}deg` }] },
          ]}
          resizeMode="contain"
        />
      </View>
    );
  }

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
  const ratio =
    isBoss && maxHp > 0 ? Math.max(0, Math.min(1, (hp ?? maxHp) / maxHp)) : 0;
  const plasmaAura = weapon === "plasma" || usesPlasma;

  return (
    <View
      style={[styles.wrap, { left: x, top: y, width, height }]}
      pointerEvents="none"
    >
      {plasmaAura ? <View style={styles.plasmaRing} /> : null}
      {shieldHp > 0 ? <View style={styles.shieldRing} /> : null}
      {isBoss ? (
        <View style={styles.hpTrack}>
          <View style={[styles.hpFill, { width: `${ratio * 100}%` }]} />
        </View>
      ) : null}
      <Image
        source={img}
        defaultSource={images[0]}
        style={[
          styles.image,
          { width, height },
          isBoss && Platform.OS === "web"
            ? { filter: "brightness(0.84) saturate(0.42) contrast(0.96)" }
            : isBoss
              ? { opacity: 0.88 }
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
  plasmaRing: {
    position: "absolute",
    width: "132%",
    height: "132%",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(232, 121, 249, 0.85)",
    backgroundColor: "rgba(192, 38, 211, 0.18)",
  },
  shieldRing: {
    position: "absolute",
    width: "124%",
    height: "124%",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(125, 211, 252, 0.9)",
    backgroundColor: "rgba(56, 189, 248, 0.16)",
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
