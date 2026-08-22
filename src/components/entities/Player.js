import { Image, StyleSheet, View } from "react-native";
import { SHIP_IMAGES } from "../../assets";
import { SHIPS } from "../../constants/game";

export function Player({
  x,
  y,
  width,
  height,
  shipId = "aurora",
  source,
  preview,
  shielded = false,
}) {
  const ship = SHIPS.find((s) => s.id === shipId) || SHIPS[0];
  const img = source || SHIP_IMAGES[ship.id] || SHIP_IMAGES.aurora;
  const style = [
    styles.wrap,
    preview ? styles.preview : { left: x, top: y, width, height },
    preview && { width, height },
  ];
  const pulse = (Date.now() / 70) % 1000;
  const flicker = 0.72 + Math.sin(pulse) * 0.16 + Math.sin(pulse * 1.7) * 0.1;

  return (
    <View style={style} pointerEvents="none">
      {shielded ? <View style={styles.shieldRing} /> : null}
      <View style={styles.flameWrap}>
        <View
          style={[
            styles.flameOuter,
            {
              height: 10 + flicker * 5,
              opacity: 0.5 + flicker * 0.28,
              backgroundColor: ship.engine,
              shadowColor: ship.engine,
            },
          ]}
        />
        <View
          style={[
            styles.flameMid,
            {
              height: 9 + flicker * 5,
              opacity: 0.8,
            },
          ]}
        />
        <View
          style={[
            styles.flameCore,
            { height: 5 + flicker * 3 },
          ]}
        />
      </View>
      <Image source={img} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    position: "relative",
    left: undefined,
    top: undefined,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    zIndex: 2,
  },
  flameWrap: {
    position: "absolute",
    bottom: -7,
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 1,
  },
  flameOuter: {
    width: 8,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.95,
    shadowRadius: 6,
  },
  flameMid: {
    position: "absolute",
    top: 2,
    width: 5,
    borderRadius: 5,
    backgroundColor: "#fb923c",
  },
  flameCore: {
    position: "absolute",
    top: 4,
    width: 2.5,
    borderRadius: 3,
    backgroundColor: "#fef08a",
  },
  shieldRing: {
    position: "absolute",
    width: "118%",
    height: "118%",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(125, 211, 252, 0.85)",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    zIndex: 3,
  },
});
