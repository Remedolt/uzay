import { StyleSheet, View } from "react-native";
import { SHIPS } from "../../constants/game";

const ROTORS = [
  { top: "0%", left: "0%" },
  { top: "0%", right: "0%" },
  { bottom: "14%", left: "0%" },
  { bottom: "14%", right: "0%" },
];

export function Drone({ x, y, width, height, shipId = "aurora" }) {
  const ship = SHIPS.find((s) => s.id === shipId) || SHIPS[0];
  const spin = (Date.now() / 16) % 360;

  return (
    <View
      style={[styles.wrap, { left: x, top: y, width, height }]}
      pointerEvents="none"
    >
      <View style={[styles.wash, { backgroundColor: ship.engine }]} />

      <View style={[styles.arm, styles.armA]} />
      <View style={[styles.arm, styles.armB]} />

      {ROTORS.map((pos, i) => (
        <View key={i} style={[styles.rotor, pos]}>
          <View
            style={[
              styles.rotorSpin,
              { transform: [{ rotate: `${spin + i * 22}deg` }] },
            ]}
          >
            <View
              style={[
                styles.bladeRing,
                { borderColor: ship.laser, shadowColor: ship.laser },
              ]}
            />
            <View style={styles.bladeCrossA} />
            <View style={styles.bladeCrossB} />
          </View>
          <View style={[styles.hub, { backgroundColor: ship.laser }]} />
        </View>
      ))}

      <View
        style={[
          styles.hull,
          { borderColor: ship.laser, shadowColor: ship.engine },
        ]}
      >
        <View style={[styles.stripe, { backgroundColor: ship.wing }]} />
        <View style={[styles.canopy, { backgroundColor: ship.tip }]} />
      </View>

      <View style={[styles.cannon, { backgroundColor: ship.laser }]} />
      <View style={[styles.exhaust, { backgroundColor: ship.engine }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  wash: {
    position: "absolute",
    width: "70%",
    height: "70%",
    borderRadius: 99,
    opacity: 0.22,
  },
  arm: {
    position: "absolute",
    width: "78%",
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "#334155",
    borderWidth: 0.5,
    borderColor: "#64748b",
  },
  armA: {
    transform: [{ rotate: "38deg" }],
  },
  armB: {
    transform: [{ rotate: "-38deg" }],
  },
  rotor: {
    position: "absolute",
    width: "34%",
    height: "34%",
    alignItems: "center",
    justifyContent: "center",
  },
  rotorSpin: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  bladeRing: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 99,
    borderWidth: 1.4,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    opacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 4,
  },
  bladeCrossA: {
    position: "absolute",
    width: "86%",
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(226, 232, 240, 0.55)",
  },
  bladeCrossB: {
    position: "absolute",
    width: 1.5,
    height: "86%",
    borderRadius: 1,
    backgroundColor: "rgba(226, 232, 240, 0.55)",
  },
  hub: {
    width: "28%",
    height: "28%",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  hull: {
    width: "36%",
    height: "48%",
    borderRadius: 5,
    backgroundColor: "#0f172a",
    borderWidth: 1.4,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  stripe: {
    position: "absolute",
    width: "42%",
    height: "78%",
    borderRadius: 2,
    opacity: 0.85,
  },
  canopy: {
    position: "absolute",
    top: "10%",
    width: "48%",
    height: "20%",
    borderRadius: 99,
  },
  cannon: {
    position: "absolute",
    top: "6%",
    width: 3,
    height: "16%",
    borderRadius: 1,
  },
  exhaust: {
    position: "absolute",
    bottom: "10%",
    width: "16%",
    height: "10%",
    borderRadius: 99,
    opacity: 0.7,
  },
});
