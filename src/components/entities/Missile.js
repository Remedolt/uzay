import { StyleSheet, View } from "react-native";

/** Füze — burun hız vektörüne bakar. friendly: oyuncu füzesi */
export function Missile({ x, y, width, height, angle = 0, fromPlayer = false }) {
  const deg = (-angle * 180) / Math.PI;
  const body = fromPlayer ? "#67e8f9" : "#94a3b8";
  const edge = fromPlayer ? "#e0f2fe" : "#e2e8f0";
  const band = fromPlayer ? "#0284c7" : "#dc2626";
  const nose = fromPlayer ? "#a5f3fc" : "#cbd5e1";
  const plume = fromPlayer
    ? "rgba(34, 211, 238, 0.35)"
    : "rgba(251, 146, 60, 0.3)";
  const flame = fromPlayer
    ? "rgba(165, 243, 252, 0.95)"
    : "rgba(253, 224, 71, 0.92)";

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
      <View style={[styles.plume, { backgroundColor: plume }]} />
      <View style={[styles.flame, { backgroundColor: flame }]} />
      <View style={styles.core} />
      <View style={styles.finL} />
      <View style={styles.finR} />
      <View style={[styles.body, { backgroundColor: body, borderColor: edge }]}>
        <View style={[styles.band, { backgroundColor: band }]} />
        <View style={[styles.band, styles.band2]} />
        <View style={[styles.band, { backgroundColor: band }]} />
      </View>
      <View
        style={[
          styles.nose,
          { borderTopColor: nose },
        ]}
      />
      <View style={styles.tip} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-start",
    transformOrigin: "center center",
  },
  plume: {
    position: "absolute",
    top: -12,
    width: "48%",
    height: "40%",
    borderRadius: 12,
  },
  flame: {
    position: "absolute",
    top: -7,
    width: "30%",
    height: "28%",
    borderRadius: 8,
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
    borderRadius: 3,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  band: {
    width: "100%",
    height: 3,
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
