// Optom savdolar ekrani — inline forma yuqorida (modal yo'q). Donadan/umumiy
// chegirma + sof foyda jonli.
import { useMemo, useState } from "react";
import { View, Text, Image, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { Btn } from "../src/components/Btn";
import { ExpandableCard, yopKartalar } from "../src/components/ExpandableCard";
import { DateField } from "../src/components/DateField";
import { ScrollBox } from "../src/components/ScrollBox";
import { C, T, S, R } from "../src/theme";
import { formatSom, optomJami, donaFoyda } from "../src/logic/hisob";

const localSana = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function Optom() {
  const { nonlar, optomlar, setOptomlar, mahsulotNarxlari } = useApp();
  const BOSH = { ism: "", izoh: "", sana: "", sanaTanlandi: false, savat: {}, donaChegirma: "", chegirma: "" };
  const [forma, setForma] = useState(BOSH);

  const optom = useMemo(() => optomJami(optomlar), [optomlar]);

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
    const dch = parseFloat(forma.donaChegirma) || 0;
    const ch = parseFloat(forma.chegirma) || 0;
    const jamiChegirma = dch * dona + ch;
    return { summa, dona, foyda, items, jamiChegirma, yakSumma: Math.max(0, summa - jamiChegirma), yakFoyda: foyda - jamiChegirma };
  }, [forma.savat, forma.donaChegirma, forma.chegirma, nonlar, mahsulotNarxlari]);

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const yangilaSavat = (id, v) => setForma((p) => ({ ...p, savat: { ...p.savat, [id]: v } }));
  const tozala = () => { setForma(BOSH); yopKartalar(); };
  const yangilaSana = (v) => setForma((p) => ({ ...p, sana: v, sanaTanlandi: true }));

  const saqla = () => {
    if (!forma.ism.trim()) { Alert.alert("Ism kiritilmagan", "Iltimos, xaridor ismini kiriting."); return; }
    if (savatHisob.items.length === 0) { Alert.alert("Non tanlanmagan", "Kamida bitta non turidan soni kiriting."); return; }
    const sana = forma.sanaTanlandi && forma.sana ? forma.sana : localSana();
    setOptomlar((prev) => [...prev, {
      id: Date.now(), ism: forma.ism.trim(), sana, vaqt: Date.now(),
      savat: savatHisob.items, summa: savatHisob.yakSumma, chegirma: savatHisob.jamiChegirma,
      sofFoyda: savatHisob.yakFoyda, izoh: forma.izoh.trim(),
    }]);
    tozala();
  };

  const ochirOptom = (id) => Alert.alert("O'chirish", "Bu savdoni o'chirasizmi?", [
    { text: "Bekor", style: "cancel" },
    { text: "Ha", style: "destructive", onPress: () => { yopKartalar(); setOptomlar((p) => p.filter((o) => o.id !== id)); } },
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityLabel="Orqaga" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
          <Text style={styles.backTxt}>Markaz</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <View style={styles.iconBox}><Image source={require("../assets/icons/optom.png")} style={styles.iconImg} resizeMode="contain" /></View>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>OPTOM SAVDOLAR</Text>
            <Text style={styles.title}>Ulgurji savdo</Text>
            <Text style={styles.subtitle}>{formatSom(optom.summa)} so'm · {optom.soni} ta</Text>
          </View>
        </View>

        {/* INLINE FORMA */}
        <Card style={styles.formCard}>
          <View style={styles.formHead}>
            <Ionicons name="add-circle-outline" size={18} color={C.sub} />
            <Text style={styles.formTitle}>Yangi optom savdo</Text>
          </View>

          <Text style={styles.inputLabel}>Sana</Text>
          <DateField value={forma.sana || localSana()} onChange={yangilaSana} />
          {!forma.sanaTanlandi && <Text style={styles.hint}>Bugungi kun avtomatik. Boshqa sana uchun kalendarni oching.</Text>}

          <Text style={styles.inputLabel}>Xaridor *</Text>
          <TextInput value={forma.ism} onChangeText={(v) => yangila("ism", v)} placeholder="Ism familiya" placeholderTextColor={C.muted} style={styles.input} />

          <Text style={styles.inputLabel}>Non turlari (soni)</Text>
          {(nonlar || []).map((n) => (
            <View key={n.id} style={styles.savatRow}>
              <Text style={styles.savatNom} numberOfLines={1}>{n.nom}</Text>
              <Text style={styles.savatNarx}>{formatSom(n.narx)}</Text>
              <TextInput value={forma.savat[n.id] ?? ""} onChangeText={(v) => yangilaSavat(n.id, v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.savatInput} />
            </View>
          ))}

          <Text style={styles.inputLabel}>Donadan tushirish (so'm/dona)</Text>
          <TextInput value={forma.donaChegirma} onChangeText={(v) => yangila("donaChegirma", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
          <Text style={styles.inputLabel}>Umumiy chegirma (so'm)</Text>
          <TextInput value={forma.chegirma} onChangeText={(v) => yangila("chegirma", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

          <Text style={styles.inputLabel}>Izoh</Text>
          <TextInput value={forma.izoh} onChangeText={(v) => yangila("izoh", v)} placeholder="Qo'shimcha izoh (ixtiyoriy)" placeholderTextColor={C.muted} multiline style={[styles.input, styles.inputMulti]} />

          {savatHisob.items.length > 0 && (
            <View style={styles.preview}>
              <View style={styles.previewRow}><Text style={styles.previewLabel}>Jami ({savatHisob.dona} dona)</Text><Text style={styles.previewVal}>{formatSom(savatHisob.summa)} so'm</Text></View>
              {savatHisob.jamiChegirma > 0 && (
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Chegirma</Text><Text style={styles.previewVal}>− {formatSom(savatHisob.jamiChegirma)} so'm</Text></View>
              )}
              <View style={styles.previewRow}><Text style={styles.previewLabel}>To'lov</Text><Text style={[styles.previewVal, { color: C.accent }]}>{formatSom(savatHisob.yakSumma)} so'm</Text></View>
              <View style={styles.previewRow}><Text style={styles.previewLabel}>Sof foyda</Text><Text style={[styles.previewVal, { color: savatHisob.yakFoyda >= 0 ? C.green : C.red }]}>{formatSom(savatHisob.yakFoyda)} so'm</Text></View>
            </View>
          )}

          <View style={styles.formActions}>
            <Btn color={C.accent} onPress={saqla}>Saqlash</Btn>
          </View>
        </Card>

        {/* RO'YXAT */}
        <View style={styles.secHead}>
          <Ionicons name="storefront-outline" size={13} color={C.sub} />
          <Text style={styles.secTitle}>OPTOM SAVDOLAR</Text>
          <Text style={styles.secCount}>{(optomlar || []).length} ta</Text>
        </View>

        {(optomlar || []).length === 0 ? (
          <Card><Text style={styles.bosh}>Hali optom savdo yo'q</Text></Card>
        ) : (
          [...optomlar].reverse().map((o) => (
            <ExpandableCard
              key={o.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <Text style={[styles.itemIsm, styles.flex1]} numberOfLines={1}>{o.ism}</Text>
                  <Text style={[styles.itemSumma, { color: C.accent }]} numberOfLines={1}>{formatSom(o.summa)} so'm</Text>
                </View>
              }
            >
              {(o.savat || []).map((s, i) => (
                <View key={i} style={styles.savatLine}>
                  <Text style={styles.savatLNom} numberOfLines={1}>{s.nonNomi}</Text>
                  <Text style={styles.savatLV}>{s.soni} dona × {formatSom(s.narx)}</Text>
                </View>
              ))}
              {o.chegirma > 0 ? <Text style={styles.itemIzoh}>Chegirma: {formatSom(o.chegirma)} so'm</Text> : null}
              <Text style={styles.itemIzoh}>Sof foyda: {formatSom(o.sofFoyda || 0)} so'm</Text>
              {o.izoh ? <Text style={styles.itemIzoh}>{o.izoh}</Text> : null}
              <Text style={styles.itemSana}>{o.sana}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => ochirOptom(o.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                  <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                </Pressable>
              </View>
            </ExpandableCard>
          ))
        )}
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  backBtn:  { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: S[3] },
  backTxt:  { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: S[3], marginBottom: S[5] },
  iconBox:  { width: 44, height: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  iconImg:  { width: 24, height: 24, tintColor: C.accent },
  flex1:    { flex: 1 },
  eyebrow:  { fontSize: 11, color: C.muted, fontWeight: "700", letterSpacing: 1.8 },
  title:    { fontSize: T.xl, color: C.text, fontWeight: "800", letterSpacing: -0.6, marginTop: 2 },
  subtitle: { fontSize: T.sm, color: C.sub, fontWeight: "500", marginTop: 3 },
  bosh:     { fontSize: T.sm, color: C.muted },

  formCard: { marginBottom: S[5] },
  formHead: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[4] },
  formTitle:{ fontSize: T.md, fontWeight: "800", color: C.text },
  inputLabel:{ fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[3], letterSpacing: 0.3 },
  input:    { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  inputMulti:{ minHeight: 64, textAlignVertical: "top" },
  hint:     { fontSize: 11, color: C.muted, marginTop: 5, fontStyle: "italic" },
  savatRow: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  savatNom: { flex: 1, fontSize: T.sm, color: C.text },
  savatNarx:{ fontSize: T.xs, color: C.muted, width: 70, textAlign: "right" },
  savatInput:{ width: 70, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 8, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  preview:  { marginTop: S[4], backgroundColor: C.accent + "0D", borderWidth: 1, borderColor: C.accent + "2E", borderRadius: R.md, padding: S[3] },
  previewRow:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[1] },
  previewLabel:{ fontSize: T.sm, color: C.sub },
  previewVal:{ fontSize: T.md, fontWeight: "800", color: C.text },
  formActions:{ marginTop: S[4], gap: S[2] },

  secHead:  { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[3] },
  secTitle: { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1, flex: 1 },
  secCount: { fontSize: T.sm, color: C.sub, fontWeight: "700" },

  item:     { marginBottom: S[3] },
  mHead:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: S[2] },
  itemIsm:  { fontSize: T.md, fontWeight: "700", color: C.text },
  itemIzoh: { fontSize: T.sm, color: C.sub, marginTop: 2 },
  itemSana: { fontSize: T.xs, color: C.muted, marginTop: 2 },
  itemSumma:{ fontSize: T.md, fontWeight: "800", marginLeft: S[2] },
  savatLine:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  savatLNom:{ flex: 1, fontSize: T.sm, color: C.text },
  savatLV:  { fontSize: T.xs, color: C.sub, fontWeight: "700", marginLeft: S[2] },
  actions:  { flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:   { flexDirection: "row", alignItems: "center" },
  actTxt:   { fontSize: T.sm, fontWeight: "700" },
});
