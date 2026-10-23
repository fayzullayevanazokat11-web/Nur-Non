// "Kalkulyator" — mijozga non sotishda tez hisob: har bir nondan nechta olinishi
// kiritiladi, umumiy narx tepada doim ko'rinib turadi. Hisobni bir bosishda Qarz yoki
// Optom formasiga o'tkazish mumkin (savat tayyor holda ochiladi).
import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, LayoutAnimation } from "react-native";
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

  const qoy = (id, v) => setSoni((p) => ({ ...p, [id]: v }));
  const qosh = (id, d) => setSoni((p) => ({ ...p, [id]: String(Math.max(0, son(p[id]) + d)) }));
  const tozala = () => { silliq(); setSoni({}); };
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
          {hisob.dona > 0 && (
            <Pressable accessibilityRole="button" accessibilityLabel="Hisobni tozalash" onPress={tozala} hitSlop={8} style={({ pressed }) => [styles.tozala, pressed && styles.bosildi]}>
              <Ionicons name="refresh" size={16} color={C.onAccent} />
              <Text style={styles.tozalaTxt}>Tozalash</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollBox contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="Tez hisob" title="Non kalkulyatori" image={require("../../assets/tabicons/kalkulyator.png")} />

        {(nonlar || []).length === 0 ? (
          <Card><Text style={styles.bosh}>Hali non turi qo'shilmagan. Ishlab chiqarish bo'limida qo'shing.</Text></Card>
        ) : (
          <Card style={styles.royxat}>
            {(nonlar || []).map((n, i) => {
              const k = son(soni[n.id]);
              return (
                <View key={n.id} style={[styles.qator, i > 0 && styles.chiziq]}>
                  <View style={styles.ikon}><NonIkon non={n} size={20} color={C.accent} /></View>
                  <View style={styles.flex1}>
                    <Text style={styles.nom} numberOfLines={1}>{n.nom}</Text>
                    <Text style={styles.narx}>{formatSom(n.narx)} so'm{k > 0 ? `  ·  ${formatSom(k * (parseFloat(n.narx) || 0))}` : ""}</Text>
                  </View>
                  <Pressable accessibilityLabel={`${n.nom}: kamaytirish`} onPress={() => qosh(n.id, -1)} hitSlop={6} style={({ pressed }) => [styles.qadam, pressed && styles.bosildi]}>
                    <Ionicons name="remove" size={18} color={C.accent} />
                  </Pressable>
                  <TextInput
                    accessibilityLabel={`${n.nom}: soni`}
                    value={soni[n.id] ?? ""}
                    onChangeText={(v) => qoy(n.id, v.replace(/[^\d]/g, ""))}
                    placeholder="0"
                    placeholderTextColor={C.muted}
                    keyboardType="numeric"
                    style={[styles.input, k > 0 && styles.inputFaol]}
                  />
                  <Pressable accessibilityLabel={`${n.nom}: oshirish`} onPress={() => qosh(n.id, 1)} hitSlop={6} style={({ pressed }) => [styles.qadam, styles.qadamQosh, pressed && styles.bosildi]}>
                    <Ionicons name="add" size={18} color={C.onAccent} />
                  </Pressable>
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
  qadamQosh:{ backgroundColor: C.accent, borderColor: C.accent },
  input:    { width: 52, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 7, paddingHorizontal: 6, fontSize: T.md, fontWeight: "800", color: C.text, backgroundColor: C.surface, textAlign: "center" },
  inputFaol:{ borderColor: C.accent, color: C.accent },
  bosildi:  { opacity: 0.75, transform: [{ scale: 0.94 }] },
  amallar:  { marginTop: S[4] },
  amalNom:  { fontSize: T.xs, fontWeight: "800", color: C.sub, letterSpacing: 0.5, marginBottom: S[2] },
  amalQator:{ flexDirection: "row", gap: S[2] },
}));
