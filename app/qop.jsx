// Kunlik qop hisobi — TO'LIQ sahifa: hisobot sanasi, per-non kiritish (boshlang
// qoldiq, qop, yaroqsiz, kun oxiri qoldiq), FIFO tafsiloti, ishchilar haqi,
// moliyaviy xulosa va "Saqlash" / "Kunni yakunlash" tugmalari.
// Kun KUNIGA BIR MARTA yakunlanadi. Yakunlangach sahifada faqat shu kunning hisoboti
// (o'qish uchun) va PDF turadi; bekor qilish — Markazda, kun oxirigacha.
import { useEffect, useMemo, useState } from "react";
import { View, Text, Image, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { Btn } from "../src/components/Btn";
import { xomashyoRoyxati } from "../src/logic/konstantalar";
import { DateField } from "../src/components/DateField";
import { KunHisoboti } from "../src/components/KunHisoboti";
import { ScrollBox } from "../src/components/ScrollBox";
import { SahifaSarlavha } from "../src/components/SahifaSarlavha";
import { C, T, S, R, temaStil } from "../src/theme";
import { hisoblaKunlik, qoldiqlarHisobi, ishchiHaqlari, kunlikXomashyoSarfi, formatSom, bugunSana, kunTugashVaqti } from "../src/logic/hisob";

const toStr = (obj) => Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k, String(v)]));
// Ish kuni sanasi (kun tunda 03:00 da tugaydi)
const localSana = () => bugunSana();

export default function Qop() {
  const {
    nonlar, ishchilarHaq: ishchilar, optomlar, qarzlar, mahsulotNarxlari, braklar, kartalar,
    ozIshlabQoplar, setOzIshlabQoplar, tashqariSonlar, setTashqariSonlar,
    sotilmaganNon, setSotilmaganNon,
    boshlangichQoldiq, qoldaYaroqsiz, setQoldaYaroqsiz,
    kunlikXarajatlar,
    oxirgiYakunlashVaqti, customMahsulotlar,
    hisobotlarTarixi, kunYakunlanganmi, kunYakunla, lockedDayStats, yakunBekor,
  } = useApp();
  // Bugun yakunlangan bo'lsa — faqat hisobot ko'rinishi
  const yakunlangan = kunYakunlanganmi();
  const yakunHisoboti = yakunlangan
    ? (hisobotlarTarixi || []).find((h) => h.id === yakunBekor?.snapId) || (hisobotlarTarixi || []).find((h) => h.sana === lockedDayStats?.sana)
    : null;

  // Hisobot sanasi: bo'sh "" => avtomatik bugun har yakunlash'da.
  const [kunlikSana, setKunlikSana] = useState("");
  const [sanaTanlandi, setSanaTanlandi] = useState(false);
  const [fQop, setFQop] = useState(toStr(ozIshlabQoplar));
  const [fTash, setFTash] = useState(toStr(tashqariSonlar));
  const [fSot, setFSot] = useState(toStr(sotilmaganNon));
  const [fYaroqsiz, setFYaroqsiz] = useState(toStr(qoldaYaroqsiz));
  const [tegildi, setTegildi] = useState(false);

  // Boshqa joydan yangilansa, joriy formani yangilab turamiz (faqat formaga tegilmasa)
  useEffect(() => { if (!tegildi) setFQop(toStr(ozIshlabQoplar)); }, [ozIshlabQoplar]);
  useEffect(() => { if (!tegildi) setFTash(toStr(tashqariSonlar)); }, [tashqariSonlar]);
  useEffect(() => { if (!tegildi) setFSot(toStr(sotilmaganNon)); }, [sotilmaganNon]);
  useEffect(() => { if (!tegildi) setFYaroqsiz(toStr(qoldaYaroqsiz)); }, [qoldaYaroqsiz]);

  const formaTeg = (setter, key, val) => { setTegildi(true); setter((p) => ({ ...p, [key]: val })); };

  // "Kecha kabi" — oxirgi yakunlangan kunning qop/dona sonlarini bir bosishda to'ldirish
  const oxirgiHisobot = (hisobotlarTarixi || [])[0];
  const kechaKabi = () => {
    if (!oxirgiHisobot) return;
    setTegildi(true);
    setFQop(toStr(oxirgiHisobot.ozIshlabQoplar));
    setFTash(toStr(oxirgiHisobot.tashqariSonlar));
  };

  // Faqat oxirgi yakunlashdan keyingi (bugungi) brak'lar inobatga olinadi.
  const bugungiBrak = useMemo(
    () => (braklar || []).filter((b) => (b.vaqt || 0) > (oxirgiYakunlashVaqti || 0)),
    [braklar, oxirgiYakunlashVaqti]
  );
  const args = {
    nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari, braklar,
    ozIshlabQoplar: fQop, tashqariSonlar: fTash, sotilmaganNon: fSot,
    boshlangichQoldiq, qoldaYaroqsiz: fYaroqsiz, kunlikXarajatlar, oxirgiYakunlashVaqti,
  };
  const stats = useMemo(() => hisoblaKunlik(args), [fQop, fTash, fSot, fYaroqsiz, nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari, braklar, boshlangichQoldiq, kunlikXarajatlar, oxirgiYakunlashVaqti]);
  const qoldiqlar = useMemo(() => qoldiqlarHisobi(nonlar, args), [fQop, fTash, fSot, fYaroqsiz, nonlar, boshlangichQoldiq, optomlar, qarzlar, oxirgiYakunlashVaqti]);
  const haq = useMemo(() => ishchiHaqlari(nonlar, ishchilar, fQop, bugungiBrak), [nonlar, ishchilar, fQop, bugungiBrak]);

  const saqla = () => {
    setOzIshlabQoplar(fQop);
    setTashqariSonlar(fTash);
    setSotilmaganNon(fSot);
    setQoldaYaroqsiz(fYaroqsiz);
    setTegildi(false);
    Alert.alert("Saqlandi", "Kunlik kiritmalar saqlandi.");
  };

  const kunniYakunla = () => {
    // Boshlangich qoldiq, bugungi ishlab chiqarish yoki bugungi xarajat — yakunlash uchun yetarli
    const hechNarsa = stats.jamiNon <= 0 && stats.jamiQop <= 0 && stats.jamiBoshlang <= 0 && (stats.xarajatJami || 0) <= 0;
    if (hechNarsa) {
      Alert.alert("Ma'lumot yo'q", "Avval kunlik qop hisobiga ma'lumot kiriting.");
      return;
    }
    if (kunYakunlanganmi()) {
      Alert.alert("Kun yakunlangan", "Bugun kun allaqachon yakunlangan. Bir kunda faqat bir marta yakunlanadi.");
      return;
    }
    const sanaTekshir = sanaTanlandi && kunlikSana ? kunlikSana : localSana();
    if ((hisobotlarTarixi || []).some((h) => h.sana === sanaTekshir)) {
      Alert.alert("Hisobot bor", `${sanaTekshir} sanasi uchun hisobot allaqachon yozilgan. Bir kun ikki marta yakunlanmaydi.`);
      return;
    }
    Alert.alert("Kunni yakunlash", "Bugungi ma'lumot tarixga yoziladi va kun yopiladi. Bugun qayta yakunlab bo'lmaydi; xato bo'lsa — Markazdan kun oxirigacha bekor qilish mumkin. Davom etasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Yakunlash", onPress: () => {
        setTegildi(false);
        const sana = sanaTekshir;
        const endOfDay = kunTugashVaqti(); // ish kuni tunda 03:00 da tugaydi

        // ── 1) ARXIV: bugungi karta/optom/brak/xarajat yozuvlarini snap ichiga
        //    olamiz (jadval o'chmaydi, ular hisobotlarTarixi'ga ham yoziladi)
        const ms = (e) => e?.vaqt || (e?.sana ? Date.parse(e.sana) : 0);
        const yangi = (e) => ms(e) > (oxirgiYakunlashVaqti || 0);
        const bugKarta   = (kartalar || []).filter((e) => e.sana === sana && yangi(e));
        const bugBrak    = (braklar  || []).filter((e) => e.sana === sana && yangi(e));
        const bugOptom   = (optomlar || []).filter((e) => e.sana === sana && yangi(e));
        const bugXarajat = (kunlikXarajatlar || []).filter((e) => e.sana === sana && yangi(e));
        // Qarz: TEGILMAYDI (doimiy qoldiq sifatida qoladi)

        const sum = (arr, key) => arr.reduce((s, x) => s + (parseFloat(x[key]) || 0), 0);
        const kartaSum    = sum(bugKarta, "summa");
        const kartaFoyda  = sum(bugKarta, "sofFoyda");
        const brakSum     = sum(bugBrak, "summa");
        const optomSum    = sum(bugOptom, "summa");
        const optomFoyda  = sum(bugOptom, "sofFoyda");
        const xarajatSum  = sum(bugXarajat, "summa");

        // ── 2) LOCK: kun tugaguncha (tunda 03:00 gacha) Markaz'da ko'rsatkichlar shu qiymatda qotib turadi
        const lock = {
          sana,
          lockedUntil: endOfDay,
          snapshot: {
            sofFoyda:    stats.sofFoyda,
            sotilganNon: stats.sotilganNon,
            jamiQop:     stats.jamiQop,
            jamiNon:     stats.jamiNon,
            jamiBoshlang:stats.jamiBoshlang,
            daromad:     stats.daromad,
            xomashyo:    stats.xomashyo,
            ishchiHaq:   stats.ishchiHaq,
            xarajatJami: stats.xarajatJami,
            kartaSum, kartaSoni: bugKarta.length, kartaFoyda,
            brakSum,  brakSoni: bugBrak.length,
            optomSum, optomSoni: bugOptom.length, optomFoyda,
            xarajatSum, xarajatSoni: bugXarajat.length,
          },
        };

        // ── 3) HISTORY: hisobotlarTarixi jadvaliga to'liq snap yoziladi
        //    (bugungi karta/optom/brak/xarajat yozuvlari ham sana bilan birga)
        const snap = {
          id: Date.now(), sana, vaqt: Date.now(),
          boshlangichQoldiq, ozIshlabQoplar: fQop, tashqariSonlar: fTash, qoldaYaroqsiz: fYaroqsiz, sotilmaganNon: fSot,
          nonlarSnapshot: JSON.parse(JSON.stringify(nonlar)),
          ishchilarSnapshot: JSON.parse(JSON.stringify(ishchilar)),
          mahsulotNarxlariSnapshot: JSON.parse(JSON.stringify(mahsulotNarxlari)),
          daromad: stats.daromad, xomashyo: stats.xomashyo, ishchiHaq: stats.ishchiHaq,
          sofFoyda: stats.sofFoyda, sotilganNon: stats.sotilganNon, jamiQop: stats.jamiQop, jamiNon: stats.jamiNon,
          jamiBoshlang: stats.jamiBoshlang, jamiQoldiq: stats.jamiQoldiq, jamiYaroqsiz: stats.jamiYaroqsiz,
          xarajatJami: stats.xarajatJami, ishchiHaqlari: haq.list,
          // History qismi — bugungi yozuvlarning to'liq dumpi (Qarz YO'Q):
          arxiv: {
            kartalar:        bugKarta,
            braklar:         bugBrak,
            optomlar:        bugOptom,
            kunlikXarajatlar:bugXarajat,
            kartaSum, kartaFoyda, brakSum, optomSum, optomFoyda, xarajatSum,
          },
        };
        // ── 4) Xomashyo sarfi — ombor so'rovnomasi
        const sarf = kunlikXomashyoSarfi(nonlar, fQop, xomashyoRoyxati(customMahsulotlar));
        const sorov = sarf.length > 0 ? { id: Date.now() + 1, sana, vaqt: Date.now(), manba: "Kunlik qop hisobi", maydonlar: sarf } : null;

        // ── 5) Hammasi bitta amalda: tarix, muhr, so'rovnoma, ertangi tonggi qoldiq
        //    (Karta / Brak / Xarajatlar TOZALANMAYDI — ular o'z tarixida 7 kun saqlanadi)
        kunYakunla({
          snap, lock, sorov,
          forma: { ozIshlabQoplar: fQop, tashqariSonlar: fTash, sotilmaganNon: fSot, qoldaYaroqsiz: fYaroqsiz },
        });
        setKunlikSana(""); setSanaTanlandi(false);
      }},
    ]);
  };

  // ── Yakunlangan kun: faqat hisobot va PDF ──
  if (yakunlangan) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollBox contentContainerStyle={styles.scroll}>
          <SahifaSarlavha eyebrow="KUNLIK HISOB" title="Kunlik qop hisobi" subtitle="Bugungi kun yakunlangan" image={require("../assets/icons/qop.png")} />
          {yakunHisoboti ? <KunHisoboti h={yakunHisoboti} /> : (
            <Card><Text style={styles.rowLabel}>Bugungi hisobot topilmadi.</Text></Card>
          )}
        </ScrollBox>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <SahifaSarlavha eyebrow="KUNLIK HISOB" title="Kunlik qop hisobi" subtitle={`${stats.jamiQop} qop · ${stats.jamiNon} dona ishlab`} image={require("../assets/icons/qop.png")} />

        {/* Hisobot sanasi */}
        <Card accent style={styles.card}>
          <Text style={styles.fieldLabel}>Hisobot sanasi</Text>
          <DateField value={kunlikSana || localSana()} onChange={(v) => { setKunlikSana(v); setSanaTanlandi(true); }} />
          {!sanaTanlandi && <Text style={styles.sanaHint}>Bugungi kun avtomatik. Boshqa sana uchun kalendarni oching.</Text>}
        </Card>

        {/* Per-non kiritish */}
        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="layers-outline" size={18} color={C.sub} />
            <Text style={[styles.cardTitle, styles.flex1]}>Non turlari bo'yicha</Text>
            {oxirgiHisobot && (
              <Pressable accessibilityLabel="Kecha kabi to'ldirish" onPress={kechaKabi} hitSlop={6} style={({ pressed }) => [styles.kechaBtn, pressed && { opacity: 0.7 }]}>
                <Ionicons name="repeat-outline" size={14} color={C.accent} />
                <Text style={styles.kechaTxt}>Kecha kabi</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.gap10} />
          {nonlar.map((n) => {
            const oz = n.ozIshlab !== false;
            const q = qoldiqlar.find((x) => x.id === n.id) || {};
            return (
              <View key={n.id} style={styles.nonRow}>
                <View style={styles.nonHead}>
                  <Text style={styles.nonNom} numberOfLines={1}>{n.nom}</Text>
                  {q.boshlang > 0 && (
                    <View style={styles.boshlangPill}>
                      <Ionicons name="archive-outline" size={11} color={C.accent} />
                      <Text style={styles.boshlangTxt}> Tonggi: {q.boshlang}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.inputs}>
                  <Field label={oz ? "Qop" : "Dona"}
                    value={(oz ? fQop : fTash)[n.id] ?? ""}
                    onChange={(v) => oz ? formaTeg(setFQop, n.id, v) : formaTeg(setFTash, n.id, v)} />
                  <Field label="Yaroqsiz"
                    value={fYaroqsiz[n.id] ?? ""}
                    onChange={(v) => formaTeg(setFYaroqsiz, n.id, v)} />
                  <Field label="Qoldiq"
                    value={fSot[n.id] ?? ""}
                    onChange={(v) => formaTeg(setFSot, n.id, v)} />
                </View>
                {(q.jamiZaxira > 0 || q.boshlang > 0) && (
                  <Text style={styles.flow}>
                    {q.boshlang} + {q.ishlab} = {q.jamiZaxira} · Sotilgan {q.jamiSotilgan}{q.divertedShu > 0 ? ` (${q.divertedShu} optom/qarz)` : ""}{q.yaroqsiz > 0 ? ` · Yaroqsiz ${q.yaroqsiz}` : ""}
                  </Text>
                )}
              </View>
            );
          })}
          <Btn onPress={saqla} icon="save-outline">Saqlash</Btn>
        </Card>

        {/* Umumiy son hisoboti */}
        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cube-outline" size={18} color={C.sub} />
            <Text style={styles.cardTitle}>Umumiy son</Text>
          </View>
          <View style={styles.gap10} />
          <Row label="Tonggi qoldiq" value={`${stats.jamiBoshlang} dona`} />
          <Row label="Bugungi ishlab" value={`${stats.jamiNon} dona`} />
          <Row label="Sotilgan" value={`${stats.sotilganNon} dona`} />
          <Row label="Yaroqsiz" value={`${stats.jamiYaroqsiz} dona`} color={stats.jamiYaroqsiz > 0 ? C.red : C.text} />
          <Row label="Ertangi qoldiq" value={`${stats.jamiQoldiq} dona`} color={C.accent} bold />
        </Card>

        {/* Moliyaviy xulosa */}
        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cash-outline" size={18} color={C.sub} />
            <Text style={styles.cardTitle}>Moliyaviy xulosa</Text>
          </View>
          <View style={styles.gap10} />
          <Row label="Daromad" value={`${formatSom(stats.daromad)} so'm`} />
          {stats.tashqariTannarx > 0 && (
            <Row label="Tashqaridan olingan non" value={`− ${formatSom(stats.tashqariTannarx)} so'm`} color={C.red} />
          )}
          <Row label="Ishchi haqi" value={`${formatSom(stats.ishchiHaq)} so'm`} />
          {stats.xarajatJami > 0 && (
            <Row label="Qo'shimcha xarajat (bugun)" value={`− ${formatSom(stats.xarajatJami)} so'm`} color={C.red} />
          )}
          <View style={styles.divider} />
          <Row label="Sof foyda" value={`${formatSom(stats.sofFoyda)} so'm`} color={stats.sofFoyda >= 0 ? C.green : C.red} bold big />
        </Card>

        {/* Ishchilar haqi */}
        {haq.list.length > 0 && (
          <Card style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="people-outline" size={18} color={C.sub} />
              <Text style={styles.cardTitle}>Ishchilar haqi (jonli)</Text>
            </View>
            <View style={styles.gap10} />
            {haq.list.map((w) => (
              <View key={w.id} style={styles.haqRow}>
                <Text style={styles.haqNom} numberOfLines={1}>{w.ism}{w.brak > 0 ? ` (brak −${formatSom(w.brak)})` : ""}</Text>
                <Text style={styles.haqVal}>{formatSom(w.net)} so'm</Text>
              </View>
            ))}
          </Card>
        )}

        <Btn secondary onPress={kunniYakunla} icon="checkmark-done-outline">Kunni yakunlash</Btn>
        <View style={styles.gap14} />
      </ScrollBox>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange }) {
  return (
    <View style={styles.col}>
      <Text style={styles.lbl}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={C.muted}
        style={styles.input}
      />
    </View>
  );
}

function Row({ label, value, color = C.text, bold, big }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowVal, { color, fontWeight: bold ? "800" : "600", fontSize: big ? T.lg : T.md }]}>{value}</Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: S[5], paddingBottom: S[8] },
  flex1: { flex: 1 },
  card: { marginBottom: S[4] },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontSize: T.md, fontWeight: "700", color: C.text },
  kechaBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 11, borderRadius: R.pill, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  kechaTxt: { fontSize: T.xs, fontWeight: "800", color: C.accent },
  fieldLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 },
  sanaHint:   { fontSize: 11, color: C.muted, marginTop: 6, fontStyle: "italic" },
  gap10: { height: S[3] },
  gap14: { height: S[4] },

  nonRow: { marginBottom: S[3], paddingBottom: S[3], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.borderSoft },
  nonHead: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: 6, flexWrap: "wrap" },
  nonNom: { fontSize: T.md, fontWeight: "700", color: C.text },
  boshlangPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.pill, backgroundColor: C.accent + "14" },
  boshlangTxt: { fontSize: 11, color: C.accent, fontWeight: "700" },
  inputs: { flexDirection: "row", gap: S[2] },
  col: { flex: 1 },
  lbl: { fontSize: 10, color: C.sub, fontWeight: "700", marginBottom: 4, letterSpacing: 0.3, textTransform: "uppercase" },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 9, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "center" },
  flow: { fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 15 },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  rowLabel: { flex: 1, fontSize: T.sm, color: C.sub },
  rowVal: { color: C.text, marginLeft: S[2] },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: C.borderSoft, marginVertical: S[2] },

  haqRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[2] },
  haqNom: { flex: 1, fontSize: T.sm, color: C.text },
  haqVal: { fontSize: T.sm, color: C.accent, fontWeight: "800", marginLeft: S[2] },
}));
