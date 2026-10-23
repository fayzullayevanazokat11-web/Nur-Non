// Ertalabgi qop rasmlari — bitta kunning rasmlari (sukut: bugun). Bugun uchun kameradan
// olish yoki galereyadan qo'shish mumkin; o'tgan kunlar (7 kungacha) faqat ko'rish uchun.
// Rasm bosilsa — shu sahifaning o'zida kattalashadi (Modal yo'q).
import { useMemo, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert, LayoutAnimation, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { Btn } from "../src/components/Btn";
import { ScrollBox } from "../src/components/ScrollBox";
import { SahifaSarlavha } from "../src/components/SahifaSarlavha";
import { ErtalabQadamBelgisi } from "../src/components/ErtalabTekshiruv";
import { rasmTanla } from "../src/logic/qopRasm";
import { sanaChiroyli } from "../src/logic/davr";
import { bugunSana } from "../src/logic/hisob";
import { sezgi } from "../src/logic/sezgi";
import { C, T, S, R, temaStil } from "../src/theme";

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
const ikki = (n) => String(n).padStart(2, "0");
const soat = (ms) => { const d = new Date(ms); return `${ikki(d.getHours())}:${ikki(d.getMinutes())}`; };

export default function Rasmlar() {
  const { kun: kunParam } = useLocalSearchParams();
  const { qopRasmlari, qopRasmQosh, qopRasmOchir } = useApp();
  const bugun = bugunSana();
  const kun = typeof kunParam === "string" && kunParam ? kunParam : bugun;
  const bugunmi = kun === bugun;
  const rasmlar = useMemo(() => (qopRasmlari || []).filter((r) => r.kun === kun).sort((a, b) => (a.vaqt || 0) - (b.vaqt || 0)), [qopRasmlari, kun]);
  const [katta, setKatta] = useState(null);
  const [band, setBand] = useState(false);
  const { width } = useWindowDimensions();
  const katak = Math.floor((Math.min(width, 520) - S[5] * 2 - S[2] * 2) / 3);

  const qosh = async (manba) => {
    if (band) return;
    setBand(true);
    const r = await rasmTanla(manba);
    if (r.xato) Alert.alert("Ruxsat kerak", r.xato);
    else if (r.uri.length) { silliq(); await qopRasmQosh(r.uri); sezgi("tayyor"); }
    setBand(false);
  };
  const ochir = (x) => Alert.alert("Rasmni o'chirish", "Bu rasm butunlay o'chiriladi. Davom etasizmi?", [
    { text: "Yo'q", style: "cancel" },
    { text: "O'chirish", style: "destructive", onPress: () => { silliq(); setKatta(null); qopRasmOchir(x.id); } },
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <SahifaSarlavha eyebrow="QOP RASMLARI" title={bugunmi ? "Bugungi qoplar" : "Qop rasmlari"} subtitle={`${sanaChiroyli(kun)} · ${rasmlar.length} ta rasm`} icon="camera-outline" />
        {bugunmi && <ErtalabQadamBelgisi qadam="rasm" matn="Ertalabgi qoplarni rasmga oling, so'ng «Tayyor»" />}

        {bugunmi && (
          <View style={styles.tugmalar}>
            <View style={styles.flex1}><Btn icon="camera-outline" onPress={() => qosh("kamera")} disabled={band}>Rasmga olish</Btn></View>
            <View style={styles.flex1}><Btn secondary icon="images-outline" onPress={() => qosh("galereya")} disabled={band}>Galereyadan</Btn></View>
          </View>
        )}

        {katta && (
          <Card style={styles.kattaKarta}>
            <Image source={{ uri: katta.uri }} style={styles.kattaRasm} resizeMode="contain" />
            <View style={styles.kattaPast}>
              <Text style={styles.kattaVaqt}>{soat(katta.vaqt)}</Text>
              <Pressable accessibilityLabel="Rasmni o'chirish" onPress={() => ochir(katta)} hitSlop={8} style={styles.kattaBtn}>
                <Ionicons name="trash-outline" size={16} color={C.red} />
              </Pressable>
              <Pressable accessibilityLabel="Rasmni yopish" onPress={() => { silliq(); setKatta(null); }} hitSlop={8} style={styles.kattaBtn}>
                <Ionicons name="close" size={18} color={C.sub} />
              </Pressable>
            </View>
          </Card>
        )}

        {rasmlar.length === 0 ? (
          <Card>
            <View style={styles.bosh}>
              <Ionicons name="images-outline" size={28} color={C.muted} />
              <Text style={styles.boshTxt}>{bugunmi ? "Bugun hali rasm yo'q. Ertalabgi qoplarni rasmga oling yoki galereyadan qo'shing." : "Bu kun uchun rasm yo'q."}</Text>
            </View>
          </Card>
        ) : (
          <View style={styles.grid}>
            {rasmlar.map((r) => (
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
        <Text style={styles.izoh}>Rasmlar faqat shu telefonda 7 kun saqlanadi, so'ng o'zi o'chadi.</Text>
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  flex1:    { flex: 1 },
  tugmalar: { flexDirection: "row", gap: S[2], marginBottom: S[4] },
  grid:     { flexDirection: "row", flexWrap: "wrap", gap: S[2] },
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
}));
