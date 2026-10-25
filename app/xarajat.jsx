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
import { Guruh } from "../src/components/Guruh";
import { ExpandableCard, yopKartalar } from "../src/components/ExpandableCard";
import { SuriladiganQator } from "../src/components/SuriladiganQator";
import { saqlandiXabar } from "../src/components/Xabarcha";
import { DateField } from "../src/components/DateField";
import { VaqtField, hozirgiSoat } from "../src/components/VaqtField";
import { ScrollBox } from "../src/components/ScrollBox";
import { SahifaSarlavha } from "../src/components/SahifaSarlavha";
import { YakunIzoh } from "../src/components/YakunIzoh";
import { C, T, S, R, temaStil } from "../src/theme";
import { formatSom, bugunSana, sonOl } from "../src/logic/hisob";
import { BoshHolat } from "../src/components/BoshHolat";


export default function Xarajat() {
  const { kunlikXarajatlar, setKunlikXarajatlar, ochirArxivga, yozuvSanasi } = useApp();
  // Bugun yakunlangan bo'lsa — yangi yozuv ertangi ish kuniga tushadi
  const localSana = yozuvSanasi;
  const bugun = bugunSana();
  // sana: bo'sh bo'lsa => "avtomatik bugun" har save'da yangidan hisoblanadi
  const BOSH = { summa: "", izoh: "", sana: "", sanaTanlandi: false, soat: "" };
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
  const yangilaSana = (v) => setForma((p) => ({ ...p, sana: v, sanaTanlandi: true }));
  // Saqlash/Bekor: forma tozalanadi va ochiq batafsil kartalar yopiladi
  const tozala = () => { setForma(BOSH); setTahrirId(null); yopKartalar(); };

  const tahrirla = (x) => {
    // Mavjud yozuv sanasi tahrirlash uchun "qo'lda tanlangan" deb hisoblanadi
    setForma({ summa: String(x.summa || ""), izoh: x.izoh || "", sana: x.sana || bugun, sanaTanlandi: true, soat: x.soat || "" });
    yopKartalar();
    setTahrirId(x.id); setTimeout(() => scrollRef.current?.scrollToTop?.(true), 50);
  };

  const saqla = () => {
    const summa = sonOl(forma.summa);
    if (!summa) { Alert.alert("Summa kiritilmagan", "Iltimos, xarajat summasini kiriting."); return; }
    if (!forma.izoh.trim()) { Alert.alert("Izoh kiritilmagan", "Xarajat nimaga ketganini yozing."); return; }
    // Qo'lda tanlanmagan bo'lsa har save'da joriy kun (uzoq vaqt ochiq qolsa ham to'g'ri)
    const sana = forma.sanaTanlandi && forma.sana ? forma.sana : localSana();
    const soat = forma.soat || hozirgiSoat(); // qo'lda tanlanmasa — hozirgi vaqt
    if (tahrirId) {
      setKunlikXarajatlar((prev) => prev.map((x) => x.id === tahrirId ? { ...x, summa, izoh: forma.izoh.trim(), sana, soat } : x));
    } else {
      setKunlikXarajatlar((prev) => [{ id: Date.now(), sana, soat, vaqt: Date.now(), summa, izoh: forma.izoh.trim() }, ...(prev || [])]);
    }
    saqlandiXabar("Xarajat saqlandi");
    tozala();
  };

  const ochir = (id) => Alert.alert("O'chirish", "Bu xarajatni o'chirasizmi?", [
    { text: "Bekor", style: "cancel" },
    { text: "Ha", style: "destructive", onPress: () => {
      yopKartalar();
      ochirArxivga("xarajat", id); // Tarixdagilar'ga — 7 kun ichida qaytarish mumkin
      if (tahrirId === id) tozala();
    } },
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SahifaSarlavha eyebrow="QO'SHIMCHA XARAJATLAR" title="Kunlik xarajatlar" subtitle={`Bugun: ${formatSom(bugungiJami)} so'm · Jami: ${formatSom(jami7Kun)} so'm`} image={require("../assets/icons/xarajat.png")} />

        {/* INLINE FORMA */}
        <YakunIzoh />
        <Card style={styles.formCard}>
          <View style={styles.formHead}>
            <Ionicons name={tahrirId ? "create-outline" : "add-circle-outline"} size={18} color={C.sub} />
            <Text style={styles.formTitle}>{tahrirId ? "Xarajatni tahrirlash" : "Yangi xarajat"}</Text>
          </View>

          <Text style={styles.inputLabel}>Sana</Text>
          <DateField value={forma.sana || localSana()} onChange={yangilaSana} />
          <Text style={styles.inputLabel}>Vaqt</Text>
          <VaqtField value={forma.soat} onChange={(v) => setForma((p) => ({ ...p, soat: v }))} />
          {!forma.sanaTanlandi && !forma.soat && <Text style={styles.hint}>Bugungi sana va hozirgi vaqt avtomatik. O'zgartirish uchun bosing.</Text>}

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
          <BoshHolat icon="cash-outline" sarlavha="Hali xarajat yo'q" matn="Gaz, yo'l haqi, ta'mir kabi kunlik xarajatlarni yuqoridagi formadan yozing — sof foydadan ayriladi." />
        ) : (
          <Guruh>{royxat.map((x) => (
            <SuriladiganQator key={x.id} ichki nom={x.izoh} onOchir={() => { yopKartalar(); ochirArxivga("xarajat", x.id); if (tahrirId === x.id) tozala(); saqlandiXabar("O'chirildi · Tarixdagilarda"); }}>
              <ExpandableCard
                ichki
                header={
                  <View style={styles.mHead}>
                    <View style={styles.flex1}>
                      <Text style={styles.itemIsm} numberOfLines={1}>{x.izoh}</Text>
                      <Text style={styles.itemSana}>{x.sana}{x.soat ? ` · ${x.soat}` : ""}{x.sana === bugun ? " · bugun" : ""}</Text>
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
            </SuriladiganQator>
          ))}</Guruh>
        )}

        <Text style={styles.note}>* Xarajatlar 7 kun saqlanadi. Bugungi xarajatlar kunlik sof foydadan ayriladi.</Text>
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  flex1:    { flex: 1 },
  bosh:     { fontSize: T.sm, color: C.muted },

  formCard: { marginBottom: S[5] },
  formHead: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[4] },
  formTitle:{ fontSize: T.md, fontWeight: "800", color: C.text },
  inputLabel:{ fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[3], letterSpacing: 0.3 },
  input:    { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  inputMulti:{ minHeight: 72, textAlignVertical: "top" },
  hint:     { fontSize: 11, color: C.muted, marginTop: 5, fontStyle: "italic" },
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
}));
