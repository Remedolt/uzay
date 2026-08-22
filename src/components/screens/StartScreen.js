import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GAME_TITLE, PLAYER, SHIPS, getShip } from "../../constants/game";
import { Player } from "../entities/Player";
import { SpaceBackground } from "../fx/SpaceBackground";
import { Scoreboard } from "../hud/Scoreboard";
import { HowToPlay } from "./HowToPlay";

const STATS = [
  { key: "speed", label: "Hız" },
  { key: "shield", label: "Kalkan" },
  { key: "health", label: "Sağlık" },
  { key: "fire", label: "Ateş" },
];

function StatRow({ label, value, color }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statTrack}>
        {Array.from({ length: 5 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.statPip,
              i < value
                ? { backgroundColor: color }
                : styles.statPipOff,
            ]}
          />
        ))}
      </View>
      <Text style={[styles.statNum, { color }]}>{value}</Text>
    </View>
  );
}

export function StartScreen({
  highScore,
  leaderboard = [],
  shipId,
  onSelectShip,
  onStart,
}) {
  const selected = getShip(shipId);
  const [help, setHelp] = useState(false);

  return (
    <View style={styles.overlay}>
      <SpaceBackground />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{GAME_TITLE}</Text>
        <Text style={styles.highScore}>En yüksek: {highScore}</Text>

        <Text style={styles.pickLabel}>GEMİ SEÇ</Text>
        <View style={styles.shipRow}>
          {SHIPS.map((ship) => {
            const on = ship.id === shipId;
            return (
              <Pressable
                key={ship.id}
                onPress={() => onSelectShip(ship.id)}
                style={[styles.shipCard, on && styles.shipCardOn]}
              >
                <Player
                  preview
                  shipId={ship.id}
                  width={PLAYER.width}
                  height={PLAYER.height}
                  x={0}
                  y={0}
                />
                <Text style={[styles.shipName, on && styles.shipNameOn]}>
                  {ship.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.statPanel, { borderColor: selected.body + "99" }]}>
          <Text style={[styles.statTitle, { color: selected.body }]}>
            {selected.name}
          </Text>
          {STATS.map((stat) => (
            <StatRow
              key={stat.key}
              label={stat.label}
              value={selected[stat.key]}
              color={selected.body}
            />
          ))}
        </View>

        <Pressable
          style={[styles.button, { backgroundColor: selected.body }]}
          onPress={() => onStart(shipId)}
        >
          <Text style={styles.buttonText}>Oyuna Başla</Text>
        </Pressable>
        <Pressable style={styles.helpBtn} onPress={() => setHelp(true)}>
          <Text style={styles.helpText}>Nasıl oynanır</Text>
        </Pressable>

        <View style={styles.boardWrap}>
          <Scoreboard entries={leaderboard} />
        </View>
      </ScrollView>
      <HowToPlay visible={help} onClose={() => setHelp(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
  },
  highScore: {
    color: "#fbbf24",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 14,
    fontWeight: "700",
  },
  boardWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 8,
  },
  pickLabel: {
    color: "#cbd5e1",
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 8,
  },
  shipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 14,
    maxWidth: 420,
  },
  shipCard: {
    width: 96,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  shipCardOn: {
    borderColor: "#f8fafc",
    backgroundColor: "rgba(30,41,59,0.85)",
  },
  shipName: {
    marginTop: 8,
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  shipNameOn: {
    color: "#f8fafc",
  },
  statPanel: {
    width: "100%",
    maxWidth: 320,
    marginBottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
  },
  statTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  statLabel: {
    width: 58,
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  statTrack: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  statPip: {
    flex: 1,
    height: 8,
    borderRadius: 3,
  },
  statPipOff: {
    backgroundColor: "rgba(51, 65, 85, 0.7)",
  },
  statNum: {
    width: 14,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  helpBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.45)",
  },
  helpText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "700",
  },
});
