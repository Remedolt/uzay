import { Image, StyleSheet, View } from "react-native";
import { METEOR_IMAGES } from "../../assets";

export function Meteor({
  x,
  y,
  width,
  height,
  variant = 0,
  rotation = 0,
  source,
}) {
  const img = source || METEOR_IMAGES[variant % METEOR_IMAGES.length];
  return (
    <View
      style={[
        styles.wrap,
        {
          left: x,
          top: y,
          width,
          height,
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.glow} />
      <Image source={img} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(249, 115, 22, 0.18)",
    borderRadius: 999,
    transform: [{ scale: 0.72 }],
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
});
