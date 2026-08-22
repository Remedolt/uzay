import { Pressable, StyleSheet, Text, View } from "react-native";

export function PauseScreen({ onResume }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Duraklatıldı</Text>
        <Text style={styles.hint}>ESC veya buton ile devam et</Text>
        <Pressable style={styles.button} onPress={onResume}>
          <Text style={styles.buttonText}>Devam Et</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    minWidth: 240,
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.35)",
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  hint: {
    color: "#94a3b8",
    marginTop: 8,
    marginBottom: 20,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#22d3ee",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: "#082f49",
    fontSize: 17,
    fontWeight: "800",
  },
});
