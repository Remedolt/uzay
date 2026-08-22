import { StyleSheet, View } from "react-native";
import { SHIPS } from "../../constants/game";

export function Laser({ x, y, width, height, shipId = "aurora" }) {
  const ship = SHIPS.find((s) => s.id === shipId) || SHIPS[0];
  const glowW = Math.max(8, width * 2.6);
  const glowH = height + 10;
  const tip = Math.max(4, Math.min(7, width + 2));

  return (
    <View
      style={[
        styles.wrap,
        {
          left: x + width / 2 - glowW / 2,
          top: y - 4,
          width: glowW,
          height: glowH,
        },
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.glow,
          {
            backgroundColor: ship.laser,
            shadowColor: ship.laser,
          },
        ]}
      />
      <View
        style={[
          styles.core,
          {
            width: Math.max(3, width),
            height: height,
            backgroundColor: "#fffef5",
            borderColor: ship.laser,
            shadowColor: ship.laser,
          },
        ]}
      />
      <View
        style={[
          styles.tip,
          {
            width: tip,
            height: tip,
            backgroundColor: ship.laser,
            shadowColor: ship.laser,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  glow: {
    position: "absolute",
    top: 2,
    width: "70%",
    height: "88%",
    borderRadius: 12,
    opacity: 0.28,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
  },
  core: {
    marginTop: 4,
    borderRadius: 4,
    borderWidth: 1,
    opacity: 0.95,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  tip: {
    marginTop: 1,
    borderRadius: 99,
    opacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
});
