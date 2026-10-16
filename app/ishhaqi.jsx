// Oylik ish haqi — har bir xodim uchun oy bo'yicha: hisoblangan (yakunlangan
// kunlar), bonus, jarima, avans, to'langan va qolgan summa. Avans/jarima/bonus/to'lov
// yozuvlari shu yerda qo'shiladi; o'chirilsa "Tarixdagilar"ga tushadi.
import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { Btn } from "../src/components/Btn";
import { ExpandableCard, yopKartalar } from "../src/components/ExpandableCard";
import { ScrollBox } from "../src/components/ScrollBox";
import { SahifaSarlavha } from "../src/components/SahifaSarlavha";
import { C, T, S, R, temaStil } from "../src/theme";
import { formatSom, bugunSana } from "../src/logic/hisob";
import { oylikIshHaqi, joriyOy, oyQosh, oyNomi, oyKunlari, ISH_HAQI_TURLAR } from "../src/logic/davr";

const TURLAR = ["avans", "jarima", "bonus", "tolov"];

export default function IshHaqi() {
  const { hisobotlarTarixi, oylikArxiv, ishchilar, ishHaqiYozuvlari, setIshHaqiYozuvlari, ochirArxivga } = useApp();
  const [oy, setOy] = useState(joriyOy());
  const [forma, setForma] = useState({}); // ishchiId → { tur, summa, izoh }
  const hisob = useMemo(
    () => oylikIshHaqi({ oy, hisobotlar: hisobotlarTarixi, arxiv: oylikArxiv, ishchilar, yozuvlar: ishHaqiYozuvlari }),
    [oy, hisobotlarTarixi, oylikArxiv, ishchilar, ishHaqiYozuvlari]
  );
  const joriy = oy === joriyOy();
  // Yozuv sanasi: joriy oyda — bugun, o'tgan oyda — o'sha oyning oxirgi kuni
  const yozuvSana = () => (joriy ? bugunSana() : `${oy}-${String(oyKunlari(oy)).padStart(2, "0")}`);

  const f = (id) => forma[id] || { tur: "avans", summa: "", izoh: "" };
  const yangila = (id, k, v) => setForma((p) => ({ ...p, [id]: { ...f(id), ...p[id], [k]: v } }));

  const qosh = (r, tur, summa, izoh = "") => {
    setIshHaqiYozuvlari((p) => [{ id: Date.now(), ishchiId: r.id, tur, summa: Math.round(summa), sana: yozuvSana(), vaqt: Date.now(), izoh }, ...(p || [])]);
  };

  const saqla = (r) => {
    const x = f(r.id);
    const summa = parseFloat(String(x.summa).replace(/\s/g, "")) || 0;
    if (summa <= 0) { Alert.alert("Summa kiritilmagan", "Iltimos, summani kiriting."); return; }
    qosh(r, x.tur, summa, (x.izoh || "").trim());
    setForma((p) => ({ ...p, [r.id]: { tur: x.tur, summa: "", izoh: "" } }));
  };

  const toliqTola = (r) =>
    Alert.alert("Oylikni to'lash", `${r.ism}ga qolgan ${formatSom(r.qoldiq)} so'm to'landimi?`, [
      { text: "Bekor", style: "cancel" },
      { text: "Ha, to'landi", onPress: () => { qosh(r, "tolov", r.qoldiq, "Oylik to'landi"); yopKartalar(); } },
    ]);

  const ochir = (y) =>
    Alert.alert("O'chirish", `${ISH_HAQI_TURLAR[y.tur]?.nom || "Yozuv"} ${formatSom(y.summa)} so'm o'chirilsinmi?`, [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => ochirArxivga("ishHaqi", y.id) },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SahifaSarlavha eyebrow="XODIMLAR" title="Oylik ish haqi" subtitle="Yakunlangan kunlar bo'yicha hisoblanadi" icon="wallet-outline" orqaga="Xodimlar" />

        {/* Oy tanlash */}
        <View style={styles.oyQator}>
          <Pressable accessibilityLabel="Oldingi oy" onPress={() => { yopKartalar(); setOy((o) => oyQosh(o, -1)); }} hitSlop={8} style={styles.oyBtn}>
            <Ionicons name="chevron-back" size={18} color={C.text} />
          </Pressable>
          <Text style={styles.oyNom}>{oyNomi(oy)}</Text>
          <Pressable accessibilityLabel="Keyingi oy" disabled={joriy} onPress={() => { yopKartalar(); setOy((o) => oyQosh(o, 1)); }} hitSlop={8} style={[styles.oyBtn, joriy && styles.oyBtnOff]}>
            <Ionicons name="chevron-forward" size={18} color={joriy ? C.muted : C.text} />
          </Pressable>
        </View>

        <View style={styles.plitkalar}>
          <Plitka nom="Hisoblangan" qiymat={hisob.jami} />
          <Plitka nom="Berilgan" qiymat={hisob.berilgan} />
          <Plitka nom="Qoldiq" qiymat={hisob.qoldiq} ajrat />
        </View>

        {hisob.list.length === 0 ? (
          <Card><Text style={styles.bosh}>Bu oyda hisob yo'q.</Text></Card>
        ) : (
          hisob.list.map((r) => {
            const x = f(r.id);
            return (
              <ExpandableCard
                key={r.id}
                style={styles.item}
                header={
                  <View style={styles.mHead}>
                    <View style={styles.flex1}>
                      <Text style={styles.ism} numberOfLines={1}>{r.ism}</Text>
                      <Text style={styles.izoh} numberOfLines={1}>{r.kunlar ? `${r.kunlar} kun ishladi` : "Bu oyda yakunlangan kun yo'q"}{r.avans + r.tolov > 0 ? ` · berildi ${formatSom(r.avans + r.tolov)}` : ""}</Text>
                    </View>
                    <Text style={[styles.qoldiq, r.qoldiq <= 0 && { color: C.muted }]}>{r.qoldiq > 0 ? `${formatSom(r.qoldiq)} so'm` : r.qoldiq < 0 ? `+${formatSom(-r.qoldiq)}` : "✓"}</Text>
                  </View>
                }
              >
                <Qator nom={`Hisoblangan${r.kunlar ? ` (${r.kunlar} kun)` : ""}`} qiymat={r.hisoblangan} />
                {r.bonus > 0 && <Qator nom="Bonus" qiymat={r.bonus} belgi="+" />}
                {r.jarima > 0 && <Qator nom="Jarima" qiymat={r.jarima} belgi="−" />}
                {r.avans > 0 && <Qator nom="Avans" qiymat={r.avans} belgi="−" />}
                {r.tolov > 0 && <Qator nom="To'langan" qiymat={r.tolov} belgi="−" />}
                <View style={styles.qoldiqQator}>
                  <Text style={styles.qoldiqNom}>{r.qoldiq < 0 ? "Ortiqcha berilgan" : "Qolgan"}</Text>
                  <Text style={styles.qoldiqVal}>{formatSom(Math.abs(r.qoldiq))} so'm</Text>
                </View>

                {/* Yangi yozuv */}
                <View style={styles.turlar}>
                  {TURLAR.map((t) => (
                    <Pressable key={t} onPress={() => yangila(r.id, "tur", t)} style={[styles.tur, x.tur === t && styles.turActive]}>
                      <Text style={[styles.turTxt, x.tur === t && styles.turTxtActive]}>{ISH_HAQI_TURLAR[t].nom}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.kiritQator}>
                  <View style={styles.flex1}>
                    <TextInput value={x.summa} onChangeText={(v) => yangila(r.id, "summa", v)} placeholder="Summa" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
                  </View>
                  <Pressable accessibilityLabel={`${r.ism}: yozuv qo'shish`} onPress={() => saqla(r)} style={({ pressed }) => [styles.qoshBtn, pressed && styles.pressed]}>
                    <Ionicons name="add" size={20} color={C.onAccent} />
                  </Pressable>
                </View>
                <TextInput value={x.izoh} onChangeText={(v) => yangila(r.id, "izoh", v)} placeholder="Izoh (ixtiyoriy)" placeholderTextColor={C.muted} style={[styles.input, styles.izohInput]} />
                {r.qoldiq > 0 && (
                  <Pressable onPress={() => toliqTola(r)} hitSlop={6} style={styles.toliqBtn}>
                    <Ionicons name="checkmark-done-outline" size={15} color={C.accent} />
                    <Text style={styles.toliqTxt}> Qolganini to'lash · {formatSom(r.qoldiq)} so'm</Text>
                  </Pressable>
                )}

                {r.yozuvlar.length > 0 && <Text style={styles.yozuvSarlavha}>YOZUVLAR</Text>}
                {r.yozuvlar.map((y) => (
                  <View key={y.id} style={styles.yozuv}>
                    <Ionicons name={ISH_HAQI_TURLAR[y.tur]?.icon || "ellipse-outline"} size={16} color={y.tur === "bonus" ? C.accent : C.sub} />
                    <View style={styles.flex1}>
                      <Text style={styles.yozuvNom}>{ISH_HAQI_TURLAR[y.tur]?.nom}{y.izoh ? ` · ${y.izoh}` : ""}</Text>
                      <Text style={styles.yozuvSana}>{y.sana}</Text>
                    </View>
                    <Text style={styles.yozuvSumma}>{ISH_HAQI_TURLAR[y.tur]?.ishora > 0 ? "+" : "−"}{formatSom(y.summa)}</Text>
                    <Pressable accessibilityLabel="Yozuvni o'chirish" onPress={() => ochir(y)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={15} color={C.muted} />
                    </Pressable>
                  </View>
                ))}
              </ExpandableCard>
            );
          })
        )}
        <Text style={styles.eslatma}>Hisoblangan summa «Kunni yakunlash» qilingan kunlardan olinadi. Bugungi kun yakunlangach qo'shiladi.</Text>
      </ScrollBox>
    </SafeAreaView>
  );
}

function Plitka({ nom, qiymat, ajrat }) {
  return (
    <View style={[styles.plitka, ajrat && styles.plitkaAjrat]}>
      <Text style={styles.plitkaNom} numberOfLines={1}>{nom}</Text>
      <Text style={[styles.plitkaVal, ajrat && { color: C.accent }]} numberOfLines={1} adjustsFontSizeToFit>{formatSom(qiymat)}</Text>
    </View>
  );
}

function Qator({ nom, qiymat, belgi = "" }) {
  return (
    <View style={styles.qator}>
      <Text style={styles.qatorNom}>{nom}</Text>
      <Text style={styles.qatorVal}>{belgi}{formatSom(qiymat)} so'm</Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  flex1:    { flex: 1 },
  bosh:     { fontSize: T.sm, color: C.muted },
  pressed:  { opacity: 0.75, transform: [{ scale: 0.97 }] },

  oyQator:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.card, borderRadius: R.pill, borderWidth: 1, borderColor: C.borderSoft, padding: 4, marginBottom: S[3] },
  oyBtn:    { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: C.surface },
  oyBtnOff: { opacity: 0.5 },
  oyNom:    { fontSize: T.md, fontWeight: "800", color: C.text },

  plitkalar:{ flexDirection: "row", gap: S[2], marginBottom: S[5] },
  plitka:   { flex: 1, backgroundColor: C.card, borderRadius: R.md, borderWidth: 1, borderColor: C.borderSoft, paddingVertical: S[3], paddingHorizontal: S[3] },
  plitkaAjrat:{ borderColor: C.accent + "55" },
  plitkaNom:{ fontSize: 11, color: C.muted, fontWeight: "700" },
  plitkaVal:{ fontSize: T.md, color: C.text, fontWeight: "800", marginTop: 3 },

  item:     { marginBottom: S[3] },
  mHead:    { flexDirection: "row", alignItems: "center", gap: S[2] },
  ism:      { fontSize: T.md, fontWeight: "700", color: C.text },
  izoh:     { fontSize: T.xs, color: C.muted, marginTop: 2 },
  qoldiq:   { fontSize: T.md, fontWeight: "800", color: C.accent },

  qator:    { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  qatorNom: { fontSize: T.sm, color: C.sub },
  qatorVal: { fontSize: T.sm, color: C.text, fontWeight: "700" },
  qoldiqQator:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: S[2], paddingTop: S[2], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  qoldiqNom:{ fontSize: T.md, color: C.text, fontWeight: "800" },
  qoldiqVal:{ fontSize: T.md, color: C.accent, fontWeight: "800" },

  turlar:   { flexDirection: "row", gap: 6, marginTop: S[4], marginBottom: S[2] },
  tur:      { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: R.pill, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  turActive:{ backgroundColor: C.accent, borderColor: C.accent },
  turTxt:   { fontSize: T.xs, fontWeight: "700", color: C.sub },
  turTxtActive:{ color: C.onAccent },
  kiritQator:{ flexDirection: "row", gap: S[2] },
  input:    { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  izohInput:{ marginTop: S[2], fontSize: T.sm },
  qoshBtn:  { width: 48, borderRadius: R.md, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" },
  toliqBtn: { flexDirection: "row", alignItems: "center", marginTop: S[3] },
  toliqTxt: { fontSize: T.sm, fontWeight: "700", color: C.accent },

  yozuvSarlavha:{ fontSize: 11, color: C.muted, fontWeight: "800", letterSpacing: 1.2, marginTop: S[4], marginBottom: S[1] },
  yozuv:    { flexDirection: "row", alignItems: "center", gap: S[2], paddingVertical: S[2], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  yozuvNom: { fontSize: T.sm, color: C.text, fontWeight: "600" },
  yozuvSana:{ fontSize: 11, color: C.muted },
  yozuvSumma:{ fontSize: T.sm, fontWeight: "800", color: C.text },
  eslatma:  { fontSize: 11, color: C.muted, marginTop: S[2], textAlign: "center", lineHeight: 16 },
}));
