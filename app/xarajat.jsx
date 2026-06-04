// Kunlik qo'shimcha xarajatlar ekrani — inline forma yuqorida (Markaz>Xarajat'ni
// bosgan ham darrov yozib qo'shadi). Tugma + modal o'rniga doim ko'rinib turadigan kart.
// 7 kun saqlanadi, bugungilari kunlik sof foydadan ayriladi.
import { useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { Btn } from "../src/components/Btn";
import { ExpandableCard } from "../src/components/ExpandableCard";
import { DateField } from "../src/components/DateField";
import { ScrollBox } from "../src/components/ScrollBox";
import { C, T, S, R } from "../src/theme";
import { formatSom } from "../src/logic/hisob";

const localSana = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function Xarajat() {
  const { kunlikXarajatlar, setKunlikXarajatlar } = useApp();
  const bugun = localSana();
  const BOSH = { summa: "", izoh: "", sana: bugun };
  const [tahrirId, setTahrirId] = useState(null);
  const scrollRef = useRef(null);
  const [forma, setForma] = useState(BOSH);

  const royxat = useMemo(
    () => [...(kunlikXarajatlar || [])].sort((a, b) => (b.vaqt || 0) - (a.vaqt || 0)),
    [kunlikXarajatlar]
  );
  const bugungiJami = useMemo(
    () => royxat.filter((x) => x.sana === bugun).reduce((s, x) => s + (parseFloat(x.summa) || 0), 0),
    [royxat, bugun]
  );
  const jami7Kun = useMemo(
    () => royxat.reduce((s, x) => s + (parseFloat(x.summa) || 0), 0),
    [royxat]
  );

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const tozala = () => { setForma(BOSH); setTahrirId(null); };

  const tahrirla = (x) => {
    setForma({ summa: String(x.summa || ""), izoh: x.izoh || "", sana: x.sana || bugun });
    setTahrirId(x.id); setTimeout(() => scrollRef.current?.scrollToTop?.(true), 50);
  };

  const saqla = () => {
    const summa = parseFloat(forma.summa) || 0;
    if (!summa) { Alert.alert("Summa kiritilmagan", "Iltimos, xarajat summasini kiriting."); return; }
    if (!forma.izoh.trim()) { Alert.alert("Izoh kiritilmagan", "Xarajat nimaga ketganini yozing."); return; }
    const sana = forma.sana || bugun;
    if (tahrirId) {
      setKunlikXarajatlar((prev) => prev.map((x) => x.id === tahrirId ? { ...x, summa, izoh: forma.izoh.trim(), sana } : x));
    } else {
      setKunlikXarajatlar((prev) => [{ id: Date.now(), sana, vaqt: Date.now(), summa, izoh: forma.izoh.trim() }, ...(prev || [])]);
    }
    tozala();
  };

  const ochir = (id) => Alert.alert("O'chirish", "Bu xarajatni o'chirasizmi?", [
    { text: "Bekor", style: "cancel" },
    { text: "Ha", style: "destructive", onPress: () => {
      setKunlikXarajatlar((p) => p.filter((x) => x.id !== id));
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
          <View style={styles.iconBox}><Image source={require("../assets/icons/xarajat.png")} style={styles.iconImg} resizeMode="contain" /></View>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>QO'SHIMCHA XARAJATLAR</Text>
            <Text style={styles.title}>Kunlik xarajatlar</Text>
            <Text style={styles.subtitle}>Bugun: {formatSom(bugungiJami)} so'm · Jami: {formatSom(jami7Kun)} so'm</Text>
          </View>
        </View>

        {/* INLINE FORMA */}
        <Card style={styles.formCard}>
          <View style={styles.formHead}>
            <Ionicons name={tahrirId ? "create-outline" : "add-circle-outline"} size={18} color={C.sub} />
            <Text style={styles.formTitle}>{tahrirId ? "Xarajatni tahrirlash" : "Yangi xarajat"}</Text>
          </View>

          <Text style={styles.inputLabel}>Sana</Text>
          <DateField value={forma.sana} onChange={(v) => yangila("sana", v)} />

          <Text style={styles.inputLabel}>Summa (so'm) *</Text>
          <TextInput value={forma.summa} onChangeText={(v) => yangila("summa", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

          <Text style={styles.inputLabel}>Nimaga ketgan *</Text>
          <TextInput value={forma.izoh} onChangeText={(v) => yangila("izoh", v)} placeholder="Masalan: Elektr, gaz, yo'l haqi, tamir..." placeholderTextColor={C.muted} multiline style={[styles.input, styles.inputMulti]} />

          <View style={styles.formActions}>
            <Btn color={C.accent} onPress={saqla}>{tahrirId ? "Yangilash" : "Saqlash"}</Btn>
            {tahrirId && <Btn secondary onPress={tozala}>Bekor</Btn>}
          </View>
        </Card>

        {/* RO'YXAT */}
        <View style={styles.secHead}>
          <Ionicons name="cash-outline" size={13} color={C.sub} />
          <Text style={styles.secTitle}>XARAJATLAR (7 kun)</Text>
          <Text style={styles.secCount}>{royxat.length} ta</Text>
        </View>

        {royxat.length === 0 ? (
          <Card><Text style={styles.bosh}>Hali xarajat yo'q</Text></Card>
        ) : (
          royxat.map((x) => (
            <ExpandableCard
              key={x.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <View style={styles.flex1}>
                    <Text style={styles.itemIsm} numberOfLines={1}>{x.izoh}</Text>
                    <Text style={styles.itemSana}>{x.sana}{x.sana === bugun ? " · bugun" : ""}</Text>
                  </View>
                  <Text style={[styles.itemSumma, { color: C.red }]} numberOfLines={1}>− {formatSom(x.summa)} so'm</Text>
                </View>
              }
            >
              <View style={styles.actions}>
                <Pressable onPress={() => tahrirla(x)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="create-outline" size={16} color={C.accent} />
                  <Text style={[styles.actTxt, { color: C.accent }]}> Tahrirlash</Text>
                </Pressable>
                <Pressable onPress={() => ochir(x.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                  <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                </Pressable>
              </View>
            </ExpandableCard>
          ))
        )}

        <Text style={styles.note}>* Xarajatlar 7 kun saqlanadi. Bugungi xarajatlar kunlik sof foydadan ayriladi.</Text>
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
  inputMulti:{ minHeight: 72, textAlignVertical: "top" },
  formActions:{ marginTop: S[4], gap: S[2] },

  secHead:  { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[3] },
  secTitle: { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1, flex: 1 },
  secCount: { fontSize: T.sm, color: C.sub, fontWeight: "700" },

  item:     { marginBottom: S[3] },
  mHead:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: S[2] },
  itemIsm:  { fontSize: T.md, fontWeight: "700", color: C.text },
  itemSana: { fontSize: T.xs, color: C.muted, marginTop: 2 },
  itemSumma:{ fontSize: T.md, fontWeight: "800", marginLeft: S[2] },
  actions:  { flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:   { flexDirection: "row", alignItems: "center" },
  actTxt:   { fontSize: T.sm, fontWeight: "700" },
  note:     { fontSize: 11, color: C.muted, marginTop: S[4], fontStyle: "italic", textAlign: "center" },
});
