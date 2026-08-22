import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MAX_LIVES, WEAPON } from "../../constants/game";

function Heart({ filled }) {
  return (
    <View style={[styles.heart, filled ? styles.heartOn : styles.heartOff]}>
      <Text style={[styles.heartText, !filled && styles.heartTextOff]}>♥</Text>
    </View>
  );
}

function StatChip({ icon, label, value, accent }) {
  return (
    <View style={[styles.chip, { borderColor: accent }]}>
      <View style={[styles.chipIconWrap, { backgroundColor: accent + "33" }]}>
        <Text style={[styles.chipIcon, { color: accent }]}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.chipLabel}>{label}</Text>
        <Text style={styles.chipValue}>{value}</Text>
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
  combo = 0,
  comboMul = 1,
  droneCount = 0,
}) {
  const insets = useSafeAreaInsets();
  const slots = MAX_LIVES;
  const isMaxWeapon = weaponLevel >= WEAPON.maxLevel;
  const weaponLabel = isMaxWeapon ? "MAX" : `${weaponLevel + 1}x`;
  const weaponAccent = isMaxWeapon ? "#fbbf24" : "#f59e0b";
  const stageNo = stage || level || 1;
  const waveRatio = quota > 0 ? Math.max(0, Math.min(1, spawned / quota)) : 1;
  const progressText =
    phase === "boss"
      ? "Patron"
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
        style={[styles.bar, { paddingTop: insets.top + 10 }]}
        pointerEvents="none"
      >
        <View style={styles.topRow}>
        <View style={styles.panel}>
          <StatChip icon="★" label="SKOR" value={score} accent="#fbbf24" />
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
          <StatChip
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
          <View style={styles.livesPanel}>
            <Text style={styles.livesLabel}>CAN</Text>
            <View style={styles.livesRow}>
              {Array.from({ length: slots }, (_, i) => (
                <Heart key={i} filled={i < lives} />
              ))}
            </View>
          </View>
        </View>
      </View>
      </View>

      {combo >= 2 ? (
        <View
          style={[
            styles.comboDock,
            { bottom: Math.max(18, insets.bottom + 14) },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.comboLabel}>KOMBO</Text>
          <View style={styles.comboRow}>
            <Text style={styles.comboCount}>{combo}</Text>
            <Text style={styles.comboMul}>×{comboMul}</Text>
          </View>
        </View>
      ) : null}
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
  chipIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chipIcon: {
    fontSize: 14,
    fontWeight: "800",
  },
  chipLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  chipValue: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 1,
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
  comboDock: {
    position: "absolute",
    left: 12,
    zIndex: 4,
    minWidth: 86,
    backgroundColor: "rgba(2, 6, 23, 0.78)",
    borderColor: "rgba(251, 191, 36, 0.7)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  comboLabel: {
    color: "#fde68a",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  comboRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 1,
  },
  comboCount: {
    color: "#fff7ed",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 24,
  },
  comboMul: {
    color: "#fbbf24",
    fontSize: 16,
    fontWeight: "800",
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
