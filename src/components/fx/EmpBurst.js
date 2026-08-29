import { StyleSheet, View } from "react-native";

export function EmpBurst({ burst }) {
  if (!burst || burst.t <= 0 || burst.t >= 1) return null;
  const t = burst.t;
  const size = 40 + t * 720;
  const opacity = Math.max(0, 0.55 * (1 - t));
  const zeus = burst.kind === "zeus";
  const freeze = burst.kind === "freeze";
  const flashColor = freeze ? "#e0f2fe" : zeus ? "#bae6fd" : "#f8fafc";
  const ringOuter = freeze
    ? `rgba(224, 242, 254, ${0.95 * (1 - t)})`
    : zeus
      ? `rgba(125, 211, 252, ${0.9 * (1 - t)})`
      : `rgba(224, 242, 254, ${0.85 * (1 - t)})`;
  const ringInner = freeze
    ? `rgba(125, 211, 252, ${0.95 * (1 - t)})`
    : zeus
      ? `rgba(56, 189, 248, ${0.95 * (1 - t)})`
      : `rgba(34, 211, 238, ${0.9 * (1 - t)})`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={[
          styles.flash,
          { opacity: 0.42 * (1 - t) * (1 - t), backgroundColor: flashColor },
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
            borderColor: ringOuter,
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
            borderColor: ringInner,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 18,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 3,
    zIndex: 19,
  },
});
