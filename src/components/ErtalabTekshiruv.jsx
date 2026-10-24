// Markazdagi "Kunlik vazifa" (ish kuni 03:00 da boshlanadi):
//   1) Ishchilar davomati  → Xodimlar bo'limi (kim keldi / kelmadi)
//   2) Omborni tekshirish  → Ombor bo'limi (zaxira, so'rovnomalar)
//   3) Sut kirimi          → shu yerning o'zida, 2 mahal litr (omborda turmaydi, kunlik daromaddan ayriladi)
// Bajarilgach "Kunlik vazifa bajarildi" bosiladi — Markazda kun oxirigacha belgi turadi
// (2-mahal sut hali yozilmagan bo'lsa — belgi tagida sut maydonlari qoladi). Kun yakunlangan bo'lsa ko'rinmaydi.
import { View, Text, Pressable, StyleSheet, Alert, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useApp } from "../store/AppData";
import { SutKirimi } from "./SutKirimi";
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
  { k: "sut", nom: "Sut kirimi", izoh: "Bugun kelgan sut, litr (2 mahal)", icon: "water-outline" },
];

export function ErtalabTekshiruv({ kunYopiq }) {
  const { ertalab, ertalabBelgila, ertalabTugalla, setErtalabYonalish, ertalabPanel, setErtalabPanel, ishchilarHaq, kelmaganlar, sutKirimi } = useApp();
  if (kunYopiq && !ertalab.tugallandi) return null;
  const bugungiSut = (sutKirimi || {})[bugunSana()] || {};

  // Bajarilgan — ixcham belgi; 2-mahal sut hali yozilmagan bo'lsa, maydonlar shu yerda qoladi
  if (ertalab.tugallandi) {
    return (
      <View style={styles.tayyorWrap}>
        <View style={styles.tayyor}>
          <View style={styles.tayyorBelgi}><Ionicons name="checkmark" size={14} color={C.onAccent} /></View>
          <Text style={styles.tayyorTxt}>Kunlik vazifa bajarilgan</Text>
          <Text style={styles.tayyorSoat}>{soat(ertalab.tugallandi)}</Text>
        </View>
        {!kunYopiq && !(bugungiSut.m2 > 0) && (
          <View style={styles.sutQoldi}>
            <Text style={styles.qadamNom}>Sut kirimi</Text>
            <SutKirimi />
          </View>
        )}
      </View>
    );
  }

  const bajarildi = QADAMLAR.filter((q) => ertalab[q.k]).length;
  const aktiv = (ishchilarHaq || []).filter((w) => w.holat === "Aktiv").length;
  const keldi = aktiv - (kelmaganlar || []).filter((id) => (ishchilarHaq || []).some((w) => w.id === id && w.holat === "Aktiv")).length;
  const almash = () => { silliq(); setErtalabPanel(!ertalabPanel); };
  const bor = (q) => { ertalabBelgila(q.k, true); setErtalabYonalish(q.k); router.navigate(q.yol); };
  const tugalla = () => {
    const bajar = () => { silliq(); ertalabTugalla(); setErtalabPanel(false); sezgi("tayyor"); };
    if (bajarildi === QADAMLAR.length) { bajar(); return; }
    Alert.alert("Vazifa to'liq emas", "Hamma qadam belgilanmagan. Baribir tugallaysizmi?", [
      { text: "Yo'q", style: "cancel" },
      { text: "Tugallash", onPress: bajar },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <Bosma accessibilityRole="button" accessibilityLabel="Kunlik vazifa" onPress={almash} sezgiTuri="bos" style={styles.bosh}>
        <View style={styles.boshIkon}><Ionicons name="sunny-outline" size={22} color={C.onAccent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.boshNom}>Kunlik vazifa</Text>
          <Text style={styles.boshIzoh}>Bajarildi · {bajarildi}/{QADAMLAR.length}</Text>
        </View>
        <Ionicons name={ertalabPanel ? "chevron-up" : "chevron-down"} size={18} color={C.onAccentSub} />
      </Bosma>

      {ertalabPanel && (
        <View style={styles.panel}>
          {QADAMLAR.map((q, i) => {
            const ok = !!ertalab[q.k];
            return (
              <View key={q.k} style={[styles.qadam, i > 0 && styles.qadamChiziq, !q.yol && styles.qadamUst]}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${q.nom}: belgi`}
                  accessibilityState={{ checked: ok }}
                  onPress={() => { silliq(); ertalabBelgila(q.k, !ok); }}
                  hitSlop={8}
                  style={[styles.belgi, ok && styles.belgiOk]}
                >
                  {ok ? <Ionicons name="checkmark" size={14} color={C.onAccent} /> : <Text style={styles.raqam}>{i + 1}</Text>}
                </Pressable>
                {q.yol ? (
                <Bosma accessibilityRole="link" accessibilityLabel={q.nom} onPress={() => bor(q)} tashqi={styles.flex1} style={styles.havola}>
                  <Ionicons name={q.icon} size={18} color={C.accent} />
                  <View style={styles.flex1}>
                    <Text style={[styles.qadamNom, ok && styles.qadamOk]}>{q.nom}</Text>
                    <Text style={styles.qadamIzoh}>{q.k === "davomat" && aktiv > 0 ? `${keldi}/${aktiv} keldi · ${q.izoh}` : q.izoh}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </Bosma>
                ) : (
                  // Sut — sahifaga o'tmasdan shu yerning o'zida kiritiladi
                  <View style={[styles.flex1, styles.havola, styles.havolaUst]}>
                    <View style={styles.sutBosh}>
                      <Ionicons name={q.icon} size={18} color={C.accent} />
                      <View style={styles.flex1}>
                        <Text style={[styles.qadamNom, ok && styles.qadamOk]}>{q.nom}</Text>
                        <Text style={styles.qadamIzoh}>{q.izoh}</Text>
                      </View>
                    </View>
                    <SutKirimi />
                  </View>
                )}
              </View>
            );
          })}
          <View style={styles.tugma}>
            <Btn icon="checkmark-done-outline" onPress={tugalla} disabled={false} sezgiTuri={false}>
              Kunlik vazifa bajarildi
            </Btn>
          </View>
        </View>
      )}
    </View>
  );
}

// Xodimlar/Ombor sahifasida — Markazdagi havoladan kelinganda "Tayyor" belgisi
export function ErtalabQadamBelgisi({ qadam, matn }) {
  const { ertalab, ertalabYonalish, setErtalabYonalish } = useApp();
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
  tayyorWrap:{ marginBottom: S[4] },
  sutQoldi:  { marginTop: S[2], backgroundColor: C.card, borderRadius: R.md, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, padding: S[3] },
  havolaUst: { flexDirection: "column", alignItems: "stretch", minWidth: 0 },
  qadamUst:  { alignItems: "flex-start", paddingTop: S[3] },
  sutBosh:   { flexDirection: "row", alignItems: "center", gap: S[3], marginBottom: S[2] },
  tayyor:    { flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.accent + "12", borderRadius: R.md, borderWidth: 1, borderColor: C.accent + "2E", paddingVertical: S[2] + 2, paddingHorizontal: S[3] },
  tayyorBelgi:{ width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: C.accent },
  tayyorTxt: { flex: 1, fontSize: T.sm, fontWeight: "800", color: C.text },
  tayyorSoat:{ fontSize: T.xs, fontWeight: "700", color: C.sub },
  qadamBelgi:{ flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.accent + "12", borderRadius: R.md, borderWidth: 1, borderColor: C.accent + "33", paddingVertical: S[2], paddingLeft: S[3], paddingRight: S[2], marginBottom: S[4] },
  qadamBelgiTxt:{ flex: 1, fontSize: T.sm, fontWeight: "700", color: C.text },
  qadamBelgiBtn:{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.accent, borderRadius: R.pill, paddingVertical: 7, paddingHorizontal: 12 },
  qadamBelgiBtnTxt:{ fontSize: T.xs, fontWeight: "800", color: C.onAccent },
}));
