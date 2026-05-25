// "Ishlab chiqarish" (assortiment) ekrani.
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { C, T } from "../../src/theme";
import { formatSom, getQopTannarx } from "../../src/logic/hisob";

export default function IshlabChiqarish() {
  const { nonlar, setNonlar, ishchilar, mahsulotNarxlari } = useApp();

  // setNonlar → ro'yxat darhol yangilanadi (reaktivlik)
  const ochirNon = (id) =>
    Alert.alert("O'chirish", "Bu non turini o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => setNonlar((p) => p.filter((n) => n.id !== id)) },
    ]);

  const aktivIshchi = (ishchilar || []).filter((w) => w.holat === "Aktiv").length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Assortiment</Text>
        <Text style={styles.title}>Ishlab chiqarish</Text>
        <Text style={styles.subtitle}>{nonlar.length} xil non · {aktivIshchi} aktiv xodim</Text>

        <View style={styles.gap14} />
        <Btn onPress={() => Alert.alert("Tez orada", "Non qo'shish formasi keyingi bosqichda.")}>+ Yangi qo'shish</Btn>
        <View style={styles.gap14} />

        {nonlar.length === 0 ? (
          <Card><Text style={styles.muted}>Hali non turi qo'shilmagan</Text></Card>
        ) : (
          nonlar.map((non) => {
            const oz = non.ozIshlab !== false;
            const tannarx = oz ? getQopTannarx(non, mahsulotNarxlari) : 0;
            return (
              <Card key={non.id} accent={oz} style={styles.item}>
                <View style={styles.rowBetween}>
                  <View style={styles.flex1}>
                    <Text style={styles.nonNom}>{non.nom}</Text>
                    <Text style={styles.badge}>{oz ? "🏭 O'zimizniki" : "📦 Tashqaridan"}</Text>
                  </View>
                  <Pressable onPress={() => ochirNon(non.id)} hitSlop={8} style={styles.del}>
                    <Ionicons name="trash-outline" size={18} color={C.red} />
                  </Pressable>
                </View>
                <View style={styles.divider} />
                <Row label="Sotuv narxi" value={`${formatSom(non.narx)} so'm`} valueColor={C.accent} bold />
                {oz && (
                  <>
                    <Row label="1 qop normasi" value={`${non.nonSoni} dona`} />
                    <Row label="1 qop tannarxi" value={`${formatSom(tannarx)} so'm`} valueColor={C.red} />
                    <Row label="Ingredientlar" value={`${(non.mahsulotlar || []).length} xil`} />
                  </>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, valueColor = C.text, bold = false }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor, fontWeight: bold ? "900" : "700" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 16, paddingBottom: 32 },
  eyebrow:   { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  title:     { fontSize: T.xl, fontWeight: "900", color: C.text, marginTop: 2 },
  subtitle:  { fontSize: T.sm, color: C.muted, marginTop: 2 },
  gap14:     { height: 14 },
  item:      { marginBottom: 12 },
  rowBetween:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  flex1:     { flex: 1 },
  nonNom:    { fontSize: T.lg, fontWeight: "900", color: C.text },
  badge:     { fontSize: T.xs, color: C.sub, fontWeight: "700", marginTop: 2 },
  del:       { padding: 6 },
  divider:   { height: 1, backgroundColor: C.border, marginVertical: 8 },
  row:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  label:     { fontSize: T.sm, color: C.sub },
  value:     { fontSize: T.sm },
  muted:     { fontSize: T.sm, color: C.muted },
});
