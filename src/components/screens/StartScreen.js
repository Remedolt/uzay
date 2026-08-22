import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GAME_TITLE, PLAYER, SHIPS } from "../../constants/game";
import { Player } from "../entities/Player";
import { SpaceBackground } from "../fx/SpaceBackground";
import { Scoreboard } from "../hud/Scoreboard";

export function StartScreen({
  highScore,
  leaderboard = [],
  shipId,
  onSelectShip,
  onStart,
}) {
  return (
    <View style={styles.overlay}>
      <SpaceBackground />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{GAME_TITLE}</Text>
        <Text style={styles.subtitle}>Uzay gemini seç, düşman filosunu durdur</Text>
        <Text style={styles.highScore}>En yüksek: {highScore}</Text>

        <Text style={styles.pickLabel}>Gemi seç</Text>
        <View style={styles.shipRow}>
          {SHIPS.map((ship) => {
            const selected = ship.id === shipId;
            return (
              <Pressable
                key={ship.id}
                onPress={() => onSelectShip(ship.id)}
                style={[styles.shipCard, selected && styles.shipCardOn]}
              >
                <Player
                  preview
                  shipId={ship.id}
                  width={PLAYER.width}
                  height={PLAYER.height}
                  x={0}
                  y={0}
                />
                <Text style={[styles.shipName, selected && styles.shipNameOn]}>
                  {ship.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: (SHIPS.find((s) => s.id === shipId) || SHIPS[0])
                .body,
            },
          ]}
          onPress={() => onStart(shipId)}
        >
          <Text style={styles.buttonText}>Oyuna Başla</Text>
        </Pressable>
        <Text style={styles.hint}>
          Aşama ilerledikçe boss değişir; yüksek aşamalarda füze de atar.
          Gemiler 2–3’lü dalgalar halinde gelir.
        </Text>

        <View style={styles.boardWrap}>
          <Scoreboard entries={leaderboard} />
        </View>
      </ScrollView>
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
  subtitle: {
    color: "#94a3b8",
    marginTop: 8,
    marginBottom: 10,
    textAlign: "center",
  },
  highScore: {
    color: "#fbbf24",
    fontSize: 16,
    marginBottom: 12,
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
    textTransform: "uppercase",
    marginBottom: 8,
  },
  diffRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  diffBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.3)",
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  diffBtnOn: {
    borderColor: "#fbbf24",
    backgroundColor: "rgba(251, 191, 36, 0.18)",
  },
  diffText: {
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: 13,
  },
  diffTextOn: {
    color: "#fde68a",
  },
  shipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 22,
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
  hint: {
    color: "#64748b",
    marginTop: 18,
    textAlign: "center",
    maxWidth: 340,
    lineHeight: 20,
  },
});
