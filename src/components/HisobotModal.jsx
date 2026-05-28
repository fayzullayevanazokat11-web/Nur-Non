// Kunlik yakuniy hisobot modali — Tasdiqlashdan keyin chiqadi.
// Ishlab chiqarish (qop) sof foydasi + bugungi Karta / Optom / Qarz integratsiyasi.
import { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import { Modal } from "./Modal";
import { Btn } from "./Btn";
import { C, T, S, R } from "../theme";
import { hisoblaKunlik, formatSom } from "../logic/hisob";

export function HisobotModal({ visible, onClose }) {
  const {
    nonlar, ishchilar, mahsulotNarxlari,
    ozIshlabQoplar, tashqariSonlar, sotilmaganNon,
    qarzlar, optomlar, kartalar,
  } = useApp();

  const data = useMemo(() => {
    const d = new Date();
    const bugun = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const kunlik = hisoblaKunlik({
      nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari,
    });
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
    return { bugun, kunlik, optomSum, optomFoyda, optomSoni: optomB.length, qarzSum, qarzSoni: qarzB.length, kartaSum, kartaFoyda, kartaDona, kartaSoni: kartaB.length, umumiy };
  }, [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, qarzlar, optomlar, kartalar, mahsulotNarxlari]);

  return (
    <Modal modalVisible={visible} onClose={onClose}>
      <View style={styles.head}>
        <Ionicons name="document-text-outline" size={20} color={C.sub} />
        <Text style={styles.title}>Kunlik hisobot</Text>
      </View>
      <Text style={styles.sana}>{data.bugun}</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Ishlab chiqarish (qop) */}
        <View style={[styles.block, { backgroundColor: C.accent + "0D", borderColor: C.accent + "2E" }]}>
          <Text style={styles.blockHead}>Ishlab chiqarish (kunlik qop)</Text>
          <Row label="Ishlab chiqarilgan" value={`${data.kunlik.jamiNon} dona`} />
          <Row label="Sotilgan" value={`${data.kunlik.sotilganNon} dona`} />
          <Row label="Sof foyda" value={`${formatSom(data.kunlik.sofFoyda)} so'm`} color={data.kunlik.sofFoyda >= 0 ? C.green : C.red} bold />
        </View>

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

        {/* Umumiy */}
        <View style={styles.umumiy}>
          <Text style={styles.umumiyLabel}>UMUMIY FOYDA</Text>
          <Text style={[styles.umumiyVal, { color: data.umumiy >= 0 ? C.green : C.red }]}>{formatSom(data.umumiy)} so'm</Text>
          <Text style={styles.umumiyForm}>
            Kunlik {formatSom(data.kunlik.sofFoyda)} + Karta {formatSom(data.kartaFoyda)} + Optom {formatSom(data.optomFoyda)}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.gap12} />
      <Btn onPress={onClose} icon="checkmark-outline">Yopish</Btn>
    </Modal>
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
  head:      { flexDirection: "row", alignItems: "center", gap: S[2] },
  title:     { fontSize: T.lg, fontWeight: "800", color: C.text },
  sana:      { fontSize: T.sm, color: C.muted, marginBottom: S[3] },
  scroll:    { maxHeight: 420 },
  block:     { borderRadius: R.md, borderWidth: 1, borderColor: C.border, padding: S[3], marginBottom: S[2], backgroundColor: C.surface },
  blockHead: { fontSize: T.sm, fontWeight: "700", color: C.text, marginBottom: S[2] },
  row:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  rowLabel:  { fontSize: T.sm, color: C.sub },
  rowVal:    { fontSize: T.sm },
  note:      { fontSize: 11, color: C.muted, marginTop: S[1] },
  umumiy:    { borderRadius: R.md, borderWidth: 1, borderColor: C.accent + "2E", padding: S[4], backgroundColor: C.accent + "0D", alignItems: "center", marginTop: S[1] },
  umumiyLabel: { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1 },
  umumiyVal: { fontSize: T.xxl, fontWeight: "800", marginTop: S[1], letterSpacing: -0.5 },
  umumiyForm: { fontSize: 10, color: C.muted, marginTop: 6, textAlign: "center" },
  gap12:     { height: S[3] },
});
