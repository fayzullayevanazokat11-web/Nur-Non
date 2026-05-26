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
import { ExpandableCard } from "../../src/components/ExpandableCard";
import { C, T, S, R } from "../../src/theme";
import { formatSom, getQopTannarx, getIngNarx } from "../../src/logic/hisob";

const BOSH_FORMA = { nom: "", narx: "", tannarx: "", nonSoni: "", mahsulotlar: [] };

export default function IshlabChiqarish() {
  const { nonlar, setNonlar, ishchilar, mahsulotNarxlari } = useApp();

  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirId, setTahrirId] = useState(null);   // null = yangi, aks holda tahrir
  const [tahrirOz, setTahrirOz] = useState(false);  // tahrirlanayotgan non o'zimiznikimi
  const [forma, setForma] = useState(BOSH_FORMA);

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const yangilaIng = (id, miqdor) =>
    setForma((p) => ({ ...p, mahsulotlar: p.mahsulotlar.map((m) => (m.id === id ? { ...m, miqdor } : m)) }));

  const ochYangi = () => { setForma(BOSH_FORMA); setTahrirId(null); setTahrirOz(false); setModalOchiq(true); };
  const ochTahrir = (non) => {
    const oz = non.ozIshlab !== false;
    const tannarx = oz ? "" : String(Math.max(0, (parseFloat(non.narx) || 0) - (parseFloat(non.tashqariFoyda) || 0)));
    setForma({
      nom: non.nom, narx: String(non.narx || ""), tannarx, nonSoni: String(non.nonSoni || ""),
      mahsulotlar: oz ? (non.mahsulotlar || []).map((m) => ({ ...m, miqdor: String(m.miqdor ?? "") })) : [],
    });
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
          return {
            ...n, nom: forma.nom.trim(), narx, nonSoni: parseFloat(forma.nonSoni) || 0,
            mahsulotlar: (forma.mahsulotlar || []).map((m) => ({ ...m, miqdor: parseFloat(m.miqdor) || 0 })),
          };
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
  const formaTannarx = (forma.mahsulotlar || []).reduce((s, m) => s + getIngNarx(m, mahsulotNarxlari), 0);

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
              <ExpandableCard
                key={non.id}
                style={styles.item}
                header={
                  <View>
                    <Text style={styles.nonNom}>{non.nom}</Text>
                    <View style={[styles.chip, { backgroundColor: (oz ? C.accent : C.blue) + "16" }]}>
                      <Text style={[styles.chipTxt, { color: oz ? C.accent : C.blue }]}>{oz ? "O'zimizniki" : "Tashqaridan"}</Text>
                    </View>
                  </View>
                }
              >
                <Row label="Sotuv narxi" value={`${formatSom(non.narx)} so'm`} valueColor={C.accent} bold />
                {oz ? (
                  <>
                    <Row label="1 qop normasi" value={`${non.nonSoni} dona`} />
                    <Row label="1 qop tannarxi" value={`${formatSom(tannarx)} so'm`} valueColor={C.red} bold last />
                    <View style={styles.ingWrap}>
                      <Text style={styles.ingHead}>INGREDIENTLAR ({(non.mahsulotlar || []).length})</Text>
                      {(non.mahsulotlar || []).map((m) => (
                        <View key={m.id} style={styles.ingRow}>
                          <Text style={styles.ingNom} numberOfLines={1}>{m.emoji} {m.nom}</Text>
                          <Text style={styles.ingMiqdor}>{m.miqdor} {m.birlik}</Text>
                          <Text style={styles.ingNarx}>{formatSom(getIngNarx(m, mahsulotNarxlari))} so'm</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Row label="Tannarxi" value={`${formatSom(tannarx)} so'm`} valueColor={C.red} last />
                )}
                <View style={styles.bodyActions}>
                  <Pressable accessibilityLabel="Tahrirlash" onPress={() => ochTahrir(non)} hitSlop={8} style={styles.actBtn}>
                    <Ionicons name="create-outline" size={16} color={C.accent} />
                    <Text style={[styles.actTxt, { color: C.accent }]}> Tahrirlash</Text>
                  </Pressable>
                  <Pressable accessibilityLabel="O'chirish" onPress={() => ochirNon(non.id)} hitSlop={8} style={styles.actBtn}>
                    <Ionicons name="trash-outline" size={16} color={C.red} />
                    <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                  </Pressable>
                </View>
              </ExpandableCard>
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

            <Text style={styles.inputLabel}>Ingredientlar (1 qopga)</Text>
            <ScrollView style={styles.ingScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {(forma.mahsulotlar || []).map((m) => (
                <View key={m.id} style={styles.ingEditRow}>
                  <Text style={styles.ingEditNom} numberOfLines={1}>{m.emoji} {m.nom}</Text>
                  <TextInput
                    value={String(m.miqdor)}
                    onChangeText={(v) => yangilaIng(m.id, v)}
                    placeholder="0"
                    placeholderTextColor={C.muted}
                    keyboardType="numeric"
                    style={styles.ingInput}
                  />
                  <Text style={styles.ingUnit}>{m.birlik}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.ingTotal}>
              <Text style={styles.ingTotalLabel}>1 qop tannarxi</Text>
              <Text style={styles.ingTotalVal}>{formatSom(formaTannarx)} so'm</Text>
            </View>
            <Text style={styles.hint}>Narx Ombor narxlaridan avtomatik hisoblanadi</Text>
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
  item:      { marginBottom: S[3] },
  flex1:     { flex: 1 },
  nonNom:    { fontSize: T.lg, fontWeight: "800", color: C.text },
  chip:      { alignSelf: "flex-start", paddingVertical: 3, paddingHorizontal: 9, borderRadius: R.pill, marginTop: 5 },
  chipTxt:   { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
  row:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[2] },
  rowLast:   { marginBottom: 0 },
  label:     { fontSize: T.sm, color: C.sub },
  value:     { fontSize: T.sm },
  muted:     { fontSize: T.sm, color: C.muted },
  bodyActions:{ flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:    { flexDirection: "row", alignItems: "center" },
  actTxt:    { fontSize: T.sm, fontWeight: "700" },

  // Karta — ingredient ro'yxati
  ingWrap:   { marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  ingHead:   { fontSize: 10, color: C.muted, fontWeight: "700", letterSpacing: 0.8, marginBottom: S[2] },
  ingRow:    { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  ingNom:    { flex: 1, fontSize: T.sm, color: C.text },
  ingMiqdor: { fontSize: T.xs, color: C.muted, width: 78, textAlign: "right" },
  ingNarx:   { fontSize: T.xs, color: C.sub, fontWeight: "700", width: 82, textAlign: "right" },

  // Modal
  ingScroll:    { maxHeight: 220, marginBottom: S[2] },
  ingEditRow:   { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  ingEditNom:   { flex: 1, fontSize: T.sm, color: C.text },
  ingInput:     { width: 90, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 8, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  ingUnit:      { width: 28, fontSize: T.xs, color: C.muted },
  ingTotal:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.accent + "0D", borderWidth: 1, borderColor: C.accent + "2E", borderRadius: R.md, paddingVertical: S[2], paddingHorizontal: S[3], marginBottom: S[2] },
  ingTotalLabel:{ fontSize: T.sm, color: C.sub, fontWeight: "600" },
  ingTotalVal:  { fontSize: T.md, color: C.accent, fontWeight: "800" },

  modalTitle: { fontSize: T.lg, fontWeight: "800", color: C.text, marginBottom: S[4] },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface, marginBottom: S[3] },
  hint: { fontSize: 11, color: C.muted, marginTop: -6, marginBottom: S[2] },
  modalRow: { flexDirection: "row", gap: S[3] },
});
