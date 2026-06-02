// "Xodimlar" — ishchi qo'shish/tahrirlash. Haq turi: kunlik yoki qoplik
// (qoplik bo'lsa bir nechta non turi tanlanib, har qaysi non qopidan narx kiritiladi).
import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { Modal } from "../../src/components/Modal";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { ExpandableCard } from "../../src/components/ExpandableCard";
import { ScrollBox } from "../../src/components/ScrollBox";
import { DateField } from "../../src/components/DateField";
import { Avatar } from "../../src/components/Avatar";
import { C, T, S, R } from "../../src/theme";
import { formatSom } from "../../src/logic/hisob";
import { LAVOZIMLAR, getLavozimLabel } from "../../src/logic/konstantalar";

const BOSH_FORMA = { ism: "", lavozimId: LAVOZIMLAR[0].id, lavozimCustom: "", haqTuri: "kunlik", miqdor: "", nonNarx: {}, holat: "Aktiv", tatilSana: "" };
const HOLATLAR = ["Aktiv", "Ta'tilda"];

export default function Xodimlar() {
  const { ishchilar, setIshchilar, nonlar } = useApp();
  const ozNonlar = (nonlar || []).filter((n) => n.ozIshlab !== false);

  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirId, setTahrirId] = useState(null);
  const [forma, setForma] = useState(BOSH_FORMA);

  const aktiv = (ishchilar || []).filter((w) => w.holat === "Aktiv");

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const yangilaNon = (nom, v) => setForma((p) => ({ ...p, nonNarx: { ...p.nonNarx, [nom]: v } }));

  const ochYangi = () => { setForma(BOSH_FORMA); setTahrirId(null); setModalOchiq(true); };
  const ochTahrir = (w) => {
    const nonNarx = {};
    Object.entries(w.nonNarxlari || {}).forEach(([nom, narx]) => { nonNarx[nom] = String(narx); });
    setForma({
      ism: w.ism, lavozimId: w.lavozimId, lavozimCustom: w.lavozimCustom || "",
      haqTuri: w.haqTuri || "kunlik",
      miqdor: String(w.miqdor || ""), nonNarx, holat: w.holat || "Aktiv",
      tatilSana: w.tatilQaytishSana || "",
    });
    setTahrirId(w.id); setModalOchiq(true);
  };
  const yopModal = () => setModalOchiq(false);

  const saqla = () => {
    if (!forma.ism.trim()) {
      Alert.alert("Ism kiritilmagan", "Iltimos, xodim ismini kiriting.");
      return;
    }
    if (forma.lavozimId === "boshqasi" && !forma.lavozimCustom.trim()) {
      Alert.alert("Lavozim kiritilmagan", "Iltimos, lavozim nomini kiriting.");
      return;
    }
    let qoshimcha;
    if (forma.haqTuri === "qop") {
      const nonNarxlari = {};
      const nonTurlari = [];
      Object.entries(forma.nonNarx).forEach(([nom, narx]) => {
        const n = parseFloat(narx) || 0;
        if (n > 0) { nonNarxlari[nom] = n; nonTurlari.push(nom); }
      });
      qoshimcha = { haqTuri: "qop", miqdor: 0, nonTurlari, nonNarxlari };
    } else {
      qoshimcha = { haqTuri: "kunlik", miqdor: parseFloat(forma.miqdor) || 0, nonTurlari: [], nonNarxlari: {} };
    }
    const asos = {
      ism: forma.ism.trim(), lavozimId: forma.lavozimId,
      lavozimCustom: forma.lavozimId === "boshqasi" ? forma.lavozimCustom.trim() : "",
      holat: forma.holat,
      tatilQaytishSana: forma.holat === "Ta'tilda" ? forma.tatilSana : "",
      ...qoshimcha,
    };
    if (tahrirId) {
      setIshchilar((prev) => prev.map((w) => (w.id === tahrirId ? { ...w, ...asos } : w)));
    } else {
      setIshchilar((prev) => [...prev, { id: Date.now(), tel: "", tatilQaytishSana: "", tahrirSoni: 0, ...asos }]);
    }
    yopModal();
  };

  const ochir = (id) =>
    Alert.alert("O'chirish", "Bu xodimni o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => setIshchilar((p) => p.filter((w) => w.id !== id)) },
    ]);

  // Ta'tildagi xodimni darhol Aktivga o'tkazish (qaytish sanasi tozalanadi).
  const tatildanQaytar = (w) =>
    Alert.alert("Ta'tildan qaytdi", `${w.ism} ta'tildan qaytdimi? Holati Aktivga o'tkaziladi.`, [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", onPress: () => setIshchilar((p) => p.map((x) => x.id === w.id ? { ...x, holat: "Aktiv", tatilQaytishSana: "" } : x)) },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <ScreenHeader eyebrow="Jamoa" title="Xodimlar" image={require("../../assets/tabicons/xodimlar.png")} />

        <View style={styles.statsRow}>
          <Card style={styles.statTile}>
            <Ionicons name="people-circle-outline" size={16} color={C.sub} style={styles.statIcon} />
            <Text style={styles.statLabel}>AKTIV XODIMLAR</Text>
            <Text style={[styles.statValue, { color: C.text }]}>{aktiv.length}</Text>
            <Text style={styles.statUnit}>nafar</Text>
          </Card>
        </View>

        <View style={styles.gap14} />
        <Btn onPress={ochYangi} icon="person-add-outline">Yangi ishchi kiritish</Btn>
        <View style={styles.gap14} />

        {(ishchilar || []).length === 0 ? (
          <Card><Text style={styles.muted}>Xodimlar hali kiritilmagan</Text></Card>
        ) : (
          ishchilar.map((w) => {
            const qop = w.haqTuri === "qop";
            const nonlarRo = Object.entries(w.nonNarxlari || {});
            return (
              <ExpandableCard
                key={w.id}
                style={styles.item}
                header={
                  <View style={styles.left}>
                    <Avatar name={w.ism} />
                    <View style={styles.flex1}>
                      <Text style={styles.ism}>{w.ism}</Text>
                      <Text style={styles.lavozim}>{getLavozimLabel(w)}</Text>
                    </View>
                    {w.holat === "Ta'tilda" && (
                      <View style={styles.tatilBadge}>
                        <Ionicons name="airplane-outline" size={12} color={C.accent} />
                        <Text style={styles.tatilBadgeTxt}>Ta'tilda</Text>
                      </View>
                    )}
                  </View>
                }
              >
                <View style={styles.bodyTop}>
                  <View style={[styles.statePill, { backgroundColor: (w.holat === "Aktiv" ? C.green : C.accent) + "14" }]}>
                    {w.holat === "Ta'tilda" && <Ionicons name="airplane-outline" size={12} color={C.accent} />}
                    <Text style={[styles.stateTxt, { color: w.holat === "Aktiv" ? C.green : C.accent }]}>{w.holat}</Text>
                  </View>
                  <Text style={styles.haq}>{qop ? "Qoplik" : `${formatSom(w.miqdor)} so'm/kun`}</Text>
                </View>
                {w.holat === "Ta'tilda" && w.tatilQaytishSana ? (
                  <Text style={styles.tatil}>Ta'tildan qaytadi: {w.tatilQaytishSana}</Text>
                ) : null}
                {qop && nonlarRo.length > 0 && (
                  <View style={styles.haqWrap}>
                    {nonlarRo.map(([nom, narx]) => (
                      <View key={nom} style={styles.haqRow}>
                        <Text style={styles.haqNom} numberOfLines={1}>{nom}</Text>
                        <Text style={styles.haqVal}>{formatSom(narx)} so'm/qop</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.bodyActions}>
                  {w.holat === "Ta'tilda" && (
                    <Pressable accessibilityLabel="Ta'tildan qaytdi" onPress={() => tatildanQaytar(w)} hitSlop={8} style={styles.actBtn}>
                      <Ionicons name="checkmark-circle-outline" size={16} color={C.green} />
                      <Text style={[styles.actTxt, { color: C.green }]}> Ta'tildan qaytdi</Text>
                    </Pressable>
                  )}
                  <Pressable accessibilityLabel="Tahrirlash" onPress={() => ochTahrir(w)} hitSlop={8} style={styles.actBtn}>
                    <Ionicons name="create-outline" size={16} color={C.accent} />
                    <Text style={[styles.actTxt, { color: C.accent }]}> Tahrirlash</Text>
                  </Pressable>
                  <Pressable accessibilityLabel="O'chirish" onPress={() => ochir(w.id)} hitSlop={8} style={styles.actBtn}>
                    <Ionicons name="trash-outline" size={16} color={C.red} />
                    <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                  </Pressable>
                </View>
              </ExpandableCard>
            );
          })
        )}
      </ScrollBox>

      {/* Qo'shish / Tahrirlash modali */}
      <Modal modalVisible={modalOchiq} onClose={yopModal}>
        <View style={styles.modalHead}>
          <Ionicons name={tahrirId ? "create-outline" : "person-add-outline"} size={20} color={C.sub} />
          <Text style={styles.modalTitle}>{tahrirId ? "Xodimni tahrirlash" : "Yangi ishchi"}</Text>
        </View>

        <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
          <Text style={styles.inputLabel}>Ism *</Text>
          <TextInput value={forma.ism} onChangeText={(v) => yangila("ism", v)} placeholder="Masalan: Akmal aka" placeholderTextColor={C.muted} style={styles.input} />

          <Text style={styles.inputLabel}>Lavozim</Text>
          <View style={styles.lavGrid}>
            {LAVOZIMLAR.map((lav) => {
              const tanlangan = forma.lavozimId === lav.id;
              return (
                <Pressable key={lav.id} onPress={() => yangila("lavozimId", lav.id)} style={[styles.lavBtn, tanlangan && styles.lavBtnActive]}>
                  <Ionicons name={tanlangan ? "checkmark-circle-outline" : "ellipse-outline"} size={16} color={tanlangan ? C.accent : C.muted} />
                  <Text style={[styles.lavLabel, tanlangan && styles.lavLabelActive]} numberOfLines={1}>{lav.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {forma.lavozimId === "boshqasi" && (
            <>
              <Text style={styles.inputLabel}>Lavozim nomi *</Text>
              <TextInput
                value={forma.lavozimCustom}
                onChangeText={(v) => yangila("lavozimCustom", v)}
                placeholder="Masalan: Yetkazib beruvchi"
                placeholderTextColor={C.muted}
                style={styles.input}
              />
            </>
          )}

          <Text style={styles.inputLabel}>Haq turi</Text>
          <View style={styles.turRow}>
            <Pressable style={[styles.turBtn, forma.haqTuri === "kunlik" && styles.turBtnActive]} onPress={() => yangila("haqTuri", "kunlik")}>
              <Text style={[styles.turTxt, forma.haqTuri === "kunlik" && styles.turTxtActive]}>Kunlik</Text>
            </Pressable>
            <Pressable style={[styles.turBtn, forma.haqTuri === "qop" && styles.turBtnActive]} onPress={() => yangila("haqTuri", "qop")}>
              <Text style={[styles.turTxt, forma.haqTuri === "qop" && styles.turTxtActive]}>Qoplik</Text>
            </Pressable>
          </View>

          {forma.haqTuri === "kunlik" ? (
            <>
              <Text style={styles.inputLabel}>Kunlik haq (so'm)</Text>
              <TextInput value={forma.miqdor} onChangeText={(v) => yangila("miqdor", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Qaysi nondan qancha (1 qop, so'm)</Text>
              {ozNonlar.length === 0 ? (
                <Text style={styles.muted}>Avval o'zimizniki non turi qo'shing.</Text>
              ) : (
                ozNonlar.map((n) => (
                  <View key={n.id} style={styles.nonRow}>
                    <Text style={styles.nonNom} numberOfLines={1}>{n.nom}</Text>
                    <TextInput value={forma.nonNarx[n.nom] ?? ""} onChangeText={(v) => yangilaNon(n.nom, v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.nonInput} />
                  </View>
                ))
              )}
            </>
          )}

          <Text style={styles.inputLabel}>Holat</Text>
          <View style={styles.holatRow}>
            {HOLATLAR.map((h) => {
              const tanlangan = forma.holat === h;
              return (
                <Pressable key={h} onPress={() => yangila("holat", h)} style={[styles.holatBtn, tanlangan && styles.holatBtnActive]}>
                  <Text style={[styles.holatTxt, tanlangan && styles.holatTxtActive]}>{h}</Text>
                </Pressable>
              );
            })}
          </View>

          {forma.holat === "Ta'tilda" && (
            <>
              <Text style={styles.inputLabel}>Ta'tildan qaytish sanasi</Text>
              <DateField value={forma.tatilSana} onChange={(v) => yangila("tatilSana", v)} />
              <Text style={styles.hintSm}>Ta'tilda bo'lsa kunlik ish haqi hisoblanmaydi.</Text>
            </>
          )}
        </ScrollView>

        <View style={styles.gap12} />
        <View style={styles.modalRow}>
          <View style={styles.flex1}><Btn secondary onPress={yopModal}>Bekor</Btn></View>
          <View style={styles.flex1}><Btn onPress={saqla}>Saqlash</Btn></View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: S[5], paddingBottom: S[8] },
  statsRow:  { flexDirection: "row", gap: S[2] },
  statTile:  { flex: 1, paddingVertical: S[3], paddingHorizontal: S[3] },
  statIcon:  { marginBottom: S[1] },
  statLabel: { fontSize: 9, color: C.muted, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: S[2] },
  statValue: { fontSize: 26, fontWeight: "800", letterSpacing: -0.3 },
  statUnit:  { fontSize: 10, color: C.muted, marginTop: 2 },
  gap12:     { height: S[3] },
  gap14:     { height: S[4] },
  item:      { marginBottom: S[3] },
  left:      { flexDirection: "row", alignItems: "center", gap: S[3], flex: 1 },
  flex1:     { flex: 1 },
  ism:       { fontSize: T.md, fontWeight: "700", color: C.text },
  lavozim:   { fontSize: T.sm, color: C.sub, marginTop: 1 },
  bodyTop:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 3, paddingHorizontal: 10, borderRadius: R.pill },
  stateTxt:  { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
  tatilBadge:{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.accent + "14", paddingVertical: 3, paddingHorizontal: 8, borderRadius: R.pill },
  tatilBadgeTxt: { fontSize: 10, fontWeight: "700", color: C.accent, letterSpacing: 0.2 },
  haq:       { fontSize: T.sm, fontWeight: "800", color: C.accent },
  tatil:     { fontSize: T.xs, color: C.muted, marginTop: 6 },
  hintSm:    { fontSize: 11, color: C.muted, marginTop: 5 },
  haqWrap:   { marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[2] },
  haqRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  haqNom:    { flex: 1, fontSize: T.sm, color: C.text },
  haqVal:    { fontSize: T.sm, color: C.sub, fontWeight: "700", marginLeft: S[2] },
  muted:     { fontSize: T.sm, color: C.muted },
  bodyActions:{ flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:    { flexDirection: "row", alignItems: "center" },
  actTxt:    { fontSize: T.sm, fontWeight: "700" },

  // Modal
  modalHead:  { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[3] },
  modalTitle: { fontSize: T.lg, fontWeight: "800", color: C.text },
  formScroll: { maxHeight: 440 },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[2], letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  lavGrid:   { flexDirection: "row", flexWrap: "wrap", gap: S[2] },
  lavBtn: { width: "47%", flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 11, backgroundColor: "transparent" },
  lavBtnActive: { borderColor: C.accent, backgroundColor: C.accent + "0D" },
  lavLabel:     { fontSize: T.sm, color: C.sub, fontWeight: "600", flexShrink: 1 },
  lavLabelActive: { color: C.accent, fontWeight: "700" },
  turRow:    { flexDirection: "row", gap: S[2] },
  turBtn:    { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  turBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  turTxt:    { fontSize: T.sm, fontWeight: "700", color: C.sub },
  turTxtActive: { color: "#FFF3E8" },
  nonRow:    { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  nonNom:    { flex: 1, fontSize: T.sm, color: C.text },
  nonInput:  { width: 120, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 9, paddingHorizontal: 12, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  holatRow:  { flexDirection: "row", gap: S[2] },
  holatBtn:  { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, alignItems: "center" },
  holatBtnActive: { borderColor: C.accent, backgroundColor: C.accent + "0D" },
  holatTxt:  { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  holatTxtActive: { color: C.accent, fontWeight: "700" },
  modalRow:  { flexDirection: "row", gap: S[3] },
});
