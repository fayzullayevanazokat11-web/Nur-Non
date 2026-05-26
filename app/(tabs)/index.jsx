// "Markaz" ekrani — kunlik ko'rsatkichlar + Qarz / Optom (summa) modallari.
import { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { Modal } from "../../src/components/Modal";
import { C, T } from "../../src/theme";
import { hisoblaKunlik, formatSom, qarzJami, optomJami } from "../../src/logic/hisob";

const BOSH_FORMA = { ism: "", summa: "", izoh: "" };

export default function Markaz() {
  const {
    nonlar, ishchilar, qarzlar, setQarzlar, optomlar, setOptomlar,
    ozIshlabQoplar, tashqariSonlar, sotilmaganNon, mahsulotNarxlari,
  } = useApp();

  const stats = useMemo(
    () => hisoblaKunlik({ nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari }),
    [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari]
  );

  // Kartochkalar real qiymatlarni ko'rsatadi
  const qarz = useMemo(() => qarzJami(qarzlar), [qarzlar]);
  const optom = useMemo(() => optomJami(optomlar), [optomlar]);

  // Universal modal: tur = "qarz" | "optom" | null
  const [modalTur, setModalTur] = useState(null);
  const [forma, setForma] = useState(BOSH_FORMA);

  const ochModal = (tur) => { setForma(BOSH_FORMA); setModalTur(tur); };
  const yopModal = () => setModalTur(null);
  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));

  // Saqlash — tegishli state (setQarzlar / setOptomlar) yangilanadi
  const saqla = () => {
    if (!forma.ism.trim() || !forma.summa) {
      Alert.alert("Maydonlar to'liq emas", "Iltimos, ism va summani kiriting.");
      return;
    }
    const summa = parseFloat(forma.summa) || 0;
    const sana = new Date().toISOString().split("T")[0];
    if (modalTur === "qarz") {
      setQarzlar((prev) => [
        ...prev,
        { id: Date.now(), ism: forma.ism.trim(), summa, izoh: forma.izoh.trim(), sana, tolangan: false, tolanganVaqt: null },
      ]);
    } else {
      setOptomlar((prev) => [
        ...prev,
        { id: Date.now(), ism: forma.ism.trim(), summa, izoh: forma.izoh.trim(), sana, vaqt: Date.now() },
      ]);
    }
    yopModal();
  };

  const qarzModal = modalTur === "qarz";
  const akcent = qarzModal ? C.red : C.blue;

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
        </Card>

        <Text style={styles.section}>QARZ / OPTOM KO'RSATKICHLARI</Text>
        <View style={styles.row}>
          <Card style={styles.half}>
            <Text style={styles.tileLabel}>🏷️ Qarz</Text>
            <Text style={[styles.summa, { color: C.red }]} numberOfLines={1}>{formatSom(qarz.summa)} so'm</Text>
            <Text style={styles.muted}>{qarz.soni} ta faol qarz</Text>
            <View style={styles.gap10} />
            <Btn color={C.red} onPress={() => ochModal("qarz")}>+ Qarz qo'shish</Btn>
          </Card>
          <Card style={styles.half}>
            <Text style={styles.tileLabel}>📦 Optom</Text>
            <Text style={[styles.summa, { color: C.blue }]} numberOfLines={1}>{formatSom(optom.summa)} so'm</Text>
            <Text style={styles.muted}>{optom.soni} ta savdo</Text>
            <View style={styles.gap10} />
            <Btn color={C.blue} onPress={() => ochModal("optom")}>+ Xarid qo'shish</Btn>
          </Card>
        </View>
      </ScrollView>

      {/* Universal Qarz / Optom modali */}
      <Modal modalVisible={modalTur !== null} onClose={yopModal}>
        <Text style={styles.modalTitle}>{qarzModal ? "🏷️ Yangi qarz" : "📦 Yangi optom savdo"}</Text>

        <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.inputLabel}>{qarzModal ? "Qarz oluvchi *" : "Xaridor *"}</Text>
          <TextInput
            value={forma.ism}
            onChangeText={(v) => yangila("ism", v)}
            placeholder="Ism familiya"
            placeholderTextColor={C.muted}
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Summa (so'm) *</Text>
          <TextInput
            value={forma.summa}
            onChangeText={(v) => yangila("summa", v)}
            placeholder="0"
            placeholderTextColor={C.muted}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Izoh</Text>
          <TextInput
            value={forma.izoh}
            onChangeText={(v) => yangila("izoh", v)}
            placeholder="Qo'shimcha izoh (ixtiyoriy)"
            placeholderTextColor={C.muted}
            multiline
            style={[styles.input, styles.inputMulti]}
          />
        </ScrollView>

        <View style={styles.gap12} />
        <View style={styles.modalRow}>
          <View style={styles.half}><Btn secondary onPress={yopModal}>Bekor</Btn></View>
          <View style={styles.half}><Btn color={akcent} onPress={saqla}>✓ Saqlash</Btn></View>
        </View>
      </Modal>
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
  summa:     { fontSize: 20, fontWeight: "900" },
  gap10:     { height: 10 },
  gap12:     { height: 12 },

  // Modal
  modalTitle: { fontSize: T.lg, fontWeight: "900", color: C.text, marginBottom: 12 },
  formScroll: { maxHeight: 360 },
  inputLabel: { fontSize: T.xs, color: C.muted, fontWeight: "700", marginBottom: 6, marginTop: 4, letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: T.md,
    color: C.text,
    backgroundColor: C.surface,
  },
  inputMulti: { minHeight: 64, textAlignVertical: "top" },
  modalRow:  { flexDirection: "row", gap: 10 },
});
