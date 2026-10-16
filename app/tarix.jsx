// Statistika va kunlik hisobotlar tarixi — yuqorida grafik va ko'rsatkichlar,
// pastda har kunlik hisobot (jadval ko'rinishi).
// 30 kun davomida saqlanadi (AppData useEffect avtomatik tozalaydi).
// Har bir hisobot ichida 'Kun oxiri' qatori = Daromad − Ishchi haqi (alohida muhim ko'rsatkich).
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { ExpandableCard, yopKartalar } from "../src/components/ExpandableCard";
import { ScrollBox } from "../src/components/ScrollBox";
import { Statistika } from "../src/components/Statistika";
import { C, T, S, R } from "../src/theme";
import { formatSom } from "../src/logic/hisob";

export default function Tarix() {
  const { nonlar, hisobotlarTarixi, ochirArxivga } = useApp();

  const ochirHisobot = (id) =>
    Alert.alert("O'chirish", "Shu sanadagi hisobotni o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => { yopKartalar(); ochirArxivga("hisobot", id); } },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <Pressable accessibilityLabel="Orqaga" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
          <Text style={styles.backTxt}>Markaz</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <View style={styles.iconBox}><Ionicons name="stats-chart-outline" size={22} color={C.accent} /></View>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>HISOBOTLAR TARIXI</Text>
            <Text style={styles.title}>Statistika</Text>
            <Text style={styles.subtitle}>30 kun davomida saqlanadi · {(hisobotlarTarixi || []).length} ta</Text>
          </View>
        </View>

        {(hisobotlarTarixi || []).length > 0 && <Statistika hisobotlar={hisobotlarTarixi} nonlar={nonlar} />}

        {(hisobotlarTarixi || []).length > 0 && (
          <View style={styles.secHead}>
            <Ionicons name="calendar-outline" size={13} color={C.sub} />
            <Text style={styles.secTitle}>KUNLIK HISOBOTLAR</Text>
          </View>
        )}

        {(hisobotlarTarixi || []).length === 0 ? (
          <Card><Text style={styles.bosh}>Hali hisobot yo'q. Kunlik qop hisobi sahifasidagi "Kunni yakunlash"ni bossangiz, hisobot shu yerda paydo bo'ladi.</Text></Card>
        ) : (
          [...hisobotlarTarixi].slice(0, 30).map((h) => {
            const daromad = parseFloat(h.daromad) || 0;
            const ishchiHaq = parseFloat(h.ishchiHaq) || 0;
            const kunOxiri = daromad - ishchiHaq;
            return (
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
                  <View style={styles.histRow}><Text style={styles.histNom}>Daromad</Text><Text style={styles.histVal}>{formatSom(daromad)} so'm</Text></View>
                  <View style={styles.histRow}><Text style={styles.histNom}>Ishchi haqi</Text><Text style={styles.histVal}>{formatSom(ishchiHaq)} so'm</Text></View>
                  {(h.ishchiHaqlari || []).map((w) => (
                    <View key={w.id} style={styles.histSubRow}>
                      <Text style={styles.histSubNom} numberOfLines={1}>· {w.ism}{w.brak > 0 ? ` (brak −${formatSom(w.brak)})` : ""}</Text>
                      <Text style={styles.histSubVal}>{formatSom(w.net)} so'm</Text>
                    </View>
                  ))}
                  <View style={styles.histRow}><Text style={styles.histNom}>Ishlab / sotilgan</Text><Text style={styles.histVal}>{h.jamiNon || 0} / {h.sotilganNon || 0} dona</Text></View>

                  {/* KUN OXIRI — alohida ajratilgan muhim qator (Daromad − Ishchi haqi) */}
                  <View style={styles.kunOxiriBox}>
                    <View style={styles.histRow}>
                      <Text style={styles.kunOxiriLbl}>Kun oxiri</Text>
                      <Text style={[styles.kunOxiriVal, { color: kunOxiri >= 0 ? C.accent : C.red }]}>{formatSom(kunOxiri)} so'm</Text>
                    </View>
                    <Text style={styles.kunOxiriHint}>Kunlik aylanma − ishchilar haqi (qo'shimcha xarajatdan oldin)</Text>
                  </View>

                  <View style={styles.histRow}><Text style={styles.histNomB}>Sof foyda</Text><Text style={styles.histValB}>{formatSom(h.sofFoyda)} so'm</Text></View>
                </View>
                <View style={styles.actions}>
                  <Pressable accessibilityLabel="O'chirish" onPress={() => ochirHisobot(h.id)} hitSlop={6} style={styles.actBtn}>
                    <Ionicons name="trash-outline" size={16} color={C.red} />
                    <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                  </Pressable>
                </View>
              </ExpandableCard>
            );
          })
        )}
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  backBtn:  { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: S[3] },
  backTxt:  { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: S[3], marginBottom: S[5] },
  iconBox:  { width: 44, height: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  flex1:    { flex: 1 },
  eyebrow:  { fontSize: 11, color: C.muted, fontWeight: "700", letterSpacing: 1.8 },
  title:    { fontSize: T.xl, color: C.text, fontWeight: "800", letterSpacing: -0.6, marginTop: 2 },
  subtitle: { fontSize: T.sm, color: C.sub, fontWeight: "500", marginTop: 3 },
  bosh:     { fontSize: T.sm, color: C.muted },
  secHead:  { flexDirection: "row", alignItems: "center", gap: 6, marginTop: S[2], marginBottom: S[3] },
  secTitle: { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1 },

  item:     { marginBottom: S[3] },
  mHead:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: S[2] },
  itemIsm:  { fontSize: T.md, fontWeight: "700", color: C.text },
  itemSumma:{ fontSize: T.md, fontWeight: "800", marginLeft: S[2] },

  histWrap: { paddingTop: S[1] },
  histRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  histNom:  { fontSize: T.sm, color: C.sub, flex: 1 },
  histVal:  { fontSize: T.sm, color: C.text, fontWeight: "700", marginLeft: S[2] },
  histNomB: { fontSize: T.md, color: C.text, fontWeight: "800", flex: 1 },
  histValB: { fontSize: T.md, color: C.green, fontWeight: "800", marginLeft: S[2] },
  histSubRow:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3, paddingLeft: S[3] },
  histSubNom:{ fontSize: T.xs, color: C.muted, flex: 1 },
  histSubVal:{ fontSize: T.xs, color: C.sub, fontWeight: "600", marginLeft: S[2] },
  histDiv:  { height: 1, backgroundColor: C.borderSoft, marginVertical: S[2] },

  // Kun oxiri — alohida ajralib turuvchi box
  kunOxiriBox: { marginTop: S[3], marginBottom: S[2], backgroundColor: C.accent + "0D", borderWidth: 1, borderColor: C.accent + "2E", borderRadius: R.md, paddingVertical: S[2], paddingHorizontal: S[3] },
  kunOxiriLbl: { fontSize: T.sm, color: C.text, fontWeight: "800", flex: 1 },
  kunOxiriVal: { fontSize: T.md, fontWeight: "800", marginLeft: S[2] },
  kunOxiriHint:{ fontSize: 10, color: C.muted, marginTop: 2, fontStyle: "italic" },

  actions:  { flexDirection: "row", justifyContent: "flex-end", marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:   { flexDirection: "row", alignItems: "center" },
  actTxt:   { fontSize: T.sm, fontWeight: "700" },
});
