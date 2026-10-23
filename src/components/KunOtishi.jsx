// Kun almashishi ekrani (to'liq ekran, Modal emas):
//   • Kun xulosasi — ish kuni tunda 03:00 da tugaganda (03:00–03:59 orasida ochiq bo'lsa
//     yoki ochilsa): kechagi statistikaga qarab gap, asosiy raqamlar.
//   • Ertalabki salom — 04:00 dan keyin dastur birinchi ochilganda: vaqt, hafta kuni,
//     bayram va kechagi natijaga qarab salom (kecha xulosasi ko'rilmagan bo'lsa — shu yerda).
// Har biri kuniga bir marta; "Markazga qaytish" bilan yopiladi. Menyuda o'chirib qo'yish mumkin.
import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, Easing, StyleSheet, AppState, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { markazga, markazdan } from "../logic/yol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "../store/AppData";
import { ishKuni, formatSom } from "../logic/hisob";
import { sanaChiroyli } from "../logic/davr";
import { ixcham as ixchamSon } from "./Statistika";
import { kunXulosasi, ertalabSalomi } from "../logic/kunGaplari";
import { sezgi } from "../logic/sezgi";
import { C, T, S, R, temaStil } from "../theme";

const KALIT = "nurnon:kunOtishi";
const ikki = (n) => String(n).padStart(2, "0");
const sanaStr = (d) => `${d.getFullYear()}-${ikki(d.getMonth() + 1)}-${ikki(d.getDate())}`;
const son = (x) => parseFloat(x) || 0;

export function KunOtishi() {
  const {
    tayyor, hisobotlarTarixi, ozIshlabQoplar, tashqariSonlar, akkauntNomi,
    salomYoqilgan, ertalab, kunYakunlanganmi, setErtalabPanel,
  } = useApp();
  const [holat, setHolat] = useState(null);          // { xulosa: "YYYY-MM-DD", salom: "YYYY-MM-DD" }
  const [tanishuv, setTanishuv] = useState(null);    // yo'riqnoma ko'rilganmi
  const [ekran, setEkran] = useState(null);
  const [tick, setTick] = useState(0);
  const a = useRef(new Animated.Value(0)).current;

  // Saqlangan holat va yo'riqnoma belgisi
  useEffect(() => {
    AsyncStorage.multiGet([KALIT, "nurnon:tanishuv"])
      .then((r) => {
        const o = Object.fromEntries(r);
        setHolat(o[KALIT] ? JSON.parse(o[KALIT]) || {} : {});
        setTanishuv(o["nurnon:tanishuv"] != null && JSON.parse(o["nurnon:tanishuv"]) === true);
      })
      .catch(() => { setHolat({}); setTanishuv(true); });
  }, []);
  const saqla = (yangi) => { setHolat(yangi); AsyncStorage.setItem(KALIT, JSON.stringify(yangi)).catch(() => {}); };

  // Vaqt o'tishini kuzatamiz: har 30 soniyada va dastur oldingi planga chiqqanda
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    const sub = AppState.addEventListener("change", (h) => { if (h === "active") setTick((x) => x + 1); });
    return () => { clearInterval(t); sub.remove(); };
  }, []);

  useEffect(() => {
    if (ekran || !tayyor || !holat || tanishuv == null || salomYoqilgan === false) return;
    const hozir = new Date();
    const bugunD = ishKuni(hozir.getTime());
    const bugun = sanaStr(bugunD);
    const kecha = sanaStr(new Date(bugunD.getFullYear(), bugunD.getMonth(), bugunD.getDate() - 1));
    // Yangi o'rnatilgan dastur (yo'riqnoma hali ko'rilmagan) — bugun salom shart emas
    if (!tanishuv) {
      if (holat.salom !== bugun) saqla({ xulosa: kecha, salom: bugun });
      return;
    }
    const tarix = hisobotlarTarixi || [];
    const faollik = [ozIshlabQoplar, tashqariSonlar].some((o) => Object.values(o || {}).some((v) => son(v) > 0));
    const xulosaKerak = holat.xulosa !== kecha && (tarix.length > 0 || faollik);
    const salomKerak = holat.salom !== bugun && hozir.getHours() >= 4;
    const xulosa = xulosaKerak ? kunXulosasi({ sana: kecha, hisobotlar: tarix, faollik }) : null;

    if (hozir.getHours() === 3 && xulosaKerak) {
      setEkran({ tur: "xulosa", sana: kecha, xulosa });
      saqla({ ...holat, xulosa: kecha });
    } else if (salomKerak) {
      // Kecha xulosasi tunda ko'rilmagan bo'lsa — salom ichida qisqa ko'rinishda
      const tur = (xulosa || kunXulosasi({ sana: kecha, hisobotlar: tarix, faollik })).tur;
      setEkran({ tur: "salom", sana: bugun, salom: ertalabSalomi({ sana: bugun, hozir, kechaTur: tarix.length || faollik ? tur : null }), kecha: xulosa, kechaSana: kecha });
      saqla({ xulosa: kecha, salom: bugun });
    }
  }, [tayyor, holat, tanishuv, tick, salomYoqilgan, hisobotlarTarixi]);

  useEffect(() => {
    if (!ekran) return;
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    sezgi("tayyor");
  }, [ekran]);

  // Ekran ochiq bo'lsa telefonning "Orqaga" tugmasi uni yopib Markazga qaytaradi
  useEffect(() => {
    if (!ekran) return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      Animated.timing(a, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => { setEkran(null); markazga(); });
      return true;
    });
    return () => sub.remove();
  }, [ekran]);

  if (!ekran) return null;

  const yop = (keyin) => {
    Animated.timing(a, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      setEkran(null);
      keyin?.();
    });
  };
  const markazgaQayt = () => yop(markazga);
  const statistika = () => yop(() => markazdan("/tarix"));
  const kunniBoshla = () => yop(() => { setErtalabPanel(true); markazga(); });
  const tekshiruvKerak = ekran.tur === "salom" && !ertalab.tugallandi && !kunYakunlanganmi();

  const kirish = { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] };
  const ikonPop = { transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] };

  return (
    <Animated.View testID="kun-otishi" style={[styles.fon, { opacity: a }]} needsOffscreenAlphaCompositing>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.markaz}>
          <Animated.View style={[styles.kontent, kirish]}>
            {ekran.tur === "xulosa" ? (
              <>
                <Text style={styles.yuqori}>KUN YAKUNI · {sanaChiroyli(ekran.sana)}</Text>
                <Animated.View style={[styles.ikon, ikonPop]}><Ionicons name={ekran.xulosa.ikon} size={46} color={C.accent} /></Animated.View>
                <Text testID="ko-sarlavha" style={styles.sarlavha}>{ekran.xulosa.sarlavha}</Text>
                <Text testID="ko-matn" style={styles.matn}>{ekran.xulosa.matn}</Text>
                {ekran.xulosa.qoshimcha.map((x) => <Text key={x} style={styles.qosh}>{x}</Text>)}
                <Raqamlar x={ekran.xulosa} />
              </>
            ) : (
              <>
                <Text style={styles.yuqori}>{(akkauntNomi ? `${akkauntNomi} · ` : "") + sanaChiroyli(ekran.sana)}</Text>
                <Animated.View style={[styles.ikon, ikonPop]}><Ionicons name={ekran.salom.ikon} size={46} color={C.accent} /></Animated.View>
                <Text testID="ko-sarlavha" style={styles.sarlavha}>{ekran.salom.sarlavha}</Text>
                <Text testID="ko-matn" style={styles.matn}>{ekran.salom.matn}</Text>
                {ekran.kecha && (
                  <View style={styles.kecha}>
                    <View style={styles.kechaBosh}>
                      <Ionicons name={ekran.kecha.ikon} size={16} color={C.accent} />
                      <Text style={styles.kechaYuqori}>KECHA · {sanaChiroyli(ekran.kechaSana).split(" · ")[0]}</Text>
                    </View>
                    <Text testID="ko-kecha" style={styles.kechaSarlavha}>{ekran.kecha.sarlavha}</Text>
                    <Text style={styles.kechaMatn}>{ekran.kecha.matn}</Text>
                    {ekran.kecha.h && <Raqamlar x={ekran.kecha} ixcham />}
                  </View>
                )}
              </>
            )}
          </Animated.View>
        </View>

        <Animated.View style={[styles.tugmalar, { opacity: a }]}>
          {tekshiruvKerak && (
            <Pressable accessibilityRole="button" onPress={kunniBoshla} sezgiTuri="otish" style={({ pressed }) => [styles.btn, pressed && styles.bosildi]}>
              <Ionicons name="sunny-outline" size={18} color={C.onAccent} />
              <Text style={styles.btnTxt}>Kunni boshlash</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={markazgaQayt}
            sezgiTuri="otish"
            style={({ pressed }) => [tekshiruvKerak ? styles.btn2 : styles.btn, pressed && styles.bosildi]}
          >
            <Ionicons name="home-outline" size={18} color={tekshiruvKerak ? C.accent : C.onAccent} />
            <Text style={tekshiruvKerak ? styles.btn2Txt : styles.btnTxt}>Markazga qaytish</Text>
          </Pressable>
          {ekran.tur === "xulosa" && ekran.xulosa.h && (
            <Pressable accessibilityRole="button" onPress={statistika} sezgiTuri="otish" hitSlop={8} style={styles.link}>
              <Text style={styles.linkTxt}>Statistikani ko'rish</Text>
            </Pressable>
          )}
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

function Raqamlar({ x, ixcham }) {
  const h = x.h;
  if (!h) return null;
  const foiz = x.foiz;
  return (
    <View style={[styles.raqamlar, ixcham && styles.raqamlarIxcham]}>
      <Plitka nom="Sof foyda" qiymat={Math.abs(son(h.sofFoyda)) >= 1e6 ? ixchamSon(son(h.sofFoyda)) : formatSom(son(h.sofFoyda))} birlik="so'm" ixcham={ixcham} />
      <Plitka nom="Sotilgan" qiymat={formatSom(son(h.sotilganNon))} birlik="dona" ixcham={ixcham} />
      <Plitka nom={foiz != null ? "O'rtachaga" : "Qop"} qiymat={foiz != null ? `${foiz >= 0 ? "+" : "−"}${Math.abs(foiz)}%` : String(son(h.jamiQop))} birlik={foiz != null ? "nisbatan" : "qop"} ixcham={ixcham} />
    </View>
  );
}

function Plitka({ nom, qiymat, birlik, ixcham }) {
  return (
    <View style={[styles.plitka, ixcham && styles.plitkaIxcham]}>
      <Text style={styles.plitkaNom} numberOfLines={1}>{nom}</Text>
      <Text style={[styles.plitkaVal, ixcham && styles.plitkaValIxcham]} numberOfLines={1} adjustsFontSizeToFit>{qiymat}</Text>
      <Text style={styles.plitkaBirlik}>{birlik}</Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  fon:      { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, zIndex: 60 },
  safe:     { flex: 1, paddingHorizontal: S[6], paddingBottom: S[5] },
  markaz:   { flex: 1, justifyContent: "center" },
  kontent:  { alignItems: "center" },
  yuqori:   { fontSize: 11, fontWeight: "800", color: C.muted, letterSpacing: 1, textAlign: "center", marginBottom: S[5] },
  ikon:     { width: 96, height: 96, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "16", marginBottom: S[5] },
  sarlavha: { fontSize: T.xl, fontWeight: "800", color: C.text, textAlign: "center", letterSpacing: -0.5 },
  matn:     { fontSize: T.md, color: C.sub, textAlign: "center", lineHeight: 23, marginTop: S[3] },
  qosh:     { fontSize: T.sm, color: C.accent, fontWeight: "700", textAlign: "center", marginTop: S[2], lineHeight: 19 },
  raqamlar: { flexDirection: "row", gap: S[2], marginTop: S[6], alignSelf: "stretch" },
  raqamlarIxcham: { marginTop: S[3] },
  plitka:   { flex: 1, backgroundColor: C.card, borderRadius: R.md, borderWidth: 1, borderColor: C.borderSoft, paddingVertical: S[3], paddingHorizontal: S[2], alignItems: "center" },
  plitkaIxcham: { backgroundColor: C.surface, paddingVertical: S[2] },
  plitkaNom:{ fontSize: 10, color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  plitkaVal:{ fontSize: T.lg, color: C.accent, fontWeight: "800", marginTop: 4 },
  plitkaValIxcham: { fontSize: T.md },
  plitkaBirlik:{ fontSize: 10, color: C.muted, marginTop: 1 },
  kecha:    { alignSelf: "stretch", marginTop: S[6], backgroundColor: C.card, borderRadius: R.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, padding: S[4] },
  kechaBosh:{ flexDirection: "row", alignItems: "center", gap: 6 },
  kechaYuqori:{ fontSize: 10, fontWeight: "800", color: C.muted, letterSpacing: 0.8 },
  kechaSarlavha:{ fontSize: T.md, fontWeight: "800", color: C.text, marginTop: S[2] },
  kechaMatn:{ fontSize: T.sm, color: C.sub, marginTop: 4, lineHeight: 19 },
  tugmalar: { gap: S[2] },
  btn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S[2], backgroundColor: C.accent, borderRadius: R.md, paddingVertical: 15 },
  btnTxt:   { fontSize: T.md, fontWeight: "800", color: C.onAccent },
  btn2:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S[2], borderRadius: R.md, paddingVertical: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  btn2Txt:  { fontSize: T.md, fontWeight: "800", color: C.accent },
  bosildi:  { opacity: 0.85, transform: [{ scale: 0.98 }] },
  link:     { alignSelf: "center", paddingVertical: S[2] },
  linkTxt:  { fontSize: T.sm, fontWeight: "700", color: C.sub },
}));
