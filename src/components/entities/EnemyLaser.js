import { StyleSheet, View } from "react-native";

/** Düşman lazeri (aşağı doğru) */
export function EnemyLaser({ x, y, width, height }) {
  return (
    <View
      style={[
        styles.wrap,
        {
          left: x + width / 2 - 6,
          top: y,
          width: 12,
          height: height + 6,
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.glow} />
      <View style={[styles.core, { width, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    width: "80%",
    height: "90%",
    borderRadius: 8,
    backgroundColor: "rgba(248, 113, 113, 0.35)",
  },
  core: {
    marginTop: 2,
    borderRadius: 3,
    backgroundColor: "#fecaca",
    borderWidth: 1,
    borderColor: "#f87171",
  },
});
