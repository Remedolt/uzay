import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GAME_TITLE, PLAYER, SHIPS, getShip } from "../../constants/game";
import {
  enterFullscreen,
  fullscreenSupported,
  prefersFullscreenByDefault,
  loadFullscreenPref,
  saveFullscreenPref,
} from "../../web/fullscreen";
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
  leaderboard = [],
  shipId,
  onSelectShip,
  onStart,
  onUnlockAudio,
}) {
  const selected = getShip(shipId);
  const [help, setHelp] = useState(false);
  const [fullscreen, setFullscreen] = useState(prefersFullscreenByDefault);
  const web = Platform.OS === "web";

  useEffect(() => {
    if (!web) return undefined;
    let live = true;
    loadFullscreenPref().then((on) => {
      if (live) setFullscreen(on);
    });
    return () => {
      live = false;
    };
  }, [web]);

  const toggleFullscreen = () => {
    const next = !fullscreen;
    setFullscreen(next);
    saveFullscreenPref(next);
  };

  const start = () => {
    try {
      onUnlockAudio?.();
    } catch {
    }
    onStart(shipId);
    if (web && fullscreen) {
      setTimeout(() => enterFullscreen(), 0);
    }
  };

  return (
    <View style={styles.overlay}>
      <SpaceBackground />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{GAME_TITLE}</Text>

        <View style={styles.shipRow}>
          {SHIPS.map((ship) => {
            const on = ship.id === shipId;
            return (
              <Pressable
                key={ship.id}
                onPress={() => {
                  onUnlockAudio?.();
                  onSelectShip(ship.id);
                }}
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
          onPress={start}
        >
          <Text style={styles.buttonText}>Oyuna Başla</Text>
        </Pressable>
        {web ? (
          <Pressable style={styles.fsRow} onPress={toggleFullscreen}>
            <View style={[styles.fsSwitch, fullscreen && styles.fsSwitchOn]}>
              <View style={[styles.fsKnob, fullscreen && styles.fsKnobOn]} />
            </View>
            <View style={styles.fsCopy}>
              <Text style={styles.fsTitle}>Tam ekran</Text>
              <Text style={styles.fsHint}>
                {fullscreen
                  ? fullscreenSupported()
                    ? "Oyun başlayınca tarayıcı çubuğu gizlenir"
                    : "Mümkünse başlayınca ekranı doldurur"
                  : "Kapalı — tarayıcı çubukları görünür"}
              </Text>
            </View>
          </Pressable>
        ) : null}
        {web ? null : (
          <Pressable
            style={styles.helpBtn}
            onPress={() => {
              onUnlockAudio?.();
              setHelp(true);
            }}
          >
            <Text style={styles.helpText}>Nasıl oynanır</Text>
          </Pressable>
        )}

        <View style={styles.boardWrap}>
          <Scoreboard entries={leaderboard} />
        </View>
      </ScrollView>
      {web ? null : (
        <HowToPlay visible={help} onClose={() => setHelp(false)} />
      )}
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
    marginBottom: 18,
  },
  boardWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 8,
  },
  shipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
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
  fsRow: {
    marginTop: 14,
    width: "100%",
    maxWidth: 320,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.35)",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
  },
  fsSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(51, 65, 85, 0.9)",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  fsSwitchOn: {
    backgroundColor: "#22d3ee",
  },
  fsKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  fsKnobOn: {
    alignSelf: "flex-end",
    backgroundColor: "#082f49",
  },
  fsCopy: {
    flex: 1,
  },
  fsTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
  },
  fsHint: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
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
