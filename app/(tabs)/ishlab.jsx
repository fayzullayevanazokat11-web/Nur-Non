// "Ishlab chiqarish" (assortiment) ekrani — Modal orqali non qo'shish.
import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { Modal } from "../../src/components/Modal";
import { C, T } from "../../src/theme";
import { formatSom, getQopTannarx } from "../../src/logic/hisob";

const BOSH_FORMA = { nom: "", narx: "", tannarx: "" };

export default function IshlabChiqarish() {
  const { nonlar, setNonlar, ishchilar, mahsulotNarxlari } = useApp();

  const [modalOchiq, setModalOchiq] = useState(false);
  const [forma, setForma] = useState(BOSH_FORMA);

  const ochModal = () => { setForma(BOSH_FORMA); setModalOchiq(true); };
  const yopModal = () => setModalOchiq(false);
  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));

  // Saqlash — setNonlar orqali yangi non qo'shiladi (ro'yxat darhol yangilanadi)
  const saqla = () => {
    if (!forma.nom.trim() || !forma.narx) {
      Alert.alert("Maydonlar to'liq emas", "Iltimos, non nomi va sotuv narxini kiriting.");
      return;
    }
    const narx = parseFloat(forma.narx) || 0;
    const tannarx = parseFloat(forma.tannarx) || 0;
    const yangiNon = {
      id: Date.now(),
      nom: forma.nom.trim(),
      narx,
      nonSoni: 0,
      ozIshlab: false, // qo'lda kiritilgan — retseptsiz
      tashqariFoyda: Math.max(0, narx - tannarx), // narx − tannarx = bittadan foyda
      mahsulotlar: [],
    };
    setNonlar((prev) => [...prev, yangiNon]);
    yopModal();
  };

  // setNonlar → ro'yxat darhol yangilanadi
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
        <Btn onPress={ochModal}>+ Yangi non turi kiritish</Btn>
        <View style={styles.gap14} />

        {nonlar.length === 0 ? (
          <Card><Text style={styles.muted}>Hali non turi qo'shilmagan</Text></Card>
        ) : (
          nonlar.map((non) => {
            const oz = non.ozIshlab !== false;
            const tannarx = oz
              ? getQopTannarx(non, mahsulotNarxlari)
              : Math.max(0, (parseFloat(non.narx) || 0) - (parseFloat(non.tashqariFoyda) || 0));
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
                {oz ? (
                  <>
                    <Row label="1 qop normasi" value={`${non.nonSoni} dona`} />
                    <Row label="1 qop tannarxi" value={`${formatSom(tannarx)} so'm`} valueColor={C.red} />
                    <Row label="Ingredientlar" value={`${(non.mahsulotlar || []).length} xil`} />
                  </>
                ) : (
                  <Row label="Tannarxi" value={`${formatSom(tannarx)} so'm`} valueColor={C.red} />
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Yangi non kiritish modali */}
      <Modal modalVisible={modalOchiq} onClose={yopModal}>
        <Text style={styles.modalTitle}>📦 Yangi non turi</Text>

        <Text style={styles.inputLabel}>Non nomi *</Text>
        <TextInput
          value={forma.nom}
          onChangeText={(v) => yangila("nom", v)}
          placeholder="Masalan: Kulcha"
          placeholderTextColor={C.muted}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Sotuv narxi (so'm) *</Text>
        <TextInput
          value={forma.narx}
          onChangeText={(v) => yangila("narx", v)}
          placeholder="0"
          placeholderTextColor={C.muted}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Tannarxi (so'm)</Text>
        <TextInput
          value={forma.tannarx}
          onChangeText={(v) => yangila("tannarx", v)}
          placeholder="0"
          placeholderTextColor={C.muted}
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={styles.gap14} />
        <View style={styles.modalRow}>
          <View style={styles.flex1}>
            <Btn secondary onPress={yopModal}>Bekor</Btn>
          </View>
          <View style={styles.flex1}>
            <Btn onPress={saqla}>✓ Saqlash</Btn>
          </View>
        </View>
      </Modal>
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

  // Modal
  modalTitle: { fontSize: T.lg, fontWeight: "900", color: C.text, marginBottom: 14 },
  inputLabel: { fontSize: T.xs, color: C.muted, fontWeight: "700", marginBottom: 6, letterSpacing: 0.4 },
  input: {
    borderWidth: 1,
    borderColor: C.accent,      // C.accent rangida border
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: T.md,
    color: C.text,
    backgroundColor: C.surface,
    marginBottom: 12,
  },
  modalRow: { flexDirection: "row", gap: 10 },
});
