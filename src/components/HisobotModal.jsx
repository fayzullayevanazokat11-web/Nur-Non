// Kunlik yakuniy hisobot — Tasdiqlashdan keyin chiqadi.
// RN Modal o'rniga to'liq ekran View qatlami (absoluteFillObject + zIndex).
import { useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import { Btn } from "./Btn";
import { C, T, S, R } from "../theme";
import { hisoblaKunlik, qoldiqlarHisobi, formatSom, ishchiHaqlari } from "../logic/hisob";

export function HisobotModal({ visible, onClose }) {
  const {
    nonlar, ishchilar, mahsulotNarxlari, braklar,
    ozIshlabQoplar, tashqariSonlar, sotilmaganNon,
    boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar,
    qarzlar, optomlar, kartalar,
  } = useApp();

  const data = useMemo(() => {
    const d = new Date();
    const bugun = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const kunlik = hisoblaKunlik({
      nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar,
      boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar,
    });
    const xarajatBugun = (kunlikXarajatlar || []).filter((x) => x.sana === bugun);
    const xarajatSum = xarajatBugun.reduce((s, x) => s + (parseFloat(x.summa) || 0), 0);
    const qoldiqlar = qoldiqlarHisobi(nonlar, {
      boshlangichQoldiq, ozIshlabQoplar, tashqariSonlar, qoldaYaroqsiz, sotilmaganNon, optomlar, qarzlar,
    }).filter((q) => q.jamiZaxira > 0 || q.qoldiq > 0 || q.yaroqsiz > 0);
    const sum = (arr, key) => (arr || []).reduce((s, x) => s + (parseFloat(x[key]) || 0), 0);
    const optomB = (optomlar || []).filter((o) => o.sana === bugun);
    const qarzB = (qarzlar || []).filter((q) => q.sana === bugun);
    const kartaB = (kartalar || []).filter((k) => k.sana === bugun);
    const optomSum = sum(optomB, "summa");
    const optomFoyda = sum(optomB, "sofFoyda");
    const qarzSum = sum(qarzB, "summa");
    const kartaSum = sum(kartaB, "summa");
    const kartaFoyda = sum(kartaB, "sofFoyda");
    const kartaDona = sum(kartaB, "dona");
    // Umumiy foyda = ishlab chiqarish + karta sof foydasi + optom SOF FOYDASI (chegirma ayrilgan)
    const umumiy = kunlik.sofFoyda + kartaFoyda + optomFoyda;
    const haq = ishchiHaqlari(nonlar, ishchilar, ozIshlabQoplar, braklar);
    return { bugun, kunlik, qoldiqlar, xarajatBugun, xarajatSum, optomSum, optomFoyda, optomSoni: optomB.length, qarzSum, qarzSoni: qarzB.length, kartaSum, kartaFoyda, kartaDona, kartaSoni: kartaB.length, umumiy, haqList: haq.list };
  }, [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, qarzlar, optomlar, kartalar, mahsulotNarxlari, braklar, boshlangichQoldiq, qoldaYaroqsiz, kunlikXarajatlar]);

  if (!visible) return null;
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.headerRow}>
          <View style={styles.head}>
            <Ionicons name="document-text-outline" size={22} color={C.sub} />
            <View style={styles.flex1}>
              <Text style={styles.title}>Kunlik hisobot</Text>
              <Text style={styles.sana}>{data.bugun}</Text>
            </View>
          </View>
          <Pressable accessibilityLabel="Yopish" onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={C.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Ishlab chiqarish (qop) */}
        <View style={[styles.block, { backgroundColor: C.accent + "0D", borderColor: C.accent + "2E" }]}>
          <Text style={styles.blockHead}>Ishlab chiqarish (kunlik qop)</Text>
          <Row label="Tonggi qoldiq" value={`${data.kunlik.jamiBoshlang} dona`} />
          <Row label="Bugungi ishlab" value={`${data.kunlik.jamiNon} dona`} />
          <Row label="Sotilgan" value={`${data.kunlik.sotilganNon} dona`} />
          <Row label="Yaroqsiz" value={`${data.kunlik.jamiYaroqsiz} dona`} color={data.kunlik.jamiYaroqsiz > 0 ? C.red : C.text} />
          <Row label="Ertangi qoldiq" value={`${data.kunlik.jamiQoldiq} dona`} color={C.accent} bold />
          <Row label="Daromad" value={`${formatSom(data.kunlik.daromad)} so'm`} />
          <Row label="Ishchi haqi" value={`− ${formatSom(data.kunlik.ishchiHaq)} so'm`} color={C.red} />
          {/* KUN OXIRI — kunlik aylanma − ishchi haqi (sof foydadan ham muhim ko'rsatkich) */}
          <View style={styles.kunOxiriBox}>
            <View style={styles.kunOxiriRow}>
              <Text style={styles.kunOxiriLbl}>Kun oxiri</Text>
              <Text style={[styles.kunOxiriVal, { color: (data.kunlik.daromad - data.kunlik.ishchiHaq) >= 0 ? C.accent : C.red }]}>
                {formatSom((data.kunlik.daromad || 0) - (data.kunlik.ishchiHaq || 0))} so'm
              </Text>
            </View>
            <Text style={styles.kunOxiriHint}>Kunlik aylanma − ishchilar haqi</Text>
          </View>
          <Row label="Sof foyda" value={`${formatSom(data.kunlik.sofFoyda)} so'm`} color={data.kunlik.sofFoyda >= 0 ? C.green : C.red} bold />
        </View>

        {/* Partiyaviy zaxira tafsiloti */}
        {data.qoldiqlar.length > 0 && (
          <View style={[styles.block, { backgroundColor: C.surface }]}>
            <Text style={styles.blockHead}>Zaxira tafsiloti (FIFO)</Text>
            {data.qoldiqlar.map((q) => (
              <View key={q.id} style={styles.qoldiqRow}>
                <Text style={styles.qoldiqNom} numberOfLines={1}>{q.nom}</Text>
                <Text style={styles.qoldiqDet}>
                  {q.boshlang}+{q.ishlab} − {q.jamiSotilgan}{q.yaroqsiz > 0 ? ` − ${q.yaroqsiz} yar.` : ""} = <Text style={{ color: C.accent, fontWeight: "800" }}>{q.qoldiq}</Text>
                </Text>
              </View>
            ))}
            <Text style={styles.qoldiqHint}>* "Ertangi qoldiq" ertangi tonggi zaxiraga ko'chiriladi.</Text>
          </View>
        )}

        {/* Karta */}
        <View style={[styles.block, { backgroundColor: C.green + "0D", borderColor: C.green + "2E" }]}>
          <Text style={[styles.blockHead, { color: C.green }]}>Karta to'lovlari (bugun)</Text>
          <Row label="Summa" value={`${formatSom(data.kartaSum)} so'm`} />
          <Row label="≈ Non" value={`${data.kartaDona} dona`} />
          <Row label="Sof foyda" value={`${formatSom(data.kartaFoyda)} so'm`} color={C.green} bold />
        </View>

        {/* Optom */}
        <View style={[styles.block, { backgroundColor: C.blue + "0D", borderColor: C.blue + "2E" }]}>
          <Text style={[styles.blockHead, { color: C.blue }]}>Optom savdolar (bugun)</Text>
          <Row label={`${data.optomSoni} ta savdo`} value={`${formatSom(data.optomSum)} so'm`} />
          <Row label="Sof foyda (chegirma ayrilgan)" value={`${formatSom(data.optomFoyda)} so'm`} color={C.blue} bold />
        </View>

        {/* Qarz */}
        <View style={[styles.block, { backgroundColor: C.red + "0D", borderColor: C.red + "26" }]}>
          <Text style={[styles.blockHead, { color: C.red }]}>Qarz (bugun)</Text>
          <Row label={`${data.qarzSoni} ta qarz`} value={`${formatSom(data.qarzSum)} so'm`} bold />
          <Text style={styles.note}>* Qarz alohida — hali to'lanmagan, umumiyga qo'shilmaydi</Text>
        </View>

        {/* Qo'shimcha xarajatlar (bugun) */}
        {data.xarajatBugun.length > 0 && (
          <View style={[styles.block, { backgroundColor: C.red + "0D", borderColor: C.red + "26" }]}>
            <Text style={[styles.blockHead, { color: C.red }]}>Qo'shimcha xarajatlar (bugun)</Text>
            {data.xarajatBugun.map((x) => (
              <Row key={x.id} label={x.izoh} value={`− ${formatSom(x.summa)} so'm`} color={C.red} />
            ))}
            <Row label="Jami" value={`− ${formatSom(data.xarajatSum)} so'm`} color={C.red} bold />
          </View>
        )}

        {/* Ishchilar haqi */}
        {data.haqList.length > 0 && (
          <View style={[styles.block, { backgroundColor: "#F5EBDA", borderColor: "#E7D3B4" }]}>
            <Text style={styles.blockHead}>Ishchilar haqi</Text>
            {data.haqList.map((w) => (
              <Row key={w.id} label={w.brak > 0 ? `${w.ism} (brak −${formatSom(w.brak)})` : w.ism} value={`${formatSom(w.net)} so'm`} bold />
            ))}
          </View>
        )}

        {/* Umumiy */}
        <View style={styles.umumiy}>
          <Text style={styles.umumiyLabel}>UMUMIY FOYDA</Text>
          <Text style={[styles.umumiyVal, { color: data.umumiy >= 0 ? C.green : C.red }]}>{formatSom(data.umumiy)} so'm</Text>
          <Text style={styles.umumiyForm}>
            Kunlik {formatSom(data.kunlik.sofFoyda)} + Karta {formatSom(data.kartaFoyda)} + Optom {formatSom(data.optomFoyda)}
          </Text>
        </View>
        </ScrollView>

        <View style={styles.footer}>
          <Btn onPress={onClose} icon="checkmark-outline">Yopish</Btn>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Row({ label, value, color = C.text, bold }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowVal, { color, fontWeight: bold ? "800" : "600" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, zIndex: 9000 },
  safe:      { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: S[5], paddingTop: S[4], paddingBottom: S[3], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.borderSoft },
  head:      { flexDirection: "row", alignItems: "center", gap: S[3], flex: 1 },
  flex1:     { flex: 1 },
  title:     { fontSize: T.xl, fontWeight: "800", color: C.text, letterSpacing: -0.4 },
  sana:      { fontSize: T.sm, color: C.muted, marginTop: 2 },
  closeBtn:  { padding: 6 },
  scroll:    { flex: 1 },
  scrollContent:{ padding: S[5] },
  footer:    { padding: S[5], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  block:     { borderRadius: R.md, borderWidth: 1, borderColor: C.border, padding: S[3], marginBottom: S[2], backgroundColor: C.surface },
  blockHead: { fontSize: T.sm, fontWeight: "700", color: C.text, marginBottom: S[2] },
  kunOxiriBox: { marginTop: S[2], marginBottom: S[2], backgroundColor: C.accent + "1A", borderWidth: 1, borderColor: C.accent + "3D", borderRadius: R.md, paddingVertical: S[2], paddingHorizontal: S[3] },
  kunOxiriRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  kunOxiriLbl: { fontSize: T.sm, color: C.text, fontWeight: "800", flex: 1 },
  kunOxiriVal: { fontSize: T.md, fontWeight: "800", marginLeft: S[2] },
  kunOxiriHint:{ fontSize: 10, color: C.muted, marginTop: 2, fontStyle: "italic" },
  row:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  rowLabel:  { fontSize: T.sm, color: C.sub },
  rowVal:    { fontSize: T.sm },
  note:      { fontSize: 11, color: C.muted, marginTop: S[1] },
  qoldiqRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  qoldiqNom: { fontSize: T.sm, color: C.text, flex: 1 },
  qoldiqDet: { fontSize: T.sm, color: C.sub, marginLeft: S[2] },
  qoldiqHint:{ fontSize: 10, color: C.muted, marginTop: S[1], fontStyle: "italic" },
  umumiy:    { borderRadius: R.md, borderWidth: 1, borderColor: C.accent + "2E", padding: S[4], backgroundColor: C.accent + "0D", alignItems: "center", marginTop: S[1] },
  umumiyLabel: { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1 },
  umumiyVal: { fontSize: T.xxl, fontWeight: "800", marginTop: S[1], letterSpacing: -0.5 },
  umumiyForm: { fontSize: 10, color: C.muted, marginTop: 6, textAlign: "center" },
  gap12:     { height: S[3] },
});
