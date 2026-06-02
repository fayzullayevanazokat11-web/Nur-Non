// Kunlik qop hisobi — MA'LUMOT KIRITISH (partiyaviy inventarizatsiya).
// Har non uchun: Boshlang'ich qoldiq (kechagi) read-only, Bugungi qop/Dona,
// Qo'lda yaroqsiz, Kun oxiriga qoldiq (ertangi boshlang'ich bo'ladi).
// Kun bo'yi bir necha marta kiritilishi mumkin (Saqlash). Kun oxirida Markazdagi
// "Kunni yakunlash" tugmasi bilan tasdiqlanadi.
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import { Modal } from "./Modal";
import { Btn } from "./Btn";
import { C, T, S, R } from "../theme";
import { hisoblaKunlik, qoldiqlarHisobi, formatSom } from "../logic/hisob";

const toStr = (obj) => Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k, String(v)]));

export function KunlikQopModal({ visible, onClose }) {
  const {
    nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari, braklar,
    ozIshlabQoplar, setOzIshlabQoplar, tashqariSonlar, setTashqariSonlar,
    sotilmaganNon, setSotilmaganNon,
    boshlangichQoldiq, qoldaYaroqsiz, setQoldaYaroqsiz,
  } = useApp();

  const [fQop, setFQop] = useState({});
  const [fTash, setFTash] = useState({});
  const [fSot, setFSot] = useState({});
  const [fYaroqsiz, setFYaroqsiz] = useState({});

  useEffect(() => {
    if (visible) {
      setFQop(toStr(ozIshlabQoplar));
      setFTash(toStr(tashqariSonlar));
      setFSot(toStr(sotilmaganNon));
      setFYaroqsiz(toStr(qoldaYaroqsiz));
    }
  }, [visible]);

  const args = {
    nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari, braklar,
    ozIshlabQoplar: fQop, tashqariSonlar: fTash, sotilmaganNon: fSot,
    boshlangichQoldiq, qoldaYaroqsiz: fYaroqsiz,
  };
  const r = useMemo(() => hisoblaKunlik(args), [fQop, fTash, fSot, fYaroqsiz, nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari, braklar, boshlangichQoldiq]);
  const qoldiqlar = useMemo(() => qoldiqlarHisobi(nonlar, args), [fQop, fTash, fSot, fYaroqsiz, nonlar, optomlar, qarzlar, boshlangichQoldiq]);
  const qoldiqMap = useMemo(() => Object.fromEntries(qoldiqlar.map((q) => [q.id, q])), [qoldiqlar]);

  const saqla = () => {
    setOzIshlabQoplar(fQop);
    setTashqariSonlar(fTash);
    setSotilmaganNon(fSot);
    setQoldaYaroqsiz(fYaroqsiz);
    onClose();
  };

  return (
    <Modal modalVisible={visible} onClose={onClose}>
      <View style={styles.head}>
        <Ionicons name="calculator-outline" size={20} color={C.sub} />
        <Text style={styles.title}>Kunlik qop hisobi</Text>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
        {nonlar.map((n) => {
          const oz = n.ozIshlab !== false;
          const q = qoldiqMap[n.id] || {};
          return (
            <View key={n.id} style={styles.nonRow}>
              <View style={styles.nonHead}>
                <Text style={styles.nonNom} numberOfLines={1}>{n.nom}</Text>
                {q.boshlang > 0 && (
                  <View style={styles.boshlangPill}>
                    <Ionicons name="archive-outline" size={11} color={C.accent} />
                    <Text style={styles.boshlangTxt}> Tonggi qoldiq: {q.boshlang}</Text>
                  </View>
                )}
              </View>
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
                  <Text style={styles.lbl}>Yaroqsiz</Text>
                  <TextInput
                    value={fYaroqsiz[n.id] ?? ""}
                    onChangeText={(v) => setFYaroqsiz((p) => ({ ...p, [n.id]: v }))}
                    keyboardType="numeric" placeholder="0" placeholderTextColor={C.muted} style={styles.input}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.lbl}>Kun oxiri qoldiq</Text>
                  <TextInput
                    value={fSot[n.id] ?? ""}
                    onChangeText={(v) => setFSot((p) => ({ ...p, [n.id]: v }))}
                    keyboardType="numeric" placeholder="0" placeholderTextColor={C.muted} style={styles.input}
                  />
                </View>
              </View>
              {(q.jamiZaxira > 0 || q.boshlang > 0) && (
                <Text style={styles.flow}>
                  Zaxira {q.jamiZaxira} = {q.boshlang} (kechagi) + {q.ishlab} (bugun) ·
                  Sotilgan {q.jamiSotilgan}
                  {q.divertedShu > 0 ? ` (shundan ${q.divertedShu} optom/qarz)` : ""}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.summary}>
        <SumRow label="Tonggi qoldiq" value={`${r.jamiBoshlang} dona`} />
        <SumRow label="Bugungi ishlab" value={`${r.jamiNon} dona`} />
        <SumRow label="Sotilgan" value={`${r.sotilganNon} dona`} />
        <SumRow label="Yaroqsiz" value={`${r.jamiYaroqsiz} dona`} color={r.jamiYaroqsiz > 0 ? C.red : C.text} />
        <SumRow label="Ertangi qoldiq" value={`${r.jamiQoldiq} dona`} color={C.accent} />
        <View style={styles.sumDivider} />
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
  scroll:  { maxHeight: 360 },
  nonRow:  { marginBottom: S[3], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.borderSoft, paddingBottom: S[3] },
  nonHead: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: 6, flexWrap: "wrap" },
  nonNom:  { fontSize: T.md, fontWeight: "700", color: C.text },
  boshlangPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.pill, backgroundColor: C.accent + "14" },
  boshlangTxt: { fontSize: 11, color: C.accent, fontWeight: "700" },
  inputs:  { flexDirection: "row", gap: S[2] },
  col:     { flex: 1 },
  lbl:     { fontSize: 10, color: C.sub, fontWeight: "700", marginBottom: 4, letterSpacing: 0.3, textTransform: "uppercase" },
  input:   { borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 9, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "center" },
  flow:    { fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 15 },
  summary: { marginTop: S[3], backgroundColor: "#F5EBDA", borderWidth: 1, borderColor: "#E7D3B4", borderRadius: R.md, padding: S[3] },
  sumRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  sumDivider: { height: StyleSheet.hairlineWidth, backgroundColor: C.borderSoft, marginVertical: 6 },
  sumLabel:{ fontSize: T.sm, color: C.sub },
  sumVal:  { fontSize: T.md },
  btns:    { flexDirection: "row", gap: S[3], marginTop: S[3] },
  flex1:   { flex: 1 },
});
