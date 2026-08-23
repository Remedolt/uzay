import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { enterFullscreen, isFullscreen } from "../../web/fullscreen";

export function PauseScreen({ onResume, onQuit }) {
  const showFs = Platform.OS === "web" && !isFullscreen();

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Duraklatıldı</Text>
        <Text style={styles.hint}>ESC veya buton ile devam et</Text>
        <Pressable style={styles.button} onPress={onResume}>
          <Text style={styles.buttonText}>Devam Et</Text>
        </Pressable>
        {showFs ? (
          <Pressable
            style={styles.fsBtn}
            onPress={() => {
              enterFullscreen();
              onResume();
            }}
          >
            <Text style={styles.fsText}>Tam ekran</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.quitBtn} onPress={onQuit}>
          <Text style={styles.quitText}>Oyundan Çık</Text>
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
  fsBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.45)",
  },
  fsText: {
    color: "#e0f2fe",
    fontSize: 15,
    fontWeight: "800",
  },
  quitBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.55)",
  },
  quitText: {
    color: "#fecaca",
    fontSize: 15,
    fontWeight: "800",
  },
});
