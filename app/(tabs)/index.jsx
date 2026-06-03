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
import { ExpandableCard } from "../../src/components/ExpandableCard";
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
    hisobotlarTarixi, setHisobotlarTarixi, braklar,
    boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar, oxirgiYakunlashVaqti,
  } = useApp();

  // "Bugungi" = oxirgi yakunlashdan keyin kiritilgan yozuvlar.
  // Yakunlash bo'lganidan oldingi karta/brak/xarajat — Markaz hisobida ko'rinmaydi
  // (avtomatik tarixga aylanadi, tarix ekranlarida 7 kun ko'rinib turadi).
  const yangiYozuv = (e) => (e.vaqt || 0) > (oxirgiYakunlashVaqti || 0);
  const bugungiKarta = useMemo(() => (kartalar || []).filter(yangiYozuv), [kartalar, oxirgiYakunlashVaqti]);
  const bugungiBrak  = useMemo(() => (braklar  || []).filter(yangiYozuv), [braklar,  oxirgiYakunlashVaqti]);
  const bugungiOptom = useMemo(() => (optomlar || []).filter(yangiYozuv), [optomlar, oxirgiYakunlashVaqti]);
  const bugungiQarz  = useMemo(() => (qarzlar  || []).filter(yangiYozuv), [qarzlar,  oxirgiYakunlashVaqti]);

  const stats = useMemo(
    () => hisoblaKunlik({ nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar, boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar, oxirgiYakunlashVaqti }),
    [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar, boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar, oxirgiYakunlashVaqti]
  );
  const bugungiHaq = useMemo(
    () => ishchiHaqlari(nonlar, ishchilar, ozIshlabQoplar, bugungiBrak),
    [nonlar, ishchilar, ozIshlabQoplar, bugungiBrak]
  );

  const qarz = useMemo(() => qarzJami(qarzlar), [qarzlar]);
  const optom = useMemo(() => optomJami(optomlar), [optomlar]);
  const karta = useMemo(() => kartaJami(bugungiKarta), [bugungiKarta]);
  const brakSumma = useMemo(() => bugungiBrak.reduce((s, b) => s + (parseFloat(b.summa) || 0), 0), [bugungiBrak]);
  const xarajatBugun = useMemo(() => {
    const bugun = localSana();
    return (kunlikXarajatlar || []).filter((x) => x.sana === bugun && yangiYozuv(x)).reduce((s, x) => s + (parseFloat(x.summa) || 0), 0);
  }, [kunlikXarajatlar, oxirgiYakunlashVaqti]);
  const xarajatSoni = useMemo(() => {
    const bugun = localSana();
    return (kunlikXarajatlar || []).filter((x) => x.sana === bugun && yangiYozuv(x)).length;
  }, [kunlikXarajatlar, oxirgiYakunlashVaqti]);

  const ochirHisobot = (id) => Alert.alert("O'chirish", "Shu sanadagi hisobotni o'chirasizmi?", [
    { text: "Bekor", style: "cancel" },
    { text: "Ha", style: "destructive", onPress: () => setHisobotlarTarixi((p) => p.filter((h) => h.id !== id)) },
  ]);

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
            sub={`${formatSom(brakSumma)} so'm • ${(braklar || []).length} ta`}
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

        {/* KUNLIK HISOBOTLAR TARIXI (30 kun) */}
        <View style={styles.secHead}>
          <View style={styles.secHeadLeft}>
            <Ionicons name="calendar-outline" size={13} color={C.sub} />
            <Text style={styles.section}>KUNLIK HISOBOTLAR (30 kun)</Text>
          </View>
          <Text style={[styles.secSum, { color: C.accent }]}>{(hisobotlarTarixi || []).length} ta</Text>
        </View>
        {(hisobotlarTarixi || []).length === 0 ? (
          <Text style={styles.bosh}>Hali hisobot yo'q</Text>
        ) : (
          [...hisobotlarTarixi].slice(0, 30).map((h) => (
            <ExpandableCard
              key={h.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <Text style={[styles.itemIsm, styles.flex1]} numberOfLines={1}>{h.sana}</Text>
                  <Text style={[styles.itemSumma, { color: (h.sofFoyda || 0) >= 0 ? C.green : C.red }]} numberOfLines={1}>{formatSom(h.sofFoyda)} so'm</Text>
                </View>
              }
            >
              <View style={styles.histWrap}>
                {(h.nonlarSnapshot || nonlar).map((n) => {
                  const oz = n.ozIshlab !== false;
                  const q = oz ? (parseInt((h.ozIshlabQoplar || {})[n.id]) || 0) : (parseInt((h.tashqariSonlar || {})[n.id]) || 0);
                  if (q <= 0) return null;
                  return (
                    <View key={n.id} style={styles.histRow}>
                      <Text style={styles.histNom} numberOfLines={1}>{n.nom}</Text>
                      <Text style={styles.histVal}>{q} {oz ? "qop" : "dona"}</Text>
                    </View>
                  );
                })}
                <View style={styles.histDiv} />
                <View style={styles.histRow}><Text style={styles.histNom}>Daromad</Text><Text style={styles.histVal}>{formatSom(h.daromad)} so'm</Text></View>
                <View style={styles.histRow}><Text style={styles.histNom}>Xomashyo</Text><Text style={styles.histVal}>{formatSom(h.xomashyo)} so'm</Text></View>
                <View style={styles.histRow}><Text style={styles.histNom}>Ishchi haqi</Text><Text style={styles.histVal}>{formatSom(h.ishchiHaq)} so'm</Text></View>
                {(h.ishchiHaqlari || []).map((w) => (
                  <View key={w.id} style={styles.histSubRow}>
                    <Text style={styles.histSubNom} numberOfLines={1}>· {w.ism}{w.brak > 0 ? ` (brak −${formatSom(w.brak)})` : ""}</Text>
                    <Text style={styles.histSubVal}>{formatSom(w.net)} so'm</Text>
                  </View>
                ))}
                <View style={styles.histRow}><Text style={styles.histNom}>Ishlab / sotilgan</Text><Text style={styles.histVal}>{h.jamiNon || 0} / {h.sotilganNon || 0} dona</Text></View>
                <View style={styles.histRow}><Text style={styles.histNomB}>Sof foyda</Text><Text style={styles.histValB}>{formatSom(h.sofFoyda)} so'm</Text></View>
              </View>
              <View style={styles.actions}>
                <Pressable accessibilityLabel="O'chirish" onPress={() => ochirHisobot(h.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                  <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                </Pressable>
              </View>
            </ExpandableCard>
          ))
        )}
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
