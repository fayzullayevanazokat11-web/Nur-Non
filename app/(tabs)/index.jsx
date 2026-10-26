// "Markaz" ekrani — eslatmalar, kunlik vazifa, so'ng bitta kartada Qarzlar/Optom/Karta/Xarajat
// ustunlari, "Hisob-kitob" guruhi (qop hisobi + kun yakunini bekor qilish, statistika)
// va bugungi ishchilar haqi (jami bilan).
import { tikMs } from "../../src/store/rejim";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet, LayoutAnimation, AppState, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { ScrollBox } from "../../src/components/ScrollBox";
import { Bosma } from "../../src/components/Bosma";
import { EslatmalarPanel } from "../../src/components/EslatmalarPanel";
import { ErtalabTekshiruv } from "../../src/components/ErtalabTekshiruv";
import { DavomatKarta } from "../../src/components/Davomat";
import { ixcham } from "../../src/components/Statistika";
import { Guruh, GuruhQator, KorsatkichQatori } from "../../src/components/Guruh";
import { C, T, S, R, temaStil } from "../../src/theme";
import { hisoblaKunlik, formatSom, qarzJami, optomJami, kartaJami, ishchiHaqlari, bugunSana, sutLitri } from "../../src/logic/hisob";
// Maxsus rasm ikonkalari (Ionicons o'rniga — premium ko'rinish)
const ICONS = {
  qop:     require("../../assets/icons/qop.png"),
  qarz:    require("../../assets/icons/qarz.png"),
  optom:   require("../../assets/icons/optom.png"),
  karta:   require("../../assets/icons/karta.png"),
  brak:    require("../../assets/icons/brak.png"),
  xarajat: require("../../assets/icons/xarajat.png"),
};

// Ish kuni sanasi (kun tunda 03:00 da tugaydi)
const localSana = () => bugunSana();

export default function Markaz() {
  const {
    nonlar, ishchilarHaq: ishchilar, qarzlar, optomlar, kartalar,
    ozIshlabQoplar, tashqariSonlar, sotilmaganNon, mahsulotNarxlari,
    hisobotlarTarixi, braklar, sutKirimi,
    boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar, oxirgiYakunlashVaqti,
    lockedDayStats, yakunBekor, yakunBekorMumkinmi, kunYakuniniBekor, setErtalabYonalish, ertalabKorildi,
  } = useApp();

  // Har 30 soniyada tick — ish kuni tugaganda (tunda 03:00) lock va sana ko'rsatkichlari
  // o'z-o'zidan yangilanishi uchun. Foydalanuvchi tegmasa ham Markaz tetik turadi.
  // Markazga qaytilgach ertalabgi qadam bannerlari ("Tayyor") boshqa sahifalarda qolib ketmasin
  useFocusEffect(useCallback(() => { setErtalabYonalish(null); }, []));

  const [davomatOch, setDavomatOch] = useState(0); // Kunlik vazifadan bosilganda davomat kartasi ochiladi
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1000000), tikMs(30000));
    return () => clearInterval(id);
  }, []);
  const bugunSanasi = useMemo(() => localSana(), [tick]);

  // ── MUHRLANGAN KUN (Lock) ──
  // "Kunni tugatish" bosilgan bo'lsa va o'sha ish kuni hali tugamagan bo'lsa (tunda 03:00 dan oldin)
  // — Markaz ko'rsatkichlarini yakunlash paytidagi muhrlangan snapshotdan o'qiymiz.
  // Aks holda jonli (live) hisob-kitob bo'ladi. Sana o'zgarishi bilan (ertaga) lock o'z-o'zidan
  // tarqaladi va ko'rsatkichlar yangi kun uchun jonli yangilanadi.
  const locked = useMemo(() => {
    if (!lockedDayStats) return null;
    if ((lockedDayStats.kun || lockedDayStats.sana) !== bugunSanasi) return null;
    if (lockedDayStats.lockedUntil && Date.now() > lockedDayStats.lockedUntil) return null;
    return lockedDayStats.snapshot || null;
  }, [lockedDayStats, bugunSanasi, tick]);

  // Bugungi yozuvlar — sana + oxirgiYakunlashVaqti filtri bilan (lock paytida
  // Markaz baribir locked.snapshot'dan o'qiydi, lekin bu filterlar tahlil va
  // ishchi haqi uchun ham ishlatiladi).
  const yangiYozuv = (e) => (e.vaqt || 0) > (oxirgiYakunlashVaqti || 0);
  const bugSanasi = (e) => e.sana === bugunSanasi;
  const bugungiKarta = useMemo(() => (kartalar || []).filter((e) => bugSanasi(e) && yangiYozuv(e)), [kartalar, oxirgiYakunlashVaqti, bugunSanasi]);
  const bugungiBrak  = useMemo(() => (braklar  || []).filter((e) => bugSanasi(e) && yangiYozuv(e)), [braklar,  oxirgiYakunlashVaqti, bugunSanasi]);
  const bugungiOptom = useMemo(() => (optomlar || []).filter((e) => bugSanasi(e) && yangiYozuv(e)), [optomlar, oxirgiYakunlashVaqti, bugunSanasi]);

  const liveStats = useMemo(
    () => hisoblaKunlik({ nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar, boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar, oxirgiYakunlashVaqti, sutLitr: sutLitri((sutKirimi || {})[bugunSana()]) }),
    [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar, boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar, oxirgiYakunlashVaqti, sutKirimi]
  );
  // Lock bo'lsa — snapshot, aks holda jonli hisob:
  const stats = locked ? { ...liveStats, ...locked } : liveStats;
  // Kun yakunlangan bo'lsa — o'sha kun hisobotidagi ishchilar haqi (kiritmalar tozalangan)
  const yakunHisoboti = useMemo(() => {
    if (!locked) return null;
    return (hisobotlarTarixi || []).find((h) => h.id === yakunBekor?.snapId)
      || (hisobotlarTarixi || []).find((h) => h.sana === lockedDayStats?.sana) || null;
  }, [locked, hisobotlarTarixi, yakunBekor, lockedDayStats]);
  const bugungiHaq = useMemo(() => {
    if (yakunHisoboti) return { list: yakunHisoboti.ishchiHaqlari || [] };
    return ishchiHaqlari(nonlar, ishchilar, ozIshlabQoplar, bugungiBrak);
  }, [yakunHisoboti, nonlar, ishchilar, ozIshlabQoplar, bugungiBrak]);

  // Qarzlar — Lock ta'sir qilmaydi (doimiy qoldiq).
  const qarz = useMemo(() => qarzJami(qarzlar), [qarzlar]);
  // Optom / Karta / Brak / Xarajat — Lock bo'lsa snapshotdan, bo'lmasa jonli:
  const optom = useMemo(() => {
    if (locked) return { summa: locked.optomSum, soni: locked.optomSoni };
    return optomJami(bugungiOptom);
  }, [locked, bugungiOptom]);
  const karta = useMemo(() => {
    if (locked) return { summa: locked.kartaSum, soni: locked.kartaSoni };
    return kartaJami(bugungiKarta);
  }, [locked, bugungiKarta]);
  const xarajatBugun = useMemo(() => {
    if (locked) return locked.xarajatSum;
    return (kunlikXarajatlar || []).filter((x) => x.sana === bugunSanasi && yangiYozuv(x)).reduce((s, x) => s + (parseFloat(x.summa) || 0), 0);
  }, [locked, kunlikXarajatlar, oxirgiYakunlashVaqti, bugunSanasi]);
  const xarajatSoni = useMemo(() => {
    if (locked) return locked.xarajatSoni;
    return (kunlikXarajatlar || []).filter((x) => x.sana === bugunSanasi && yangiYozuv(x)).length;
  }, [locked, kunlikXarajatlar, oxirgiYakunlashVaqti, bugunSanasi]);

  // Kun yakunini bekor qilish (shu kun oxirigacha) — tick tufayli tunda 03:00 da o'zi yo'qoladi
  const bekorKorinadi = !!locked && yakunBekorMumkinmi();
  const yakunniBekorSora = () =>
    Alert.alert("Kun yakunini bekor qilish", "Bugungi hisobot olib tashlanadi, kiritilgan qoplar «Kunlik qop hisobi»ga qaytadi va kunni qayta yakunlash mumkin bo'ladi. Fikringiz o'zgarsa — «Tarixdagilar»dan tiklaysiz. Davom etasizmi?", [
      { text: "Yo'q", style: "cancel" },
      { text: "Bekor qilish", style: "destructive", onPress: () => {
        LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
        kunYakuniniBekor();
      } },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <ScreenHeader eyebrow="Bosh sahifa" title="Markaz" image={require("../../assets/tabicons/markaz.png")} />

        <EslatmalarPanel />

        {/* KUNNI BOSHLASH — ertalabgi tekshiruv (davomat, ombor) */}
        <ErtalabTekshiruv kunYopiq={!!locked} onDavomat={() => setDavomatOch((x) => x + 1)} />

        {/* BUGUNGI DAVOMAT — Markazda (ochilganda Kunlik vazifada "ko'rildi" deb qayd etiladi) */}
        <DavomatKarta ochKaliti={davomatOch || null} onOchildi={() => ertalabKorildi("davomat")} />


        {/* PUL OQIMI — Qarzlar / Optom / Karta / Xarajat bitta kartada, ustunlarga bo'lingan */}
        <KorsatkichQatori
          items={[
            { label: "Qarzlar", image: ICONS.qarz, qiymat: qarz.summa ? ixcham(qarz.summa) : "0", birlik: qarz.kishi ? `${qarz.kishi} kishi` : "so'm", soni: qarz.kishi, onPress: () => router.push("/qarzlar") },
            { label: "Optom", image: ICONS.optom, qiymat: optom.summa ? ixcham(optom.summa) : "0", birlik: optom.soni ? `${optom.soni} ta · bugun` : "bugun", onPress: () => router.push("/optom") },
            { label: "Karta", image: ICONS.karta, qiymat: karta.summa ? ixcham(karta.summa) : "0", birlik: karta.soni ? `${karta.soni} ta · bugun` : "bugun", onPress: () => router.push("/karta") },
            { label: "Xarajat", image: ICONS.xarajat, accessibilityLabel: "Kunlik qo'shimcha xarajatlar", qiymat: xarajatBugun ? ixcham(xarajatBugun) : "0", birlik: xarajatSoni ? `${xarajatSoni} ta · bugun` : "bugun", onPress: () => router.push("/xarajat") },
          ]}
        />

        {/* HISOB-KITOB — qop hisobi, xarajatlar va statistika bitta guruhda */}
        <Guruh sarlavha="HISOB-KITOB" icon="albums-outline">
          <GuruhQator
            key="qop"
            image={ICONS.qop}
            nom="Kunlik qop hisobi"
            izoh={locked ? "Kun yakunlangan · hisobot va PDF" : `${stats.jamiBoshlang > 0 ? `${stats.jamiBoshlang} tonggi · ` : ""}${stats.jamiQop} qop · ${stats.jamiNon} dona ishlab`}
            onPress={() => router.push("/qop")}
          />
          {/* KUN YAKUNINI BEKOR QILISH — yakunlangan kunning oxirigacha turadi */}
          {bekorKorinadi && (
            <View key="bekor" style={styles.yakunQator}>
              <Ionicons name="lock-closed-outline" size={18} color={C.accent} />
              <View style={styles.flex1}>
                <Text style={styles.yakunMatn}>Kun yakunlangan · {soatMatni(yakunBekor?.vaqt)}</Text>
                <Text style={styles.yakunIzoh}>Xato bo'lsa — tunda 03:00 gacha bekor qilish mumkin</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Kun yakunini bekor qilish"
                onPress={yakunniBekorSora}
                hitSlop={6}
                style={({ pressed }) => [styles.yakunBtn, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="arrow-undo-outline" size={14} color={C.accent} />
                <Text style={styles.yakunBtnTxt}>Bekor qilish</Text>
              </Pressable>
            </View>
          )}
          <GuruhQator
            key="tarix"
            icon="stats-chart-outline"
            accessibilityLabel="Hisobotlar tarixi"
            nom="Statistika va tarix"
            izoh={`${(hisobotlarTarixi || []).length} ta hisobot · 30 kun`}
            onPress={() => router.push("/tarix")}
          />
        </Guruh>

        {/* BUGUNGI ISHCHILAR HAQI (jonli) — bitta kartada, ostida jami */}
        {bugungiHaq.list.length > 0 && (
          <Guruh sarlavha="BUGUNGI ISHCHILAR HAQI" icon="people-outline" soni={`${bugungiHaq.list.length} nafar`}>
            {bugungiHaq.list.map((w) => (
              <View key={w.id} style={styles.haqRow}>
                <Text style={styles.haqNom} numberOfLines={1}>{w.ism}{w.brak > 0 ? ` (brak −${formatSom(w.brak)})` : ""}</Text>
                <Text style={styles.haqVal}>{formatSom(w.net)} so'm</Text>
              </View>
            ))}
            <View key="jami" style={[styles.haqRow, styles.haqJami]}>
              <Text style={styles.haqJamiNom}>Jami</Text>
              <Text style={styles.haqJamiVal}>{formatSom(bugungiHaq.list.reduce((s, w) => s + (Number(w.net) || 0), 0))} so'm</Text>
            </View>
          </Guruh>
        )}

      </ScrollBox>

    </SafeAreaView>
  );
}

const ikkiR = (n) => String(n).padStart(2, "0");
const soatMatni = (ms) => { const d = new Date(ms || Date.now()); return `${ikkiR(d.getHours())}:${ikkiR(d.getMinutes())}`; };

const styles = temaStil(() => StyleSheet.create({
  davomatEslatma: { flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.accent + "12", borderWidth: 1, borderColor: C.accent + "2E", borderRadius: R.md, paddingVertical: S[3], paddingHorizontal: S[3], marginBottom: S[4] },
  davomatEslatmaTxt: { flex: 1, fontSize: T.sm, fontWeight: "700", color: C.text, lineHeight: 19 },
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: S[5], paddingBottom: S[8] },
  statsRow:  { flexDirection: "row", gap: S[2], marginBottom: S[3] },
  boshKarta: { marginBottom: S[4], paddingVertical: S[4] },
  boshUst:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: S[2] },
  boshNom:   { fontSize: 10, fontWeight: "800", color: C.muted, letterSpacing: 1 },
  farq:      { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: C.accent, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: 8 },
  farqPast:  { backgroundColor: C.panel },
  farqTxt:   { fontSize: 11, fontWeight: "800", color: C.onAccent },
  boshQiymat:{ fontSize: 36, fontWeight: "800", color: C.accent, letterSpacing: -0.8, marginTop: S[2] },
  boshBirlik:{ fontSize: 18, fontWeight: "700", color: C.sub },
  boshKecha: { fontSize: 12, color: C.muted, fontWeight: "600", marginTop: 2 },
  boshPast:  { flexDirection: "row", alignItems: "center", marginTop: S[3], paddingTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  boshKichik:{ flex: 1, gap: 2 },
  boshKichikNom:{ fontSize: 10, fontWeight: "700", color: C.muted, letterSpacing: 0.5, textTransform: "uppercase" },
  boshKichikQiymat:{ fontSize: 17, fontWeight: "800", color: C.text },
  boshAjrat: { width: StyleSheet.hairlineWidth, alignSelf: "stretch", backgroundColor: C.borderSoft, marginHorizontal: S[3] },
  yakunlaBtn:{ flexDirection: "row", alignItems: "center", gap: S[2], marginTop: S[3], backgroundColor: C.accent, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: S[3] },
  yakunlaTxt:{ flex: 1, fontSize: T.sm, fontWeight: "800", color: C.onAccent },
  statTile:  { flex: 1, paddingVertical: S[3], paddingHorizontal: S[3] },
  statIcon:  { marginBottom: S[1] },
  statLabel: { fontSize: 9, color: C.muted, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: S[2] },
  statValue: { fontWeight: "800", letterSpacing: -0.3 },
  statUnit:  { fontSize: 10, color: C.muted, marginTop: 2 },
  block:     { marginBottom: S[5] },
  cardTitleRow:{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[1] },
  cardTitle: { fontSize: T.md, fontWeight: "700", color: C.text },
  fieldLabel:{ fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 },
  muted:     { fontSize: T.sm, color: C.sub },
  gap10:     { height: S[3] },

  // 4 ta kichik tugma — bitta qatorda
  miniQator: { flexDirection: "row", gap: S[2], marginBottom: S[3] },
  miniTile:  { alignItems: "center", backgroundColor: C.card, borderRadius: R.md, paddingVertical: S[3], paddingHorizontal: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft },
  miniIcon:  { width: 40, height: 40, borderRadius: R.sm, alignItems: "center", justifyContent: "center" },
  miniIconImg:{ width: 22, height: 22 },
  miniSoni:  { position: "absolute", top: -5, right: -7, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: C.accent, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: C.card },
  miniSoniTxt:{ fontSize: 10, fontWeight: "800", color: C.onAccent },
  miniLabel: { fontSize: T.xs, fontWeight: "800", color: C.text, marginTop: S[2] },
  miniQiymat:{ fontSize: 11, fontWeight: "600", color: C.muted, marginTop: 1 },
  navTilePressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  // Kun yakuni — bekor qilish qatori
  yakunQator:{ flexDirection: "row", alignItems: "center", gap: S[3], backgroundColor: C.accent + "0F", paddingVertical: S[3], paddingHorizontal: S[4] },
  yakunMatn: { fontSize: T.sm, fontWeight: "800", color: C.text },
  yakunIzoh: { fontSize: 11, color: C.sub, marginTop: 2 },
  yakunBtn:  { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 7, paddingHorizontal: 11, borderRadius: R.pill, borderWidth: 1, borderColor: C.accent + "66", backgroundColor: C.surface },
  yakunBtnTxt:{ fontSize: T.xs, fontWeight: "800", color: C.accent },
  navIcon:   { width: 40, height: 40, borderRadius: R.md, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  navIconImg:{ width: 24, height: 24, tintColor: C.accent },

  // Vertikal nav tugmalari (Qop hisobi, Xarajatlar)
  xarajatBtn: { flexDirection: "row", alignItems: "center", gap: S[3], backgroundColor: C.card, borderRadius: R.lg, padding: S[4], borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, marginTop: S[1], marginBottom: S[3] },
  xarajatBtnPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  qopBtn:    { marginBottom: S[5] },
  xarajatLabel: { fontSize: T.md, fontWeight: "800", color: C.text, letterSpacing: -0.2 },
  xarajatSub:   { fontSize: 11, color: C.muted, fontWeight: "600", marginTop: 2 },

  // Bugungi ishchilar haqi
  haqRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 11, paddingHorizontal: S[4] },
  haqJami:   { backgroundColor: C.accent + "0D" },
  haqJamiNom:{ flex: 1, fontSize: T.sm, fontWeight: "800", color: C.text, letterSpacing: 0.3 },
  haqJamiVal:{ fontSize: T.md, fontWeight: "800", color: C.accent },
  haqNom:    { flex: 1, fontSize: T.sm, color: C.text },
  haqVal:    { fontSize: T.sm, color: C.accent, fontWeight: "800", marginLeft: S[2] },

  // Tarix sec head
  secHead:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[3], marginTop: S[5] },
  secHeadLeft:{ flexDirection: "row", alignItems: "center", gap: 6 },
  section:   { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1 },
  secSum:    { fontSize: T.sm, fontWeight: "700" },
  bosh:      { fontSize: T.sm, color: C.muted, paddingVertical: S[2] },

  // Tarix item
  item:      { marginBottom: S[3] },
  mHead:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: S[2] },
  flex1:     { flex: 1 },
  itemIsm:   { fontSize: T.md, fontWeight: "700", color: C.text },
  itemSumma: { fontSize: T.md, fontWeight: "800", marginLeft: S[2] },
  histWrap:  {},
  histRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  histNom:   { flex: 1, fontSize: T.sm, color: C.sub },
  histVal:   { fontSize: T.sm, color: C.text, fontWeight: "700", marginLeft: S[2] },
  histSubRow:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4, paddingLeft: S[2] },
  histSubNom:{ flex: 1, fontSize: T.xs, color: C.muted },
  histSubVal:{ fontSize: T.xs, color: C.sub, fontWeight: "700", marginLeft: S[2] },
  histNomB:  { flex: 1, fontSize: T.sm, color: C.text, fontWeight: "800" },
  histValB:  { fontSize: T.md, color: C.accent, fontWeight: "800", marginLeft: S[2] },
  histDiv:   { height: StyleSheet.hairlineWidth, backgroundColor: C.borderSoft, marginVertical: S[2] },
  actions:   { flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:    { flexDirection: "row", alignItems: "center" },
  actTxt:    { fontSize: T.sm, fontWeight: "700" },
}));
