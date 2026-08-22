import { Image, StyleSheet, View } from "react-native";
import { BOSS_SHIP_IMAGES, ENEMY_SHIP_IMAGES } from "../../assets";

/**
 * Düşman / boss uzay gemisi — şeffaf PNG sprite.
 */
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
  const img = isBoss
    ? BOSS_SHIP_IMAGES[variant % BOSS_SHIP_IMAGES.length] || BOSS_SHIP_IMAGES[0]
    : ENEMY_SHIP_IMAGES[variant % ENEMY_SHIP_IMAGES.length] ||
      ENEMY_SHIP_IMAGES[0];
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
      <Image source={img} style={styles.image} resizeMode="contain" />
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
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
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
  },
  hpFill: {
    height: "100%",
    backgroundColor: "#f87171",
  },
});
