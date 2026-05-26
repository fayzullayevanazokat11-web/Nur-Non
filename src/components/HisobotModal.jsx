// Kunlik yakuniy hisobot modali — Tasdiqlashdan keyin chiqadi.
// Ishlab chiqarish (qop) sof foydasi + bugungi Karta / Optom / Qarz integratsiyasi.
import { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useApp } from "../store/AppData";
import { Modal } from "./Modal";
import { Btn } from "./Btn";
import { C, T } from "../theme";
import { hisoblaKunlik, formatSom } from "../logic/hisob";

export function HisobotModal({ visible, onClose }) {
  const {
    nonlar, ishchilar, mahsulotNarxlari,
    ozIshlabQoplar, tashqariSonlar, sotilmaganNon,
    qarzlar, optomlar, kartalar,
  } = useApp();

  const data = useMemo(() => {
    const bugun = new Date().toISOString().split("T")[0];
    const kunlik = hisoblaKunlik({
      nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari,
    });
    const sum = (arr, key) => (arr || []).reduce((s, x) => s + (parseFloat(x[key]) || 0), 0);
    const optomB = (optomlar || []).filter((o) => o.sana === bugun);
    const qarzB = (qarzlar || []).filter((q) => q.sana === bugun);
    const kartaB = (kartalar || []).filter((k) => k.sana === bugun);
    const optomSum = sum(optomB, "summa");
    const qarzSum = sum(qarzB, "summa");
    const kartaSum = sum(kartaB, "summa");
    const kartaFoyda = sum(kartaB, "sofFoyda");
    const kartaDona = sum(kartaB, "dona");
    // Umumiy foyda = ishlab chiqarish sof foydasi + karta sof foydasi + optom savdo
    const umumiy = kunlik.sofFoyda + kartaFoyda + optomSum;
    return { bugun, kunlik, optomSum, optomSoni: optomB.length, qarzSum, qarzSoni: qarzB.length, kartaSum, kartaFoyda, kartaDona, kartaSoni: kartaB.length, umumiy };
  }, [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, qarzlar, optomlar, kartalar, mahsulotNarxlari]);

  return (
    <Modal modalVisible={visible} onClose={onClose}>
      <Text style={styles.title}>✅ Kunlik hisobot</Text>
      <Text style={styles.sana}>{data.bugun}</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Ishlab chiqarish (qop) */}
        <View style={styles.block}>
          <Text style={styles.blockHead}>🏭 Ishlab chiqarish (kunlik qop)</Text>
          <Row label="Ishlab chiqarilgan" value={`${data.kunlik.jamiNon} dona`} />
          <Row label="Sotilgan" value={`${data.kunlik.sotilganNon} dona`} />
          <Row label="Sof foyda" value={`${formatSom(data.kunlik.sofFoyda)} so'm`} color={data.kunlik.sofFoyda >= 0 ? C.green : C.red} bold />
        </View>

        {/* Karta */}
        <View style={[styles.block, { borderColor: C.green + "40" }]}>
          <Text style={[styles.blockHead, { color: C.green }]}>💳 Karta to'lovlari (bugun)</Text>
          <Row label="Summa" value={`${formatSom(data.kartaSum)} so'm`} />
          <Row label="≈ Non" value={`${data.kartaDona} dona`} />
          <Row label="Sof foyda" value={`${formatSom(data.kartaFoyda)} so'm`} color={C.green} bold />
        </View>

        {/* Optom */}
        <View style={[styles.block, { borderColor: C.blue + "40" }]}>
          <Text style={[styles.blockHead, { color: C.blue }]}>📦 Optom savdolar (bugun)</Text>
          <Row label={`${data.optomSoni} ta savdo`} value={`${formatSom(data.optomSum)} so'm`} bold />
        </View>

        {/* Qarz */}
        <View style={[styles.block, { borderColor: C.red + "40" }]}>
          <Text style={[styles.blockHead, { color: C.red }]}>🏷️ Qarz (bugun)</Text>
          <Row label={`${data.qarzSoni} ta qarz`} value={`${formatSom(data.qarzSum)} so'm`} bold />
          <Text style={styles.note}>* Qarz alohida — hali to'lanmagan, umumiyga qo'shilmaydi</Text>
        </View>

        {/* Umumiy */}
        <View style={styles.umumiy}>
          <Text style={styles.umumiyLabel}>UMUMIY FOYDA</Text>
          <Text style={[styles.umumiyVal, { color: data.umumiy >= 0 ? C.green : C.red }]}>{formatSom(data.umumiy)} so'm</Text>
          <Text style={styles.umumiyForm}>
            Kunlik {formatSom(data.kunlik.sofFoyda)} + Karta {formatSom(data.kartaFoyda)} + Optom {formatSom(data.optomSum)}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.gap12} />
      <Btn onPress={onClose}>Yopish</Btn>
    </Modal>
  );
}

function Row({ label, value, color = C.text, bold }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowVal, { color, fontWeight: bold ? "900" : "700" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title:     { fontSize: T.lg, fontWeight: "900", color: C.text },
  sana:      { fontSize: T.sm, color: C.muted, marginBottom: 12 },
  scroll:    { maxHeight: 420 },
  block:     { borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: C.surface },
  blockHead: { fontSize: T.sm, fontWeight: "800", color: C.text, marginBottom: 8 },
  row:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  rowLabel:  { fontSize: T.sm, color: C.sub },
  rowVal:    { fontSize: T.sm },
  note:      { fontSize: 9, color: C.muted, marginTop: 4, fontStyle: "italic" },
  umumiy:    { borderRadius: 14, padding: 14, backgroundColor: C.accent + "12", borderWidth: 1, borderColor: C.accent + "40", alignItems: "center", marginTop: 2 },
  umumiyLabel: { fontSize: T.xs, color: C.muted, fontWeight: "800", letterSpacing: 1 },
  umumiyVal: { fontSize: 26, fontWeight: "900", marginTop: 4 },
  umumiyForm: { fontSize: 10, color: C.muted, marginTop: 6, textAlign: "center" },
  gap12:     { height: 12 },
});
