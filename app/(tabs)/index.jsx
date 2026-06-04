// "Markaz" ekrani — kunlik ko'rsatkichlar + navigatsiya tugmalari (qop hisobi,
// 2x2 grid: Qarz/Optom/Karta/Brak, qo'shimcha xarajatlar) + hisobotlar tarixi.
import { useMemo } from "react";
import { View, Text, Pressable, Image, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { BrandHeader } from "../../src/components/BrandHeader";
import { ScrollBox } from "../../src/components/ScrollBox";
import { C, T, S, R } from "../../src/theme";
import { hisoblaKunlik, formatSom, qarzJami, optomJami, kartaJami, ishchiHaqlari } from "../../src/logic/hisob";
// Maxsus rasm ikonkalari (Ionicons o'rniga — premium ko'rinish)
const ICONS = {
  qop:     require("../../assets/icons/qop.png"),
  qarz:    require("../../assets/icons/qarz.png"),
  optom:   require("../../assets/icons/optom.png"),
  karta:   require("../../assets/icons/karta.png"),
  brak:    require("../../assets/icons/brak.png"),
  xarajat: require("../../assets/icons/xarajat.png"),
};

const localSana = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function Markaz() {
  const {
    nonlar, ishchilar, qarzlar, optomlar, kartalar,
    ozIshlabQoplar, tashqariSonlar, sotilmaganNon, mahsulotNarxlari,
    hisobotlarTarixi, braklar,
    boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar, oxirgiYakunlashVaqti,
    lockedDayStats,
  } = useApp();

  const bugunSanasi = localSana();

  // ── MUHRLANGAN KUN (Lock) ──
  // "Kunni tugatish" bosilgan bo'lsa va o'sha kun hali tugamagan bo'lsa (23:59 dan oldin)
  // — Markaz ko'rsatkichlarini yakunlash paytidagi muhrlangan snapshotdan o'qiymiz.
  // Aks holda jonli (live) hisob-kitob bo'ladi. Sana o'zgarishi bilan (ertaga) lock o'z-o'zidan
  // tarqaladi va ko'rsatkichlar yangi kun uchun jonli yangilanadi.
  const locked = useMemo(() => {
    if (!lockedDayStats) return null;
    if (lockedDayStats.sana !== bugunSanasi) return null;
    if (lockedDayStats.lockedUntil && Date.now() > lockedDayStats.lockedUntil) return null;
    return lockedDayStats.snapshot || null;
  }, [lockedDayStats, bugunSanasi]);

  // Bugungi yozuvlar — sana + oxirgiYakunlashVaqti filtri bilan (lock paytida
  // Markaz baribir locked.snapshot'dan o'qiydi, lekin bu filterlar tahlil va
  // ishchi haqi uchun ham ishlatiladi).
  const yangiYozuv = (e) => (e.vaqt || 0) > (oxirgiYakunlashVaqti || 0);
  const bugSanasi = (e) => e.sana === bugunSanasi;
  const bugungiKarta = useMemo(() => (kartalar || []).filter((e) => bugSanasi(e) && yangiYozuv(e)), [kartalar, oxirgiYakunlashVaqti, bugunSanasi]);
  const bugungiBrak  = useMemo(() => (braklar  || []).filter((e) => bugSanasi(e) && yangiYozuv(e)), [braklar,  oxirgiYakunlashVaqti, bugunSanasi]);
  const bugungiOptom = useMemo(() => (optomlar || []).filter((e) => bugSanasi(e) && yangiYozuv(e)), [optomlar, oxirgiYakunlashVaqti, bugunSanasi]);

  const liveStats = useMemo(
    () => hisoblaKunlik({ nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar, boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar, oxirgiYakunlashVaqti }),
    [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar, boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar, oxirgiYakunlashVaqti]
  );
  // Lock bo'lsa — snapshot, aks holda jonli hisob:
  const stats = locked ? { ...liveStats, ...locked } : liveStats;

  const bugungiHaq = useMemo(
    () => ishchiHaqlari(nonlar, ishchilar, ozIshlabQoplar, bugungiBrak),
    [nonlar, ishchilar, ozIshlabQoplar, bugungiBrak]
  );

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
  const brakSumma = useMemo(() => {
    if (locked) return locked.brakSum;
    return bugungiBrak.reduce((s, b) => s + (parseFloat(b.summa) || 0), 0);
  }, [locked, bugungiBrak]);
  const brakSoni = useMemo(() => locked ? locked.brakSoni : bugungiBrak.length, [locked, bugungiBrak]);
  const xarajatBugun = useMemo(() => {
    if (locked) return locked.xarajatSum;
    return (kunlikXarajatlar || []).filter((x) => x.sana === bugunSanasi && yangiYozuv(x)).reduce((s, x) => s + (parseFloat(x.summa) || 0), 0);
  }, [locked, kunlikXarajatlar, oxirgiYakunlashVaqti, bugunSanasi]);
  const xarajatSoni = useMemo(() => {
    if (locked) return locked.xarajatSoni;
    return (kunlikXarajatlar || []).filter((x) => x.sana === bugunSanasi && yangiYozuv(x)).length;
  }, [locked, kunlikXarajatlar, oxirgiYakunlashVaqti, bugunSanasi]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <BrandHeader />

        <View style={styles.statsRow}>
          <StatTile label="Bugungi sof foyda" unit="so'm" value={formatSom(stats.sofFoyda)} color={stats.sofFoyda >= 0 ? C.green : C.red} icon="trending-up-outline" />
          <StatTile label="Sotilgan non" unit="dona" value={String(stats.sotilganNon)} color={C.text} icon="cube-outline" />
          <StatTile label="Kunlik qop" unit="qop" value={String(stats.jamiQop)} color={C.accent} icon="layers-outline" />
        </View>

        {/* Kunlik qop hisobi — alohida sahifaga olib boradi (to'liq tafsilot bilan) */}
        <Pressable
          accessibilityLabel="Kunlik qop hisobi"
          accessibilityRole="button"
          onPress={() => router.push("/qop")}
          android_ripple={{ color: C.accent + "1A" }}
          style={({ pressed }) => [styles.xarajatBtn, styles.qopBtn, pressed && styles.xarajatBtnPressed]}
        >
          <View style={[styles.navIcon, { backgroundColor: C.accent + "14" }]}>
            <Image source={ICONS.qop} style={styles.navIconImg} resizeMode="contain" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.xarajatLabel}>Kunlik qop hisobi</Text>
            <Text style={styles.xarajatSub}>
              {stats.jamiBoshlang > 0 ? `${stats.jamiBoshlang} tonggi · ` : ""}
              {stats.jamiQop} qop · {stats.jamiNon} dona ishlab
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </Pressable>

        {/* 2×2 navigatsiya grid — har kvadrat o'z sub-ekraniga olib o'tadi */}
        <View style={styles.gridRow}>
          <NavTile image={ICONS.qarz} tint={C.red}
            label="Qarzlar"
            sub={`${formatSom(qarz.summa)} so'm • ${qarz.soni} ta`}
            onPress={() => router.push("/qarzlar")}
          />
          <NavTile image={ICONS.optom} tint={C.accent}
            label="Optom"
            sub={`${formatSom(optom.summa)} so'm • ${optom.soni} ta`}
            onPress={() => router.push("/optom")}
          />
        </View>
        <View style={styles.gridRow}>
          <NavTile image={ICONS.karta} tint={C.green}
            label="Karta"
            sub={`${formatSom(karta.summa)} so'm • ${karta.soni} ta`}
            onPress={() => router.push("/karta")}
          />
          <NavTile image={ICONS.brak} tint={C.red}
            label="Brak"
            sub={`${formatSom(brakSumma)} so'm • ${brakSoni} ta`}
            onPress={() => router.push("/brak")}
          />
        </View>

        {/* Kunlik qo'shimcha xarajatlar — vertikal nav tugma */}
        <Pressable
          accessibilityLabel="Kunlik qo'shimcha xarajatlar"
          accessibilityRole="button"
          onPress={() => router.push("/xarajat")}
          android_ripple={{ color: C.accent + "1A" }}
          style={({ pressed }) => [styles.xarajatBtn, pressed && styles.xarajatBtnPressed]}
        >
          <View style={[styles.navIcon, { backgroundColor: C.accent + "14" }]}>
            <Image source={ICONS.xarajat} style={styles.navIconImg} resizeMode="contain" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.xarajatLabel}>Kunlik qo'shimcha xarajatlar</Text>
            <Text style={styles.xarajatSub}>Bugun: {formatSom(xarajatBugun)} so'm • {xarajatSoni} ta</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </Pressable>

        {/* BUGUNGI ISHCHILAR HAQI (jonli) */}
        {bugungiHaq.list.length > 0 && (
          <Card style={styles.block}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="people-outline" size={18} color={C.sub} />
              <Text style={styles.cardTitle}>Bugungi ishchilar haqi</Text>
            </View>
            <View style={styles.gap10} />
            {bugungiHaq.list.map((w) => (
              <View key={w.id} style={styles.haqRow}>
                <Text style={styles.haqNom} numberOfLines={1}>{w.ism}{w.brak > 0 ? ` (brak −${formatSom(w.brak)})` : ""}</Text>
                <Text style={styles.haqVal}>{formatSom(w.net)} so'm</Text>
              </View>
            ))}
          </Card>
        )}

        {/* HISOBOTLAR TARIXI — alohida sahifaga olib boradi (Markaz toza turishi uchun) */}
        <Pressable
          accessibilityLabel="Hisobotlar tarixi"
          accessibilityRole="button"
          onPress={() => router.push("/tarix")}
          android_ripple={{ color: C.accent + "1A" }}
          style={({ pressed }) => [styles.xarajatBtn, pressed && styles.xarajatBtnPressed]}
        >
          <View style={[styles.navIcon, { backgroundColor: C.accent + "14" }]}>
            <Ionicons name="calendar-outline" size={22} color={C.accent} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.xarajatLabel}>Hisobotlar tarixi</Text>
            <Text style={styles.xarajatSub}>{(hisobotlarTarixi || []).length} ta hisobot · 30 kun</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </Pressable>
      </ScrollBox>

    </SafeAreaView>
  );
}

function StatTile({ label, value, unit, color, icon }) {
  const len = String(value || "").length;
  const valSize = len > 9 ? 14 : len > 7 ? 16 : len > 5 ? 18 : 20;
  return (
    <Card style={styles.statTile}>
      <Ionicons name={icon} size={16} color={C.sub} style={styles.statIcon} />
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={[styles.statValue, { color, fontSize: valSize }]} numberOfLines={1}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </Card>
  );
}

function NavTile({ icon, image, tint, label, sub, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      android_ripple={{ color: tint + "1A", borderless: false }}
      style={({ pressed }) => [styles.navTile, pressed && styles.navTilePressed]}
    >
      <View style={[styles.navIcon, { backgroundColor: tint + "14" }]}>
        {image
          ? <Image source={image} style={[styles.navIconImg, { tintColor: tint }]} resizeMode="contain" />
          : <Ionicons name={icon} size={22} color={tint} />}
      </View>
      <Text style={styles.navLabel}>{label}</Text>
      <Text style={styles.navSub} numberOfLines={1}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: S[5], paddingBottom: S[8] },
  statsRow:  { flexDirection: "row", gap: S[2], marginBottom: S[5] },
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

  // 2x2 grid
  gridRow:   { width: "100%", flexDirection: "row", justifyContent: "space-between", marginBottom: S[3] },
  navTile:   { width: "48%", aspectRatio: 1, backgroundColor: C.card, borderRadius: R.lg, padding: S[4], justifyContent: "space-between", borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft },
  navTilePressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  navIcon:   { width: 40, height: 40, borderRadius: R.md, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  navIconImg:{ width: 24, height: 24, tintColor: C.accent },
  navLabel:  { fontSize: T.md, fontWeight: "800", color: C.text, letterSpacing: -0.2, marginTop: S[2] },
  navSub:    { fontSize: 11, color: C.muted, fontWeight: "600", marginTop: 2 },

  // Vertikal nav tugmalari (Qop hisobi, Xarajatlar)
  xarajatBtn: { flexDirection: "row", alignItems: "center", gap: S[3], backgroundColor: C.card, borderRadius: R.lg, padding: S[4], borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, marginTop: S[1], marginBottom: S[3] },
  xarajatBtnPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  qopBtn:    { marginBottom: S[5] },
  xarajatLabel: { fontSize: T.md, fontWeight: "800", color: C.text, letterSpacing: -0.2 },
  xarajatSub:   { fontSize: 11, color: C.muted, fontWeight: "600", marginTop: 2 },

  // Bugungi ishchilar haqi
  haqRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[2] },
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
});
