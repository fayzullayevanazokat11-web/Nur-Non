// Qarzlar ekrani — qarz qo'shish/o'chirish/to'lash, jonli summa va chegirma.
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
import { DateField } from "../src/components/DateField";
import { ScrollBox } from "../src/components/ScrollBox";
import { C, T, S, R } from "../src/theme";
import { formatSom, qarzJami, donaFoyda } from "../src/logic/hisob";

const BOSH_FORMA = { ism: "", izoh: "", sana: "", savat: {}, chegirma: "" };
const localSana = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function Qarzlar() {
  const { nonlar, qarzlar, setQarzlar, mahsulotNarxlari } = useApp();
  const [modalOchiq, setModalOchiq] = useState(false);
  const [forma, setForma] = useState(BOSH_FORMA);

  const qarz = useMemo(() => qarzJami(qarzlar), [qarzlar]);

  const savatHisob = useMemo(() => {
    let summa = 0, dona = 0, foyda = 0;
    const items = [];
    (nonlar || []).forEach((n) => {
      const soni = parseInt(forma.savat[n.id]) || 0;
      if (soni <= 0) return;
      const narx = parseFloat(n.narx) || 0;
      summa += soni * narx;
      dona += soni;
      foyda += soni * donaFoyda(n, mahsulotNarxlari);
      items.push({ nonNomi: n.nom, soni, narx });
    });
    const chegirma = parseFloat(forma.chegirma) || 0;
    return { summa, dona, foyda, items, chegirma, yakSumma: Math.max(0, summa - chegirma) };
  }, [forma.savat, forma.chegirma, nonlar, mahsulotNarxlari]);

  const ochModal = () => { setForma({ ...BOSH_FORMA, sana: localSana() }); setModalOchiq(true); };
  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const yangilaSavat = (id, v) => setForma((p) => ({ ...p, savat: { ...p.savat, [id]: v } }));

  const saqla = () => {
    if (!forma.ism.trim()) { Alert.alert("Ism kiritilmagan", "Iltimos, qarz oluvchi ismini kiriting."); return; }
    if (savatHisob.items.length === 0) { Alert.alert("Non tanlanmagan", "Kamida bitta non turidan soni kiriting."); return; }
    const sana = forma.sana || localSana();
    setQarzlar((prev) => [...prev, {
      id: Date.now(), ism: forma.ism.trim(), sana, vaqt: Date.now(),
      savat: savatHisob.items, summa: savatHisob.yakSumma, chegirma: savatHisob.chegirma,
      izoh: forma.izoh.trim(), tolangan: false, tolanganVaqt: null,
    }]);
    setModalOchiq(false);
  };

  const tolaQarz = (id) => setQarzlar((prev) => prev.map((q) => q.id === id ? { ...q, tolangan: true, tolanganVaqt: Date.now() } : q));
  const ochirQarz = (id) => Alert.alert("O'chirish", "Bu qarzni o'chirasizmi?", [
    { text: "Bekor", style: "cancel" },
    { text: "Ha", style: "destructive", onPress: () => setQarzlar((p) => p.filter((q) => q.id !== id)) },
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <Pressable accessibilityLabel="Orqaga" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
          <Text style={styles.backTxt}>Markaz</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <View style={styles.iconBox}><Image source={require("../assets/icons/qarz.png")} style={styles.iconImg} resizeMode="contain" /></View>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>QARZLAR</Text>
            <Text style={styles.title}>Qarzdorlar</Text>
            <Text style={styles.subtitle}>{formatSom(qarz.summa)} so'm · {qarz.soni} ta aktiv</Text>
          </View>
        </View>

        <Btn color={C.accent} onPress={ochModal} icon="add-outline">Qarz qo'shish</Btn>
        <View style={styles.gap14} />

        {(qarzlar || []).length === 0 ? (
          <Card><Text style={styles.bosh}>Hali qarz yo'q</Text></Card>
        ) : (
          [...qarzlar].reverse().map((q) => (
            <ExpandableCard
              key={q.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <Text style={[styles.itemIsm, styles.flex1]} numberOfLines={1}>{q.ism}{q.tolangan ? "  · to'landi" : ""}</Text>
                  <Text style={[styles.itemSumma, { color: q.tolangan ? C.muted : C.red }]} numberOfLines={1}>{formatSom(q.summa)} so'm</Text>
                </View>
              }
            >
              {(q.savat || []).map((s, i) => (
                <View key={i} style={styles.savatLine}>
                  <Text style={styles.savatLNom} numberOfLines={1}>{s.nonNomi}</Text>
                  <Text style={styles.savatLV}>{s.soni} dona × {formatSom(s.narx)}</Text>
                </View>
              ))}
              {q.chegirma > 0 ? <Text style={styles.itemIzoh}>Chegirma: {formatSom(q.chegirma)} so'm</Text> : null}
              {q.izoh ? <Text style={styles.itemIzoh}>{q.izoh}</Text> : null}
              <Text style={styles.itemSana}>{q.sana}</Text>
              <View style={styles.actions}>
                {!q.tolangan && (
                  <Pressable onPress={() => tolaQarz(q.id)} hitSlop={6} style={styles.actBtn}>
                    <Ionicons name="checkmark" size={15} color={C.accent} />
                    <Text style={[styles.actTxt, { color: C.accent }]}> To'landi</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => ochirQarz(q.id)} hitSlop={6} style={styles.actBtn}>
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
          <Ionicons name="receipt-outline" size={20} color={C.sub} />
          <Text style={styles.modalTitle}>Yangi qarz</Text>
        </View>
        <ScrollBox style={styles.formScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Sana</Text>
          <DateField value={forma.sana} onChange={(v) => yangila("sana", v)} />
          <View style={styles.gap10} />

          <Text style={styles.inputLabel}>Qarz oluvchi *</Text>
          <TextInput value={forma.ism} onChangeText={(v) => yangila("ism", v)} placeholder="Ism familiya" placeholderTextColor={C.muted} style={styles.input} />

          <Text style={styles.inputLabel}>Non turlari (soni)</Text>
          {(nonlar || []).map((n) => (
            <View key={n.id} style={styles.savatRow}>
              <Text style={styles.savatNom} numberOfLines={1}>{n.nom}</Text>
              <Text style={styles.savatNarx}>{formatSom(n.narx)}</Text>
              <TextInput value={forma.savat[n.id] ?? ""} onChangeText={(v) => yangilaSavat(n.id, v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.savatInput} />
            </View>
          ))}

          <Text style={styles.inputLabel}>Chegirma (so'm, ixtiyoriy)</Text>
          <TextInput value={forma.chegirma} onChangeText={(v) => yangila("chegirma", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

          <Text style={styles.inputLabel}>Izoh</Text>
          <TextInput value={forma.izoh} onChangeText={(v) => yangila("izoh", v)} placeholder="Qo'shimcha izoh (ixtiyoriy)" placeholderTextColor={C.muted} multiline style={[styles.input, styles.inputMulti]} />

          <View style={styles.preview}>
            <View style={styles.previewRow}><Text style={styles.previewLabel}>Jami ({savatHisob.dona} dona)</Text><Text style={styles.previewVal}>{formatSom(savatHisob.summa)} so'm</Text></View>
            {savatHisob.chegirma > 0 && (
              <View style={styles.previewRow}><Text style={styles.previewLabel}>Chegirma</Text><Text style={styles.previewVal}>− {formatSom(savatHisob.chegirma)} so'm</Text></View>
            )}
            <View style={styles.previewRow}><Text style={styles.previewLabel}>Qarz summasi</Text><Text style={[styles.previewVal, { color: C.accent }]}>{formatSom(savatHisob.yakSumma)} so'm</Text></View>
          </View>
        </ScrollBox>
        <View style={styles.gap12} />
        <View style={styles.modalRow}>
          <Btn color={C.accent} onPress={saqla}>Saqlash</Btn>
          <Btn secondary onPress={() => setModalOchiq(false)}>Bekor</Btn>
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
  iconBox: { width: 44, height: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.red + "14" },
  iconImg: { width: 24, height: 24, tintColor: C.red },
  flex1: { flex: 1 },
  eyebrow: { fontSize: 11, color: C.muted, fontWeight: "700", letterSpacing: 1.8 },
  title: { fontSize: T.xl, color: C.text, fontWeight: "800", letterSpacing: -0.6, marginTop: 2 },
  subtitle: { fontSize: T.sm, color: C.sub, fontWeight: "500", marginTop: 3 },
  bosh: { fontSize: T.sm, color: C.muted },
  gap10: { height: S[3] },
  gap12: { height: S[3] },
  gap14: { height: S[4] },
  item: { marginBottom: S[3] },
  mHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: S[2] },
  itemIsm: { fontSize: T.md, fontWeight: "700", color: C.text },
  itemIzoh: { fontSize: T.sm, color: C.sub, marginTop: 2 },
  itemSana: { fontSize: T.xs, color: C.muted, marginTop: 2 },
  itemSumma: { fontSize: T.md, fontWeight: "800", marginLeft: S[2] },
  savatLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  savatLNom: { flex: 1, fontSize: T.sm, color: C.text },
  savatLV: { fontSize: T.xs, color: C.sub, fontWeight: "700", marginLeft: S[2] },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn: { flexDirection: "row", alignItems: "center" },
  actTxt: { fontSize: T.sm, fontWeight: "700" },
  modalHead: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[3] },
  modalTitle: { fontSize: T.lg, fontWeight: "800", color: C.text },
  formScroll: { maxHeight: 420 },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[1], letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  inputMulti: { minHeight: 64, textAlignVertical: "top" },
  savatRow: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  savatNom: { flex: 1, fontSize: T.sm, color: C.text },
  savatNarx: { fontSize: T.xs, color: C.muted, width: 70, textAlign: "right" },
  savatInput: { width: 70, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 8, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  preview: { marginTop: S[3], backgroundColor: C.accent + "0D", borderWidth: 1, borderColor: C.accent + "2E", borderRadius: R.md, padding: S[3] },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[1] },
  previewLabel: { fontSize: T.sm, color: C.sub },
  previewVal: { fontSize: T.md, fontWeight: "800", color: C.text },
  modalRow:   { gap: S[2] },
});
