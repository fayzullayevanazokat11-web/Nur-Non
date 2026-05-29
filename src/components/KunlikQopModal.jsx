// Kunlik qop hisobi — MA'LUMOT KIRITISH. Har non uchun qop/dona + sotilmagan kiritiladi.
// Kun bo'yi bir necha marta kiritilishi mumkin (Saqlash). Natijalar Markazda jonli
// hisoblanadi; kun oxirida Markazdagi "Kunni yakunlash" tugmasi bilan tasdiqlanadi.
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import { Modal } from "./Modal";
import { Btn } from "./Btn";
import { C, T, S, R } from "../theme";
import { hisoblaKunlik, formatSom } from "../logic/hisob";

const toStr = (obj) => Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k, String(v)]));

export function KunlikQopModal({ visible, onClose }) {
  const {
    nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari, braklar,
    ozIshlabQoplar, setOzIshlabQoplar, tashqariSonlar, setTashqariSonlar,
    sotilmaganNon, setSotilmaganNon,
  } = useApp();

  const [fQop, setFQop] = useState({});
  const [fTash, setFTash] = useState({});
  const [fSot, setFSot] = useState({});

  useEffect(() => {
    if (visible) {
      setFQop(toStr(ozIshlabQoplar));
      setFTash(toStr(tashqariSonlar));
      setFSot(toStr(sotilmaganNon));
    }
  }, [visible]);

  const r = useMemo(
    () => hisoblaKunlik({
      nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari, braklar,
      ozIshlabQoplar: fQop, tashqariSonlar: fTash, sotilmaganNon: fSot,
    }),
    [fQop, fTash, fSot, nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari, braklar]
  );

  const saqla = () => {
    setOzIshlabQoplar(fQop);
    setTashqariSonlar(fTash);
    setSotilmaganNon(fSot);
    onClose();
  };

  return (
    <Modal modalVisible={visible} onClose={onClose}>
      <View style={styles.head}>
        <Ionicons name="calculator-outline" size={20} color={C.sub} />
        <Text style={styles.title}>Kunlik qop hisobi</Text>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {nonlar.map((n) => {
          const oz = n.ozIshlab !== false;
          return (
            <View key={n.id} style={styles.nonRow}>
              <Text style={styles.nonNom} numberOfLines={1}>{n.nom}</Text>
              <View style={styles.inputs}>
                <View style={styles.col}>
                  <Text style={styles.lbl}>{oz ? "Qop" : "Dona"}</Text>
                  <TextInput
                    value={(oz ? fQop : fTash)[n.id] ?? ""}
                    onChangeText={(v) => (oz ? setFQop : setFTash)((p) => ({ ...p, [n.id]: v }))}
                    keyboardType="numeric" placeholder="0" placeholderTextColor={C.muted} style={styles.input}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.lbl}>Sotilmagan</Text>
                  <TextInput
                    value={fSot[n.id] ?? ""}
                    onChangeText={(v) => setFSot((p) => ({ ...p, [n.id]: v }))}
                    keyboardType="numeric" placeholder="0" placeholderTextColor={C.muted} style={styles.input}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.summary}>
        <SumRow label="Jami non" value={`${r.jamiNon} dona`} />
        <SumRow label="Sotilgan" value={`${r.sotilganNon} dona`} />
        <SumRow label="Daromad" value={`${formatSom(r.daromad)} so'm`} />
        <SumRow label="Xomashyo" value={`${formatSom(r.xomashyo)} so'm`} />
        <SumRow label="Ishchi haqi" value={`${formatSom(r.ishchiHaq)} so'm`} />
        <SumRow label="Sof foyda" value={`${formatSom(r.sofFoyda)} so'm`} bold color={r.sofFoyda >= 0 ? C.green : C.red} />
      </View>

      <View style={styles.btns}>
        <View style={styles.flex1}><Btn onPress={saqla} icon="save-outline">Saqlash</Btn></View>
      </View>
    </Modal>
  );
}

function SumRow({ label, value, bold, color = C.text }) {
  return (
    <View style={styles.sumRow}>
      <Text style={styles.sumLabel}>{label}</Text>
      <Text style={[styles.sumVal, { color, fontWeight: bold ? "800" : "600" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head:    { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[3] },
  title:   { fontSize: T.lg, fontWeight: "800", color: C.text },
  scroll:  { maxHeight: 340 },
  nonRow:  { marginBottom: S[3], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.borderSoft, paddingBottom: S[3] },
  nonNom:  { fontSize: T.md, fontWeight: "700", color: C.text, marginBottom: 6 },
  inputs:  { flexDirection: "row", gap: S[3] },
  col:     { flex: 1 },
  lbl:     { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: S[1] },
  input:   { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  summary: { marginTop: S[3], backgroundColor: "#F5EBDA", borderWidth: 1, borderColor: "#E7D3B4", borderRadius: R.md, padding: S[3] },
  sumRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  sumLabel:{ fontSize: T.sm, color: C.sub },
  sumVal:  { fontSize: T.md },
  btns:    { flexDirection: "row", gap: S[3], marginTop: S[3] },
  flex1:   { flex: 1 },
});
