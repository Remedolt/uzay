import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export function StageBanner({ title, subtitle, kind }) {
  const scale = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const boss = kind === "boss" || /PATRON|AM[İI]RAL/i.test(title || "");

  useEffect(() => {
    if (!title) return undefined;
    scale.setValue(boss ? 0.68 : 0.9);
    flash.setValue(boss ? 1 : 0);
    const enter = Animated.parallel([
      Animated.spring(scale, {
        toValue: boss ? 0.95 : 1,
        friction: 6.8,
        tension: 140,
        useNativeDriver: true,
      }),
      boss
        ? Animated.timing(flash, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          })
        : Animated.delay(0),
    ]);
    enter.start();
    return () => enter.stop();
  }, [title, subtitle, boss, scale, flash]);

  if (!title) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {boss ? (
        <Animated.View style={[styles.flash, { opacity: flash }]} />
      ) : null}
      <Animated.View
        style={[
          styles.card,
          boss && styles.bossCard,
          { transform: [{ scale }] },
        ]}
      >
        {boss ? <Text style={styles.alert}>UYARI</Text> : null}
        <Text style={[styles.title, boss && styles.bossTitle]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.sub, boss && styles.bossSub]}>{subtitle}</Text>
        ) : null}
      </Animated.View>
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
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(248, 113, 113, 0.32)",
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
  bossCard: {
    minWidth: 228,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderColor: "rgba(248, 113, 113, 0.75)",
    backgroundColor: "rgba(69, 10, 10, 0.82)",
    shadowColor: "#f43f5e",
    shadowOpacity: 0.65,
    shadowRadius: 17,
    shadowOffset: { width: 0, height: 0 },
  },
  alert: {
    color: "#fecaca",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3.8,
    marginBottom: 4,
  },
  title: {
    color: "#fde68a",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  bossTitle: {
    color: "#fff1f2",
    fontSize: 32,
    letterSpacing: 3.8,
    textShadowColor: "rgba(248, 113, 113, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 11,
  },
  sub: {
    color: "#cbd5e1",
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  bossSub: {
    color: "#fecdd3",
    fontSize: 14,
    fontWeight: "700",
  },
});
