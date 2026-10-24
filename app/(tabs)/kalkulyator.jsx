// "Kalkulyator" — mijozga non sotishda tez hisob: har bir nondan nechta olinishi
// kiritiladi, umumiy narx tepada doim ko'rinib turadi. Hisobni bir bosishda Qarz yoki
// Optom formasiga o'tkazish mumkin (savat tayyor holda ochiladi).
// Son telefon klaviaturasisiz kiritiladi: son katagi bosilsa, o'sha non qatori tagida
// 0–9 raqamlar (ikki qatorda) ochiladi (boshqa non bosilsa — avvalgisi yopiladi). Yonidagi tugma nollaydi.
import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, LayoutAnimation } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { ScrollBox } from "../../src/components/ScrollBox";
import { NonIkon } from "../../src/components/XomashyoIkon";
import { useAnimSon } from "../../src/components/useAnimSon";
import { C, T, S, R, temaStil } from "../../src/theme";
import { formatSom } from "../../src/logic/hisob";

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(180, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
const son = (x) => Math.max(0, parseInt(String(x ?? "").replace(/\s/g, ""), 10) || 0);

export default function Kalkulyator() {
  const { nonlar, setTayyorSavat } = useApp();
  const [soni, setSoni] = useState({}); // nonId → "12"
  // Soni kiritilgan nonlar ro'yxat tepasiga chiqadi (oxirgisi eng tepada) va
  // "Tozalash" bosilmaguncha o'sha yerda turadi
  const [tepada, setTepada] = useState([]);
  const tepagaChiqar = (id) => setTepada((p) => {
    if (p.includes(id)) return p;
    silliq();
    return [id, ...p];
  });
  const tartibli = useMemo(() => {
    const royxat = nonlar || [];
    const ust = tepada.map((id) => royxat.find((n) => n.id === id)).filter(Boolean);
    return [...ust, ...royxat.filter((n) => !tepada.includes(n.id))];
  }, [nonlar, tepada]);

  const hisob = useMemo(() => {
    let summa = 0, dona = 0;
    (nonlar || []).forEach((n) => {
      const k = son(soni[n.id]);
      summa += k * (parseFloat(n.narx) || 0);
      dona += k;
    });
    return { summa, dona };
  }, [soni, nonlar]);
  const korinish = useAnimSon(hisob.summa);

  // Raqamlar qatori qaysi non uchun ochiq (bir vaqtda bittasi)
  const [ochiq, setOchiq] = useState(null);
  const ochYop = (id) => { silliq(); setOchiq((o) => (o === id ? null : id)); };
  const raqam = (id, r) => {
    const joriy = String(son(soni[id]) || "");
    const yangi = (joriy + r).replace(/^0+(?=\d)/, "").slice(0, 4); // 4 xonagacha
    if (son(yangi) > 0) tepagaChiqar(id);
    setSoni((p) => ({ ...p, [id]: yangi }));
  };
  const nolla = (id) => setSoni((p) => ({ ...p, [id]: "" }));
  const tozala = () => { silliq(); setSoni({}); setTepada([]); setOchiq(null); };
  // Hisobni qarz / optom formasiga o'tkazish
  const otkaz = (tur) => {
    const savat = {};
    Object.entries(soni).forEach(([id, v]) => { if (son(v) > 0) savat[id] = String(son(v)); });
    setTayyorSavat({ tur, savat });
    router.push(tur === "qarz" ? "/qarzlar" : "/optom");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Umumiy narx — tepada doim ko'rinadi */}
      <View style={styles.tepa}>
        <View style={styles.jami}>
          <View style={styles.flex1}>
            <Text style={styles.jamiNom}>UMUMIY NARX</Text>
            <Text style={styles.jamiQiymat} numberOfLines={1} adjustsFontSizeToFit>{formatSom(Math.round(korinish))} so'm</Text>
            <Text style={styles.jamiDona}>{hisob.dona} dona non</Text>
          </View>
          {(hisob.dona > 0 || tepada.length > 0) && (
            <Pressable accessibilityRole="button" accessibilityLabel="Hisobni tozalash" onPress={tozala} hitSlop={8} style={({ pressed }) => [styles.tozala, pressed && styles.bosildi]}>
              <Ionicons name="refresh" size={16} color={C.onAccent} />
              <Text style={styles.tozalaTxt}>Tozalash</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollBox contentContainerStyle={styles.scroll}>
        <ScreenHeader eyebrow="Tez hisob" title="Non kalkulyatori" image={require("../../assets/tabicons/kalkulyator.png")} />

        {(nonlar || []).length === 0 ? (
          <Card><Text style={styles.bosh}>Hali non turi qo'shilmagan. Ishlab chiqarish bo'limida qo'shing.</Text></Card>
        ) : (
          <Card style={styles.royxat}>
            {tartibli.map((n, i) => {
              const k = son(soni[n.id]);
              const faol = ochiq === n.id;
              return (
                <View key={n.id} style={i > 0 && styles.chiziq}>
                <View style={styles.qator}>
                  <View style={styles.ikon}><NonIkon non={n} size={20} color={C.accent} /></View>
                  <View style={styles.flex1}>
                    <Text style={styles.nom} numberOfLines={1}>{n.nom}</Text>
                    <Text style={styles.narx}>{formatSom(n.narx)} so'm{k > 0 ? `  ·  ${formatSom(k * (parseFloat(n.narx) || 0))}` : ""}</Text>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`${n.nom}: soni`} accessibilityState={{ expanded: faol }} onPress={() => ochYop(n.id)} style={[styles.input, k > 0 && styles.inputFaol, faol && styles.inputOchiq]}>
                    <Text style={[styles.inputTxt, k > 0 && styles.inputTxtFaol, !k && !faol && styles.inputTxtBosh]}>{k || 0}</Text>
                  </Pressable>
                  <Pressable accessibilityLabel={`${n.nom}: nollash`} onPress={() => nolla(n.id)} disabled={!k} hitSlop={6} style={({ pressed }) => [styles.qadam, !k && styles.qadamOchiq, pressed && styles.bosildi]}>
                    <Ionicons name="close" size={16} color={k ? C.accent : C.muted} />
                  </Pressable>
                </View>
                {faol && (
                  <View style={styles.raqamlar}>
                    {[["1", "2", "3", "4", "5"], ["6", "7", "8", "9", "0"]].map((qator) => (
                      <View key={qator[0]} style={styles.raqamQator}>
                        {qator.map((r) => (
                          <Pressable key={r} accessibilityLabel={`${n.nom}: ${r}`} onPress={() => raqam(n.id, r)} style={({ pressed }) => [styles.raqam, pressed && styles.raqamBosildi]}>
                            <Text style={styles.raqamTxt}>{r}</Text>
                          </Pressable>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
                </View>
              );
            })}
          </Card>
        )}

        {hisob.dona > 0 && (
          <View style={styles.amallar}>
            <Text style={styles.amalNom}>Hisobni yozib qo'yish</Text>
            <View style={styles.amalQator}>
              <View style={styles.flex1}><Btn icon="receipt-outline" onPress={() => otkaz("qarz")} sezgiTuri="otish">Qarzga</Btn></View>
              <View style={styles.flex1}><Btn secondary icon="storefront-outline" onPress={() => otkaz("optom")} sezgiTuri="otish">Optomga</Btn></View>
            </View>
          </View>
        )}
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  flex1:    { flex: 1 },
  tepa:     { paddingHorizontal: S[5], paddingTop: S[3], paddingBottom: S[2], backgroundColor: C.bg },
  jami:     { flexDirection: "row", alignItems: "center", gap: S[3], backgroundColor: C.accent, borderRadius: R.lg, paddingVertical: S[4], paddingHorizontal: S[5] },
  jamiNom:  { fontSize: 10, fontWeight: "800", letterSpacing: 1, color: C.onAccentSub },
  jamiQiymat:{ fontSize: 30, fontWeight: "800", color: C.onAccent, letterSpacing: -0.5, marginTop: 2 },
  jamiDona: { fontSize: T.xs, fontWeight: "700", color: C.onAccentSub, marginTop: 2 },
  tozala:   { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: R.pill, backgroundColor: "rgba(255,255,255,0.18)" },
  tozalaTxt:{ fontSize: T.xs, fontWeight: "800", color: C.onAccent },
  scroll:   { padding: S[5], paddingTop: S[3], paddingBottom: S[8] },
  bosh:     { fontSize: T.sm, color: C.muted },
  royxat:   { paddingVertical: S[2], paddingHorizontal: S[4] },
  qator:    { flexDirection: "row", alignItems: "center", gap: S[2], paddingVertical: S[3] },
  chiziq:   { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  ikon:     { width: 36, height: 36, borderRadius: R.sm, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  nom:      { fontSize: T.sm, fontWeight: "800", color: C.text },
  narx:     { fontSize: 11, color: C.muted, marginTop: 2, fontWeight: "600" },
  qadam:    { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  qadamOchiq:{ opacity: 0.4 },
  input:    { minWidth: 58, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 7, paddingHorizontal: 8, backgroundColor: C.surface, alignItems: "center" },
  inputFaol:{ borderColor: C.accent },
  inputOchiq:{ borderColor: C.accent, borderWidth: 2, backgroundColor: C.accent + "10" },
  inputTxt: { fontSize: T.md, fontWeight: "800", color: C.text },
  inputTxtFaol:{ color: C.accent },
  inputTxtBosh:{ color: C.muted },
  // 0–9 ikki qatorda (1–5, 6–0) — barmoq bilan bosishga qulay katta tugmalar
  raqamlar: { gap: 8, paddingBottom: S[3] },
  raqamQator:{ flexDirection: "row", gap: 8 },
  raqam:    { flex: 1, height: 54, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.panel },
  raqamBosildi:{ backgroundColor: C.accent + "33", transform: [{ scale: 0.94 }] },
  raqamTxt: { fontSize: 22, fontWeight: "800", color: C.text },
  bosildi:  { opacity: 0.75, transform: [{ scale: 0.94 }] },
  amallar:  { marginTop: S[4] },
  amalNom:  { fontSize: T.xs, fontWeight: "800", color: C.sub, letterSpacing: 0.5, marginBottom: S[2] },
  amalQator:{ flexDirection: "row", gap: S[2] },
}));
