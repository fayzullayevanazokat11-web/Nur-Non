// Yakunlangan kun hisoboti (faqat o'qish uchun) — Kunlik qop hisobi sahifasida kun
// yopilgandan keyin ko'rinadi: asosiy ko'rsatkichlar, non turlari, sonlar, moliya,
// ishchilar haqi. "PDF" — hisobotni fayl qilib ulashish; "Markazga qaytish" — bosh sahifaga.
import { View, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../store/AppData";
import { Card } from "./Card";
import { Btn } from "./Btn";
import { NonIkon } from "./XomashyoIkon";
import { formatSom } from "../logic/hisob";
import { sanaChiroyli } from "../logic/davr";
import { kunlikHtml, pdfUlash } from "../logic/ulashish";
import { C, T, S, R, temaStil } from "../theme";

const ikki = (n) => String(n).padStart(2, "0");
const soat = (ms) => { const d = new Date(ms || Date.now()); return `${ikki(d.getHours())}:${ikki(d.getMinutes())}`; };
const son = (x) => parseFloat(x) || 0;

export function KunHisoboti({ h }) {
  const { nonlar, akkauntNomi } = useApp();
  const daromad = son(h.daromad), haq = son(h.ishchiHaq), a = h.arxiv || {};

  const pdf = () => pdfUlash(kunlikHtml(h, { akkaunt: akkauntNomi, nonlar }), `nur-non-${h.sana}`)
    .catch(() => Alert.alert("Xatolik", "PDF tayyorlab bo'lmadi."));
  const markazga = () => router.navigate("/");

  const nonQatorlar = (h.nonlarSnapshot || nonlar || []).map((n) => {
    const oz = n.ozIshlab !== false;
    const q = oz ? (parseInt((h.ozIshlabQoplar || {})[n.id]) || 0) : (parseInt((h.tashqariSonlar || {})[n.id]) || 0);
    return q > 0 ? { id: n.id, nom: n.nom, non: (nonlar || []).find((x) => x.id === n.id) || n, matn: `${q} ${oz ? "qop" : "dona"}` } : null;
  }).filter(Boolean);
  const qoshimcha = [
    ["Karta to'lovlari", a.kartaSum], ["Optom savdo", a.optomSum], ["Brak", a.brakSum], ["Qo'shimcha xarajat", h.xarajatJami],
  ].filter(([, v]) => son(v) > 0);

  return (
    <View>
      <Card accent style={styles.card}>
        <View style={styles.bosh}>
          <View style={styles.belgi}><Ionicons name="checkmark-done" size={20} color={C.onAccent} /></View>
          <View style={styles.flex1}>
            <Text style={styles.boshSarlavha}>Kun yakunlandi</Text>
            <Text style={styles.boshIzoh}>{sanaChiroyli(h.sana)} · {soat(h.vaqt)}</Text>
          </View>
        </View>
        <Text style={styles.eslatma}>Yangi kun tunda soat 03:00 da ochiladi. Xato bo'lsa — Markazda shu vaqtgacha bekor qilish mumkin.</Text>
      </Card>

      <View style={styles.plitkalar}>
        <Plitka nom="Sof foyda" qiymat={formatSom(h.sofFoyda)} birlik="so'm" ajrat />
        <Plitka nom="Daromad" qiymat={formatSom(daromad)} birlik="so'm" />
        <Plitka nom="Sotilgan" qiymat={formatSom(h.sotilganNon)} birlik="dona" />
      </View>

      {nonQatorlar.length > 0 && (
        <Card style={styles.card}>
          <Sarlavha icon="layers-outline" matn="Ishlab chiqarish" />
          {nonQatorlar.map((x) => <Qator key={x.id} nom={x.nom} qiymat={x.matn} ikon={<NonIkon non={x.non} size={15} color={C.sub} />} />)}
        </Card>
      )}

      <Card style={styles.card}>
        <Sarlavha icon="cube-outline" matn="Umumiy son" />
        <Qator nom="Tonggi qoldiq" qiymat={`${formatSom(h.jamiBoshlang)} dona`} />
        <Qator nom="Ishlab chiqarilgan" qiymat={`${formatSom(h.jamiNon)} dona`} />
        <Qator nom="Sotilgan" qiymat={`${formatSom(h.sotilganNon)} dona`} />
        {son(h.jamiYaroqsiz) > 0 && <Qator nom="Yaroqsiz" qiymat={`${formatSom(h.jamiYaroqsiz)} dona`} />}
        <Qator nom="Ertangi qoldiq" qiymat={`${formatSom(h.jamiQoldiq)} dona`} qalin />
      </Card>

      <Card style={styles.card}>
        <Sarlavha icon="cash-outline" matn="Moliya" />
        <Qator nom="Daromad" qiymat={`${formatSom(daromad)} so'm`} />
        <Qator nom="Ishchi haqi" qiymat={`${formatSom(haq)} so'm`} />
        <Qator nom="Kun oxiri (daromad − ishchi haqi)" qiymat={`${formatSom(daromad - haq)} so'm`} />
        {qoshimcha.map(([nom, v]) => <Qator key={nom} nom={nom} qiymat={`${formatSom(v)} so'm`} />)}
        <View style={styles.chiziq} />
        <Qator nom="Sof foyda" qiymat={`${formatSom(h.sofFoyda)} so'm`} qalin katta />
      </Card>

      {(h.ishchiHaqlari || []).length > 0 && (
        <Card style={styles.card}>
          <Sarlavha icon="people-outline" matn="Ishchilar haqi" />
          {h.ishchiHaqlari.map((w) => <Qator key={w.id} nom={`${w.ism}${w.brak > 0 ? ` (brak −${formatSom(w.brak)})` : ""}`} qiymat={`${formatSom(w.net)} so'm`} />)}
        </Card>
      )}

      <Btn icon="document-outline" onPress={pdf}>PDF hisobot</Btn>
      <View style={styles.oraliq} />
      <Btn secondary icon="home-outline" onPress={markazga} sezgiTuri="otish">Markazga qaytish</Btn>
    </View>
  );
}

function Plitka({ nom, qiymat, birlik, ajrat }) {
  return (
    <View style={[styles.plitka, ajrat && styles.plitkaAjrat]}>
      <Text style={styles.plitkaNom} numberOfLines={1}>{nom}</Text>
      <Text style={[styles.plitkaVal, ajrat && { color: C.accent }]} numberOfLines={1} adjustsFontSizeToFit>{qiymat}</Text>
      <Text style={styles.plitkaBirlik}>{birlik}</Text>
    </View>
  );
}

function Sarlavha({ icon, matn }) {
  return (
    <View style={styles.sarlavha}>
      <Ionicons name={icon} size={18} color={C.sub} />
      <Text style={styles.sarlavhaTxt}>{matn}</Text>
    </View>
  );
}

function Qator({ nom, qiymat, qalin, katta, ikon }) {
  return (
    <View style={styles.qator}>
      {ikon}
      <Text style={styles.qatorNom}>{nom}</Text>
      <Text style={[styles.qatorVal, qalin && styles.qalin, katta && styles.katta]}>{qiymat}</Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  flex1:       { flex: 1 },
  card:        { marginBottom: S[4] },
  bosh:        { flexDirection: "row", alignItems: "center", gap: S[3] },
  belgi:       { width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" },
  boshSarlavha:{ fontSize: T.lg, fontWeight: "800", color: C.text },
  boshIzoh:    { fontSize: T.sm, color: C.sub, marginTop: 2 },
  eslatma:     { fontSize: T.xs, color: C.sub, marginTop: S[3], lineHeight: 17 },
  plitkalar:   { flexDirection: "row", gap: S[2], marginBottom: S[4] },
  plitka:      { flex: 1, backgroundColor: C.card, borderRadius: R.md, borderWidth: 1, borderColor: C.borderSoft, paddingVertical: S[3], paddingHorizontal: S[3] },
  plitkaAjrat: { borderColor: C.accent + "55" },
  plitkaNom:   { fontSize: 10, color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
  plitkaVal:   { fontSize: T.md, color: C.text, fontWeight: "800", marginTop: 4 },
  plitkaBirlik:{ fontSize: 10, color: C.muted, marginTop: 1 },
  sarlavha:    { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[3] },
  sarlavhaTxt: { fontSize: T.md, fontWeight: "700", color: C.text },
  qator:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7, gap: S[2] },
  qatorNom:    { flex: 1, fontSize: T.sm, color: C.sub },
  qatorVal:    { fontSize: T.sm, color: C.text, fontWeight: "600" },
  qalin:       { fontWeight: "800" },
  katta:       { fontSize: T.lg, color: C.accent },
  chiziq:      { height: StyleSheet.hairlineWidth, backgroundColor: C.borderSoft, marginVertical: S[2] },
  oraliq:      { height: S[2] },
}));
