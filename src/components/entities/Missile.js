import { StyleSheet, View } from "react-native";

/** Boss füzesi — hız vektörüne göre döner; burun +y yönünde */
export function Missile({ x, y, width, height, angle = 0 }) {
  const deg = (angle * 180) / Math.PI;

  return (
    <View
      style={[
        styles.wrap,
        {
          left: x,
          top: y,
          width,
          height,
          transform: [{ rotate: `${deg}deg` }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.plume} />
      <View style={styles.flame} />
      <View style={styles.core} />
      <View style={styles.finL} />
      <View style={styles.finR} />
      <View style={styles.body}>
        <View style={styles.band} />
        <View style={[styles.band, styles.band2]} />
        <View style={styles.band} />
      </View>
      <View style={styles.nose} />
      <View style={styles.tip} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  plume: {
    position: "absolute",
    top: -12,
    width: "48%",
    height: "40%",
    borderRadius: 12,
    backgroundColor: "rgba(251, 146, 60, 0.3)",
  },
  flame: {
    position: "absolute",
    top: -7,
    width: "30%",
    height: "28%",
    borderRadius: 8,
    backgroundColor: "rgba(253, 224, 71, 0.92)",
  },
  core: {
    position: "absolute",
    top: -2,
    width: "12%",
    height: "14%",
    borderRadius: 6,
    backgroundColor: "#fff7ed",
  },
  body: {
    marginTop: 6,
    width: "46%",
    height: "54%",
    backgroundColor: "#94a3b8",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  band: {
    width: "100%",
    height: 3,
    backgroundColor: "#dc2626",
  },
  band2: {
    backgroundColor: "#f8fafc",
    height: 2,
  },
  nose: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#cbd5e1",
  },
  tip: {
    width: 4,
    height: 4,
    marginTop: -3,
    borderRadius: 2,
    backgroundColor: "#fecaca",
  },
  finL: {
    position: "absolute",
    left: "4%",
    top: "12%",
    width: "32%",
    height: "18%",
    backgroundColor: "#475569",
    borderRadius: 1,
    transform: [{ rotate: "-28deg" }],
  },
  finR: {
    position: "absolute",
    right: "4%",
    top: "12%",
    width: "32%",
    height: "18%",
    backgroundColor: "#475569",
    borderRadius: 1,
    transform: [{ rotate: "28deg" }],
  },
});
