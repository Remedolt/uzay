import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MAX_LIVES, WEAPON } from "../../constants/game";

function Heart({ filled, compact }) {
  return (
    <View
      style={[
        styles.heart,
        compact && styles.heartCompact,
        filled ? styles.heartOn : styles.heartOff,
      ]}
    >
      <Text
        style={[
          styles.heartText,
          compact && styles.heartTextCompact,
          !filled && styles.heartTextOff,
        ]}
      >
        ♥
      </Text>
    </View>
  );
}

function StatChip({ icon, label, value, accent, compact }) {
  return (
    <View style={[styles.chip, compact && styles.chipCompact, { borderColor: accent }]}>
      <View
        style={[
          styles.chipIconWrap,
          compact && styles.chipIconWrapCompact,
          { backgroundColor: accent + "33" },
        ]}
      >
        <Text style={[styles.chipIcon, compact && styles.chipIconCompact, { color: accent }]}>
          {icon}
        </Text>
      </View>
      <View>
        <Text style={[styles.chipLabel, compact && styles.chipLabelCompact]}>{label}</Text>
        <Text style={[styles.chipValue, compact && styles.chipValueCompact]}>{value}</Text>
      </View>
    </View>
  );
}

export function Hud({
  score,
  lives,
  level,
  stage,
  phase,
  spawned = 0,
  quota = 8,
  shielded,
  shieldHp = 0,
  weaponLevel = 0,
  droneCount = 0,
}) {
  const insets = useSafeAreaInsets();
  const compact = Platform.OS !== "web";
  const slots = compact ? Math.max(1, lives) : MAX_LIVES;
  const isMaxWeapon = weaponLevel >= WEAPON.maxLevel;
  const weaponLabel = isMaxWeapon ? "MAX" : `${weaponLevel + 1}x`;
  const weaponAccent = isMaxWeapon ? "#fbbf24" : "#f59e0b";
  const stageNo = stage || level || 1;
  const waveRatio = quota > 0 ? Math.max(0, Math.min(1, spawned / quota)) : 1;
  const progressText =
    phase === "boss"
      ? "Amiral"
      : phase === "clear"
        ? "Tamam"
        : `${Math.min(spawned, quota)}/${quota}`;
  const fill =
    phase === "boss" || phase === "clear" ? 1 : waveRatio;
  const fillColor =
    phase === "boss" ? "#f87171" : phase === "clear" ? "#34d399" : "#a78bfa";

  return (
    <>
      <View
        style={[
          styles.bar,
          compact && styles.barCompact,
          { paddingTop: insets.top + (compact ? 6 : 10) },
        ]}
        pointerEvents="none"
      >
        <View style={styles.topRow}>
        <View style={[styles.panel, compact && styles.panelCompact]}>
          <StatChip compact={compact} icon="★" label="SKOR" value={score} accent="#fbbf24" />
          {compact ? null : (
          <View style={[styles.chip, { borderColor: "#a78bfa" }]}>
            <View
              style={[styles.chipIconWrap, { backgroundColor: "#a78bfa33" }]}
            >
              <Text style={[styles.chipIcon, { color: "#a78bfa" }]}>▲</Text>
            </View>
            <View style={styles.stageChipBody}>
              <Text style={styles.chipLabel}>AŞAMA {stageNo}</Text>
              <Text style={styles.chipValue}>{progressText}</Text>
              <View style={styles.stageMiniTrack}>
                <View
                  style={[
                    styles.stageMiniFill,
                    { width: `${fill * 100}%`, backgroundColor: fillColor },
                  ]}
                />
              </View>
            </View>
          </View>
          )}
          <StatChip
            compact={compact}
            icon="✦"
            label="SİLAH"
            value={weaponLabel}
            accent={weaponAccent}
          />
        </View>

        <View style={styles.rightCol}>
          {droneCount > 0 ? (
            <View style={styles.droneBadge}>
              <Text style={styles.droneIcon}>◉</Text>
              <Text style={styles.droneLabel}>Yancı ×{droneCount}</Text>
            </View>
          ) : null}
          {shielded ? (
            <View style={styles.shieldBadge}>
              <Text style={styles.shieldIcon}>◈</Text>
              <Text style={styles.shieldLabel}>
                Kalkan{shieldHp > 1 ? ` x${shieldHp}` : ""}
              </Text>
            </View>
          ) : null}
          <View style={[styles.livesPanel, compact && styles.livesPanelCompact]}>
            <Text style={[styles.livesLabel, compact && styles.chipLabelCompact]}>CAN</Text>
            <View style={styles.livesRow}>
              {Array.from({ length: slots }, (_, i) => (
                <Heart key={i} compact={compact} filled={compact ? true : i < lives} />
              ))}
            </View>
          </View>
        </View>
      </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 0,
    zIndex: 4,
  },
  barCompact: {
    left: 8,
    right: 8,
  },
  panelCompact: {
    maxWidth: "55%",
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  stageChipBody: {
    minWidth: 58,
  },
  stageMiniTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    overflow: "hidden",
    marginTop: 3,
  },
  stageMiniFill: {
    height: "100%",
    borderRadius: 2,
  },
  panel: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    maxWidth: "62%",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  chipCompact: {
    gap: 5,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  chipIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chipIconWrapCompact: {
    width: 21,
    height: 21,
    borderRadius: 6,
  },
  chipIcon: {
    fontSize: 14,
    fontWeight: "800",
  },
  chipIconCompact: {
    fontSize: 11,
  },
  chipLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  chipLabelCompact: {
    fontSize: 8,
    marginBottom: 2,
  },
  chipValue: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 1,
  },
  chipValueCompact: {
    fontSize: 12,
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 6,
  },
  livesPanel: {
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(251, 113, 133, 0.35)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "flex-end",
  },
  livesPanelCompact: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  livesLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  livesRow: {
    flexDirection: "row",
    gap: 4,
  },
  heart: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  heartCompact: {
    width: 17,
    height: 17,
    borderRadius: 5,
  },
  heartOn: {
    backgroundColor: "rgba(244, 63, 94, 0.28)",
  },
  heartOff: {
    backgroundColor: "rgba(51, 65, 85, 0.45)",
  },
  heartText: {
    color: "#fb7185",
    fontSize: 14,
    fontWeight: "800",
    marginTop: -1,
  },
  heartTextCompact: {
    fontSize: 11,
  },
  heartTextOff: {
    color: "#64748b",
  },
  shieldBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(56, 189, 248, 0.22)",
    borderColor: "rgba(125, 211, 252, 0.6)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  shieldIcon: {
    color: "#7dd3fc",
    fontSize: 12,
    fontWeight: "800",
  },
  shieldLabel: {
    color: "#e0f2fe",
    fontSize: 11,
    fontWeight: "700",
  },
  rocketDock: {
    position: "absolute",
    left: 12,
    zIndex: 4,
    minWidth: 86,
    backgroundColor: "rgba(2, 6, 23, 0.78)",
    borderColor: "rgba(34, 211, 238, 0.7)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  rocketDockCompact: {
    minWidth: 68,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    left: 8,
  },
  rocketLabel: {
    color: "#a5f3fc",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  rocketCount: {
    color: "#ecfeff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 24,
    marginTop: 1,
  },
  rocketCountCompact: {
    fontSize: 17,
    lineHeight: 19,
  },
  droneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(167, 139, 250, 0.2)",
    borderColor: "rgba(196, 181, 253, 0.55)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  droneIcon: {
    color: "#ddd6fe",
    fontSize: 11,
  },
  droneLabel: {
    color: "#ede9fe",
    fontSize: 11,
    fontWeight: "700",
  },
});
