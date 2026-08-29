import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MOBILE_INTRO_IMAGE, WEB_INTRO_IMAGE } from "../../assets";

const WEB = Platform.OS === "web";
const INTRO_IMAGE = WEB ? WEB_INTRO_IMAGE : MOBILE_INTRO_IMAGE;
const TITLE_FONT = WEB ? "Orbitron, system-ui, sans-serif" : undefined;
const BTN_FONT = WEB ? "Nunito, system-ui, sans-serif" : undefined;

export function WebIntro({ onContinue, onUnlockAudio }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [pressed, setPressed] = useState(false);
  const btnPulse = useRef(new Animated.Value(1)).current;
  const titleGlow = useRef(new Animated.Value(0)).current;

  const compact = !WEB || width < 480;
  const titleSize = Math.round(
    Math.min(compact ? 30 : 40, Math.max(24, width * (compact ? 0.078 : 0.055)))
  );
  const titleTracking = compact ? 4 : 8;
  const btnPadV = compact ? 14 : 16;
  const btnPadH = compact ? 28 : 36;
  const btnFont = compact ? 17 : 20;
  const pulseMax = compact ? 1.05 : 1.08;

  useEffect(() => {
    if (WEB && typeof document !== "undefined") {
      const fonts = [
        {
          id: "uzay-orbitron-font",
          href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&display=swap",
        },
        {
          id: "uzay-btn-font",
          href: "https://fonts.googleapis.com/css2?family=Nunito:wght@800;900&display=swap",
        },
      ];
      fonts.forEach(({ id, href }) => {
        if (!document.getElementById(id)) {
          const link = document.createElement("link");
          link.id = id;
          link.rel = "stylesheet";
          link.href = href;
          document.head.appendChild(link);
        }
      });
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(btnPulse, {
          toValue: pulseMax,
          duration: compact ? 900 : 720,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(btnPulse, {
          toValue: 1,
          duration: compact ? 900 : 720,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(titleGlow, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(titleGlow, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    glow.start();
    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [btnPulse, titleGlow, pulseMax, compact]);

  const go = () => {
    try {
      onUnlockAudio?.();
    } catch {
    }
    onContinue?.();
  };

  const topPad = Math.max(insets.top + 12, compact ? 36 : 28);
  const bottomPad = Math.max(insets.bottom + 20, compact ? 36 : 48);

  return (
    <View style={styles.wrap}>
      <Image
        source={INTRO_IMAGE}
        {...(Platform.OS === "android" ? { defaultSource: INTRO_IMAGE } : null)}
        style={styles.art}
        resizeMode="cover"
      />
      <View style={[styles.topScrim, compact && styles.topScrimCompact]} pointerEvents="none" />
      {!WEB ? <View style={styles.topScrimSoft} pointerEvents="none" /> : null}
      <View
        style={[
          styles.titlePlate,
          compact && styles.titlePlateCompact,
          { top: Math.max(insets.top + 8, height * 0.035) },
        ]}
        pointerEvents="none"
      />
      <View style={[styles.bottomScrim, compact && styles.bottomScrimCompact]} pointerEvents="none" />
      {!WEB ? <View style={styles.bottomScrimSoft} pointerEvents="none" /> : null}

      <View
        style={[styles.copy, { paddingTop: topPad, paddingBottom: bottomPad }]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.titleBlock,
            {
              opacity: titleGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                fontSize: titleSize,
                letterSpacing: titleTracking,
                lineHeight: titleSize + 6,
              },
            ]}
          >
            UZAY AVCISI
          </Text>
        </Animated.View>

        <Pressable
          onPress={go}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          onHoverIn={() => setPressed(true)}
          onHoverOut={() => setPressed(false)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Gemi seç"
        >
          <View>
            {!WEB ? <View style={styles.btnShadowNative} /> : null}
            <Animated.View
              style={[
                styles.btn,
                pressed ? styles.btnHover : null,
                {
                  paddingVertical: btnPadV,
                  paddingHorizontal: btnPadH,
                  transform: [{ scale: btnPulse }],
                },
              ]}
            >
              <Text style={[styles.btnText, { fontSize: btnFont }]}>
                GEMİNİ SEÇ
              </Text>
            </Animated.View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020617",
    zIndex: 40,
  },
  art: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  topScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "22%",
    ...(WEB
      ? {
          backgroundColor: "transparent",
          backgroundImage:
            "linear-gradient(to bottom, rgba(2, 6, 23, 0.92), rgba(2, 6, 23, 0.35), rgba(2, 6, 23, 0))",
        }
      : { backgroundColor: "rgba(2, 6, 23, 0.78)" }),
  },
  topScrimCompact: {
    height: "26%",
  },
  topScrimSoft: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "18%",
    height: "14%",
    backgroundColor: "rgba(2, 6, 23, 0.35)",
  },
  titlePlate: {
    position: "absolute",
    left: "8%",
    right: "8%",
    height: 72,
    borderRadius: 4,
    backgroundColor: "rgba(2, 6, 23, 0.55)",
    ...(WEB
      ? {
          boxShadow: "0 0 40px rgba(2, 6, 23, 0.85)",
        }
      : null),
  },
  titlePlateCompact: {
    left: "6%",
    right: "6%",
    height: 56,
    borderRadius: 6,
    backgroundColor: "rgba(2, 6, 23, 0.62)",
  },
  bottomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "26%",
    ...(WEB
      ? {
          backgroundColor: "transparent",
          backgroundImage:
            "linear-gradient(to bottom, rgba(2, 6, 23, 0), rgba(2, 6, 23, 0.72))",
        }
      : { backgroundColor: "rgba(2, 6, 23, 0.55)" }),
  },
  bottomScrimCompact: {
    height: "30%",
  },
  bottomScrimSoft: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "22%",
    height: "12%",
    backgroundColor: "rgba(2, 6, 23, 0.28)",
  },
  copy: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  titleBlock: {
    alignItems: "center",
    zIndex: 2,
  },
  title: {
    fontFamily: TITLE_FONT,
    fontWeight: "900",
    textAlign: "center",
    ...(WEB
      ? {
          backgroundImage:
            "linear-gradient(180deg, #f0fdff 0%, #bae6fd 14%, #22d3ee 32%, #0891b2 52%, #164e63 72%, #67e8f9 88%, #ecfeff 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          filter:
            "drop-shadow(0 0 16px rgba(34, 211, 238, 0.65)) drop-shadow(0 1px 0 rgba(255,255,255,0.35)) drop-shadow(0 3px 0 rgba(0,0,0,0.95)) drop-shadow(0 5px 14px rgba(0,0,0,0.75))",
        }
      : {
          color: "#7dd3fc",
          textShadowColor: "rgba(0,0,0,0.95)",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        }),
  },
  btnShadowNative: {
    position: "absolute",
    left: 6,
    right: -6,
    top: 6,
    bottom: -6,
    borderRadius: 999,
    backgroundColor: "#000",
  },
  btn: {
    backgroundColor: "#22d3ee",
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "#000",
    ...(WEB
      ? { boxShadow: "8px 8px 0 #000", cursor: "pointer" }
      : { elevation: 6 }),
  },
  btnHover: {
    backgroundColor: "#fbbf24",
    ...(WEB ? { boxShadow: "10px 10px 0 #000" } : null),
  },
  btnText: {
    color: "#140c08",
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: BTN_FONT,
    textAlign: "center",
  },
});
