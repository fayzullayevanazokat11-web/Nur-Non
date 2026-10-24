// "Rasmlar arxivi" — logotip menyusidan ochiladi. Oxirgi 7 kunning qop rasmlari kunlar bo'yicha
// (faqat ko'rish uchun). Rasmlar Kunlik qop hisobi tagidagi "Rasmga olish" bo'limida olinadi.
// Kun bosilsa — o'sha kun rasmlari ochiladi; rasm bosilsa shu yerda kattalashadi (Modal yo'q).
import { useMemo, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, LayoutAnimation, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { ScrollBox } from "../src/components/ScrollBox";
import { SahifaSarlavha } from "../src/components/SahifaSarlavha";
import { sanaChiroyli } from "../src/logic/davr";
import { bugunSana } from "../src/logic/hisob";
import { C, T, S, R, temaStil } from "../src/theme";

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
const ikki = (n) => String(n).padStart(2, "0");
const soat = (ms) => { const d = new Date(ms); return `${ikki(d.getHours())}:${ikki(d.getMinutes())}`; };

export default function Rasmlar() {
  const { qopRasmlari } = useApp();
  const bugun = bugunSana();
  const kunlar = useMemo(() => {
    const m = new Map();
    (qopRasmlari || []).forEach((r) => { if (!m.has(r.kun)) m.set(r.kun, []); m.get(r.kun).push(r); });
    return [...m.entries()].sort((a, b) => String(b[0]).localeCompare(String(a[0])));
  }, [qopRasmlari]);
  const jami = (qopRasmlari || []).length;
  const [katta, setKatta] = useState(null);
  const [ochiqKun, setOchiqKun] = useState(kunlar[0]?.[0] || null);
  const { width } = useWindowDimensions();
  const katak = Math.floor((Math.min(width, 520) - S[5] * 2 - S[4] * 2 - S[2] * 2) / 3);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <SahifaSarlavha eyebrow="ARXIV" title="Rasmlar arxivi" subtitle={`Oxirgi 7 kun · ${jami} ta rasm`} icon="images-outline" />

        {katta && (
          <Card style={styles.kattaKarta}>
            <Image source={{ uri: katta.uri }} style={styles.kattaRasm} resizeMode="contain" />
            <View style={styles.kattaPast}>
              <Text style={styles.kattaVaqt}>{sanaChiroyli(katta.kun)} · {soat(katta.vaqt)}</Text>
              <Pressable accessibilityLabel="Rasmni yopish" onPress={() => { silliq(); setKatta(null); }} hitSlop={8} style={styles.kattaBtn}>
                <Ionicons name="close" size={18} color={C.sub} />
              </Pressable>
            </View>
          </Card>
        )}

        {kunlar.length === 0 ? (
          <Card>
            <View style={styles.bosh}>
              <Ionicons name="images-outline" size={28} color={C.muted} />
              <Text style={styles.boshTxt}>Hali rasm yo'q. Qop rasmlari «Kunlik qop hisobi» tagidagi «Rasmga olish» bo'limida olinadi.</Text>
            </View>
          </Card>
        ) : (
          <Card style={styles.royxat}>
            {kunlar.map(([k, list], i) => {
              const ochiq = ochiqKun === k;
              return (
                <View key={k} style={i > 0 && styles.chiziq}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Qop rasmlari: ${k}`}
                    accessibilityState={{ expanded: ochiq }}
                    onPress={() => { silliq(); setOchiqKun(ochiq ? null : k); }}
                    style={({ pressed }) => [styles.kunQator, pressed && { opacity: 0.75 }]}
                  >
                    <View style={styles.flex1}>
                      <Text style={styles.kunNom}>{sanaChiroyli(k)}{k === bugun ? " · bugun" : ""}</Text>
                      <Text style={styles.kunSoni}>{list.length} ta rasm</Text>
                    </View>
                    {!ochiq && (
                      <View style={styles.mini}>
                        {list.slice(0, 4).map((r) => <Image key={r.id} source={{ uri: r.uri }} style={styles.miniRasm} />)}
                      </View>
                    )}
                    <Ionicons name={ochiq ? "chevron-up" : "chevron-down"} size={16} color={C.muted} />
                  </Pressable>
                  {ochiq && (
                    <View style={styles.grid}>
                      {[...list].sort((a, b) => (a.vaqt || 0) - (b.vaqt || 0)).map((r) => (
                        <Pressable
                          key={r.id}
                          accessibilityRole="imagebutton"
                          accessibilityLabel={`Qop rasmi ${soat(r.vaqt)}`}
                          onPress={() => { silliq(); setKatta(katta?.id === r.id ? null : r); }}
                          style={({ pressed }) => [styles.katak, { width: katak, height: katak }, katta?.id === r.id && styles.katakTanlangan, pressed && { opacity: 0.8 }]}
                        >
                          <Image source={{ uri: r.uri }} style={styles.katakRasm} resizeMode="cover" />
                          <View style={styles.katakVaqt}><Text style={styles.katakVaqtTxt}>{soat(r.vaqt)}</Text></View>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </Card>
        )}
        <Text style={styles.izoh}>Rasmlar faqat shu telefonda 7 kun saqlanadi, so'ng o'zi o'chadi.</Text>
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  flex1:    { flex: 1 },
  grid:     { flexDirection: "row", flexWrap: "wrap", gap: S[2], paddingBottom: S[3] },
  katak:    { borderRadius: R.md, overflow: "hidden", backgroundColor: C.panel, borderWidth: 1, borderColor: C.borderSoft },
  katakTanlangan: { borderColor: C.accent, borderWidth: 2 },
  katakRasm:{ width: "100%", height: "100%" },
  katakVaqt:{ position: "absolute", left: 6, bottom: 6, paddingVertical: 2, paddingHorizontal: 6, borderRadius: R.pill, backgroundColor: "rgba(0,0,0,0.45)" },
  katakVaqtTxt:{ fontSize: 10, fontWeight: "800", color: "#FFFFFF" },
  kattaKarta:{ padding: S[2], marginBottom: S[4] },
  kattaRasm:{ width: "100%", height: 360, borderRadius: R.md, backgroundColor: C.panel },
  kattaPast:{ flexDirection: "row", alignItems: "center", gap: S[2], paddingTop: S[2], paddingHorizontal: S[2] },
  kattaVaqt:{ flex: 1, fontSize: T.sm, fontWeight: "700", color: C.sub },
  kattaBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.borderSoft },
  bosh:     { alignItems: "center", gap: S[2], paddingVertical: S[3] },
  boshTxt:  { fontSize: T.sm, color: C.muted, textAlign: "center", lineHeight: 20 },
  izoh:     { fontSize: 11, color: C.muted, textAlign: "center", marginTop: S[4] },
  royxat:   { paddingVertical: S[2] },
  chiziq:   { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  kunQator: { flexDirection: "row", alignItems: "center", gap: S[2], paddingVertical: S[3] },
  kunNom:   { fontSize: T.sm, fontWeight: "700", color: C.text },
  kunSoni:  { fontSize: 11, color: C.muted, marginTop: 1 },
  mini:     { flexDirection: "row", gap: 4 },
  miniRasm: { width: 34, height: 34, borderRadius: 8, backgroundColor: C.panel },

}));
