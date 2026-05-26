// "Xodimlar" — ishchi qo'shish va tahrirlash (kasb emoji bilan).
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
import { Avatar } from "../../src/components/Avatar";
import { C, T, S, R } from "../../src/theme";
import { formatSom } from "../../src/logic/hisob";
import { LAVOZIMLAR, getLavozimLabel } from "../../src/logic/konstantalar";

const BOSH_FORMA = { ism: "", lavozimId: LAVOZIMLAR[0].id, miqdor: "", holat: "Aktiv" };
const HOLATLAR = ["Aktiv", "Ta'tilda"];

export default function Xodimlar() {
  const { ishchilar, setIshchilar } = useApp();

  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirId, setTahrirId] = useState(null);
  const [forma, setForma] = useState(BOSH_FORMA);

  const aktiv = (ishchilar || []).filter((w) => w.holat === "Aktiv");

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const ochYangi = () => { setForma(BOSH_FORMA); setTahrirId(null); setModalOchiq(true); };
  const ochTahrir = (w) => {
    setForma({ ism: w.ism, lavozimId: w.lavozimId, miqdor: String(w.miqdor || ""), holat: w.holat || "Aktiv" });
    setTahrirId(w.id); setModalOchiq(true);
  };
  const yopModal = () => setModalOchiq(false);

  const saqla = () => {
    if (!forma.ism.trim()) {
      Alert.alert("Ism kiritilmagan", "Iltimos, xodim ismini kiriting.");
      return;
    }
    const miqdor = parseFloat(forma.miqdor) || 0;
    if (tahrirId) {
      // Tahrirlash — qolgan maydonlar (haqTuri, nonTurlari...) saqlanadi
      setIshchilar((prev) => prev.map((w) =>
        w.id === tahrirId ? { ...w, ism: forma.ism.trim(), lavozimId: forma.lavozimId, miqdor, holat: forma.holat } : w
      ));
    } else {
      setIshchilar((prev) => [...prev, {
        id: Date.now(), ism: forma.ism.trim(), lavozimId: forma.lavozimId, lavozimCustom: "",
        haqTuri: "kunlik", miqdor, tel: "", holat: forma.holat, tatilQaytishSana: "",
        tahrirSoni: 0, nonTurlari: [], nonNarxlari: {},
      }]);
    }
    yopModal();
  };

  const ochir = (id) =>
    Alert.alert("O'chirish", "Bu xodimni o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => setIshchilar((p) => p.filter((w) => w.id !== id)) },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Jamoa" title="Xodimlar" />

        <View style={styles.statsRow}>
          <Card style={styles.statTile}>
            <Text style={styles.statLabel}>AKTIV XODIMLAR</Text>
            <Text style={[styles.statValue, { color: C.text }]}>{aktiv.length}</Text>
            <Text style={styles.statUnit}>nafar</Text>
          </Card>
        </View>

        <View style={styles.gap14} />
        <Btn onPress={ochYangi}>Yangi ishchi kiritish</Btn>
        <View style={styles.gap14} />

        {(ishchilar || []).length === 0 ? (
          <Card><Text style={styles.muted}>Xodimlar hali kiritilmagan</Text></Card>
        ) : (
          ishchilar.map((w) => (
            <ExpandableCard
              key={w.id}
              style={styles.item}
              header={
                <View style={styles.left}>
                  <Avatar name={w.ism} />
                  <View style={styles.flex1}>
                    <Text style={styles.ism}>{w.ism}</Text>
                    <Text style={styles.lavozim}>{getLavozimLabel(w)}</Text>
                  </View>
                </View>
              }
            >
              <View style={styles.bodyTop}>
                <View style={[styles.statePill, { backgroundColor: (w.holat === "Aktiv" ? C.green : C.muted) + "14" }]}>
                  <Text style={[styles.stateTxt, { color: w.holat === "Aktiv" ? C.green : C.sub }]}>{w.holat}</Text>
                </View>
                <Text style={styles.haq}>
                  {formatSom(w.miqdor)} so'm{w.haqTuri === "qop" ? "/qop" : "/kun"}
                </Text>
              </View>
              <View style={styles.bodyActions}>
                <Pressable accessibilityLabel="Tahrirlash" onPress={() => ochTahrir(w)} hitSlop={8} style={styles.actBtn}>
                  <Ionicons name="create-outline" size={16} color={C.accent} />
                  <Text style={[styles.actTxt, { color: C.accent }]}> Tahrirlash</Text>
                </Pressable>
                <Pressable accessibilityLabel="O'chirish" onPress={() => ochir(w.id)} hitSlop={8} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                  <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                </Pressable>
              </View>
            </ExpandableCard>
          ))
        )}
      </ScrollView>

      {/* Qo'shish / Tahrirlash modali */}
      <Modal modalVisible={modalOchiq} onClose={yopModal}>
        <Text style={styles.modalTitle}>{tahrirId ? "Xodimni tahrirlash" : "Yangi ishchi"}</Text>

        <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.inputLabel}>Ism *</Text>
          <TextInput value={forma.ism} onChangeText={(v) => yangila("ism", v)} placeholder="Masalan: Akmal aka" placeholderTextColor={C.muted} style={styles.input} />

          <Text style={styles.inputLabel}>Lavozim</Text>
          <View style={styles.lavGrid}>
            {LAVOZIMLAR.map((lav) => {
              const tanlangan = forma.lavozimId === lav.id;
              return (
                <Pressable key={lav.id} onPress={() => yangila("lavozimId", lav.id)} style={[styles.lavBtn, tanlangan && styles.lavBtnActive]}>
                  <Ionicons name={tanlangan ? "checkmark-circle" : "ellipse-outline"} size={16} color={tanlangan ? C.accent : C.muted} />
                  <Text style={[styles.lavLabel, tanlangan && styles.lavLabelActive]} numberOfLines={1}>{lav.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Tarif stavkasi (so'm)</Text>
          <TextInput value={forma.miqdor} onChangeText={(v) => yangila("miqdor", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

          <Text style={styles.inputLabel}>Holat</Text>
          <View style={styles.holatRow}>
            {HOLATLAR.map((h) => {
              const tanlangan = forma.holat === h;
              return (
                <Pressable key={h} onPress={() => yangila("holat", h)} style={[styles.holatBtn, tanlangan && styles.holatBtnActive]}>
                  <Text style={[styles.holatTxt, tanlangan && styles.holatTxtActive]}>{h}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.gap12} />
        <View style={styles.modalRow}>
          <View style={styles.flex1}><Btn secondary onPress={yopModal}>Bekor</Btn></View>
          <View style={styles.flex1}><Btn onPress={saqla}>Saqlash</Btn></View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: S[4], paddingBottom: S[7] },
  statsRow:  { flexDirection: "row", gap: S[2] },
  statTile:  { flex: 1, paddingVertical: S[3], paddingHorizontal: S[3] },
  statLabel: { fontSize: 9, color: C.muted, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: S[2] },
  statValue: { fontSize: 26, fontWeight: "800", letterSpacing: -0.3 },
  statUnit:  { fontSize: 10, color: C.muted, marginTop: 2 },
  gap12:     { height: S[3] },
  gap14:     { height: S[4] },
  item:      { marginBottom: S[2] },
  left:      { flexDirection: "row", alignItems: "center", gap: S[3], flex: 1 },
  flex1:     { flex: 1 },
  ism:       { fontSize: T.md, fontWeight: "700", color: C.text },
  lavozim:   { fontSize: T.sm, color: C.sub, marginTop: 1 },
  bodyTop:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statePill: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: R.pill },
  stateTxt:  { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
  haq:       { fontSize: T.sm, fontWeight: "800", color: C.accent },
  muted:     { fontSize: T.sm, color: C.muted },
  bodyActions:{ flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:    { flexDirection: "row", alignItems: "center" },
  actTxt:    { fontSize: T.sm, fontWeight: "700" },

  // Modal
  modalTitle: { fontSize: T.lg, fontWeight: "800", color: C.text, marginBottom: S[3] },
  formScroll: { maxHeight: 440 },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[1], letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  lavGrid:   { flexDirection: "row", flexWrap: "wrap", gap: S[2] },
  lavBtn: { width: "47%", flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 11, backgroundColor: "transparent" },
  lavBtnActive: { borderColor: C.accent, backgroundColor: C.accent + "0D" },
  lavLabel:     { fontSize: T.sm, color: C.sub, fontWeight: "600", flexShrink: 1 },
  lavLabelActive: { color: C.accent, fontWeight: "700" },
  holatRow:  { flexDirection: "row", gap: S[2] },
  holatBtn:  { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, alignItems: "center" },
  holatBtnActive: { borderColor: C.accent, backgroundColor: C.accent + "0D" },
  holatTxt:  { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  holatTxtActive: { color: C.accent, fontWeight: "700" },
  modalRow:  { flexDirection: "row", gap: S[3] },
});
