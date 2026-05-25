// "Markaz" ekrani — kunlik ko'rsatkichlar.
import { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { C, T } from "../../src/theme";
import { hisoblaKunlik, formatSom } from "../../src/logic/hisob";

export default function Markaz() {
  const {
    nonlar, ishchilar, qarzlar, optomlar,
    ozIshlabQoplar, tashqariSonlar, sotilmaganNon, mahsulotNarxlari,
  } = useApp();

  const stats = useMemo(
    () => hisoblaKunlik({ nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari }),
    [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari]
  );

  const faolQarz = (qarzlar || []).filter((q) => !q.tolangan).length;
  const optomSoni = (optomlar || []).length;

  const tezOrada = () => Alert.alert("Tez orada", "Bu bo'lim keyingi bosqichda qo'shiladi.");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Nonvoyxona №1</Text>
        <Text style={styles.title}>Bosh ko'rsatkichlar</Text>
        <Text style={styles.subtitle}>Bugungi ish ko'rsatkichlari</Text>

        <View style={styles.statsRow}>
          <StatTile label="Bugungi sof foyda" unit="so'm" value={formatSom(stats.sofFoyda)} color={stats.sofFoyda >= 0 ? C.green : C.red} />
          <StatTile label="Sotilgan non" unit="dona" value={String(stats.sotilganNon)} color={C.text} />
          <StatTile label="Kunlik qop" unit="qop" value={String(stats.jamiQop)} color={C.accent} />
        </View>

        <Card accent style={styles.block}>
          <Text style={styles.cardTitle}>📦 Kunlik qop hisobi</Text>
          <Text style={styles.muted}>{nonlar.length} xil non · {stats.jamiNon} dona ishlab chiqarildi</Text>
          <View style={styles.gap12} />
          <Btn onPress={tezOrada}>+ Ma'lumot qo'shish</Btn>
        </Card>

        <Text style={styles.section}>QARZ / OPTOM KO'RSATKICHLARI</Text>
        <View style={styles.row}>
          <Card style={styles.half}>
            <Text style={styles.tileLabel}>🏷️ Qarz</Text>
            <Text style={styles.bigNum}>{faolQarz}</Text>
            <Text style={styles.muted}>ta faol qarz</Text>
            <View style={styles.gap10} />
            <Btn color={C.red} onPress={tezOrada}>+ Qarz qo'shish</Btn>
          </Card>
          <Card style={styles.half}>
            <Text style={styles.tileLabel}>📦 Optom</Text>
            <Text style={[styles.bigNum, { color: C.blue }]}>{optomSoni}</Text>
            <Text style={styles.muted}>ta savdo</Text>
            <View style={styles.gap10} />
            <Btn color={C.blue} onPress={tezOrada}>+ Xarid qo'shish</Btn>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ label, value, unit, color }) {
  const len = String(value || "").length;
  const valSize = len > 9 ? 14 : len > 7 ? 16 : len > 5 ? 18 : 20;
  return (
    <Card style={styles.statTile}>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={[styles.statValue, { color, fontSize: valSize }]} numberOfLines={1}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 16, paddingBottom: 32 },
  eyebrow:   { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  title:     { fontSize: T.xl, fontWeight: "900", color: C.text, marginTop: 2 },
  subtitle:  { fontSize: T.sm, color: C.muted, marginTop: 2, marginBottom: 16 },
  statsRow:  { flexDirection: "row", gap: 8, marginBottom: 16 },
  statTile:  { flex: 1, paddingVertical: 10, paddingHorizontal: 9 },
  statLabel: { fontSize: 9, color: C.muted, fontWeight: "700", letterSpacing: 0.6, marginBottom: 5 },
  statValue: { fontWeight: "900" },
  statUnit:  { fontSize: 10, color: C.muted, marginTop: 2 },
  block:     { marginBottom: 16 },
  cardTitle: { fontSize: T.md, fontWeight: "800", color: C.text, marginBottom: 4 },
  muted:     { fontSize: T.sm, color: C.sub },
  section:   { fontSize: T.xs, color: C.muted, fontWeight: "700", letterSpacing: 1, marginBottom: 10 },
  row:       { flexDirection: "row", gap: 12 },
  half:      { flex: 1 },
  tileLabel: { fontSize: T.xs, color: C.sub, fontWeight: "700", marginBottom: 6 },
  bigNum:    { fontSize: 30, fontWeight: "900", color: C.text },
  gap10:     { height: 10 },
  gap12:     { height: 12 },
});
