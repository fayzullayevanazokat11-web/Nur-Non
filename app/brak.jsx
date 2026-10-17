// Brak ekrani — inline forma yuqorida. Ishchini tanlab, har non turidan brak
// donasini darrov yozish mumkin (modal yo'q).
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
import { SahifaSarlavha } from "../src/components/SahifaSarlavha";
import { BrakTahlili } from "../src/components/BrakTahlili";
import { C, T, S, R, temaStil } from "../src/theme";
import { formatSom } from "../src/logic/hisob";

const localSana = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const BOSH = { ishchiId: null, dona: {} };

export default function Brak() {
  const { nonlar, ishchilar, braklar, setBraklar, ochirArxivga } = useApp();
  const [tahrirId, setTahrirId] = useState(null);
  const scrollRef = useRef(null);
  const [forma, setForma] = useState(BOSH);

  const qopIshchilar = (ishchilar || []).filter((w) => w.haqTuri === "qop" && w.holat === "Aktiv");
  const ishchi = qopIshchilar.find((w) => w.id === forma.ishchiId);
  const donaNarxi = (nom) => parseFloat((nonlar || []).find((n) => n.nom === nom)?.narx) || 0;
  const summa = useMemo(() =>
    (ishchi?.nonTurlari || []).reduce((s, nom) => s + donaNarxi(nom) * (parseFloat(forma.dona[nom]) || 0), 0),
    [ishchi, forma.dona, nonlar]
  );

  // Saqlash/Bekor: forma tozalanadi va ochiq batafsil kartalar yopiladi
  const tozala = () => { setForma(BOSH); setTahrirId(null); yopKartalar(); };
  const setDona = (nom, v) => setForma((p) => ({ ...p, dona: { ...p.dona, [nom]: v } }));

  const tahrirla = (b) => {
    setForma({ ishchiId: b.ishchiId, dona: { [b.nonNomi]: String(b.soni || "") } });
    yopKartalar();
    setTahrirId(b.id); setTimeout(() => scrollRef.current?.scrollToTop?.(true), 50);
  };

  const saqla = () => {
    if (!ishchi) { Alert.alert("To'liq emas", "Ishchini tanlang."); return; }
    if (tahrirId) {
      const b = (braklar || []).find((x) => x.id === tahrirId);
      const nom = b?.nonNomi;
      const soni = parseFloat(forma.dona[nom]) || 0;
      if (soni <= 0) { Alert.alert("To'liq emas", "Brak sonini kiriting (0 dan katta)."); return; }
      setBraklar((prev) => prev.map((x) => x.id === tahrirId
        ? { ...x, ishchiId: ishchi.id, ishchiIsm: ishchi.ism, soni, summa: Math.round(donaNarxi(nom) * soni) }
        : x));
      tozala();
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
    tozala();
  };

  const ochirBrak = (id) => Alert.alert("O'chirish", "Bu brakni o'chirasizmi?", [
    { text: "Bekor", style: "cancel" },
    { text: "Ha", style: "destructive", onPress: () => {
      yopKartalar();
      ochirArxivga("brak", id); // Tarixdagilar'ga — 7 kun ichida qaytarish mumkin
      if (tahrirId === id) tozala();
    } },
  ]);

  const jamiSumma = (braklar || []).reduce((s, b) => s + (parseFloat(b.summa) || 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SahifaSarlavha eyebrow="BRAK" title="Yaroqsizlar" subtitle={`${formatSom(jamiSumma)} so'm · ${(braklar || []).length} ta yozuv`} image={require("../assets/icons/brak.png")} ton="red" />

        {/* INLINE FORMA */}
        <Card style={styles.formCard}>
          <View style={styles.formHead}>
            <Ionicons name={tahrirId ? "create-outline" : "alert-circle-outline"} size={18} color={C.sub} />
            <Text style={styles.formTitle}>{tahrirId ? "Brakni tahrirlash" : "Brak qo'shish"}</Text>
          </View>

          <Text style={styles.inputLabel}>Ishchi (qopdan haq oladigan)</Text>
          {qopIshchilar.length === 0 ? (
            <Text style={styles.bosh}>Qopdan haq oladigan aktiv ishchi yo'q.</Text>
          ) : (
            qopIshchilar.map((w) => (
              <Pressable key={w.id} onPress={() => setForma((p) => ({ ishchiId: w.id, dona: p.ishchiId === w.id ? p.dona : {} }))} style={[styles.pickRow, forma.ishchiId === w.id && styles.pickRowActive]}>
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

          <View style={styles.formActions}>
            <Btn color={C.accent} onPress={saqla}>{tahrirId ? "Yangilash" : "Saqlash"}</Btn>
            {tahrirId && <Btn secondary onPress={tozala}>Bekor</Btn>}
          </View>
        </Card>

        {/* RO'YXAT */}
        <BrakTahlili />

        <View style={styles.secHead}>
          <Ionicons name="alert-circle-outline" size={13} color={C.sub} />
          <Text style={styles.secTitle}>BRAK YOZUVLARI</Text>
          <Text style={styles.secCount}>{(braklar || []).length} ta</Text>
        </View>

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
                <Pressable onPress={() => tahrirla(b)} hitSlop={6} style={styles.actBtn}>
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
  pickRow:  { flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 12, marginBottom: S[2], backgroundColor: C.surface },
  pickRowActive: { borderColor: C.accent, backgroundColor: C.accent + "0D" },
  pickTxt:  { fontSize: T.sm, color: C.sub, fontWeight: "600", flexShrink: 1 },
  pickTxtActive: { color: C.accent, fontWeight: "700" },
  savatRow: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  savatNom: { flex: 1, fontSize: T.sm, color: C.text },
  savatNarx:{ fontSize: T.xs, color: C.muted, width: 70, textAlign: "right" },
  savatInput:{ width: 70, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 8, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  preview:  { marginTop: S[3], backgroundColor: C.red + "0D", borderWidth: 1, borderColor: C.red + "26", borderRadius: R.md, padding: S[3] },
  previewRow:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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
  actions:  { flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:   { flexDirection: "row", alignItems: "center" },
  actTxt:   { fontSize: T.sm, fontWeight: "700" },
}));
