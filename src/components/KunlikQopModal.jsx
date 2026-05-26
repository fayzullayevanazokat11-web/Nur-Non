// Kunlik qop hisobi — har non uchun qop/dona + sotilmagan kiritiladi,
// jonli sof foyda ko'rsatiladi, "Tasdiqlash" hisobot snapshotini saqlaydi.
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet } from "react-native";
import { useApp } from "../store/AppData";
import { Modal } from "./Modal";
import { Btn } from "./Btn";
import { C, T, S, R } from "../theme";
import { hisoblaKunlik, formatSom } from "../logic/hisob";

const toStr = (obj) => Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k, String(v)]));

export function KunlikQopModal({ visible, onClose, onTasdiq }) {
  const {
    nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari,
    ozIshlabQoplar, setOzIshlabQoplar, tashqariSonlar, setTashqariSonlar,
    sotilmaganNon, setSotilmaganNon, hisobotlarTarixi, setHisobotlarTarixi,
  } = useApp();

  const [fQop, setFQop] = useState({});
  const [fTash, setFTash] = useState({});
  const [fSot, setFSot] = useState({});

  // Ochilganda joriy qiymatlar bilan to'ldiriladi
  useEffect(() => {
    if (visible) {
      setFQop(toStr(ozIshlabQoplar));
      setFTash(toStr(tashqariSonlar));
      setFSot(toStr(sotilmaganNon));
    }
  }, [visible]);

  // Jonli hisob (forma qiymatlari asosida)
  const r = useMemo(
    () => hisoblaKunlik({
      nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari,
      ozIshlabQoplar: fQop, tashqariSonlar: fTash, sotilmaganNon: fSot,
    }),
    [fQop, fTash, fSot, nonlar, ishchilar, optomlar, qarzlar, mahsulotNarxlari]
  );

  const kiritmalarniSaqla = () => {
    setOzIshlabQoplar(fQop);
    setTashqariSonlar(fTash);
    setSotilmaganNon(fSot);
  };

  const saqla = () => { kiritmalarniSaqla(); onClose(); };

  const tasdiqla = () => {
    kiritmalarniSaqla();
    const sana = new Date().toISOString().split("T")[0];
    const snapshot = {
      id: Date.now(),
      sana,
      vaqt: Date.now(),
      ozIshlabQoplar: fQop,
      tashqariSonlar: fTash,
      sotilmaganNon: fSot,
      nonlarSnapshot: JSON.parse(JSON.stringify(nonlar)),
      ishchilarSnapshot: JSON.parse(JSON.stringify(ishchilar)),
      mahsulotNarxlariSnapshot: JSON.parse(JSON.stringify(mahsulotNarxlari)),
      daromad: r.daromad,
      xomashyo: r.xomashyo,
      ishchiHaq: r.ishchiHaq,
      sofFoyda: r.sofFoyda,
      sotilganNon: r.sotilganNon,
      jamiQop: r.jamiQop,
    };
    // Bir kunda bitta hisobot — o'sha sanani almashtiramiz
    setHisobotlarTarixi((prev) => [snapshot, ...(prev || []).filter((h) => h.sana !== sana)]);
    // Yakuniy hisobot modalini ochish (Karta/Optom/Qarz integratsiyasi bilan)
    if (onTasdiq) onTasdiq();
    else onClose();
  };

  return (
    <Modal modalVisible={visible} onClose={onClose}>
      <Text style={styles.title}>Kunlik qop hisobi</Text>

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
        <SumRow label="Bugungi sof foyda" value={`${formatSom(r.sofFoyda)} so'm`} bold color={r.sofFoyda >= 0 ? C.green : C.red} />
      </View>

      <View style={styles.btns}>
        <View style={styles.flex1}><Btn secondary onPress={saqla}>Saqlash</Btn></View>
        <View style={styles.flex1}><Btn onPress={tasdiqla}>Tasdiqlash</Btn></View>
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
  title:   { fontSize: T.lg, fontWeight: "800", color: C.text, marginBottom: S[3] },
  scroll:  { maxHeight: 360 },
  nonRow:  { marginBottom: S[3], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.borderSoft, paddingBottom: S[3] },
  nonNom:  { fontSize: T.md, fontWeight: "700", color: C.text, marginBottom: 6 },
  inputs:  { flexDirection: "row", gap: S[3] },
  col:     { flex: 1 },
  lbl:     { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: S[1] },
  input:   { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  summary: { marginTop: S[3], backgroundColor: C.accent + "0D", borderWidth: 1, borderColor: C.accent + "2E", borderRadius: R.md, padding: S[3] },
  sumRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  sumLabel:{ fontSize: T.sm, color: C.sub },
  sumVal:  { fontSize: T.md },
  btns:    { flexDirection: "row", gap: S[3], marginTop: S[3] },
  flex1:   { flex: 1 },
});
