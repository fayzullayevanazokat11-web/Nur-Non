// "Ishlab chiqarish" (assortiment) — non qo'shish va tahrirlash.
import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { Modal } from "../../src/components/Modal";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { C, T, S, R } from "../../src/theme";
import { formatSom, getQopTannarx } from "../../src/logic/hisob";

const BOSH_FORMA = { nom: "", narx: "", tannarx: "", nonSoni: "" };

export default function IshlabChiqarish() {
  const { nonlar, setNonlar, ishchilar, mahsulotNarxlari } = useApp();

  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirId, setTahrirId] = useState(null);   // null = yangi, aks holda tahrir
  const [tahrirOz, setTahrirOz] = useState(false);  // tahrirlanayotgan non o'zimiznikimi
  const [forma, setForma] = useState(BOSH_FORMA);

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));

  const ochYangi = () => { setForma(BOSH_FORMA); setTahrirId(null); setTahrirOz(false); setModalOchiq(true); };
  const ochTahrir = (non) => {
    const oz = non.ozIshlab !== false;
    const tannarx = oz ? "" : String(Math.max(0, (parseFloat(non.narx) || 0) - (parseFloat(non.tashqariFoyda) || 0)));
    setForma({ nom: non.nom, narx: String(non.narx || ""), tannarx, nonSoni: String(non.nonSoni || "") });
    setTahrirId(non.id); setTahrirOz(oz); setModalOchiq(true);
  };
  const yopModal = () => setModalOchiq(false);

  const saqla = () => {
    if (!forma.nom.trim() || !forma.narx) {
      Alert.alert("Maydonlar to'liq emas", "Iltimos, non nomi va sotuv narxini kiriting.");
      return;
    }
    const narx = parseFloat(forma.narx) || 0;
    if (tahrirId) {
      // Tahrirlash — boshqa maydonlar (mahsulotlar, ozIshlab) saqlanadi
      setNonlar((prev) => prev.map((n) => {
        if (n.id !== tahrirId) return n;
        if (n.ozIshlab !== false) {
          return { ...n, nom: forma.nom.trim(), narx, nonSoni: parseFloat(forma.nonSoni) || 0 };
        }
        const tannarx = parseFloat(forma.tannarx) || 0;
        return { ...n, nom: forma.nom.trim(), narx, tashqariFoyda: Math.max(0, narx - tannarx) };
      }));
    } else {
      const tannarx = parseFloat(forma.tannarx) || 0;
      setNonlar((prev) => [...prev, {
        id: Date.now(), nom: forma.nom.trim(), narx, nonSoni: 0,
        ozIshlab: false, tashqariFoyda: Math.max(0, narx - tannarx), mahsulotlar: [],
      }]);
    }
    yopModal();
  };

  const ochirNon = (id) =>
    Alert.alert("O'chirish", "Bu non turini o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => setNonlar((p) => p.filter((n) => n.id !== id)) },
    ]);

  const aktivIshchi = (ishchilar || []).filter((w) => w.holat === "Aktiv").length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Assortiment" title="Ishlab chiqarish" subtitle={`${nonlar.length} xil non · ${aktivIshchi} aktiv xodim`} />

        <Btn onPress={ochYangi}>Yangi non turi kiritish</Btn>
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
              <Card key={non.id} style={styles.item}>
                <View style={styles.cardHead}>
                  <View style={styles.flex1}>
                    <Text style={styles.nonNom}>{non.nom}</Text>
                    <View style={[styles.chip, { backgroundColor: (oz ? C.accent : C.blue) + "16" }]}>
                      <Text style={[styles.chipTxt, { color: oz ? C.accent : C.blue }]}>{oz ? "O'zimizniki" : "Tashqaridan"}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActs}>
                    <Pressable accessibilityLabel="Tahrirlash" onPress={() => ochTahrir(non)} hitSlop={8} style={styles.act}>
                      <Ionicons name="create-outline" size={18} color={C.accent} />
                    </Pressable>
                    <Pressable accessibilityLabel="O'chirish" onPress={() => ochirNon(non.id)} hitSlop={8} style={styles.act}>
                      <Ionicons name="trash-outline" size={18} color={C.red} />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Row label="Sotuv narxi" value={`${formatSom(non.narx)} so'm`} valueColor={C.accent} bold />
                  {oz ? (
                    <>
                      <Row label="1 qop normasi" value={`${non.nonSoni} dona`} />
                      <Row label="1 qop tannarxi" value={`${formatSom(tannarx)} so'm`} valueColor={C.red} />
                      <Row label="Ingredientlar" value={`${(non.mahsulotlar || []).length} xil`} last />
                    </>
                  ) : (
                    <Row label="Tannarxi" value={`${formatSom(tannarx)} so'm`} valueColor={C.red} last />
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Qo'shish / Tahrirlash modali */}
      <Modal modalVisible={modalOchiq} onClose={yopModal}>
        <Text style={styles.modalTitle}>{tahrirId ? "Nonni tahrirlash" : "Yangi non turi"}</Text>

        <Text style={styles.inputLabel}>Non nomi *</Text>
        <TextInput value={forma.nom} onChangeText={(v) => yangila("nom", v)} placeholder="Masalan: Kulcha" placeholderTextColor={C.muted} style={styles.input} />

        <Text style={styles.inputLabel}>Sotuv narxi (so'm) *</Text>
        <TextInput value={forma.narx} onChangeText={(v) => yangila("narx", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

        {tahrirId && tahrirOz ? (
          <>
            <Text style={styles.inputLabel}>1 qop normasi (dona)</Text>
            <TextInput value={forma.nonSoni} onChangeText={(v) => yangila("nonSoni", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
            <Text style={styles.hint}>Tannarx ingredientlardan hisoblanadi (Ombor narxlari)</Text>
          </>
        ) : (
          <>
            <Text style={styles.inputLabel}>Tannarxi (so'm)</Text>
            <TextInput value={forma.tannarx} onChangeText={(v) => yangila("tannarx", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
          </>
        )}

        <View style={styles.gap14} />
        <View style={styles.modalRow}>
          <View style={styles.flex1}><Btn secondary onPress={yopModal}>Bekor</Btn></View>
          <View style={styles.flex1}><Btn onPress={saqla}>Saqlash</Btn></View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Row({ label, value, valueColor = C.text, bold = false, last = false }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor, fontWeight: bold ? "800" : "600" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: S[4], paddingBottom: S[7] },
  gap14:     { height: S[4] },
  item:      { marginBottom: S[3], padding: 0 },
  cardHead:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.panel, paddingVertical: S[3], paddingHorizontal: S[4], borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.borderSoft },
  cardBody:  { paddingVertical: S[3], paddingHorizontal: S[4] },
  flex1:     { flex: 1 },
  nonNom:    { fontSize: T.lg, fontWeight: "800", color: C.text },
  chip:      { alignSelf: "flex-start", paddingVertical: 3, paddingHorizontal: 9, borderRadius: R.pill, marginTop: 5 },
  chipTxt:   { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
  cardActs:  { flexDirection: "row", gap: S[1] },
  act:       { padding: 6 },
  row:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[2] },
  rowLast:   { marginBottom: 0 },
  label:     { fontSize: T.sm, color: C.sub },
  value:     { fontSize: T.sm },
  muted:     { fontSize: T.sm, color: C.muted },

  // Modal
  modalTitle: { fontSize: T.lg, fontWeight: "800", color: C.text, marginBottom: S[4] },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface, marginBottom: S[3] },
  hint: { fontSize: 11, color: C.muted, marginTop: -6, marginBottom: S[2] },
  modalRow: { flexDirection: "row", gap: S[3] },
});
