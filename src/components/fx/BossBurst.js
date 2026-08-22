import { StyleSheet, View } from "react-native";

const SPARKS = [
  [1, 0],
  [0.7, 0.7],
  [0, 1],
  [-0.7, 0.7],
  [-1, 0],
  [-0.7, -0.7],
  [0, -1],
  [0.7, -0.7],
];

export function BossBurst({ burst }) {
  if (!burst || burst.t <= 0 || burst.t >= 1) return null;
  const t = burst.t;
  const fade = 1 - t;
  const size = 36 + t * 260;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={[
          styles.flash,
          { opacity: 0.28 * fade * fade },
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
            opacity: 0.85 * fade,
            borderColor: `rgba(251, 191, 36, ${0.95 * fade})`,
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: size * 0.55,
            height: size * 0.55,
            left: burst.x - size * 0.275,
            top: burst.y - size * 0.275,
            opacity: 0.75 * fade,
            borderColor: `rgba(248, 113, 113, ${0.9 * fade})`,
          },
        ]}
      />
      {SPARKS.map(([dx, dy], i) => {
        const dist = 18 + t * 92;
        return (
          <View
            key={i}
            style={[
              styles.spark,
              {
                left: burst.x + dx * dist - 3,
                top: burst.y + dy * dist - 3,
                opacity: 0.9 * fade,
                backgroundColor: i % 2 ? "#fbbf24" : "#fb7185",
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff7ed",
    zIndex: 18,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 3,
    zIndex: 19,
  },
  spark: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 99,
    zIndex: 20,
  },
});
