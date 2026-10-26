// Markazdagi "Kunlik vazifa" (ish kuni 03:00 da boshlanadi):
//   1) Ishchilar davomati  → Xodimlar bo'limi (kim keldi / kelmadi)
//   2) Omborni tekshirish  → Ombor bo'limi (zaxira, so'rovnomalar)
//   3) Sut kirimi          → shu yerning o'zida, 2 mahal litr (omborda turmaydi, kunlik daromaddan ayriladi)
//   4) Tashqi non kirimi   → shu yerda, ertalab va obeddan keyin nechta kelgani (tashqi non bo'lsa)
// Qat'iy: sahifasi ochilmagan qadamni belgilab bo'lmaydi; hamma qadam bajarilmaguncha vazifa tasdiqlanmaydi.
// Bajarilgach ham karta ochiladi — ichidagi ma'lumotni ko'rish va tahrirlash mumkin.
import { View, Text, Pressable, StyleSheet, Alert, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useApp } from "../store/AppData";
import { SutKirimi } from "./SutKirimi";
import { TashqiKirim, tashqiNonlar } from "./TashqiKirim";
import { bugunSana } from "../logic/hisob";
import { Bosma } from "./Bosma";
import { Btn } from "./Btn";
import { sezgi } from "../logic/sezgi";
import { markazga } from "../logic/yol";
import { C, T, S, R, temaStil } from "../theme";

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
const ikki = (n) => String(n).padStart(2, "0");
const soat = (ms) => { const d = new Date(ms); return `${ikki(d.getHours())}:${ikki(d.getMinutes())}`; };

const QADAMLAR = [
  { k: "davomat", nom: "Ishchilar davomati", izoh: "Kim keldi, kim kelmadi", icon: "people-outline", yol: "/xodimlar" },
  { k: "ombor", nom: "Omborni tekshirish", izoh: "Zaxira va so'rovnomalar", icon: "cube-outline", yol: "/ombor" },
  { k: "sut", nom: "Sut kirimi", izoh: "Bugun kelgan sut, litr (2 mahal)", icon: "water-outline", kelmadi: "Bugun sut kelmadimi?" },
  { k: "tashqi", nom: "Tashqi non kirimi", izoh: "Tashqaridan kelgan non, dona (ertalab va obeddan keyin)", icon: "storefront-outline", kelmadi: "Bugun tashqaridan non kelmadimi?" },
];

export function ErtalabTekshiruv({ kunYopiq }) {
  const { ertalab, ertalabBelgila, ertalabTugalla, setErtalabYonalish, ertalabPanel, setErtalabPanel, ishchilarHaq, kelmaganlar, sutKirimi, tashqiKirim, nonlar } = useApp();
  if (kunYopiq && !ertalab.tugallandi) return null;
  const bugun = bugunSana();
  const qadamlar = QADAMLAR.filter((q) => q.k !== "tashqi" || tashqiNonlar(nonlar).length > 0);
  const tugallangan = !!ertalab.tugallandi;
  const korildi = ertalab.korildi || {};

  const bajarildi = qadamlar.filter((q) => ertalab[q.k]).length;
  const aktiv = (ishchilarHaq || []).filter((w) => w.holat === "Aktiv").length;
  const keldi = aktiv - (kelmaganlar || []).filter((id) => (ishchilarHaq || []).some((w) => w.id === id && w.holat === "Aktiv")).length;
  // Bajarilgandan keyin: 2-mahal hali yozilmagan kirimlar eslatmasi
  const ikkinchi = [];
  if (!((sutKirimi || {})[bugun] || {}).m2) ikkinchi.push("sut");
  if (qadamlar.some((q) => q.k === "tashqi") && !Object.values(((tashqiKirim || {})[bugun] || {}).m2 || {}).some((v) => v > 0)) ikkinchi.push("tashqi non");

  const almash = () => { silliq(); setErtalabPanel(!ertalabPanel); };
  const bor = (q) => { if (!tugallangan) ertalabBelgila(q.k, true); setErtalabYonalish(tugallangan ? null : q.k); router.navigate(q.yol); };
  // Belgi: sahifali qadam — sahifa ochilgandan keyingina; kirim qadami — kirim yozilsa o'zi belgilanadi,
  // yozilmagan bo'lsa "kelmadi" deb ongli tasdiqlash kerak
  const belgila = (q, ok) => {
    if (tugallangan) return;
    if (ok) { silliq(); ertalabBelgila(q.k, false); return; }
    if (q.yol && !korildi[q.k]) {
      Alert.alert("Avval sahifani oching", `«${q.nom}» hali ko'rilmagan. Sahifani ochib tekshiring — so'ng belgilanadi.`, [
        { text: "Bekor", style: "cancel" },
        { text: "Ochish", onPress: () => bor(q) },
      ]);
      return;
    }
    if (q.kelmadi) {
      Alert.alert(q.nom, `${q.kelmadi} Kirim yozilmasdan belgilanadi.`, [
        { text: "Yo'q", style: "cancel" },
        { text: "Ha, kelmadi", onPress: () => { silliq(); ertalabBelgila(q.k, true); } },
      ]);
      return;
    }
    silliq(); ertalabBelgila(q.k, true);
  };
  const tugalla = () => {
    const qolgan = qadamlar.filter((q) => !ertalab[q.k]);
    if (qolgan.length) {
      Alert.alert("Vazifa hali bajarilmagan", `Quyidagilar bajarilmagan:\n${qolgan.map((q) => `• ${q.nom}`).join("\n")}`, [{ text: "Tushunarli" }]);
      return;
    }
    silliq(); ertalabTugalla(); setErtalabPanel(false); sezgi("tayyor");
  };

  return (
    <View style={styles.wrap}>
      <Bosma
        accessibilityRole="button"
        accessibilityLabel="Kunlik vazifa"
        accessibilityState={{ expanded: ertalabPanel }}
        onPress={almash}
        sezgiTuri="bos"
        style={[styles.bosh, tugallangan && styles.boshTayyor]}
      >
        <View style={[styles.boshIkon, tugallangan && styles.boshIkonTayyor]}>
          <Ionicons name={tugallangan ? "checkmark" : "sunny-outline"} size={tugallangan ? 20 : 22} color={tugallangan ? C.onAccent : C.onAccent} />
        </View>
        <View style={styles.flex1}>
          <Text style={[styles.boshNom, tugallangan && styles.boshNomTayyor]}>{tugallangan ? "Kunlik vazifa bajarilgan" : "Kunlik vazifa"}</Text>
          <Text style={[styles.boshIzoh, tugallangan && styles.boshIzohTayyor]} numberOfLines={1}>
            {tugallangan
              ? (!kunYopiq && ikkinchi.length ? `2-mahal ${ikkinchi.join(", ")} hali yozilmagan` : "Ko'rish va tahrirlash uchun bosing")
              : `Bajarildi · ${bajarildi}/${qadamlar.length}`}
          </Text>
        </View>
        {tugallangan && <Text style={styles.tayyorSoat}>{soat(ertalab.tugallandi)}</Text>}
        <Ionicons name={ertalabPanel ? "chevron-up" : "chevron-down"} size={18} color={tugallangan ? C.sub : C.onAccentSub} />
      </Bosma>

      {ertalabPanel && (
        <View style={styles.panel}>
          {qadamlar.map((q, i) => {
            const ok = !!ertalab[q.k];
            return (
              <View key={q.k} style={[styles.qadam, i > 0 && styles.qadamChiziq, !q.yol && styles.qadamUst]}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${q.nom}: belgi`}
                  accessibilityState={{ checked: ok, disabled: tugallangan }}
                  onPress={() => belgila(q, ok)}
                  hitSlop={8}
                  style={[styles.belgi, ok && styles.belgiOk, !ok && q.yol && !korildi[q.k] && styles.belgiYopiq]}
                >
                  {ok ? <Ionicons name="checkmark" size={14} color={C.onAccent} /> : <Text style={styles.raqam}>{i + 1}</Text>}
                </Pressable>
                {q.yol ? (
                <Bosma accessibilityRole="link" accessibilityLabel={q.nom} onPress={() => bor(q)} tashqi={styles.flex1} style={styles.havola}>
                  <Ionicons name={q.icon} size={18} color={C.accent} />
                  <View style={styles.flex1}>
                    <Text style={[styles.qadamNom, ok && styles.qadamOk]}>{q.nom}</Text>
                    <Text style={styles.qadamIzoh}>{q.k === "davomat" && aktiv > 0 ? `${keldi}/${aktiv} keldi · ${q.izoh}` : q.izoh}{!ok && !korildi[q.k] ? " · hali ochilmagan" : ""}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </Bosma>
                ) : (
                  // Sut va tashqi non — sahifaga o'tmasdan shu yerning o'zida kiritiladi
                  <View style={[styles.flex1, styles.havola, styles.havolaUst]}>
                    <View style={styles.sutBosh}>
                      <Ionicons name={q.icon} size={18} color={C.accent} />
                      <View style={styles.flex1}>
                        <Text style={[styles.qadamNom, ok && styles.qadamOk]}>{q.nom}</Text>
                        <Text style={styles.qadamIzoh}>{q.izoh}</Text>
                      </View>
                    </View>
                    {q.k === "sut" ? <SutKirimi /> : <TashqiKirim />}
                  </View>
                )}
              </View>
            );
          })}
          {tugallangan ? (
            <Text style={styles.tayyorIzoh}>Vazifa {soat(ertalab.tugallandi)} da tasdiqlangan. Kirimlarni shu yerda tuzatish mumkin.</Text>
          ) : (
            <View style={styles.tugma}>
              <Btn icon="checkmark-done-outline" onPress={tugalla} secondary={bajarildi < qadamlar.length} sezgiTuri={false}>
                {bajarildi < qadamlar.length ? `Kunlik vazifa bajarildi (${bajarildi}/${qadamlar.length})` : "Kunlik vazifa bajarildi"}
              </Btn>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Xodimlar/Ombor sahifasida — Markazdagi havoladan kelinganda "Tayyor" belgisi
// Shu bilan birga sahifa haqiqatan ochilganini qayd qiladi — Kunlik vazifada shu qadamni belgilash ochiladi.
export function ErtalabQadamBelgisi({ qadam, matn }) {
  const { ertalab, ertalabYonalish, setErtalabYonalish, ertalabKorildi } = useApp();
  useFocusEffect(useCallback(() => { ertalabKorildi(qadam); }, [qadam]));
  if (ertalabYonalish !== qadam || ertalab.tugallandi) return null;
  const tayyor = () => { setErtalabYonalish(null); sezgi("otish"); markazga(); };
  return (
    <View style={styles.qadamBelgi}>
      <Ionicons name="sunny-outline" size={18} color={C.accent} />
      <Text style={styles.qadamBelgiTxt}>{matn}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Tekshiruvga qaytish" onPress={tayyor} sezgiTuri={false} style={({ pressed }) => [styles.qadamBelgiBtn, pressed && { opacity: 0.8 }]}>
        <Ionicons name="checkmark" size={14} color={C.onAccent} />
        <Text style={styles.qadamBelgiBtnTxt}>Tayyor</Text>
      </Pressable>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  flex1:     { flex: 1 },
  wrap:      { marginBottom: S[4] },
  bosh:      { flexDirection: "row", alignItems: "center", gap: S[3], backgroundColor: C.accent, borderRadius: R.lg, paddingVertical: S[3], paddingHorizontal: S[4] },
  boshIkon:  { width: 40, height: 40, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.16)" },
  boshNom:   { fontSize: T.md, fontWeight: "800", color: C.onAccent },
  boshIzoh:  { fontSize: 11, fontWeight: "600", color: C.onAccentSub, marginTop: 2 },
  panel:     { marginTop: S[2], backgroundColor: C.card, borderRadius: R.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, paddingHorizontal: S[4], paddingTop: S[1], paddingBottom: S[4] },
  qadam:     { flexDirection: "row", alignItems: "center", gap: S[3], paddingVertical: S[2] },
  qadamChiziq:{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  belgi:     { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  belgiOk:   { backgroundColor: C.accent, borderColor: C.accent },
  raqam:     { fontSize: 12, fontWeight: "800", color: C.sub },
  havola:    { flexDirection: "row", alignItems: "center", gap: S[3], paddingVertical: S[2] },
  qadamNom:  { fontSize: T.sm, fontWeight: "800", color: C.text },
  qadamOk:   { color: C.sub },
  qadamIzoh: { fontSize: 11, color: C.muted, marginTop: 1 },
  tugma:     { marginTop: S[3] },
  boshTayyor:{ backgroundColor: C.accent + "12", borderWidth: 1, borderColor: C.accent + "2E" },
  boshIkonTayyor:{ backgroundColor: C.accent, width: 32, height: 32, borderRadius: 16 },
  boshNomTayyor:{ color: C.text, fontSize: T.sm },
  boshIzohTayyor:{ color: C.sub },
  belgiYopiq:{ borderStyle: "dashed", opacity: 0.6 },
  tayyorIzoh:{ fontSize: 11, color: C.muted, marginTop: S[3], lineHeight: 15 },
  havolaUst: { flexDirection: "column", alignItems: "stretch", minWidth: 0 },
  qadamUst:  { alignItems: "flex-start", paddingTop: S[3] },
  sutBosh:   { flexDirection: "row", alignItems: "center", gap: S[3], marginBottom: S[2] },
  tayyorSoat:{ fontSize: T.xs, fontWeight: "700", color: C.sub },
  qadamBelgi:{ flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.accent + "12", borderRadius: R.md, borderWidth: 1, borderColor: C.accent + "33", paddingVertical: S[2], paddingLeft: S[3], paddingRight: S[2], marginBottom: S[4] },
  qadamBelgiTxt:{ flex: 1, fontSize: T.sm, fontWeight: "700", color: C.text },
  qadamBelgiBtn:{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.accent, borderRadius: R.pill, paddingVertical: 7, paddingHorizontal: 12 },
  qadamBelgiBtnTxt:{ fontSize: T.xs, fontWeight: "800", color: C.onAccent },
}));
