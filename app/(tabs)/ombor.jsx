// "Ombor" ekrani — mavjud zaxira + "Yangi set kiritish" modali.
import { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { Modal } from "../../src/components/Modal";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { ExpandableCard } from "../../src/components/ExpandableCard";
import { C, T, S, R } from "../../src/theme";
import { omborBalans, zaxiraMatni, omborKattaBirlik } from "../../src/logic/hisob";
import { OMBOR_MAYDONLAR } from "../../src/logic/konstantalar";

// Har bir mahsulot id'si uchun bo'sh maydon (konstantalarga mos)
const boshForma = () => Object.fromEntries(OMBOR_MAYDONLAR.map((m) => [m.id, ""]));

export default function Ombor() {
  const { omborlar, setOmborlar, omborSorovlar, setOmborSorovlar, omborTasdiqlar, setOmborTasdiqlar } = useApp();

  const [modalOchiq, setModalOchiq] = useState(false);
  const [forma, setForma] = useState(boshForma());

  const balans = useMemo(() => omborBalans(omborlar), [omborlar]);
  const setSoni = (omborlar || []).filter((h) => h.turi === "yangiset").length;

  // So'rovnomani tasdiqlash — xomashyo ombordan AYRILADI (manfiy xarajat yozuvi)
  // + "Tasdiqlangan" tarixiga yoziladi (30 kunda o'chadi).
  const tasdiqlaSorov = (sorov) => {
    const sana = new Date().toISOString().split("T")[0];
    const entry = {
      id: Date.now(), sana, vaqt: Date.now(), turi: "xarajat", manba: sorov.manba,
      maydonlar: (sorov.maydonlar || []).map((m) => ({ ...m, qiymat: -(parseFloat(m.qiymat) || 0) })),
    };
    setOmborlar((prev) => [entry, ...prev]);
    setOmborTasdiqlar((prev) => [{ id: Date.now() + 1, sana, vaqt: Date.now(), manba: sorov.manba, maydonlar: sorov.maydonlar }, ...(prev || [])]);
    setOmborSorovlar((prev) => (prev || []).filter((s) => s.id !== sorov.id));
  };

  const radEtSorov = (sorov) =>
    Alert.alert("Rad etish", "Bu so'rovnomani rad etasizmi? Xomashyo ayrilmaydi.", [
      { text: "Bekor", style: "cancel" },
      { text: "Rad etish", style: "destructive", onPress: () => setOmborSorovlar((prev) => (prev || []).filter((s) => s.id !== sorov.id)) },
    ]);

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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={true}>
        <ScreenHeader eyebrow="Zaxira" title="Ombor hisoboti" subtitle={`${setSoni} ta set kiritilgan`} icon="server-outline" />

        <Card accent>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cube-outline" size={18} color={C.sub} />
            <Text style={styles.cardTitle}>Mavjud zaxira</Text>
          </View>
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

        {(omborSorovlar || []).length > 0 && (
          <>
            <View style={styles.secHead}>
              <Ionicons name="documents-outline" size={15} color={C.sub} />
              <Text style={styles.secTitle}>OMBOR SO'ROVNOMALARI</Text>
              <Text style={styles.secCount}>{omborSorovlar.length} ta</Text>
            </View>
            {omborSorovlar.map((sorov) => (
              <Card key={sorov.id} style={styles.sorov}>
                <View style={styles.sorovHead}>
                  <View style={styles.flex1}>
                    <Text style={styles.sorovManba}>{sorov.manba}</Text>
                    <Text style={styles.muted}>{sorov.sana} · ketadigan xomashyo</Text>
                  </View>
                  <Pressable accessibilityLabel="Rad etish" onPress={() => radEtSorov(sorov)} hitSlop={8} style={styles.radBtn}>
                    <Ionicons name="close-outline" size={18} color={C.muted} />
                  </Pressable>
                </View>
                <View style={styles.sorovList}>
                  {sorov.maydonlar.map((m) => (
                    <View key={m.id} style={styles.sorovRow}>
                      <Text style={styles.sorovNom} numberOfLines={1}>{m.emoji} {m.nom}</Text>
                      <Text style={styles.sorovVal}>− {zaxiraMatni(m.id, m.qiymat, m.birlik)}</Text>
                    </View>
                  ))}
                </View>
                <Btn onPress={() => tasdiqlaSorov(sorov)} icon="checkmark-outline">Tasdiqlash va chiqarish</Btn>
              </Card>
            ))}
            <View style={styles.gap14} />
          </>
        )}

        <View style={styles.gap14} />
        <Btn color={C.blue} onPress={ochModal} icon="add-outline">Yangi set kiritish</Btn>

        {(omborTasdiqlar || []).length > 0 && (
          <>
            <View style={styles.secHead}>
              <Ionicons name="checkmark-done-outline" size={15} color={C.sub} />
              <Text style={styles.secTitle}>TASDIQLANGAN (30 kun)</Text>
              <Text style={styles.secCount}>{omborTasdiqlar.length} ta</Text>
            </View>
            {omborTasdiqlar.map((t) => (
              <ExpandableCard
                key={t.id}
                style={styles.sorov}
                header={
                  <View style={styles.flex1}>
                    <Text style={styles.sorovManba}>{t.manba}</Text>
                    <Text style={styles.muted}>{t.sana} · chiqarilgan xomashyo</Text>
                  </View>
                }
              >
                {(t.maydonlar || []).map((m) => (
                  <View key={m.id} style={styles.sorovRow}>
                    <Text style={styles.sorovNom} numberOfLines={1}>{m.emoji} {m.nom}</Text>
                    <Text style={styles.sorovVal}>− {zaxiraMatni(m.id, m.qiymat, m.birlik)}</Text>
                  </View>
                ))}
              </ExpandableCard>
            ))}
          </>
        )}
      </ScrollView>

      {/* Yangi set kiritish modali */}
      <Modal modalVisible={modalOchiq} onClose={yopModal}>
        <View style={styles.modalHead}>
          <Ionicons name="add-circle-outline" size={20} color={C.sub} />
          <Text style={styles.modalTitle}>Yangi keltirilgan set</Text>
        </View>

        <ScrollView
          style={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
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
  scroll:    { padding: S[5], paddingBottom: S[8] },
  gap10:     { height: S[3] },
  gap12:     { height: S[3] },
  gap14:     { height: S[4] },
  cardTitleRow:{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[1] },
  cardTitle: { fontSize: T.md, fontWeight: "700", color: C.text },
  muted:     { fontSize: T.sm, color: C.sub },

  grid:      { flexDirection: "row", flexWrap: "wrap", gap: S[2] },
  cell:      { width: "100%", backgroundColor: C.surface, borderWidth: 1, borderColor: C.borderSoft, borderRadius: R.sm, paddingVertical: S[3], paddingHorizontal: S[4], flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cellNom:   { fontSize: T.sm, color: C.sub, fontWeight: "600", flexShrink: 1 },
  cellVal:   { fontSize: T.sm, fontWeight: "700", marginLeft: S[2] },

  // So'rovnomalar
  secHead:   { flexDirection: "row", alignItems: "center", gap: 6, marginTop: S[6], marginBottom: S[3] },
  secTitle:  { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1, flex: 1 },
  secCount:  { fontSize: T.sm, color: C.sub, fontWeight: "700" },
  sorov:     { marginBottom: S[3] },
  sorovHead: { flexDirection: "row", alignItems: "flex-start", marginBottom: S[3] },
  sorovManba:{ fontSize: T.md, fontWeight: "800", color: C.text },
  radBtn:    { padding: 4 },
  sorovList: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3], marginBottom: S[3] },
  sorovRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[2] },
  sorovNom:  { fontSize: T.sm, color: C.text, flex: 1 },
  sorovVal:  { fontSize: T.sm, fontWeight: "800", color: C.red, marginLeft: S[2] },

  // Modal
  modalHead:  { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[3] },
  modalTitle: { fontSize: T.lg, fontWeight: "800", color: C.text },
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
