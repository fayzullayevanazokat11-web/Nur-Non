// "Xodimlar" — ishchi qo'shish va tahrirlash (kasb emoji bilan).
import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { Modal } from "../../src/components/Modal";
import { C, T } from "../../src/theme";
import { formatSom } from "../../src/logic/hisob";
import { LAVOZIMLAR, getLavozimEmoji, getLavozimLabel } from "../../src/logic/konstantalar";

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
        <Text style={styles.eyebrow}>Jamoa</Text>
        <Text style={styles.title}>Xodimlar</Text>

        <View style={styles.statsRow}>
          <Card style={styles.statTile}>
            <Text style={styles.statLabel}>AKTIV XODIMLAR</Text>
            <Text style={[styles.statValue, { color: C.text }]}>{aktiv.length}</Text>
            <Text style={styles.statUnit}>nafar</Text>
          </Card>
        </View>

        <View style={styles.gap14} />
        <Btn onPress={ochYangi}>+ Yangi ishchi kiritish</Btn>
        <View style={styles.gap14} />

        {(ishchilar || []).length === 0 ? (
          <Card><Text style={styles.muted}>Xodimlar hali kiritilmagan</Text></Card>
        ) : (
          ishchilar.map((w) => (
            <Card key={w.id} style={styles.item}>
              <View style={styles.rowBetween}>
                <View style={styles.left}>
                  <View style={styles.avatar}><Text style={styles.avatarEmoji}>{getLavozimEmoji(w)}</Text></View>
                  <View style={styles.flex1}>
                    <Text style={styles.ism}>{w.ism}</Text>
                    <Text style={styles.lavozim}>{getLavozimLabel(w)}</Text>
                  </View>
                </View>
                <View style={styles.cardActs}>
                  <Pressable onPress={() => ochTahrir(w)} hitSlop={8} style={styles.act}>
                    <Ionicons name="create-outline" size={18} color={C.accent} />
                  </Pressable>
                  <Pressable onPress={() => ochir(w.id)} hitSlop={8} style={styles.act}>
                    <Ionicons name="trash-outline" size={18} color={C.red} />
                  </Pressable>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.rowBetween}>
                <Text style={[styles.badge, { color: w.holat === "Aktiv" ? C.green : C.sub }]}>{w.holat}</Text>
                <Text style={styles.haq}>
                  {formatSom(w.miqdor)} so'm{w.haqTuri === "qop" ? "/qop" : "/kun"}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Qo'shish / Tahrirlash modali */}
      <Modal modalVisible={modalOchiq} onClose={yopModal}>
        <Text style={styles.modalTitle}>{tahrirId ? "✏️ Xodimni tahrirlash" : "👤 Yangi ishchi"}</Text>

        <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.inputLabel}>Ism *</Text>
          <TextInput value={forma.ism} onChangeText={(v) => yangila("ism", v)} placeholder="Masalan: Akmal aka" placeholderTextColor={C.muted} style={styles.input} />

          <Text style={styles.inputLabel}>Lavozim</Text>
          <View style={styles.lavGrid}>
            {LAVOZIMLAR.map((lav) => {
              const tanlangan = forma.lavozimId === lav.id;
              return (
                <Pressable key={lav.id} onPress={() => yangila("lavozimId", lav.id)} style={[styles.lavBtn, tanlangan && styles.lavBtnActive]}>
                  <Text style={styles.lavEmoji}>{lav.emoji}</Text>
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
          <View style={styles.flex1}><Btn onPress={saqla}>✓ Saqlash</Btn></View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 16, paddingBottom: 32 },
  eyebrow:   { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  title:     { fontSize: T.xl, fontWeight: "900", color: C.text, marginTop: 2, marginBottom: 14 },
  statsRow:  { flexDirection: "row", gap: 8 },
  statTile:  { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  statLabel: { fontSize: 9, color: C.muted, fontWeight: "700", letterSpacing: 0.6, marginBottom: 5 },
  statValue: { fontSize: 24, fontWeight: "900" },
  statUnit:  { fontSize: 10, color: C.muted, marginTop: 2 },
  gap12:     { height: 12 },
  gap14:     { height: 14 },
  item:      { marginBottom: 10 },
  rowBetween:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left:      { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar:    { width: 42, height: 42, borderRadius: 12, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.borderSoft },
  avatarEmoji:{ fontSize: 20 },
  flex1:     { flex: 1 },
  ism:       { fontSize: T.md, fontWeight: "900", color: C.text },
  lavozim:   { fontSize: T.sm, color: C.sub, marginTop: 1 },
  cardActs:  { flexDirection: "row", gap: 6 },
  act:       { padding: 6 },
  divider:   { height: 1, backgroundColor: C.border, marginVertical: 8 },
  badge:     { fontSize: T.xs, fontWeight: "800" },
  haq:       { fontSize: T.sm, fontWeight: "900", color: C.accent },
  muted:     { fontSize: T.sm, color: C.muted },

  // Modal
  modalTitle: { fontSize: T.lg, fontWeight: "900", color: C.text, marginBottom: 12 },
  formScroll: { maxHeight: 440 },
  inputLabel: { fontSize: T.xs, color: C.muted, fontWeight: "700", marginBottom: 6, marginTop: 4, letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  lavGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  lavBtn: { width: "47%", flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 10, backgroundColor: "transparent" },
  lavBtnActive: { borderColor: C.accent, backgroundColor: C.accent + "18" },
  lavEmoji:     { fontSize: 18 },
  lavLabel:     { fontSize: T.sm, color: C.sub, fontWeight: "700", flexShrink: 1 },
  lavLabelActive: { color: C.accent },
  holatRow:  { flexDirection: "row", gap: 8 },
  holatBtn:  { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  holatBtnActive: { borderColor: C.accent, backgroundColor: C.accent + "18" },
  holatTxt:  { fontSize: T.sm, color: C.sub, fontWeight: "700" },
  holatTxtActive: { color: C.accent },
  modalRow:  { flexDirection: "row", gap: 10 },
});
