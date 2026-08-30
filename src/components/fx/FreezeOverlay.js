import { Platform, StyleSheet, View } from "react-native";

const WEB = Platform.OS === "web";

/** Frost veil while DONMA (time slow) is active. */
export function FreezeOverlay({ active = false, intensity = 1 }) {
  if (!active) return null;
  const a = Math.max(0.15, Math.min(1, intensity));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View
        style={[
          styles.veil,
          {
            opacity: 0.22 + a * 0.18,
            ...(WEB
              ? {
                  backgroundImage:
                    "radial-gradient(ellipse at 50% 40%, rgba(186,230,253,0.22) 0%, rgba(14,165,233,0.12) 42%, rgba(2,6,23,0.05) 72%, transparent 100%)",
                }
              : { backgroundColor: "rgba(125, 211, 252, 0.22)" }),
          },
        ]}
      />
      <View style={[styles.frostTL, { opacity: 0.35 + a * 0.35 }]} />
      <View style={[styles.frostTR, { opacity: 0.32 + a * 0.3 }]} />
      <View style={[styles.frostBL, { opacity: 0.28 + a * 0.28 }]} />
      <View style={[styles.frostBR, { opacity: 0.3 + a * 0.32 }]} />
      <View style={[styles.sparkleRow, { opacity: 0.4 + a * 0.35 }]}>
        {Array.from({ length: 14 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.flake,
              {
                left: `${(i * 7.1 + (i % 3) * 2.4) % 100}%`,
                top: `${12 + ((i * 17) % 76)}%`,
                width: 3 + (i % 3),
                height: 3 + (i % 3),
                opacity: 0.35 + (i % 5) * 0.1,
                ...(WEB ? { animationDelay: `${(i % 7) * 0.18}s` } : null),
              },
            ]}
          />
        ))}
      </View>
      <View style={[styles.edgeTop, { opacity: 0.45 * a }]} />
      <View style={[styles.edgeBottom, { opacity: 0.4 * a }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 17,
    overflow: "hidden",
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
  },
  frostTL: {
    position: "absolute",
    left: -40,
    top: -30,
    width: "48%",
    height: "38%",
    borderBottomRightRadius: 220,
    backgroundColor: "rgba(224, 242, 254, 0.22)",
    ...(WEB
      ? {
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(224,242,254,0.55) 0%, rgba(125,211,252,0.18) 40%, transparent 70%)",
          filter: "blur(1px)",
        }
      : null),
  },
  frostTR: {
    position: "absolute",
    right: -30,
    top: -20,
    width: "42%",
    height: "34%",
    borderBottomLeftRadius: 200,
    backgroundColor: "rgba(240, 249, 255, 0.18)",
    ...(WEB
      ? {
          backgroundImage:
            "radial-gradient(circle at 80% 15%, rgba(240,249,255,0.5) 0%, rgba(56,189,248,0.16) 45%, transparent 72%)",
        }
      : null),
  },
  frostBL: {
    position: "absolute",
    left: -20,
    bottom: -25,
    width: "44%",
    height: "32%",
    borderTopRightRadius: 200,
    backgroundColor: "rgba(186, 230, 253, 0.16)",
    ...(WEB
      ? {
          backgroundImage:
            "radial-gradient(circle at 15% 85%, rgba(186,230,253,0.42) 0%, rgba(14,165,233,0.14) 48%, transparent 75%)",
        }
      : null),
  },
  frostBR: {
    position: "absolute",
    right: -25,
    bottom: -20,
    width: "46%",
    height: "36%",
    borderTopLeftRadius: 220,
    backgroundColor: "rgba(224, 242, 254, 0.18)",
    ...(WEB
      ? {
          backgroundImage:
            "radial-gradient(circle at 85% 90%, rgba(224,242,254,0.48) 0%, rgba(56,189,248,0.15) 42%, transparent 70%)",
        }
      : null),
  },
  sparkleRow: {
    ...StyleSheet.absoluteFillObject,
  },
  flake: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#e0f2fe",
    ...(WEB
      ? {
          boxShadow: "0 0 6px rgba(186,230,253,0.9)",
          animationName: "uzay-flake-drift",
          animationDuration: "2.8s",
          animationIterationCount: "infinite",
          animationTimingFunction: "ease-in-out",
        }
      : {
          shadowColor: "#bae6fd",
          shadowOpacity: 0.9,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
        }),
  },
  edgeTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 56,
    backgroundColor: "rgba(186, 230, 253, 0.22)",
    ...(WEB
      ? {
          backgroundColor: "transparent",
          backgroundImage:
            "linear-gradient(to bottom, rgba(186,230,253,0.35), transparent)",
        }
      : null),
  },
  edgeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: "rgba(125, 211, 252, 0.18)",
    ...(WEB
      ? {
          backgroundColor: "transparent",
          backgroundImage:
            "linear-gradient(to top, rgba(125,211,252,0.28), transparent)",
        }
      : null),
  },
});

if (WEB && typeof document !== "undefined") {
  const id = "uzay-freeze-keyframes";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes uzay-flake-drift {
        0% { transform: translateY(0) rotate(0deg); opacity: 0.35; }
        50% { transform: translateY(10px) rotate(18deg); opacity: 0.75; }
        100% { transform: translateY(0) rotate(0deg); opacity: 0.35; }
      }
    `;
    document.head.appendChild(style);
  }
}
