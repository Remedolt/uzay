import { StyleSheet, View } from "react-native";

/** Boss füzesi — oyuncuya yönelir */
export function Missile({ x, y, width, height }) {
  return (
    <View
      style={[styles.wrap, { left: x, top: y, width, height }]}
      pointerEvents="none"
    >
      <View style={styles.tip} />
      <View style={styles.body} />
      <View style={styles.finL} />
      <View style={styles.finR} />
      <View style={styles.flame} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
  },
  tip: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#fed7aa",
  },
  body: {
    width: "46%",
    height: "52%",
    marginTop: -1,
    backgroundColor: "#f97316",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#ffedd5",
  },
  finL: {
    position: "absolute",
    left: "8%",
    bottom: "18%",
    width: "28%",
    height: "16%",
    backgroundColor: "#c2410c",
    borderRadius: 2,
    transform: [{ rotate: "22deg" }],
  },
  finR: {
    position: "absolute",
    right: "8%",
    bottom: "18%",
    width: "28%",
    height: "16%",
    backgroundColor: "#c2410c",
    borderRadius: 2,
    transform: [{ rotate: "-22deg" }],
  },
  flame: {
    width: "30%",
    height: "18%",
    marginTop: 1,
    borderRadius: 8,
    backgroundColor: "rgba(251, 191, 36, 0.85)",
  },
});
