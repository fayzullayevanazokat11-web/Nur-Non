// Karta to'lovlari ekrani — inline forma yuqorida (Markaz>Karta'ni bosgan ham
// darrov yozib qo'shadi). Tugma + modal o'rniga doim ko'rinib turadigan kart.
import { useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { Btn } from "../src/components/Btn";
import { ExpandableCard, yopKartalar } from "../src/components/ExpandableCard";
import { ScrollBox } from "../src/components/ScrollBox";
import { C, T, S, R } from "../src/theme";
import { formatSom, kartaJami, kartaHisob } from "../src/logic/hisob";

const localSana = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const BOSH = { summa: "", izoh: "" };

export default function Karta() {
  const { nonlar, kartalar, setKartalar, mahsulotNarxlari, ochirArxivga } = useApp();
  const [tahrirId, setTahrirId] = useState(null);
  const scrollRef = useRef(null);
  const [forma, setForma] = useState(BOSH);

  const karta = useMemo(() => kartaJami(kartalar), [kartalar]);
  const preview = useMemo(
    () => kartaHisob(parseFloat(forma.summa) || 0, nonlar, mahsulotNarxlari),
    [forma.summa, nonlar, mahsulotNarxlari]
  );

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  // Saqlash/Bekor: forma tozalanadi va ochiq batafsil kartalar yopiladi
  const tozala = () => { setForma(BOSH); setTahrirId(null); yopKartalar(); };

  const tahrirla = (k) => {
    setForma({ summa: String(k.summa || ""), izoh: k.izoh || "" });
    yopKartalar();
    setTahrirId(k.id); setTimeout(() => scrollRef.current?.scrollToTop?.(true), 50);
  };

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
    tozala();
  };

  const ochirKarta = (id) => Alert.alert("O'chirish", "Bu to'lovni o'chirasizmi?", [
    { text: "Bekor", style: "cancel" },
    { text: "Ha", style: "destructive", onPress: () => {
      yopKartalar();
      ochirArxivga("karta", id); // Tarixdagilar'ga — 7 kun ichida qaytarish mumkin
      if (tahrirId === id) tozala();
    } },
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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

        {/* INLINE FORMA — Markaz>Karta'ga kirish bilan darrov ko'rinadi */}
        <Card style={styles.formCard}>
          <View style={styles.formHead}>
            <Ionicons name={tahrirId ? "create-outline" : "add-circle-outline"} size={18} color={C.sub} />
            <Text style={styles.formTitle}>{tahrirId ? "To'lovni tahrirlash" : "Yangi karta to'lovi"}</Text>
          </View>

          <Text style={styles.inputLabel}>Aniq narx (so'm) *</Text>
          <TextInput
            value={forma.summa}
            onChangeText={(v) => yangila("summa", v)}
            placeholder="0"
            placeholderTextColor={C.muted}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Izoh</Text>
          <TextInput
            value={forma.izoh}
            onChangeText={(v) => yangila("izoh", v)}
            placeholder="Qo'shimcha izoh (ixtiyoriy)"
            placeholderTextColor={C.muted}
            multiline
            style={[styles.input, styles.inputMulti]}
          />

          {(parseFloat(forma.summa) || 0) > 0 && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Hisob (o'rtacha narx asosida)</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>≈ Nechta non</Text>
                <Text style={styles.previewVal}>{preview.dona} dona</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Sof foyda</Text>
                <Text style={[styles.previewVal, { color: preview.sofFoyda >= 0 ? C.green : C.red }]}>
                  {formatSom(preview.sofFoyda)} so'm
                </Text>
              </View>
            </View>
          )}

          <View style={styles.formActions}>
            <Btn color={C.accent} onPress={saqla}>{tahrirId ? "Yangilash" : "Saqlash"}</Btn>
            {tahrirId && <Btn secondary onPress={tozala}>Bekor</Btn>}
          </View>
        </Card>

        {/* OXIRGI TO'LOVLAR */}
        <View style={styles.secHead}>
          <Ionicons name="receipt-outline" size={13} color={C.sub} />
          <Text style={styles.secTitle}>OXIRGI TO'LOVLAR</Text>
          <Text style={styles.secCount}>{(kartalar || []).length} ta</Text>
        </View>

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
                <Pressable onPress={() => tahrirla(k)} hitSlop={6} style={styles.actBtn}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  backBtn:  { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: S[3] },
  backTxt:  { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: S[3], marginBottom: S[5] },
  iconBox:  { width: 44, height: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.green + "14" },
  iconImg:  { width: 24, height: 24, tintColor: C.green },
  flex1:    { flex: 1 },
  eyebrow:  { fontSize: 11, color: C.muted, fontWeight: "700", letterSpacing: 1.8 },
  title:    { fontSize: T.xl, color: C.text, fontWeight: "800", letterSpacing: -0.6, marginTop: 2 },
  subtitle: { fontSize: T.sm, color: C.sub, fontWeight: "500", marginTop: 3 },
  bosh:     { fontSize: T.sm, color: C.muted },

  // Forma kartasi
  formCard: { marginBottom: S[5] },
  formHead: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[4] },
  formTitle:{ fontSize: T.md, fontWeight: "800", color: C.text },
  inputLabel:{ fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[2], letterSpacing: 0.3 },
  input:    { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  inputMulti:{ minHeight: 64, textAlignVertical: "top" },
  preview:  { marginTop: S[3], backgroundColor: C.green + "0D", borderWidth: 1, borderColor: C.green + "2E", borderRadius: R.md, padding: S[3] },
  previewTitle:{ fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: S[2], letterSpacing: 0.3 },
  previewRow:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[1] },
  previewLabel:{ fontSize: T.sm, color: C.sub },
  previewVal:{ fontSize: T.md, fontWeight: "800", color: C.text },
  formActions:{ marginTop: S[4], gap: S[2] },

  // Section head
  secHead:  { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[3] },
  secTitle: { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1, flex: 1 },
  secCount: { fontSize: T.sm, color: C.sub, fontWeight: "700" },

  // List items
  item:     { marginBottom: S[3] },
  mHead:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: S[2] },
  itemIsm:  { fontSize: T.md, fontWeight: "700", color: C.text },
  itemIzoh: { fontSize: T.sm, color: C.sub, marginTop: 2 },
  itemSana: { fontSize: T.xs, color: C.muted, marginTop: 2 },
  itemSumma:{ fontSize: T.md, fontWeight: "800", marginLeft: S[2] },
  actions:  { flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:   { flexDirection: "row", alignItems: "center" },
  actTxt:   { fontSize: T.sm, fontWeight: "700" },
});
