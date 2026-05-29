// "Ishlab chiqarish" (assortiment) — non qo'shish/tahrirlash + Xomashyo.
// Non: o'zimizniki (ingredient + 1 qopdan non soni → dona foydasi avtomatik)
// yoki tashqaridan (donadan qoladigan foyda to'g'ridan kiritiladi). "Tannarx" yo'q.
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
import { MahsulotNarxi } from "../../src/components/MahsulotNarxi";
import { xomashyoRoyxati } from "../../src/logic/konstantalar";
import { C, T, S, R } from "../../src/theme";
import { formatSom, getQopTannarx, getIngNarx } from "../../src/logic/hisob";

const baseUnit = (birlik) => (birlik === "litr" ? "ml" : "g");
const BOSH_FORMA = { nom: "", narx: "", oz: true, nonSoni: "", donaFoyda: "", ing: {} };

// Non uchun dona foydasi
function donaFoydasi(non, narxlar) {
  if (non.ozIshlab === false) return parseFloat(non.tashqariFoyda) || 0;
  const son = parseFloat(non.nonSoni) || 0;
  if (son <= 0) return 0;
  return Math.round((parseFloat(non.narx) || 0) - getQopTannarx(non, narxlar) / son);
}

export default function IshlabChiqarish() {
  const { nonlar, setNonlar, ishchilar, mahsulotNarxlari, customMahsulotlar } = useApp();
  const royxat = xomashyoRoyxati(customMahsulotlar);

  const [tab, setTab] = useState("assortiment");
  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirId, setTahrirId] = useState(null);
  const [forma, setForma] = useState(BOSH_FORMA);

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const yangilaIng = (id, v) => setForma((p) => ({ ...p, ing: { ...p.ing, [id]: v } }));

  const ochYangi = () => { setForma(BOSH_FORMA); setTahrirId(null); setModalOchiq(true); };
  const ochTahrir = (non) => {
    const oz = non.ozIshlab !== false;
    setForma({
      nom: non.nom, narx: String(non.narx || ""), oz,
      nonSoni: String(non.nonSoni || ""),
      donaFoyda: oz ? "" : String(non.tashqariFoyda || ""),
      ing: oz ? Object.fromEntries((non.mahsulotlar || []).map((m) => [m.id, String(m.miqdor ?? "")])) : {},
    });
    setTahrirId(non.id); setModalOchiq(true);
  };
  const yopModal = () => setModalOchiq(false);

  // Forma jonli hisoblari
  const formaQopNarx = royxat.reduce((s, m) => {
    const miq = parseFloat(forma.ing[m.id]) || 0;
    return miq > 0 ? s + getIngNarx({ id: m.id, miqdor: miq }, mahsulotNarxlari) : s;
  }, 0);
  const formaSon = parseFloat(forma.nonSoni) || 0;
  const formaDonaFoyda = forma.oz
    ? Math.round((parseFloat(forma.narx) || 0) - (formaSon > 0 ? formaQopNarx / formaSon : 0))
    : (parseFloat(forma.donaFoyda) || 0);

  const saqla = () => {
    if (!forma.nom.trim() || !forma.narx) {
      Alert.alert("Maydonlar to'liq emas", "Non nomi va sotuv narxini kiriting.");
      return;
    }
    const narx = parseFloat(forma.narx) || 0;
    let yangi;
    if (forma.oz) {
      const mahsulotlar = royxat
        .map((m) => ({ id: m.id, nom: m.nom, emoji: m.emoji, birlik: baseUnit(m.birlik), miqdor: parseFloat(forma.ing[m.id]) || 0 }))
        .filter((m) => m.miqdor > 0);
      yangi = { nom: forma.nom.trim(), narx, ozIshlab: true, nonSoni: parseFloat(forma.nonSoni) || 0, tashqariFoyda: 0, mahsulotlar };
    } else {
      yangi = { nom: forma.nom.trim(), narx, ozIshlab: false, nonSoni: 0, tashqariFoyda: parseFloat(forma.donaFoyda) || 0, mahsulotlar: [] };
    }
    if (tahrirId) {
      setNonlar((prev) => prev.map((n) => (n.id === tahrirId ? { ...n, ...yangi } : n)));
    } else {
      setNonlar((prev) => [...prev, { id: Date.now(), ...yangi }]);
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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={true}>
        <ScreenHeader eyebrow="Assortiment" title="Ishlab chiqarish" subtitle={`${nonlar.length} xil non · ${aktivIshchi} aktiv xodim`} icon="cube-outline" />

        <View style={styles.segment}>
          <Pressable style={[styles.seg, tab === "assortiment" && styles.segActive]} onPress={() => setTab("assortiment")}>
            <Ionicons name="grid-outline" size={15} color={tab === "assortiment" ? "#FFF3E8" : C.sub} />
            <Text style={[styles.segTxt, tab === "assortiment" && styles.segTxtActive]}>Assortiment</Text>
          </Pressable>
          <Pressable style={[styles.seg, tab === "narx" && styles.segActive]} onPress={() => setTab("narx")}>
            <Ionicons name="leaf-outline" size={15} color={tab === "narx" ? "#FFF3E8" : C.sub} />
            <Text style={[styles.segTxt, tab === "narx" && styles.segTxtActive]}>Xomashyo</Text>
          </Pressable>
        </View>
        <View style={styles.gap14} />

        {tab === "narx" ? (
          <MahsulotNarxi />
        ) : (
          <>
            <Btn onPress={ochYangi} icon="add-circle-outline">Yangi non turi kiritish</Btn>
            <View style={styles.gap14} />

            {nonlar.length === 0 ? (
              <Card><Text style={styles.muted}>Hali non turi qo'shilmagan</Text></Card>
            ) : (
              nonlar.map((non) => {
                const oz = non.ozIshlab !== false;
                const foyda = donaFoydasi(non, mahsulotNarxlari);
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
                    <Row label="Sotuv narxi" value={`${formatSom(non.narx)} so'm`} bold />
                    {oz && <Row label="1 qopdan" value={`${non.nonSoni} dona`} />}
                    <Row label="Dona foydasi" value={`${formatSom(foyda)} so'm`} valueColor={C.accent} bold last={!oz} />
                    {oz && (non.mahsulotlar || []).length > 0 && (
                      <View style={styles.ingWrap}>
                        <Text style={styles.ingHead}>1 QOPGA XOMASHYO ({non.mahsulotlar.length})</Text>
                        {non.mahsulotlar.map((m) => (
                          <View key={m.id} style={styles.ingRow}>
                            <Text style={styles.ingNom} numberOfLines={1}>{m.emoji} {m.nom}</Text>
                            <Text style={styles.ingMiqdor}>{m.miqdor} {m.birlik}</Text>
                            <Text style={styles.ingNarx}>{formatSom(getIngNarx(m, mahsulotNarxlari))} so'm</Text>
                          </View>
                        ))}
                        <View style={styles.ingTotalRow}>
                          <Text style={styles.ingTotalLbl}>1 qopga jami</Text>
                          <Text style={styles.ingTotalV}>{formatSom(getQopTannarx(non, mahsulotNarxlari))} so'm</Text>
                        </View>
                      </View>
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
          </>
        )}
      </ScrollView>

      {/* Qo'shish / Tahrirlash modali */}
      <Modal modalVisible={modalOchiq} onClose={yopModal}>
        <View style={styles.modalHead}>
          <Ionicons name={tahrirId ? "create-outline" : "add-circle-outline"} size={20} color={C.sub} />
          <Text style={styles.modalTitle}>{tahrirId ? "Nonni tahrirlash" : "Yangi non turi"}</Text>
        </View>

        <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
          <Text style={styles.inputLabel}>Non nomi *</Text>
          <TextInput value={forma.nom} onChangeText={(v) => yangila("nom", v)} placeholder="Masalan: Kulcha" placeholderTextColor={C.muted} style={styles.input} />

          <Text style={styles.inputLabel}>Sotuv narxi (so'm) *</Text>
          <TextInput value={forma.narx} onChangeText={(v) => yangila("narx", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

          <Text style={styles.inputLabel}>Non turi</Text>
          <View style={styles.turRow}>
            <Pressable style={[styles.turBtn, forma.oz && styles.turBtnActive]} onPress={() => yangila("oz", true)}>
              <Text style={[styles.turTxt, forma.oz && styles.turTxtActive]}>O'zimizniki</Text>
            </Pressable>
            <Pressable style={[styles.turBtn, !forma.oz && styles.turBtnActive]} onPress={() => yangila("oz", false)}>
              <Text style={[styles.turTxt, !forma.oz && styles.turTxtActive]}>Tashqaridan</Text>
            </Pressable>
          </View>

          {forma.oz ? (
            <>
              <Text style={styles.inputLabel}>1 qopdan o'rtacha nechta non</Text>
              <TextInput value={forma.nonSoni} onChangeText={(v) => yangila("nonSoni", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

              <Text style={styles.inputLabel}>1 qopga ketadigan xomashyo</Text>
              {royxat.map((m) => {
                const unit = baseUnit(m.birlik);
                return (
                  <View key={m.id} style={styles.ingEditRow}>
                    <Text style={styles.ingEditNom} numberOfLines={1}>{m.emoji} {m.nom}</Text>
                    <TextInput value={forma.ing[m.id] ?? ""} onChangeText={(v) => yangilaIng(m.id, v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.ingInput} />
                    <Text style={styles.ingUnit}>{unit}</Text>
                  </View>
                );
              })}
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Donadan qoladigan foyda (so'm) *</Text>
              <TextInput value={forma.donaFoyda} onChangeText={(v) => yangila("donaFoyda", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
            </>
          )}

          <View style={styles.foydaBox}>
            {forma.oz && (
              <View style={styles.foydaLine}><Text style={styles.foydaLbl}>1 qopga xomashyo</Text><Text style={styles.foydaSub}>{formatSom(formaQopNarx)} so'm</Text></View>
            )}
            <View style={styles.foydaLine}><Text style={styles.foydaLblBig}>Dona foydasi</Text><Text style={styles.foydaVal}>{formatSom(formaDonaFoyda)} so'm</Text></View>
          </View>
        </ScrollView>

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
  scroll:    { padding: S[5], paddingBottom: S[8] },
  gap14:     { height: S[4] },
  segment:   { flexDirection: "row", gap: S[1], backgroundColor: C.panel, borderRadius: R.lg, padding: 5 },
  seg:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: R.md },
  segActive: { backgroundColor: C.accent },
  segTxt:    { fontSize: T.sm, fontWeight: "700", color: C.sub },
  segTxtActive: { color: "#FFF3E8" },
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

  ingWrap:   { marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  ingHead:   { fontSize: 10, color: C.muted, fontWeight: "700", letterSpacing: 0.8, marginBottom: S[2] },
  ingRow:    { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  ingNom:    { flex: 1, fontSize: T.sm, color: C.text },
  ingMiqdor: { fontSize: T.xs, color: C.muted, width: 78, textAlign: "right" },
  ingNarx:   { fontSize: T.xs, color: C.sub, fontWeight: "700", width: 82, textAlign: "right" },
  ingTotalRow:{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  ingTotalLbl:{ fontSize: T.xs, color: C.sub, fontWeight: "700" },
  ingTotalV: { fontSize: T.xs, color: C.text, fontWeight: "800" },

  // Modal
  formScroll: { maxHeight: 420 },
  modalHead:  { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[4] },
  modalTitle: { fontSize: T.lg, fontWeight: "800", color: C.text },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 },
  input:      { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface, marginBottom: S[3] },
  turRow:     { flexDirection: "row", gap: S[2], marginBottom: S[3] },
  turBtn:     { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  turBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  turTxt:     { fontSize: T.sm, fontWeight: "700", color: C.sub },
  turTxtActive: { color: "#FFF3E8" },
  ingEditRow: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  ingEditNom: { flex: 1, fontSize: T.sm, color: C.text },
  ingInput:   { width: 90, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 8, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  ingUnit:    { width: 28, fontSize: T.xs, color: C.muted },
  foydaBox:   { backgroundColor: C.accent + "0D", borderWidth: 1, borderColor: C.accent + "2E", borderRadius: R.md, paddingVertical: S[3], paddingHorizontal: S[3], marginTop: S[1] },
  foydaLine:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  foydaLbl:   { fontSize: T.sm, color: C.sub },
  foydaSub:   { fontSize: T.sm, color: C.text, fontWeight: "700" },
  foydaLblBig:{ fontSize: T.md, color: C.text, fontWeight: "700", marginTop: 2 },
  foydaVal:   { fontSize: T.lg, color: C.accent, fontWeight: "800", marginTop: 2 },
  modalRow:   { flexDirection: "row", gap: S[3] },
});
