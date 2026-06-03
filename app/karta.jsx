// Karta to'lovlari ekrani — summa + izoh kiritiladi, o'rtacha narx asosida ≈ non soni va sof foyda jonli.
import { useMemo, useState } from "react";
import { View, Text, ScrollView, Image, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { Btn } from "../src/components/Btn";
import { Modal } from "../src/components/Modal";
import { ExpandableCard } from "../src/components/ExpandableCard";
import { ScrollBox } from "../src/components/ScrollBox";
import { C, T, S, R } from "../src/theme";
import { formatSom, kartaJami, kartaHisob } from "../src/logic/hisob";

const localSana = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function Karta() {
  const { nonlar, kartalar, setKartalar, mahsulotNarxlari } = useApp();
  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirId, setTahrirId] = useState(null);
  const [forma, setForma] = useState({ summa: "", izoh: "" });

  const karta = useMemo(() => kartaJami(kartalar), [kartalar]);
  const preview = useMemo(() => kartaHisob(parseFloat(forma.summa) || 0, nonlar, mahsulotNarxlari), [forma.summa, nonlar, mahsulotNarxlari]);

  const ochYangi = () => { setForma({ summa: "", izoh: "" }); setTahrirId(null); setModalOchiq(true); };
  const ochTahrir = (k) => { setForma({ summa: String(k.summa || ""), izoh: k.izoh || "" }); setTahrirId(k.id); setModalOchiq(true); };
  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));

  const saqla = () => {
    const summa = parseFloat(forma.summa) || 0;
    if (!summa) { Alert.alert("Maydon to'liq emas", "Iltimos, summani kiriting."); return; }
    const pv = kartaHisob(summa, nonlar, mahsulotNarxlari);
    if (tahrirId) {
      setKartalar((prev) => prev.map((k) => k.id === tahrirId
        ? { ...k, summa, izoh: forma.izoh.trim(), dona: pv.dona, sofFoyda: pv.sofFoyda }
        : k));
    } else {
      setKartalar((prev) => [...prev, {
        id: Date.now(), summa, izoh: forma.izoh.trim(),
        sana: localSana(), vaqt: Date.now(), dona: pv.dona, sofFoyda: pv.sofFoyda,
      }]);
    }
    setModalOchiq(false);
  };

  const ochirKarta = (id) => Alert.alert("O'chirish", "Bu to'lovni o'chirasizmi?", [
    { text: "Bekor", style: "cancel" },
    { text: "Ha", style: "destructive", onPress: () => setKartalar((p) => p.filter((k) => k.id !== id)) },
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <Pressable accessibilityLabel="Orqaga" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
          <Text style={styles.backTxt}>Markaz</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <View style={styles.iconBox}><Image source={require("../assets/icons/karta.png")} style={styles.iconImg} resizeMode="contain" /></View>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>KARTA TO'LOVLARI</Text>
            <Text style={styles.title}>Karta orqali</Text>
            <Text style={styles.subtitle}>{formatSom(karta.summa)} so'm · {karta.soni} ta</Text>
          </View>
        </View>

        <Btn color={C.accent} onPress={ochYangi} icon="card-outline">Karta to'lovi</Btn>
        <View style={styles.gap14} />

        {(kartalar || []).length === 0 ? (
          <Card><Text style={styles.bosh}>Hali karta to'lovi yo'q</Text></Card>
        ) : (
          [...kartalar].reverse().map((k) => (
            <ExpandableCard
              key={k.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <Text style={[styles.itemIsm, styles.flex1]} numberOfLines={1}>{k.izoh || "Karta to'lovi"}</Text>
                  <Text style={[styles.itemSumma, { color: C.green }]} numberOfLines={1}>{formatSom(k.summa)} so'm</Text>
                </View>
              }
            >
              <Text style={styles.itemIzoh}>≈ {k.dona} dona non · sof foyda {formatSom(k.sofFoyda)} so'm</Text>
              <Text style={styles.itemSana}>{k.sana}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => ochTahrir(k)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="create-outline" size={16} color={C.accent} />
                  <Text style={[styles.actTxt, { color: C.accent }]}> Tahrirlash</Text>
                </Pressable>
                <Pressable onPress={() => ochirKarta(k.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                  <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                </Pressable>
              </View>
            </ExpandableCard>
          ))
        )}
      </ScrollBox>

      <Modal modalVisible={modalOchiq} onClose={() => setModalOchiq(false)}>
        <View style={styles.modalHead}>
          <Ionicons name={tahrirId ? "create-outline" : "card-outline"} size={20} color={C.sub} />
          <Text style={styles.modalTitle}>{tahrirId ? "Karta to'lovini tahrirlash" : "Karta to'lovi"}</Text>
        </View>
        <ScrollBox style={styles.formScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Aniq narx (so'm) *</Text>
          <TextInput value={forma.summa} onChangeText={(v) => yangila("summa", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
          <Text style={styles.inputLabel}>Izoh</Text>
          <TextInput value={forma.izoh} onChangeText={(v) => yangila("izoh", v)} placeholder="Qo'shimcha izoh (ixtiyoriy)" placeholderTextColor={C.muted} multiline style={[styles.input, styles.inputMulti]} />
          {(parseFloat(forma.summa) || 0) > 0 && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Hisob (o'rtacha narx asosida)</Text>
              <View style={styles.previewRow}><Text style={styles.previewLabel}>≈ Nechta non</Text><Text style={styles.previewVal}>{preview.dona} dona</Text></View>
              <View style={styles.previewRow}><Text style={styles.previewLabel}>Sof foyda</Text><Text style={[styles.previewVal, { color: preview.sofFoyda >= 0 ? C.green : C.red }]}>{formatSom(preview.sofFoyda)} so'm</Text></View>
            </View>
          )}
        </ScrollBox>
        <View style={styles.gap12} />
        <View style={styles.modalRow}>
          <View style={styles.flex1}><Btn secondary onPress={() => setModalOchiq(false)}>Bekor</Btn></View>
          <View style={styles.flex1}><Btn color={C.accent} onPress={saqla}>Saqlash</Btn></View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: S[5], paddingBottom: S[8] },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: S[3] },
  backTxt: { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: S[3], marginBottom: S[5] },
  iconBox: { width: 44, height: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.green + "14" },
  iconImg: { width: 24, height: 24, tintColor: C.green },
  flex1: { flex: 1 },
  eyebrow: { fontSize: 11, color: C.muted, fontWeight: "700", letterSpacing: 1.8 },
  title: { fontSize: T.xl, color: C.text, fontWeight: "800", letterSpacing: -0.6, marginTop: 2 },
  subtitle: { fontSize: T.sm, color: C.sub, fontWeight: "500", marginTop: 3 },
  bosh: { fontSize: T.sm, color: C.muted },
  gap12: { height: S[3] },
  gap14: { height: S[4] },
  item: { marginBottom: S[3] },
  mHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: S[2] },
  itemIsm: { fontSize: T.md, fontWeight: "700", color: C.text },
  itemIzoh: { fontSize: T.sm, color: C.sub, marginTop: 2 },
  itemSana: { fontSize: T.xs, color: C.muted, marginTop: 2 },
  itemSumma: { fontSize: T.md, fontWeight: "800", marginLeft: S[2] },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn: { flexDirection: "row", alignItems: "center" },
  actTxt: { fontSize: T.sm, fontWeight: "700" },
  modalHead: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[3] },
  modalTitle: { fontSize: T.lg, fontWeight: "800", color: C.text },
  formScroll: { maxHeight: 360 },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[1], letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  inputMulti: { minHeight: 64, textAlignVertical: "top" },
  preview: { marginTop: S[3], backgroundColor: C.green + "0D", borderWidth: 1, borderColor: C.green + "2E", borderRadius: R.md, padding: S[3] },
  previewTitle: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: S[2], letterSpacing: 0.3 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[1] },
  previewLabel: { fontSize: T.sm, color: C.sub },
  previewVal: { fontSize: T.md, fontWeight: "800", color: C.text },
  modalRow: { flexDirection: "row", gap: S[3] },
});
