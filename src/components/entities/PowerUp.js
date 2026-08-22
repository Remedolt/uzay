import { StyleSheet, Text, View } from "react-native";
import { POWERUP_TYPE } from "../../constants/game";

const STYLES = {
  [POWERUP_TYPE.LIFE]: {
    border: "#fb7185",
    bg: "rgba(244, 63, 94, 0.28)",
    color: "#fecdd3",
    icon: "♥",
  },
  [POWERUP_TYPE.SHIELD]: {
    border: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.28)",
    color: "#e0f2fe",
    icon: "◈",
  },
  [POWERUP_TYPE.WEAPON]: {
    border: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.28)",
    color: "#fef3c7",
    icon: "⚡",
  },
};

export function PowerUp({ x, y, width, height, type }) {
  const look = STYLES[type] || STYLES[POWERUP_TYPE.SHIELD];
  return (
    <View
      style={[
        styles.wrap,
        {
          left: x,
          top: y,
          width,
          height,
          borderColor: look.border,
          backgroundColor: look.bg,
          shadowColor: look.border,
        },
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.icon, { color: look.color }]}>{look.icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 16,
    fontWeight: "800",
  },
});
