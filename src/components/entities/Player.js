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

  return (
    <View style={style} pointerEvents="none">
      {shielded ? <View style={styles.shieldRing} /> : null}
      <View
        style={[
          styles.engineBloom,
          { backgroundColor: ship.engine, shadowColor: ship.engine },
        ]}
      />
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
  },
  engineBloom: {
    position: "absolute",
    bottom: "2%",
    width: "34%",
    height: "18%",
    borderRadius: 20,
    opacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
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
  },
});
