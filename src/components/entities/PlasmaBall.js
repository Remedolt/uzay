import { StyleSheet, View } from "react-native";

export function PlasmaBall({
  x,
  y,
  width,
  height,
  fromPlayer = false,
  pulse = 0,
}) {
  const glow = fromPlayer ? "rgba(56, 189, 248, 0.38)" : "rgba(232, 121, 249, 0.4)";
  const rim = fromPlayer ? "#7dd3fc" : "#f0abfc";
  const core = fromPlayer ? "#e0f2fe" : "#fdf4ff";
  const hot = fromPlayer ? "#22d3ee" : "#d946ef";
  const beat = 0.86 + Math.sin(pulse || 0) * 0.12;

  return (
    <View
      style={[
        styles.wrap,
        {
          left: x,
          top: y,
          width,
          height,
          transform: [{ scale: beat }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.halo, { backgroundColor: glow }]} />
      <View style={[styles.ring, { borderColor: rim }]} />
      <View style={[styles.orb, { backgroundColor: hot }]} />
      <View style={[styles.core, { backgroundColor: core }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: "150%",
    height: "150%",
    borderRadius: 999,
  },
  ring: {
    position: "absolute",
    width: "92%",
    height: "92%",
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  orb: {
    width: "62%",
    height: "62%",
    borderRadius: 999,
  },
  core: {
    position: "absolute",
    width: "28%",
    height: "28%",
    borderRadius: 999,
  },
});
