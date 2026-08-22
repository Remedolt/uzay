import { StyleSheet, Text, View } from "react-native";

export function StageBanner({ title, subtitle }) {
  if (!title) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8,
  },
  card: {
    minWidth: 180,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "rgba(2, 6, 23, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.45)",
  },
  title: {
    color: "#fde68a",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  sub: {
    color: "#cbd5e1",
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
});
