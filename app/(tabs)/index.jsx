// "Markaz" ekrani — kunlik ko'rsatkichlar + 2x2 navigatsiya grid (Qarz/Optom/Karta/Brak).
import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { BrandHeader } from "../../src/components/BrandHeader";
import { ExpandableCard } from "../../src/components/ExpandableCard";
import { KunlikQopModal } from "../../src/components/KunlikQopModal";
import { HisobotModal } from "../../src/components/HisobotModal";
import { DateField } from "../../src/components/DateField";
import { ScrollBox } from "../../src/components/ScrollBox";
import { C, T, S, R } from "../../src/theme";
import { hisoblaKunlik, formatSom, qarzJami, optomJami, kartaJami, ishchiHaqlari, kunlikXomashyoSarfi } from "../../src/logic/hisob";

const localSana = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function Markaz() {
  const {
    nonlar, ishchilar, qarzlar, optomlar, kartalar, setKartalar,
    ozIshlabQoplar, setOzIshlabQoplar, tashqariSonlar, setTashqariSonlar,
    sotilmaganNon, setSotilmaganNon, mahsulotNarxlari, setOmborSorovlar,
    hisobotlarTarixi, setHisobotlarTarixi, braklar, setBraklar,
    boshlangichQoldiq, setBoshlangichQoldiq, qoldaYaroqsiz, setQoldaYaroqsiz,
  } = useApp();

  const [qopOchiq, setQopOchiq] = useState(false);
  const [hisobotOchiq, setHisobotOchiq] = useState(false);
  const [kunlikSana, setKunlikSana] = useState(localSana());

  const stats = useMemo(
    () => hisoblaKunlik({ nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar, boshlangichQoldiq, qoldaYaroqsiz }),
    [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar, boshlangichQoldiq, qoldaYaroqsiz]
  );
  const bugungiHaq = useMemo(
    () => ishchiHaqlari(nonlar, ishchilar, ozIshlabQoplar, braklar),
    [nonlar, ishchilar, ozIshlabQoplar, braklar]
  );

  const qarz = useMemo(() => qarzJami(qarzlar), [qarzlar]);
  const optom = useMemo(() => optomJami(optomlar), [optomlar]);
  const karta = useMemo(() => kartaJami(kartalar), [kartalar]);
  const brakSumma = useMemo(() => (braklar || []).reduce((s, b) => s + (parseFloat(b.summa) || 0), 0), [braklar]);

  // Kunni yakunlash → tarix snapshot + ombor so'rovnomasi + hisobot modal.
  const kunniYakunla = () => {
    if (!(stats.jamiNon > 0 || stats.jamiQop > 0)) {
      Alert.alert("Ma'lumot yo'q", "Avval kunlik qop hisobiga ma'lumot kiriting.");
      return;
    }
    Alert.alert("Kunni yakunlash", "Bugungi ma'lumot tarixga saqlanadi va ko'rsatkichlar nollanadi. Davom etasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Yakunlash", onPress: yakunlaBajar },
    ]);
  };
  const yakunlaBajar = () => {
    const sana = kunlikSana || localSana();
    const snap = {
      id: Date.now(), sana, vaqt: Date.now(),
      boshlangichQoldiq, ozIshlabQoplar, tashqariSonlar, qoldaYaroqsiz, sotilmaganNon,
      nonlarSnapshot: JSON.parse(JSON.stringify(nonlar)),
      ishchilarSnapshot: JSON.parse(JSON.stringify(ishchilar)),
      mahsulotNarxlariSnapshot: JSON.parse(JSON.stringify(mahsulotNarxlari)),
      daromad: stats.daromad, xomashyo: stats.xomashyo, ishchiHaq: stats.ishchiHaq,
      sofFoyda: stats.sofFoyda, sotilganNon: stats.sotilganNon, jamiQop: stats.jamiQop, jamiNon: stats.jamiNon,
      jamiBoshlang: stats.jamiBoshlang, jamiQoldiq: stats.jamiQoldiq, jamiYaroqsiz: stats.jamiYaroqsiz,
      ishchiHaqlari: bugungiHaq.list,
    };
    setHisobotlarTarixi((prev) => [snap, ...(prev || []).filter((h) => h.sana !== sana)]);
    const sarf = kunlikXomashyoSarfi(nonlar, ozIshlabQoplar);
    if (sarf.length > 0) {
      setOmborSorovlar((prev) => [{ id: Date.now() + 1, sana, vaqt: Date.now(), manba: "Kunlik qop hisobi", maydonlar: sarf }, ...(prev || []).filter((s) => s.sana !== sana)]);
    }
    setHisobotOchiq(true);
  };
  const hisobotYop = () => {
    setHisobotOchiq(false);
    // Kun oxiri qoldiq → ertangi tonggi zaxiraga ko'chadi.
    setBoshlangichQoldiq(sotilmaganNon || {});
    setSotilmaganNon({});
    setOzIshlabQoplar({}); setTashqariSonlar({}); setQoldaYaroqsiz({});
    setKartalar([]); setBraklar([]);
    setKunlikSana(localSana());
  };
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

        <Card accent style={styles.block}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="calculator-outline" size={18} color={C.sub} />
            <Text style={styles.cardTitle}>Kunlik qop hisobi</Text>
          </View>
          <Text style={styles.muted}>
            {stats.jamiBoshlang > 0 ? `${stats.jamiBoshlang} dona tonggi qoldiq · ` : ""}
            {stats.jamiNon} dona ishlab chiqarildi
          </Text>
          <View style={styles.gap10} />
          <Text style={styles.fieldLabel}>Hisobot sanasi</Text>
          <DateField value={kunlikSana} onChange={setKunlikSana} />
          <View style={styles.gap10} />
          <Btn onPress={() => setQopOchiq(true)} icon="create-outline">Ma'lumot kiritish</Btn>
          <View style={styles.gap10} />
          <Btn secondary onPress={kunniYakunla} icon="checkmark-done-outline">Kunni yakunlash</Btn>
        </Card>

        {/* 2×2 navigatsiya grid — har kvadrat o'z sub-ekraniga olib o'tadi */}
        <View style={styles.gridRow}>
          <NavTile
            icon="receipt-outline" tint={C.red}
            label="Qarzlar"
            sub={`${formatSom(qarz.summa)} so'm • ${qarz.soni} ta`}
            onPress={() => router.push("/qarzlar")}
          />
          <NavTile
            icon="storefront-outline" tint={C.accent}
            label="Optom"
            sub={`${formatSom(optom.summa)} so'm • ${optom.soni} ta`}
            onPress={() => router.push("/optom")}
          />
        </View>
        <View style={styles.gridRow}>
          <NavTile
            icon="card-outline" tint={C.green}
            label="Karta"
            sub={`${formatSom(karta.summa)} so'm • ${karta.soni} ta`}
            onPress={() => router.push("/karta")}
          />
          <NavTile
            icon="alert-circle-outline" tint={C.red}
            label="Brak"
            sub={`${formatSom(brakSumma)} so'm • ${(braklar || []).length} ta`}
            onPress={() => router.push("/brak")}
          />
        </View>

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

      <KunlikQopModal visible={qopOchiq} onClose={() => setQopOchiq(false)} />
      <HisobotModal visible={hisobotOchiq} onClose={hisobotYop} />
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

function NavTile({ icon, tint, label, sub, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: tint + "1A", borderless: false }}
      style={({ pressed }) => [styles.navTile, pressed && styles.navTilePressed]}
    >
      <View style={[styles.navIcon, { backgroundColor: tint + "14" }]}>
        <Ionicons name={icon} size={22} color={tint} />
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
  gridRow:   { flexDirection: "row", gap: S[3], marginBottom: S[3] },
  navTile:   { flex: 1, aspectRatio: 1, backgroundColor: C.card, borderRadius: R.lg, padding: S[4], justifyContent: "space-between", borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft },
  navTilePressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  navIcon:   { width: 40, height: 40, borderRadius: R.md, alignItems: "center", justifyContent: "center" },
  navLabel:  { fontSize: T.md, fontWeight: "800", color: C.text, letterSpacing: -0.2, marginTop: S[2] },
  navSub:    { fontSize: 11, color: C.muted, fontWeight: "600", marginTop: 2 },

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
