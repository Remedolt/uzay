import { StyleSheet, Text, View } from "react-native";

export function Scoreboard({ entries = [], title = "Skor Tablosu" }) {
  const rows = entries.slice(0, 5);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>★ {title}</Text>
      {rows.length === 0 ? (
        <Text style={styles.empty}>Henüz kayıt yok — ilk skoru sen yap</Text>
      ) : (
        rows.map((row, i) => (
          <View key={`${row.at}-${i}`} style={styles.row}>
            <Text style={[styles.rank, i === 0 && styles.rankGold]}>
              {i + 1}.
            </Text>
            <View style={styles.mid}>
              <Text style={styles.name} numberOfLines={1}>
                {row.name || "Pilot"}
              </Text>
              <Text style={styles.meta}>
                {row.score} · Aşama {row.level || 1}
              </Text>
            </View>
            {i === 0 ? (
              <Text style={styles.crown}>♛</Text>
            ) : (
              <View style={styles.spacer} />
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.35)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  title: {
    color: "#fbbf24",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  empty: {
    color: "#64748b",
    textAlign: "center",
    fontSize: 13,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(148, 163, 184, 0.2)",
  },
  rank: {
    width: 28,
    color: "#94a3b8",
    fontWeight: "800",
    fontSize: 14,
  },
  rankGold: {
    color: "#fbbf24",
  },
  mid: {
    flex: 1,
  },
  name: {
    color: "#f8fafc",
    fontWeight: "800",
    fontSize: 15,
  },
  meta: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 1,
  },
  crown: {
    color: "#fbbf24",
    fontSize: 16,
  },
  spacer: {
    width: 16,
  },
});