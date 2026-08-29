import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

const WEB_ROWS = [
  { key: "Fare", val: "Gemiyi hareket ettir" },
  { key: "Otomatik", val: "Lazer kendiliğinden ateşler" },
  { key: "Q", val: "PATLAT EMP — mermileri siler, hasar verir" },
  { key: "E", val: "DONMA — zamanı yavaşlatır, buz efekti" },
  { key: "ESC", val: "Duraklat / devam" },
];

const MOBILE_ROWS = [
  { key: "Sürükle", val: "Parmağınla gemiyi götür" },
  { key: "Otomatik", val: "Lazer kendiliğinden ateşler" },
  { key: "PATLAT", val: "Sağ alttaki tuş — EMP patlatır" },
  { key: "ZEUS", val: "Sol alttaki tuş — yıldırımla herkesi yok eder" },
  { key: "Geri", val: "Duraklat / devam" },
];

const DROPS = [
  { icon: "♥", name: "Can" },
  { icon: "◈", name: "Kalkan" },
  { icon: "⚡", name: "Silah" },
  { icon: "◉", name: "Yancı" },
];

function isTouchUi() {
  if (Platform.OS !== "web") return true;
  if (typeof window === "undefined") return false;
  try {
    return (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(hover: none)").matches
    );
  } catch {
    return false;
  }
}

export function HowToPlay({ visible, onClose }) {
  if (!visible) return null;
  const mobile = isTouchUi();
  const rows = mobile ? MOBILE_ROWS : WEB_ROWS;

  return (
    <View style={styles.mask}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        <Text style={styles.title}>Nasıl oynanır</Text>
        <Text style={styles.lead}>
          {mobile
            ? "Parmağınla gemiyi sürükle, düşman dalgalarını temizle, amiral gemisini düşür. Öldürdükçe can, kalkan ve silah düşer."
            : "Düşman dalgalarını temizle, amiral gemisini düşür, aşamaları geç. Öldürdükçe can, kalkan ve silah düşer."}
        </Text>
        {rows.map((row) => (
          <View key={row.key} style={styles.row}>
            <Text style={styles.key}>{row.key}</Text>
            <Text style={styles.val}>{row.val}</Text>
          </View>
        ))}
        <Text style={styles.sub}>Düşmanlar</Text>
        <Text style={styles.hint}>
          Ara sıra mavi kalkanlı gemi çıkar; kalkan bitmeden gemi düşmez.
          Pembe ışıltılı plazma gemileri yavaş yavaş plazma topu atar. 2. aşamadan
          sonra çok nadir kızıl kamikaze gemisi ateş etmez, hızlıca üzerine
          dalar; çarpmazsa ekrandan çıkar. Bazı
          amiral gemileri lazer yerine plazma kullanır. Amiral gemileri havada gezer.
          10. aşamadan itibaren iki amiral gemisi birden gelir. 20. aşamadan sonra
          düşmanlar belirgin şekilde hızlanır.
        </Text>
        <Text style={styles.sub}>Düşenler</Text>
        <View style={styles.drops}>
          {DROPS.map((d) => (
            <Text key={d.name} style={styles.drop}>
              {d.icon} {d.name}
            </Text>
          ))}
        </View>
        <Pressable style={styles.close} onPress={onClose}>
          <Text style={styles.closeText}>Tamam</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mask: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
  },
  card: {
    width: "92%",
    maxWidth: 420,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.45)",
    borderRadius: 16,
    padding: 18,
    zIndex: 41,
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  lead: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  key: {
    minWidth: 78,
    color: "#67e8f9",
    fontSize: 12,
    fontWeight: "800",
  },
  val: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 13,
  },
  sub: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 6,
  },
  hint: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  drops: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  drop: {
    color: "#e2e8f0",
    fontSize: 12,
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  close: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: "#38bdf8",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  closeText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
});
