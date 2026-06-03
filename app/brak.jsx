// Brak ekrani — ishchini tanlab, har non turidan brak donasini kiritish.
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
import { formatSom } from "../src/logic/hisob";

const localSana = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function Brak() {
  const { nonlar, ishchilar, braklar, setBraklar } = useApp();
  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirId, setTahrirId] = useState(null);
  const [forma, setForma] = useState({ ishchiId: null, dona: {} });

  const qopIshchilar = (ishchilar || []).filter((w) => w.haqTuri === "qop" && w.holat === "Aktiv");
  const ishchi = qopIshchilar.find((w) => w.id === forma.ishchiId);
  const donaNarxi = (nom) => parseFloat((nonlar || []).find((n) => n.nom === nom)?.narx) || 0;
  const summa = useMemo(() =>
    (ishchi?.nonTurlari || []).reduce((s, nom) => s + donaNarxi(nom) * (parseFloat(forma.dona[nom]) || 0), 0),
    [ishchi, forma.dona, nonlar]
  );

  const ochYangi = () => { setForma({ ishchiId: null, dona: {} }); setTahrirId(null); setModalOchiq(true); };
  const ochTahrir = (b) => {
    setForma({ ishchiId: b.ishchiId, dona: { [b.nonNomi]: String(b.soni || "") } });
    setTahrirId(b.id);
    setModalOchiq(true);
  };
  const setDona = (nom, v) => setForma((p) => ({ ...p, dona: { ...p.dona, [nom]: v } }));

  const saqla = () => {
    if (!ishchi) { Alert.alert("To'liq emas", "Ishchini tanlang."); return; }
    if (tahrirId) {
      // Tahrirlash: bitta yozuvni yangilash (ishchi tanlangan bitta non bo'yicha)
      const b = (braklar || []).find((x) => x.id === tahrirId);
      const nom = b?.nonNomi;
      const soni = parseFloat(forma.dona[nom]) || 0;
      if (soni <= 0) { Alert.alert("To'liq emas", "Brak sonini kiriting (0 dan katta)."); return; }
      setBraklar((prev) => prev.map((x) => x.id === tahrirId
        ? { ...x, ishchiId: ishchi.id, ishchiIsm: ishchi.ism, soni, summa: Math.round(donaNarxi(nom) * soni) }
        : x));
      setModalOchiq(false);
      return;
    }
    const yozuvlar = (ishchi.nonTurlari || [])
      .map((nom) => ({ nom, soni: parseFloat(forma.dona[nom]) || 0 }))
      .filter((x) => x.soni > 0)
      .map((x) => ({
        id: Date.now() + Math.floor(Math.random() * 1000), sana: localSana(), vaqt: Date.now(),
        ishchiId: ishchi.id, ishchiIsm: ishchi.ism, nonNomi: x.nom,
        soni: x.soni, summa: Math.round(donaNarxi(x.nom) * x.soni),
      }));
    if (yozuvlar.length === 0) { Alert.alert("To'liq emas", "Kamida bitta non turidan brak sonini kiriting."); return; }
    setBraklar((prev) => [...prev, ...yozuvlar]);
    setModalOchiq(false);
  };

  const ochirBrak = (id) => Alert.alert("O'chirish", "Bu brakni o'chirasizmi?", [
    { text: "Bekor", style: "cancel" },
    { text: "Ha", style: "destructive", onPress: () => setBraklar((p) => p.filter((b) => b.id !== id)) },
  ]);

  const jamiSumma = (braklar || []).reduce((s, b) => s + (parseFloat(b.summa) || 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <Pressable accessibilityLabel="Orqaga" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
          <Text style={styles.backTxt}>Markaz</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <View style={styles.iconBox}><Image source={require("../assets/icons/brak.png")} style={styles.iconImg} resizeMode="contain" /></View>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>BRAK</Text>
            <Text style={styles.title}>Yaroqsizlar</Text>
            <Text style={styles.subtitle}>{formatSom(jamiSumma)} so'm · {(braklar || []).length} ta yozuv</Text>
          </View>
        </View>

        <Btn color={C.accent} onPress={ochYangi} icon="add-outline">Brak qo'shish</Btn>
        <View style={styles.gap14} />

        {(braklar || []).length === 0 ? (
          <Card><Text style={styles.bosh}>Hali brak yo'q</Text></Card>
        ) : (
          [...braklar].reverse().map((b) => (
            <ExpandableCard
              key={b.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <Text style={[styles.itemIsm, styles.flex1]} numberOfLines={1}>{b.ishchiIsm}</Text>
                  <Text style={[styles.itemSumma, { color: C.red }]} numberOfLines={1}>− {formatSom(b.summa)} so'm</Text>
                </View>
              }
            >
              <Text style={styles.itemIzoh}>{b.nonNomi} · {b.soni} dona brak</Text>
              <Text style={styles.itemSana}>{b.sana}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => ochTahrir(b)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="create-outline" size={16} color={C.accent} />
                  <Text style={[styles.actTxt, { color: C.accent }]}> Tahrirlash</Text>
                </Pressable>
                <Pressable onPress={() => ochirBrak(b.id)} hitSlop={6} style={styles.actBtn}>
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
          <Ionicons name={tahrirId ? "create-outline" : "alert-circle-outline"} size={20} color={C.sub} />
          <Text style={styles.modalTitle}>{tahrirId ? "Brakni tahrirlash" : "Brak qo'shish"}</Text>
        </View>
        <ScrollBox style={styles.formScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Ishchi (qopdan haq oladigan)</Text>
          {qopIshchilar.length === 0 ? (
            <Text style={styles.bosh}>Qopdan haq oladigan aktiv ishchi yo'q.</Text>
          ) : (
            qopIshchilar.map((w) => (
              <Pressable key={w.id} onPress={() => setForma({ ishchiId: w.id, dona: {} })} style={[styles.pickRow, forma.ishchiId === w.id && styles.pickRowActive]}>
                <Ionicons name={forma.ishchiId === w.id ? "radio-button-on-outline" : "ellipse-outline"} size={16} color={forma.ishchiId === w.id ? C.accent : C.muted} />
                <Text style={[styles.pickTxt, forma.ishchiId === w.id && styles.pickTxtActive]}>{w.ism}</Text>
              </Pressable>
            ))
          )}

          {ishchi && (
            <>
              <Text style={styles.inputLabel}>Qaysi nondan nechta dona brak</Text>
              {(ishchi.nonTurlari || []).map((nom) => (
                <View key={nom} style={styles.savatRow}>
                  <Text style={styles.savatNom} numberOfLines={1}>{nom}</Text>
                  <Text style={styles.savatNarx}>{formatSom(donaNarxi(nom))}</Text>
                  <TextInput value={forma.dona[nom] ?? ""} onChangeText={(v) => setDona(nom, v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.savatInput} />
                </View>
              ))}
              {summa > 0 && (
                <View style={styles.preview}>
                  <View style={styles.previewRow}><Text style={styles.previewLabel}>Haqdan ayriladi</Text><Text style={[styles.previewVal, { color: C.red }]}>− {formatSom(summa)} so'm</Text></View>
                </View>
              )}
            </>
          )}
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
  formScroll: { maxHeight: 420 },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[1], letterSpacing: 0.3 },
  savatRow: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  savatNom: { flex: 1, fontSize: T.sm, color: C.text },
  savatNarx: { fontSize: T.xs, color: C.muted, width: 70, textAlign: "right" },
  savatInput: { width: 70, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 8, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  pickRow: { flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 12, marginBottom: S[2], backgroundColor: C.surface },
  pickRowActive: { borderColor: C.accent, backgroundColor: C.accent + "0D" },
  pickTxt: { fontSize: T.sm, color: C.sub, fontWeight: "600", flexShrink: 1 },
  pickTxtActive: { color: C.accent, fontWeight: "700" },
  preview: { marginTop: S[3], backgroundColor: C.red + "0D", borderWidth: 1, borderColor: C.red + "26", borderRadius: R.md, padding: S[3] },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewLabel: { fontSize: T.sm, color: C.sub },
  previewVal: { fontSize: T.md, fontWeight: "800", color: C.text },
  modalRow:   { gap: S[2] },
});
