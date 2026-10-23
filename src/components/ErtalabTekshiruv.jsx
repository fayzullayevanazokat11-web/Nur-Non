// Markazdagi "Kunni boshlash" — ertalabgi tekshiruv (ish kuni 03:00 da boshlanadi):
//   1) Ishchilar davomati  → Xodimlar bo'limi (kim keldi / kelmadi)
//   2) Omborni tekshirish  → Ombor bo'limi (zaxira, so'rovnomalar)
// Ikkalasi ko'rilgach "Ertalabgi tekshiruv tugallandi" bosiladi — Markazda kun oxirigacha
// "Ertalabgi tekshiruv tugallangan" belgisi turadi. Kun yakunlangan bo'lsa ko'rinmaydi.
import { View, Text, Pressable, StyleSheet, Alert, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useApp } from "../store/AppData";
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
];

export function ErtalabTekshiruv({ kunYopiq }) {
  const { ertalab, ertalabBelgila, ertalabTugalla, setErtalabYonalish, ertalabPanel, setErtalabPanel, ishchilarHaq, kelmaganlar } = useApp();
  if (kunYopiq && !ertalab.tugallandi) return null;

  // Tugallangan — ixcham belgi
  if (ertalab.tugallandi) {
    return (
      <View style={styles.tayyor}>
        <View style={styles.tayyorBelgi}><Ionicons name="checkmark" size={14} color={C.onAccent} /></View>
        <Text style={styles.tayyorTxt}>Ertalabgi tekshiruv tugallangan</Text>
        <Text style={styles.tayyorSoat}>{soat(ertalab.tugallandi)}</Text>
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
    Alert.alert("Tekshiruv to'liq emas", "Hamma qadam belgilanmagan. Baribir tugallaysizmi?", [
      { text: "Yo'q", style: "cancel" },
      { text: "Tugallash", onPress: bajar },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <Bosma accessibilityRole="button" accessibilityLabel="Kunni boshlash" onPress={almash} sezgiTuri="bos" style={styles.bosh}>
        <View style={styles.boshIkon}><Ionicons name="sunny-outline" size={22} color={C.onAccent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.boshNom}>Kunni boshlash</Text>
          <Text style={styles.boshIzoh}>Ertalabgi tekshiruv · {bajarildi}/{QADAMLAR.length}</Text>
        </View>
        <Ionicons name={ertalabPanel ? "chevron-up" : "chevron-down"} size={18} color={C.onAccentSub} />
      </Bosma>

      {ertalabPanel && (
        <View style={styles.panel}>
          {QADAMLAR.map((q, i) => {
            const ok = !!ertalab[q.k];
            return (
              <View key={q.k} style={[styles.qadam, i > 0 && styles.qadamChiziq]}>
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
                <Bosma accessibilityRole="link" accessibilityLabel={q.nom} onPress={() => bor(q)} tashqi={styles.flex1} style={styles.havola}>
                  <Ionicons name={q.icon} size={18} color={C.accent} />
                  <View style={styles.flex1}>
                    <Text style={[styles.qadamNom, ok && styles.qadamOk]}>{q.nom}</Text>
                    <Text style={styles.qadamIzoh}>{q.k === "davomat" && aktiv > 0 ? `${keldi}/${aktiv} keldi · ${q.izoh}` : q.izoh}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </Bosma>
              </View>
            );
          })}
          <View style={styles.tugma}>
            <Btn icon="checkmark-done-outline" onPress={tugalla} disabled={false} sezgiTuri={false}>
              Ertalabgi tekshiruv tugallandi
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
  tayyor:    { flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.accent + "12", borderRadius: R.md, borderWidth: 1, borderColor: C.accent + "2E", paddingVertical: S[2] + 2, paddingHorizontal: S[3], marginBottom: S[4] },
  tayyorBelgi:{ width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: C.accent },
  tayyorTxt: { flex: 1, fontSize: T.sm, fontWeight: "800", color: C.text },
  tayyorSoat:{ fontSize: T.xs, fontWeight: "700", color: C.sub },
  qadamBelgi:{ flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.accent + "12", borderRadius: R.md, borderWidth: 1, borderColor: C.accent + "33", paddingVertical: S[2], paddingLeft: S[3], paddingRight: S[2], marginBottom: S[4] },
  qadamBelgiTxt:{ flex: 1, fontSize: T.sm, fontWeight: "700", color: C.text },
  qadamBelgiBtn:{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.accent, borderRadius: R.pill, paddingVertical: 7, paddingHorizontal: 12 },
  qadamBelgiBtnTxt:{ fontSize: T.xs, fontWeight: "800", color: C.onAccent },
}));
