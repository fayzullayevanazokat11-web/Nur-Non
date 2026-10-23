// "Tarixdagilar" — dasturda o'chirilgan barcha narsalar 7 kun saqlanadi.
// Har birini "Qaytarish" bilan asl joyiga (asl tartibida) tiklash mumkin.
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Alert, LayoutAnimation } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { ScrollBox } from "../src/components/ScrollBox";
import { Qidiruv, qidiruvMos } from "../src/components/Qidiruv";
import { SahifaSarlavha } from "../src/components/SahifaSarlavha";
import { C, T, S, R, temaStil } from "../src/theme";
import { formatSom } from "../src/logic/hisob";
import { sanaChiroyli } from "../src/logic/davr";
import { sezgi } from "../src/logic/sezgi";

const D = 86400000;
const ikki = (n) => String(n).padStart(2, "0");
const vaqtMatni = (ms) => { const d = new Date(ms); return `${ikki(d.getDate())}.${ikki(d.getMonth() + 1)} ${ikki(d.getHours())}:${ikki(d.getMinutes())}`; };
const som = (x) => `${formatSom(x)} so'm`;

// Har bir tur: nomi, ikonka va qisqa tavsif
const TURLAR = {
  qarz:        { nom: "Qarz",              icon: "receipt-outline",       tavsif: (e) => `${e.ism} · ${som(e.summa)}` },
  optom:       { nom: "Optom",             icon: "storefront-outline",    tavsif: (e) => `${e.ism} · ${som(e.summa)}` },
  karta:       { nom: "Karta",             icon: "card-outline",          tavsif: (e) => `${e.izoh || "Karta to'lovi"} · ${som(e.summa)}` },
  brak:        { nom: "Brak",              icon: "alert-circle-outline",  tavsif: (e) => `${e.ishchiIsm} · ${e.nonNomi} ${e.soni} dona` },
  xarajat:     { nom: "Xarajat",           icon: "cash-outline",          tavsif: (e) => `${e.izoh} · ${som(e.summa)}` },
  ishchi:      { nom: "Xodim",             icon: "person-outline",        tavsif: (e) => e.ism },
  non:         { nom: "Non turi",          icon: "grid-outline",          tavsif: (e) => `${e.nom} · ${som(e.narx)}` },
  hisobot:     { nom: "Hisobot",           icon: "calendar-outline",      tavsif: (e) => `${e.sana} · sof foyda ${som(e.sofFoyda)}` },
  omborSorov:  { nom: "So'rovnoma",        icon: "documents-outline",     tavsif: (e) => `${e.manba} · ${e.sana}` },
  omborSet:    { nom: "Ombor kirimi",      icon: "cube-outline",          tavsif: (e) => `Yangi set · ${e.sana}` },
  omborTasdiq: { nom: "Ombor chiqimi",     icon: "checkmark-done-outline", tavsif: (e) => `${e.manba} · ${e.sana}` },
  ingredient:  { nom: "Xomashyo",          icon: "leaf-outline",          tavsif: (e) => e.nom },
  ishHaqi:     { nom: "Ish haqi yozuvi",   icon: "wallet-outline",        tavsif: (e) => `${{ avans: "Avans", jarima: "Jarima", bonus: "Bonus", tolov: "To'lov" }[e.tur] || ""} · ${som(e.summa)} · ${e.sana}` },
  // Salbiy amallar (o'chirish emas) — qaytarilsa amal ortga qaytadi
  haydash:     { nom: "Ishdan haydaldi",   icon: "person-remove-outline", tavsif: (e) => e.ism },
  nollash:     { nom: "Zaxira nollandi",   icon: "refresh-outline",       tavsif: (e) => `Ombor · ${(e.maydonlar || []).length} xil xomashyo · ${e.sana}` },
  tolovBekor:  { nom: "Bekor qilingan to'lov", icon: "cash-outline",      tavsif: (e) => `${e.ism} · ${som(e.summa)}` },
  kunYakuni:   { nom: "Bekor qilingan kun yakuni", icon: "lock-open-outline", tavsif: (e) => `${e.sana} · sof foyda ${som(e.snap?.sofFoyda)}`, sorab: "Kun yakuni qayta tiklanadi: hisobot tarixga qaytadi va kun yana yopiladi. Davom etasizmi?" },
  import:      { nom: "Ma'lumot yuklandi", icon: "cloud-download-outline", tavsif: (e) => `Oldingi holat: ${e.akkaunt || "nomsiz akkaunt"}`, sorab: "Yuklashdan oldingi holat qaytadi — yuklangandan keyin kiritilgan o'zgarishlar ham bekor bo'ladi. Davom etasizmi?" },
};

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));

export default function Ochirilganlar() {
  const { ochirilganlar, qaytar, butunlayOchir, qopRasmlari } = useApp();
  // Ertalabgi qop rasmlari — kunlar bo'yicha (7 kun)
  const rasmKunlar = useMemo(() => {
    const m = new Map();
    (qopRasmlari || []).forEach((r) => { if (!m.has(r.kun)) m.set(r.kun, []); m.get(r.kun).push(r); });
    return [...m.entries()].sort((a, b) => String(b[0]).localeCompare(String(a[0])));
  }, [qopRasmlari]);
  const [filtr, setFiltr] = useState("hammasi");
  const [xabar, setXabar] = useState("");
  const xabarT = useRef(null);
  useEffect(() => () => clearTimeout(xabarT.current), []);

  const royxat = useMemo(
    () => [...(ochirilganlar || [])].filter((y) => TURLAR[y.tur]).sort((a, b) => (b.vaqt || 0) - (a.vaqt || 0)),
    [ochirilganlar]
  );
  const mavjudTurlar = useMemo(() => Object.keys(TURLAR).filter((k) => royxat.some((y) => y.tur === k)), [royxat]);
  const [qidiruv, setQidiruv] = useState("");
  const tavsifOl = (y) => { try { return TURLAR[y.tur].tavsif(y.element || {}); } catch { return ""; } };
  const korinadi = (filtr === "hammasi" ? royxat : royxat.filter((y) => y.tur === filtr))
    .filter((y) => qidiruvMos(`${TURLAR[y.tur].nom} ${tavsifOl(y)}`, qidiruv));

  // Tanlangan tur ro'yxatda qolmasa — "Hammasi"ga qaytamiz
  useEffect(() => { if (filtr !== "hammasi" && !mavjudTurlar.includes(filtr)) setFiltr("hammasi"); }, [filtr, mavjudTurlar]);

  const bajar = (y) => {
    silliq();
    const n = qaytar(y.id);
    if (n === true) {
      sezgi("tayyor");
      setXabar(`Qaytarildi: ${TURLAR[y.tur].nom}`);
      clearTimeout(xabarT.current);
      xabarT.current = setTimeout(() => setXabar(""), 2200);
    } else if (typeof n === "string") {
      Alert.alert("Qaytarib bo'lmadi", n);
    }
  };
  // Katta amallar (kun yakuni, ma'lumot yuklash) — avval so'raladi
  const qaytarish = (y) => {
    const sorab = TURLAR[y.tur]?.sorab;
    if (!sorab) { bajar(y); return; }
    Alert.alert("Qaytarish", sorab, [
      { text: "Yo'q", style: "cancel" },
      { text: "Qaytarish", onPress: () => bajar(y) },
    ]);
  };

  const butunlay = (y) =>
    Alert.alert("Butunlay o'chirish", "Bu yozuv butunlay o'chiriladi va qaytarib bo'lmaydi. Davom etasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "O'chirish", style: "destructive", onPress: () => { silliq(); butunlayOchir(y.id); } },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <SahifaSarlavha eyebrow="TARIXDAGILAR" title="Salbiy o'zgarishlar" subtitle={`O'chirish, nollash, haydash, qop rasmlari · 7 kun`} icon="archive-outline" />

        {rasmKunlar.length > 0 && (
          <Card style={styles.rasmKarta}>
            <View style={styles.rasmBosh}>
              <Ionicons name="camera-outline" size={18} color={C.sub} />
              <Text style={styles.rasmSarlavha}>Ertalabgi qop rasmlari</Text>
              <Text style={styles.rasmMuddat}>7 kun</Text>
            </View>
            {rasmKunlar.map(([kun, list]) => (
              <Pressable
                key={kun}
                accessibilityRole="button"
                accessibilityLabel={`Qop rasmlari: ${kun}`}
                onPress={() => router.push({ pathname: "/rasmlar", params: { kun } })}
                sezgiTuri="otish"
                style={({ pressed }) => [styles.rasmQator, pressed && styles.pressed]}
              >
                <View style={styles.flex1}>
                  <Text style={styles.rasmKun}>{sanaChiroyli(kun)}</Text>
                  <Text style={styles.rasmSoni}>{list.length} ta rasm</Text>
                </View>
                <View style={styles.rasmKichik}>
                  {list.slice(0, 4).map((r) => <Image key={r.id} source={{ uri: r.uri }} style={styles.rasmMini} />)}
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.muted} />
              </Pressable>
            ))}
          </Card>
        )}

        {xabar ? (
          <View style={styles.xabar}>
            <Ionicons name="checkmark-circle-outline" size={16} color={C.accent} />
            <Text style={styles.xabarTxt}>{xabar}</Text>
          </View>
        ) : null}

        {mavjudTurlar.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {["hammasi", ...mavjudTurlar].map((k) => {
              const tanlangan = filtr === k;
              return (
                <Pressable key={k} onPress={() => { silliq(); setFiltr(k); }} style={[styles.chip, tanlangan && styles.chipActive]}>
                  <Text style={[styles.chipTxt, tanlangan && styles.chipTxtActive]}>{k === "hammasi" ? "Hammasi" : TURLAR[k].nom}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {royxat.length > 5 && <Qidiruv value={qidiruv} onChange={setQidiruv} placeholder="Ism, summa yoki sana" />}

        {korinadi.length === 0 ? (
          <Card>
            <Text style={styles.bosh}>{royxat.length ? "Topilmadi." : "Hozircha hech narsa yo'q. Biror narsani o'chirsangiz, nollasangiz, xodimni haydasangiz yoki bekor qilsangiz — shu yerda 7 kun turadi va uni qaytarish mumkin."}</Text>
          </Card>
        ) : (
          korinadi.map((y) => {
            const tur = TURLAR[y.tur];
            const qoldi = Math.max(0, Math.ceil((7 * D - (Date.now() - (y.vaqt || 0))) / D));
            let tavsif = "";
            try { tavsif = tur.tavsif(y.element || {}); } catch { tavsif = ""; }
            return (
              <Card key={y.id} style={styles.item}>
                <View style={styles.itemRow}>
                  <View style={styles.itemIcon}><Ionicons name={tur.icon} size={18} color={C.accent} /></View>
                  <View style={styles.flex1}>
                    <Text style={styles.itemTur}>{tur.nom}</Text>
                    <Text style={styles.itemNom} numberOfLines={2}>{tavsif}</Text>
                    <Text style={styles.itemMeta}>{y.amal ? "Bo'ldi" : "O'chirildi"}: {vaqtMatni(y.vaqt)} · {qoldi} kun qoldi</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    accessibilityLabel="Butunlay o'chirish"
                    onPress={() => butunlay(y)}
                    hitSlop={6}
                    style={({ pressed }) => [styles.delBtn, pressed && styles.pressed]}
                  >
                    <Image source={require("../assets/icons/ochirish.png")} style={styles.delImg} resizeMode="contain" />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => qaytarish(y)}
                    style={({ pressed }) => [styles.qaytarBtn, pressed && styles.pressed]}
                  >
                    <Ionicons name="arrow-undo-outline" size={16} color={C.onAccent} />
                    <Text style={styles.qaytarTxt}>Qaytarish</Text>
                  </Pressable>
                </View>
              </Card>
            );
          })
        )}
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  flex1:    { flex: 1 },
  bosh:     { fontSize: T.sm, color: C.muted, lineHeight: 20 },

  xabar:    { flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.accent + "14", borderRadius: R.md, paddingVertical: S[2], paddingHorizontal: S[3], marginBottom: S[3] },
  xabarTxt: { fontSize: T.sm, fontWeight: "700", color: C.accent },

  chips:    { gap: S[2], paddingBottom: S[3] },
  chip:     { paddingVertical: 7, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipTxt:  { fontSize: T.xs, fontWeight: "700", color: C.sub },
  chipTxtActive: { color: C.onAccent },

  item:     { marginBottom: S[3] },
  itemRow:  { flexDirection: "row", alignItems: "flex-start", gap: S[3] },
  itemIcon: { width: 38, height: 38, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  itemTur:  { fontSize: 11, color: C.muted, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  itemNom:  { fontSize: T.md, color: C.text, fontWeight: "700", marginTop: 2 },
  itemMeta: { fontSize: T.xs, color: C.sub, marginTop: 4 },
  actions:  { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: S[3], marginTop: S[3], paddingTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  delBtn:   { width: 38, height: 38, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.red + "12" },
  delImg:   { width: 18, height: 18, tintColor: C.red },
  qaytarBtn:{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.accent, borderRadius: R.pill, paddingVertical: 9, paddingHorizontal: 16 },
  qaytarTxt:{ fontSize: T.sm, fontWeight: "800", color: C.onAccent },
  pressed:  { opacity: 0.7, transform: [{ scale: 0.97 }] },
  rasmKarta:{ marginBottom: S[4], paddingVertical: S[3] },
  rasmBosh: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[1] },
  rasmSarlavha:{ flex: 1, fontSize: T.md, fontWeight: "800", color: C.text },
  rasmMuddat:{ fontSize: 11, fontWeight: "800", color: C.muted },
  rasmQator:{ flexDirection: "row", alignItems: "center", gap: S[2], paddingVertical: S[2], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  rasmKun:  { fontSize: T.sm, fontWeight: "700", color: C.text },
  rasmSoni: { fontSize: 11, color: C.muted, marginTop: 1 },
  rasmKichik:{ flexDirection: "row", gap: 4 },
  rasmMini: { width: 34, height: 34, borderRadius: 8, backgroundColor: C.panel },
}));
