import { StyleSheet, View } from "react-native";

export function EmpBurst({ burst }) {
  if (!burst || burst.t <= 0 || burst.t >= 1) return null;
  const t = burst.t;
  const size = 40 + t * 720;
  const opacity = Math.max(0, 0.55 * (1 - t));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={[
          styles.flash,
          { opacity: 0.42 * (1 - t) * (1 - t) },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            left: burst.x - size / 2,
            top: burst.y - size / 2,
            opacity,
            borderColor: `rgba(224, 242, 254, ${0.85 * (1 - t)})`,
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: size * 0.62,
            height: size * 0.62,
            left: burst.x - size * 0.31,
            top: burst.y - size * 0.31,
            opacity: opacity * 0.8,
            borderColor: `rgba(34, 211, 238, ${0.9 * (1 - t)})`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f8fafc",
    zIndex: 18,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 3,
    zIndex: 19,
  },
});
