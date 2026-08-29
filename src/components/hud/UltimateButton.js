import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * @param {"right"|"left"} side
 * @param {"emp"|"zeus"} variant
 */
export function UltimateButton({
  charge = 0,
  onPress,
  side = "right",
  variant = "emp",
  label = "PATLAT",
  icon = "☢",
}) {
  const insets = useSafeAreaInsets();
  const compact = Platform.OS !== "web";
  const pct = Math.max(0, Math.min(1, charge));
  const ready = pct >= 1;
  const pulse = ready ? 0.62 + Math.sin(Date.now() / 160) * 0.38 : 1;
  const degrees = Math.round(pct * 360);
  const zeus = variant === "zeus";
  const accent = zeus ? "#38bdf8" : "#22d3ee";
  const accentSoft = zeus ? "rgba(56,189,248,0.28)" : "rgba(34,211,238,0.28)";
  const fillNative = zeus ? "rgba(56,189,248,0.38)" : "rgba(34,211,238,0.35)";
  const readyBorder = zeus ? "#7dd3fc" : "#67e8f9";
  const coreReadyBg = zeus ? "rgba(12,74,110,0.95)" : "rgba(8,47,73,0.95)";

  return (
    <View
      style={[
        styles.wrap,
        {
          bottom: Math.max(compact ? 12 : 16, insets.bottom + (compact ? 8 : 12)),
          ...(side === "left"
            ? { left: (compact ? 10 : 14) + insets.left }
            : { right: (compact ? 10 : 14) + insets.right }),
        },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={ready ? onPress : undefined}
        disabled={!ready}
        style={({ pressed }) => [
          styles.ring,
          compact && styles.ringCompact,
          ready && styles.ringReady,
          ready && { borderColor: readyBorder, shadowColor: accent },
          { opacity: pulse, transform: [{ scale: pressed && ready ? 0.94 : 1 }] },
          Platform.OS === "web"
            ? {
                backgroundImage: `conic-gradient(${accent} ${degrees}deg, rgba(15,23,42,0.92) 0deg)`,
                borderColor: ready ? readyBorder : accentSoft,
              }
            : { borderColor: ready ? readyBorder : accentSoft },
        ]}
      >
        {Platform.OS !== "web" ? (
          <View style={[styles.nativeFill, { height: `${pct * 100}%`, backgroundColor: fillNative }]} />
        ) : null}
        <View
          style={[
            styles.core,
            compact && styles.coreCompact,
            ready && styles.coreReady,
            ready && { backgroundColor: coreReadyBg, borderColor: readyBorder },
          ]}
        >
          <Text style={[styles.nuke, compact && styles.nukeCompact, zeus && styles.zeusIcon]}>
            {icon}
          </Text>
          <Text
            style={[
              styles.caption,
              compact && styles.captionCompact,
              ready && styles.captionReady,
              { color: ready ? "#ecfeff" : accent },
            ]}
          >
            {ready ? "HAZIR" : `${Math.floor(pct * 100)}%`}
          </Text>
        </View>
      </Pressable>
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
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
  ringCompact: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 5,
  },
  ringReady: {
    shadowOpacity: 0.95,
    shadowRadius: 18,
  },
  nativeFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
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
  coreCompact: {
    borderRadius: 26,
  },
  coreReady: {},
  nuke: {
    fontSize: 22,
    color: "#86efac",
    marginTop: -2,
  },
  nukeCompact: {
    fontSize: 18,
  },
  zeusIcon: {
    color: "#7dd3fc",
    textShadowColor: "rgba(56,189,248,0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  caption: {
    color: "#67e8f9",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginTop: 1,
  },
  captionCompact: {
    fontSize: 8,
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
  labelCompact: {
    marginTop: 3,
    fontSize: 8,
  },
});
