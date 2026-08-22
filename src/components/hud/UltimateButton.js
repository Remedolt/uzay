import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function UltimateButton({ charge = 0, onPress }) {
  const insets = useSafeAreaInsets();
  const pct = Math.max(0, Math.min(1, charge));
  const ready = pct >= 1;
  const pulse = ready ? 0.62 + Math.sin(Date.now() / 160) * 0.38 : 1;
  const degrees = Math.round(pct * 360);

  return (
    <View
      style={[
        styles.wrap,
        { bottom: Math.max(16, insets.bottom + 12), right: 14 + insets.right },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={ready ? onPress : undefined}
        disabled={!ready}
        style={({ pressed }) => [
          styles.ring,
          ready && styles.ringReady,
          { opacity: pulse, transform: [{ scale: pressed && ready ? 0.94 : 1 }] },
          Platform.OS === "web"
            ? {
                backgroundImage: `conic-gradient(#22d3ee ${degrees}deg, rgba(15,23,42,0.92) 0deg)`,
              }
            : null,
        ]}
      >
        {Platform.OS !== "web" ? (
          <View style={[styles.nativeFill, { height: `${pct * 100}%` }]} />
        ) : null}
        <View style={[styles.core, ready && styles.coreReady]}>
          <Text style={styles.nuke}>☢</Text>
          <Text style={[styles.caption, ready && styles.captionReady]}>
            {ready ? "HAZIR" : `${Math.floor(pct * 100)}%`}
          </Text>
        </View>
      </Pressable>
      <Text style={styles.label}>PATLAT</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    zIndex: 24,
    alignItems: "center",
  },
  ring: {
    width: 78,
    height: 78,
    borderRadius: 39,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.92)",
    borderWidth: 2,
    borderColor: "rgba(34,211,238,0.28)",
    overflow: "hidden",
    shadowColor: "#22d3ee",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  ringReady: {
    borderColor: "#67e8f9",
    shadowOpacity: 0.95,
    shadowRadius: 18,
  },
  nativeFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(34,211,238,0.35)",
  },
  core: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    backgroundColor: "rgba(2,6,23,0.94)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.2)",
  },
  coreReady: {
    backgroundColor: "rgba(8,47,73,0.95)",
    borderColor: "#67e8f9",
  },
  nuke: {
    fontSize: 22,
    color: "#86efac",
    marginTop: -2,
  },
  caption: {
    color: "#67e8f9",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginTop: 1,
  },
  captionReady: {
    color: "#ecfeff",
  },
  label: {
    marginTop: 5,
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
