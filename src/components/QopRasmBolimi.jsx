// Kunlik qop hisobi tagidagi "Rasmga olish" bo'limi — shu ish kunining qop rasmlari.
// Kameradan olish yoki galereyadan qo'shish; rasm bosilsa shu yerda kattalashadi (Modal yo'q).
// Kunni yakunlash uchun kamida bitta rasm kerak.
import { useMemo, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert, LayoutAnimation, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../store/AppData";
import { Card } from "./Card";
import { Btn } from "./Btn";
import { rasmTanla } from "../logic/qopRasm";
import { sezgi } from "../logic/sezgi";
import { C, T, S, R, temaStil } from "../theme";

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
const ikki = (n) => String(n).padStart(2, "0");
const soat = (ms) => { const d = new Date(ms); return `${ikki(d.getHours())}:${ikki(d.getMinutes())}`; };

export function QopRasmBolimi({ kun }) {
  const { qopRasmlari, qopRasmQosh, qopRasmOchir } = useApp();
  const rasmlar = useMemo(() => (qopRasmlari || []).filter((r) => r.kun === kun).sort((a, b) => (a.vaqt || 0) - (b.vaqt || 0)), [qopRasmlari, kun]);
  const [katta, setKatta] = useState(null);
  const [band, setBand] = useState(false);
  const { width } = useWindowDimensions();
  const katak = Math.floor((Math.min(width, 520) - S[5] * 2 - S[4] * 2 - S[2] * 3) / 4);

  const qosh = async (manba) => {
    if (band) return;
    setBand(true);
    const r = await rasmTanla(manba);
    if (r.xato) Alert.alert("Ruxsat kerak", r.xato);
    else if (r.uri.length) { silliq(); await qopRasmQosh(r.uri, kun); sezgi("tayyor"); }
    setBand(false);
  };
  const ochir = (x) => Alert.alert("Rasmni o'chirish", "Bu rasm butunlay o'chiriladi. Davom etasizmi?", [
    { text: "Yo'q", style: "cancel" },
    { text: "O'chirish", style: "destructive", onPress: () => { silliq(); setKatta(null); qopRasmOchir(x.id); } },
  ]);

  return (
    <Card style={styles.card} testID="rasm-bolimi">
      <View style={styles.bosh}>
        <Ionicons name="camera-outline" size={18} color={C.sub} />
        <Text style={styles.sarlavha}>Rasmga olish</Text>
        <Text style={[styles.soni, !rasmlar.length && { color: C.red }]}>{rasmlar.length ? `${rasmlar.length} ta rasm` : "Rasm yo'q"}</Text>
      </View>
      <Text style={styles.izoh}>Qoplarni rasmga oling — kunni yakunlash uchun kamida bitta rasm kerak.</Text>

      <View style={styles.tugmalar}>
        <View style={styles.flex1}><Btn icon="camera-outline" onPress={() => qosh("kamera")} disabled={band}>Rasmga olish</Btn></View>
        <View style={styles.flex1}><Btn secondary icon="images-outline" onPress={() => qosh("galereya")} disabled={band}>Galereyadan</Btn></View>
      </View>

      {katta && (
        <View style={styles.kattaQuti}>
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
        </View>
      )}

      {rasmlar.length > 0 && (
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
            </Pressable>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = temaStil(() => StyleSheet.create({
  card:     { marginBottom: S[4] },
  flex1:    { flex: 1 },
  bosh:     { flexDirection: "row", alignItems: "center", gap: S[2] },
  sarlavha: { flex: 1, fontSize: T.md, fontWeight: "800", color: C.text },
  soni:     { fontSize: T.xs, fontWeight: "700", color: C.sub },
  izoh:     { fontSize: 11, color: C.muted, marginTop: 4, marginBottom: S[3], lineHeight: 15 },
  tugmalar: { flexDirection: "row", gap: S[2] },
  grid:     { flexDirection: "row", flexWrap: "wrap", gap: S[2], marginTop: S[3] },
  katak:    { borderRadius: R.md, overflow: "hidden", backgroundColor: C.panel, borderWidth: 1, borderColor: C.borderSoft },
  katakTanlangan: { borderColor: C.accent, borderWidth: 2 },
  katakRasm:{ width: "100%", height: "100%" },
  kattaQuti:{ marginTop: S[3] },
  kattaRasm:{ width: "100%", height: 300, borderRadius: R.md, backgroundColor: C.panel },
  kattaPast:{ flexDirection: "row", alignItems: "center", gap: S[2], paddingTop: S[2] },
  kattaVaqt:{ flex: 1, fontSize: T.sm, fontWeight: "700", color: C.sub },
  kattaBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.borderSoft },
}));
