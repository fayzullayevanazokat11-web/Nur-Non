// "Ombor" ekrani — mavjud zaxira (qop / plastik quti ko'rinishida).
import { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { C, T } from "../../src/theme";
import { omborBalans, zaxiraMatni } from "../../src/logic/hisob";

export default function Ombor() {
  const { omborlar } = useApp();

  const balans = useMemo(() => omborBalans(omborlar), [omborlar]);
  const setSoni = (omborlar || []).filter((h) => h.turi === "yangiset").length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Zaxira</Text>
        <Text style={styles.title}>Ombor hisoboti</Text>
        <Text style={styles.subtitle}>{setSoni} ta set kiritilgan</Text>

        <View style={styles.gap14} />
        <Card accent>
          <Text style={styles.cardTitle}>📦 Mavjud zaxira</Text>
          <Text style={styles.muted}>Set kirimlari − tasdiqlangan xarajat</Text>
          <View style={styles.gap10} />
          <View style={styles.grid}>
            {balans.map((b) => {
              const matn = zaxiraMatni(b.id, b.qiymat, b.birlik);
              const color = b.qiymat > 0 ? C.green : b.qiymat < 0 ? C.red : C.muted;
              return (
                <View key={b.id} style={styles.cell}>
                  <Text style={styles.cellNom} numberOfLines={1}>{b.emoji} {b.nom}</Text>
                  <Text style={[styles.cellVal, { color }]} numberOfLines={1}>{matn}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={styles.gap14} />
        <Btn color={C.blue} onPress={() => Alert.alert("Tez orada", "Yangi set kiritish formasi keyingi bosqichda.")}>
          + Yangi set kiritish
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 16, paddingBottom: 32 },
  eyebrow:   { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  title:     { fontSize: T.xl, fontWeight: "900", color: C.text, marginTop: 2 },
  subtitle:  { fontSize: T.sm, color: C.muted, marginTop: 2 },
  gap10:     { height: 10 },
  gap14:     { height: 14 },
  cardTitle: { fontSize: T.md, fontWeight: "800", color: C.text, marginBottom: 4 },
  muted:     { fontSize: T.sm, color: C.sub },
  grid:      { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cell:      { width: "48.5%", backgroundColor: C.surface, borderWidth: 1, borderColor: C.borderSoft, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 9, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cellNom:   { fontSize: 9, color: C.sub, fontWeight: "700", flexShrink: 1 },
  cellVal:   { fontSize: T.xs, fontWeight: "800", marginLeft: 4 },
});
