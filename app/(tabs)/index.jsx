// "Markaz" ekrani — kunlik ko'rsatkichlar + Qarz / Optom / Karta to'lovlari.
import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { Modal } from "../../src/components/Modal";
import { C, T } from "../../src/theme";
import { hisoblaKunlik, formatSom, qarzJami, optomJami, kartaJami, kartaHisob } from "../../src/logic/hisob";

const BOSH_FORMA = { ism: "", summa: "", izoh: "" };

export default function Markaz() {
  const {
    nonlar, ishchilar, qarzlar, setQarzlar, optomlar, setOptomlar, kartalar, setKartalar,
    ozIshlabQoplar, tashqariSonlar, sotilmaganNon, mahsulotNarxlari,
  } = useApp();

  const stats = useMemo(
    () => hisoblaKunlik({ nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari }),
    [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari]
  );

  const qarz = useMemo(() => qarzJami(qarzlar), [qarzlar]);
  const optom = useMemo(() => optomJami(optomlar), [optomlar]);
  const karta = useMemo(() => kartaJami(kartalar), [kartalar]);

  const [modalTur, setModalTur] = useState(null);
  const [forma, setForma] = useState(BOSH_FORMA);

  const ochModal = (tur) => { setForma(BOSH_FORMA); setModalTur(tur); };
  const yopModal = () => setModalTur(null);
  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));

  const kartaModal = modalTur === "karta";
  const qarzModal = modalTur === "qarz";

  // Karta modali uchun jonli hisob: kiritilgan narxdan ~nechta non va sof foyda
  const preview = useMemo(
    () => (kartaModal ? kartaHisob(parseFloat(forma.summa) || 0, nonlar, mahsulotNarxlari) : null),
    [kartaModal, forma.summa, nonlar, mahsulotNarxlari]
  );

  const saqla = () => {
    const summa = parseFloat(forma.summa) || 0;
    const sana = new Date().toISOString().split("T")[0];
    if (!summa || (!kartaModal && !forma.ism.trim())) {
      Alert.alert("Maydonlar to'liq emas", kartaModal ? "Iltimos, summani kiriting." : "Iltimos, ism va summani kiriting.");
      return;
    }
    if (modalTur === "qarz") {
      setQarzlar((prev) => [...prev, { id: Date.now(), ism: forma.ism.trim(), summa, izoh: forma.izoh.trim(), sana, tolangan: false, tolanganVaqt: null }]);
    } else if (modalTur === "optom") {
      setOptomlar((prev) => [...prev, { id: Date.now(), ism: forma.ism.trim(), summa, izoh: forma.izoh.trim(), sana, vaqt: Date.now() }]);
    } else {
      const pv = kartaHisob(summa, nonlar, mahsulotNarxlari);
      setKartalar((prev) => [...prev, { id: Date.now(), summa, izoh: forma.izoh.trim(), sana, dona: pv.dona, sofFoyda: pv.sofFoyda }]);
    }
    yopModal();
  };

  const tolaQarz = (id) => setQarzlar((prev) => prev.map((q) => q.id === id ? { ...q, tolangan: true, tolanganVaqt: Date.now() } : q));
  const ochirQarz = (id) => setQarzlar((prev) => prev.filter((q) => q.id !== id));
  const ochirOptom = (id) => setOptomlar((prev) => prev.filter((o) => o.id !== id));
  const ochirKarta = (id) => setKartalar((prev) => prev.filter((k) => k.id !== id));

  const akcent = qarzModal ? C.red : kartaModal ? C.green : C.blue;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Nonvoyxona №1</Text>
        <Text style={styles.title}>Bosh ko'rsatkichlar</Text>
        <Text style={styles.subtitle}>Bugungi ish ko'rsatkichlari</Text>

        <View style={styles.statsRow}>
          <StatTile label="Bugungi sof foyda" unit="so'm" value={formatSom(stats.sofFoyda)} color={stats.sofFoyda >= 0 ? C.green : C.red} />
          <StatTile label="Sotilgan non" unit="dona" value={String(stats.sotilganNon)} color={C.text} />
          <StatTile label="Kunlik qop" unit="qop" value={String(stats.jamiQop)} color={C.accent} />
        </View>

        <Card accent style={styles.block}>
          <Text style={styles.cardTitle}>📦 Kunlik qop hisobi</Text>
          <Text style={styles.muted}>{nonlar.length} xil non · {stats.jamiNon} dona ishlab chiqarildi</Text>
        </Card>

        {/* QARZ */}
        <SectionHead emoji="🏷️" nom="QARZLAR" sum={`${formatSom(qarz.summa)} so'm · ${qarz.soni} ta`} color={C.red} />
        <Btn color={C.red} onPress={() => ochModal("qarz")}>+ Qarz qo'shish</Btn>
        <View style={styles.gap10} />
        {(qarzlar || []).length === 0 ? <Text style={styles.bosh}>Hali qarz yo'q</Text> : (
          [...qarzlar].reverse().map((q) => (
            <Card key={q.id} style={styles.item}>
              <View style={styles.rowBetween}>
                <View style={styles.flex1}>
                  <Text style={styles.itemIsm}>{q.ism}{q.tolangan ? "  ✓ to'landi" : ""}</Text>
                  {q.izoh ? <Text style={styles.itemIzoh}>{q.izoh}</Text> : null}
                  <Text style={styles.itemSana}>{q.sana}</Text>
                </View>
                <Text style={[styles.itemSumma, { color: q.tolangan ? C.muted : C.red }]}>{formatSom(q.summa)} so'm</Text>
              </View>
              <View style={styles.actions}>
                {!q.tolangan && (
                  <Pressable onPress={() => tolaQarz(q.id)} hitSlop={6} style={styles.actBtn}>
                    <Text style={[styles.actTxt, { color: C.green }]}>✓ To'landi</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => ochirQarz(q.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                </Pressable>
              </View>
            </Card>
          ))
        )}

        {/* OPTOM */}
        <SectionHead emoji="📦" nom="OPTOM SAVDOLAR" sum={`${formatSom(optom.summa)} so'm · ${optom.soni} ta`} color={C.blue} style={{ marginTop: 18 }} />
        <Btn color={C.blue} onPress={() => ochModal("optom")}>+ Xarid qo'shish</Btn>
        <View style={styles.gap10} />
        {(optomlar || []).length === 0 ? <Text style={styles.bosh}>Hali optom savdo yo'q</Text> : (
          [...optomlar].reverse().map((o) => (
            <Card key={o.id} style={styles.item}>
              <View style={styles.rowBetween}>
                <View style={styles.flex1}>
                  <Text style={styles.itemIsm}>{o.ism}</Text>
                  {o.izoh ? <Text style={styles.itemIzoh}>{o.izoh}</Text> : null}
                  <Text style={styles.itemSana}>{o.sana}</Text>
                </View>
                <Text style={[styles.itemSumma, { color: C.blue }]}>{formatSom(o.summa)} so'm</Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => ochirOptom(o.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                </Pressable>
              </View>
            </Card>
          ))
        )}

        {/* KARTA */}
        <SectionHead emoji="💳" nom="KARTA TO'LOVLARI" sum={`${formatSom(karta.summa)} so'm · ${karta.soni} ta`} color={C.green} style={{ marginTop: 18 }} />
        <Btn color={C.green} onPress={() => ochModal("karta")}>+ Karta to'lovi</Btn>
        <View style={styles.gap10} />
        {(kartalar || []).length === 0 ? <Text style={styles.bosh}>Hali karta to'lovi yo'q</Text> : (
          [...kartalar].reverse().map((k) => (
            <Card key={k.id} style={styles.item}>
              <View style={styles.rowBetween}>
                <View style={styles.flex1}>
                  <Text style={styles.itemIsm}>{k.izoh || "Karta to'lovi"}</Text>
                  <Text style={styles.itemIzoh}>≈ {k.dona} dona non · sof foyda {formatSom(k.sofFoyda)} so'm</Text>
                  <Text style={styles.itemSana}>{k.sana}</Text>
                </View>
                <Text style={[styles.itemSumma, { color: C.green }]}>{formatSom(k.summa)} so'm</Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => ochirKarta(k.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Universal modal: Qarz / Optom / Karta */}
      <Modal modalVisible={modalTur !== null} onClose={yopModal}>
        <Text style={styles.modalTitle}>
          {qarzModal ? "🏷️ Yangi qarz" : kartaModal ? "💳 Karta to'lovi" : "📦 Yangi optom savdo"}
        </Text>
        <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {!kartaModal && (
            <>
              <Text style={styles.inputLabel}>{qarzModal ? "Qarz oluvchi *" : "Xaridor *"}</Text>
              <TextInput value={forma.ism} onChangeText={(v) => yangila("ism", v)} placeholder="Ism familiya" placeholderTextColor={C.muted} style={styles.input} />
            </>
          )}

          <Text style={styles.inputLabel}>{kartaModal ? "Aniq narx (so'm) *" : "Summa (so'm) *"}</Text>
          <TextInput value={forma.summa} onChangeText={(v) => yangila("summa", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

          <Text style={styles.inputLabel}>Izoh</Text>
          <TextInput value={forma.izoh} onChangeText={(v) => yangila("izoh", v)} placeholder="Qo'shimcha izoh (ixtiyoriy)" placeholderTextColor={C.muted} multiline style={[styles.input, styles.inputMulti]} />

          {/* Karta uchun jonli hisob */}
          {kartaModal && (parseFloat(forma.summa) || 0) > 0 && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Hisob (o'rtacha narx asosida)</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>≈ Nechta non</Text>
                <Text style={styles.previewVal}>{preview.dona} dona</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Xarajat ayrilib sof foyda</Text>
                <Text style={[styles.previewVal, { color: preview.sofFoyda >= 0 ? C.green : C.red }]}>{formatSom(preview.sofFoyda)} so'm</Text>
              </View>
            </View>
          )}
        </ScrollView>
        <View style={styles.gap12} />
        <View style={styles.modalRow}>
          <View style={styles.flex1}><Btn secondary onPress={yopModal}>Bekor</Btn></View>
          <View style={styles.flex1}><Btn color={akcent} onPress={saqla}>✓ Saqlash</Btn></View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SectionHead({ emoji, nom, sum, color, style }) {
  return (
    <View style={[styles.secHead, style]}>
      <Text style={styles.section}>{emoji} {nom}</Text>
      <Text style={[styles.secSum, { color }]}>{sum}</Text>
    </View>
  );
}

function StatTile({ label, value, unit, color }) {
  const len = String(value || "").length;
  const valSize = len > 9 ? 14 : len > 7 ? 16 : len > 5 ? 18 : 20;
  return (
    <Card style={styles.statTile}>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={[styles.statValue, { color, fontSize: valSize }]} numberOfLines={1}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 16, paddingBottom: 32 },
  eyebrow:   { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  title:     { fontSize: T.xl, fontWeight: "900", color: C.text, marginTop: 2 },
  subtitle:  { fontSize: T.sm, color: C.muted, marginTop: 2, marginBottom: 16 },
  statsRow:  { flexDirection: "row", gap: 8, marginBottom: 16 },
  statTile:  { flex: 1, paddingVertical: 10, paddingHorizontal: 9 },
  statLabel: { fontSize: 9, color: C.muted, fontWeight: "700", letterSpacing: 0.6, marginBottom: 5 },
  statValue: { fontWeight: "900" },
  statUnit:  { fontSize: 10, color: C.muted, marginTop: 2 },
  block:     { marginBottom: 16 },
  cardTitle: { fontSize: T.md, fontWeight: "800", color: C.text, marginBottom: 4 },
  muted:     { fontSize: T.sm, color: C.sub },

  secHead:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 },
  section:   { fontSize: T.xs, color: C.muted, fontWeight: "700", letterSpacing: 1 },
  secSum:    { fontSize: T.sm, fontWeight: "900" },
  bosh:      { fontSize: T.sm, color: C.muted, fontStyle: "italic", paddingVertical: 6 },

  item:      { marginBottom: 8, paddingVertical: 12 },
  rowBetween:{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  flex1:     { flex: 1 },
  itemIsm:   { fontSize: T.md, fontWeight: "800", color: C.text },
  itemIzoh:  { fontSize: T.sm, color: C.sub, marginTop: 2 },
  itemSana:  { fontSize: T.xs, color: C.muted, marginTop: 2 },
  itemSumma: { fontSize: T.md, fontWeight: "900", marginLeft: 8 },
  actions:   { flexDirection: "row", justifyContent: "flex-end", gap: 14, marginTop: 8, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8 },
  actBtn:    { flexDirection: "row", alignItems: "center" },
  actTxt:    { fontSize: T.sm, fontWeight: "800" },
  gap10:     { height: 10 },
  gap12:     { height: 12 },

  // Modal
  modalTitle: { fontSize: T.lg, fontWeight: "900", color: C.text, marginBottom: 12 },
  formScroll: { maxHeight: 400 },
  inputLabel: { fontSize: T.xs, color: C.muted, fontWeight: "700", marginBottom: 6, marginTop: 4, letterSpacing: 0.3 },
  input:     { borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  inputMulti:{ minHeight: 64, textAlignVertical: "top" },
  preview:   { marginTop: 12, backgroundColor: C.green + "12", borderWidth: 1, borderColor: C.green + "40", borderRadius: 12, padding: 12 },
  previewTitle: { fontSize: T.xs, color: C.muted, fontWeight: "700", marginBottom: 8, letterSpacing: 0.3 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  previewLabel: { fontSize: T.sm, color: C.sub },
  previewVal: { fontSize: T.md, fontWeight: "900", color: C.text },
  modalRow:  { flexDirection: "row", gap: 10 },
});
