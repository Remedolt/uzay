import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SpaceBackground } from "../fx/SpaceBackground";
import { Scoreboard } from "../hud/Scoreboard";

export function GameOverScreen({
  score,
  level,
  leaderboard = [],
  scoreSaved = false,
  defaultName = "",
  onSave,
  onReplay,
}) {
  const [name, setName] = useState(defaultName || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (defaultName) setName(defaultName);
  }, [defaultName]);

  const handleSave = async () => {
    if (saving || scoreSaved) return;
    setSaving(true);
    try {
      await onSave(name);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <SpaceBackground score={score} level={level} />
      <View style={styles.panel}>
        <Text style={styles.title}>Oyun Bitti</Text>
        <Text style={styles.score}>Skor: {score}</Text>
        <Text style={styles.level}>Ulaşılan aşama: {level}</Text>

        {!scoreSaved ? (
          <>
            <Text style={styles.nameLabel}>İsmini yaz, skoru kaydet</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Pilot adı"
              placeholderTextColor="#64748b"
              maxLength={12}
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.nameInput}
            />
            <Pressable
              style={[styles.button, styles.saveBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.saveText}>Skoru Kaydet</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.boardWrap}>
              <Scoreboard entries={leaderboard} title="Skor Tablosu" />
            </View>
            <Pressable style={styles.button} onPress={onReplay}>
              <Text style={styles.buttonText}>Tekrar Oyna</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    color: "#f87171",
    fontSize: 40,
    fontWeight: "800",
    marginBottom: 12,
  },
  score: {
    color: "#e2e8f0",
    fontSize: 22,
    marginBottom: 6,
  },
  level: {
    color: "#38bdf8",
    fontSize: 16,
    marginBottom: 18,
    fontWeight: "600",
  },
  nameLabel: {
    color: "#cbd5e1",
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  nameInput: {
    width: "100%",
    maxWidth: 280,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
    backgroundColor: "rgba(15,23,42,0.85)",
    color: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },
  boardWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#34d399",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: "#fbbf24",
  },
  saveText: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  buttonText: {
    color: "#052e16",
    fontSize: 18,
    fontWeight: "700",
  },
  diffFooter: {
    marginTop: 16,
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
});
