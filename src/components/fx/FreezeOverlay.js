import { Platform, StyleSheet, View } from "react-native";

const WEB = Platform.OS === "web";

/** Full-screen frost veil while DONMA (time slow) is active. */
export function FreezeOverlay({ active = false, intensity = 1 }) {
  if (!active) return null;
  const a = Math.max(0.2, Math.min(1, intensity));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View
        style={[
          styles.veil,
          {
            opacity: 0.28 + a * 0.22,
            backgroundColor: "rgba(125, 211, 252, 0.32)",
            ...(WEB
              ? {
                  backgroundImage:
                    "linear-gradient(180deg, rgba(224,242,254,0.42) 0%, rgba(125,211,252,0.28) 35%, rgba(56,189,248,0.22) 70%, rgba(186,230,253,0.38) 100%)",
                }
              : null),
          },
        ]}
      />
      <View
        style={[
          styles.sheet,
          {
            opacity: 0.18 + a * 0.2,
            ...(WEB
              ? {
                  backgroundImage:
                    "radial-gradient(ellipse at 50% 50%, rgba(240,249,255,0.35) 0%, rgba(125,211,252,0.12) 55%, transparent 100%)",
                }
              : { backgroundColor: "rgba(224, 242, 254, 0.2)" }),
          },
        ]}
      />
      <View style={[styles.edgeTop, { opacity: 0.55 * a }]} />
      <View style={[styles.edgeBottom, { opacity: 0.5 * a }]} />
      <View style={[styles.edgeLeft, { opacity: 0.4 * a }]} />
      <View style={[styles.edgeRight, { opacity: 0.4 * a }]} />
      <View style={[styles.sparkleRow, { opacity: 0.45 + a * 0.35 }]}>
        {Array.from({ length: 18 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.flake,
              {
                left: `${(i * 5.7 + (i % 4) * 3.1) % 100}%`,
                top: `${8 + ((i * 13) % 84)}%`,
                width: 2 + (i % 4),
                height: 2 + (i % 4),
                opacity: 0.4 + (i % 5) * 0.1,
                ...(WEB ? { animationDelay: `${(i % 7) * 0.16}s` } : null),
              },
            ]}
          />
        ))}
      </View>
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
  sheet: {
    ...StyleSheet.absoluteFillObject,
  },
  sparkleRow: {
    ...StyleSheet.absoluteFillObject,
  },
  flake: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#f0fdff",
    ...(WEB
      ? {
          boxShadow: "0 0 8px rgba(186,230,253,0.95)",
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
    height: "18%",
    backgroundColor: "rgba(186, 230, 253, 0.35)",
    ...(WEB
      ? {
          backgroundColor: "transparent",
          backgroundImage:
            "linear-gradient(to bottom, rgba(224,242,254,0.55), transparent)",
        }
      : null),
  },
  edgeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "20%",
    backgroundColor: "rgba(125, 211, 252, 0.3)",
    ...(WEB
      ? {
          backgroundColor: "transparent",
          backgroundImage:
            "linear-gradient(to top, rgba(125,211,252,0.5), transparent)",
        }
      : null),
  },
  edgeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "14%",
    backgroundColor: "rgba(186, 230, 253, 0.18)",
    ...(WEB
      ? {
          backgroundColor: "transparent",
          backgroundImage:
            "linear-gradient(to right, rgba(186,230,253,0.4), transparent)",
        }
      : null),
  },
  edgeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "14%",
    backgroundColor: "rgba(186, 230, 253, 0.18)",
    ...(WEB
      ? {
          backgroundColor: "transparent",
          backgroundImage:
            "linear-gradient(to left, rgba(186,230,253,0.4), transparent)",
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
        50% { transform: translateY(10px) rotate(18deg); opacity: 0.8; }
        100% { transform: translateY(0) rotate(0deg); opacity: 0.35; }
      }
    `;
    document.head.appendChild(style);
  }
}
