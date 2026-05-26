// "Ombor" ekrani — mavjud zaxira + "Yangi set kiritish" modali.
import { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { Modal } from "../../src/components/Modal";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { C, T, S, R } from "../../src/theme";
import { omborBalans, zaxiraMatni, omborKattaBirlik } from "../../src/logic/hisob";
import { OMBOR_MAYDONLAR } from "../../src/logic/konstantalar";

// Har bir mahsulot id'si uchun bo'sh maydon (konstantalarga mos)
const boshForma = () => Object.fromEntries(OMBOR_MAYDONLAR.map((m) => [m.id, ""]));

export default function Ombor() {
  const { omborlar, setOmborlar } = useApp();

  const [modalOchiq, setModalOchiq] = useState(false);
  const [forma, setForma] = useState(boshForma());

  const balans = useMemo(() => omborBalans(omborlar), [omborlar]);
  const setSoni = (omborlar || []).filter((h) => h.turi === "yangiset").length;

  const ochModal = () => { setForma(boshForma()); setModalOchiq(true); };
  const yopModal = () => setModalOchiq(false);
  const yangila = (id, v) => setForma((p) => ({ ...p, [id]: v }));

  // Saqlash — kiritilgan qiymatlar baza birlikka (qop×50, quti×5) o'tkaziladi.
  // Yangi set avvalgi qoldiqqa QO'SHILADI (balans barcha yozuvlarni yig'adi).
  const saqla = () => {
    const maydonlar = OMBOR_MAYDONLAR.map((m) => {
      const faktor = omborKattaBirlik(m.id)?.faktor || 1;
      const kiritilgan = parseFloat(forma[m.id]) || 0;
      return { id: m.id, nom: m.nom, birlik: m.birlik, emoji: m.emoji, qiymat: kiritilgan * faktor };
    });
    if (!maydonlar.some((m) => m.qiymat > 0)) {
      Alert.alert("Bo'sh set", "Kamida bitta mahsulot miqdorini kiriting.");
      return;
    }
    const entry = {
      id: Date.now(),
      sana: new Date().toISOString().split("T")[0],
      vaqt: Date.now(),
      turi: "yangiset",
      maydonlar,
    };
    setOmborlar((prev) => [entry, ...prev]);
    yopModal();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Zaxira" title="Ombor hisoboti" subtitle={`${setSoni} ta set kiritilgan`} />

        <Card accent>
          <Text style={styles.cardTitle}>Mavjud zaxira</Text>
          <Text style={styles.muted}>Set kirimlari − tasdiqlangan xarajat</Text>
          <View style={styles.gap10} />
          <View style={styles.grid}>
            {balans.map((b) => {
              const matn = zaxiraMatni(b.id, b.qiymat, b.birlik);
              const color = b.qiymat > 0 ? C.green : b.qiymat < 0 ? C.red : C.muted;
              return (
                <View key={b.id} style={styles.cell}>
                  <Text style={styles.cellNom} numberOfLines={1}>{b.nom}</Text>
                  <Text style={[styles.cellVal, { color }]} numberOfLines={1}>{matn}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={styles.gap14} />
        <Btn color={C.blue} onPress={ochModal}>Yangi set kiritish</Btn>
      </ScrollView>

      {/* Yangi set kiritish modali */}
      <Modal modalVisible={modalOchiq} onClose={yopModal}>
        <Text style={styles.modalTitle}>Yangi keltirilgan set</Text>

        <ScrollView
          style={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {OMBOR_MAYDONLAR.map((m) => {
            const katta = omborKattaBirlik(m.id);
            const birlik = katta ? katta.birlik : m.birlik;
            const qty = parseFloat(forma[m.id]) || 0;
            return (
              <View key={m.id} style={styles.field}>
                <Text style={styles.inputLabel}>{m.nom} ({birlik})</Text>
                <TextInput
                  value={forma[m.id]}
                  onChangeText={(v) => yangila(m.id, v)}
                  placeholder={katta ? `Nechta ${birlik}` : "0"}
                  placeholderTextColor={C.muted}
                  keyboardType="numeric"
                  style={styles.input}
                />
                {katta && qty > 0 && (
                  <Text style={styles.hint}>= {qty * katta.faktor} {m.birlik}</Text>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.gap12} />
        <View style={styles.modalRow}>
          <View style={styles.flex1}><Btn secondary onPress={yopModal}>Bekor</Btn></View>
          <View style={styles.flex1}><Btn color={C.blue} onPress={saqla}>Saqlash</Btn></View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: S[4], paddingBottom: S[7] },
  gap10:     { height: S[3] },
  gap12:     { height: S[3] },
  gap14:     { height: S[4] },
  cardTitle: { fontSize: T.md, fontWeight: "700", color: C.text, marginBottom: S[1] },
  muted:     { fontSize: T.sm, color: C.sub },

  grid:      { flexDirection: "row", flexWrap: "wrap", gap: S[2] },
  cell:      { width: "48%", backgroundColor: C.surface, borderRadius: R.sm, paddingVertical: S[2], paddingHorizontal: S[3], flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cellNom:   { fontSize: 10, color: C.sub, fontWeight: "600", flexShrink: 1 },
  cellVal:   { fontSize: T.xs, fontWeight: "700", marginLeft: S[1] },

  // Modal
  modalTitle: { fontSize: T.lg, fontWeight: "800", color: C.text, marginBottom: S[3] },
  formScroll: { maxHeight: 420 },
  field:      { marginBottom: S[3] },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 5, letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: T.md,
    color: C.text,
    backgroundColor: C.surface,
  },
  hint:       { fontSize: 11, color: C.muted, marginTop: 3 },
  flex1:      { flex: 1 },
  modalRow:   { flexDirection: "row", gap: S[3] },
});
