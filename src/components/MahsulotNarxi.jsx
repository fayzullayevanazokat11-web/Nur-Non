// "Xomashyo" — har bir xomashyo narxi (qancha miqdor = qancha so'm).
// Yangi ingredient: mahsulot narxi va necha kg (litr) ekani kiritiladi — 1 kg (1 litr)
// narxini tizim o'zi topadi. Har xomashyoda ikonka (yangilarida tanlanadi).
// Bu narxlar Assortimentdagi non foydasi hisobiga ulanadi.
import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import { useTiklash } from "./useTiklash";
import { Card } from "./Card";
import { Btn } from "./Btn";
import { ExpandableCard, yopKartalar } from "./ExpandableCard";
import { OMBOR_MAYDONLAR, xomashyoRoyxati } from "../logic/konstantalar";
import { formatSom } from "../logic/hisob";
import { C, T, S, R, temaStil } from "../theme";
import { XomashyoIkon, IKON_TANLOV, IkonTanlov, BosiladiganIkon, xomashyoIkonKaliti } from "./XomashyoIkon";

const baseUnit = (birlik) => (birlik === "litr" ? "ml" : "g");
const ASOSIY_IDLAR = new Set(OMBOR_MAYDONLAR.map((m) => m.id));

export function Xomashyo() {
  const { mahsulotNarxlari, setMahsulotNarxlari, customMahsulotlar, setCustomMahsulotlar, ochirArxivga, xomashyoIkonlari, xomashyoIkonQoy } = useApp();
  const royxat = xomashyoRoyxati(customMahsulotlar);
  // Ikonka bosilsa — shu kartaning o'zida tanlov ochiladi
  const [ikonOchiq, setIkonOchiq] = useState(null);
  useTiklash(() => setIkonOchiq(null));
  const ikonAlmash = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
    setIkonOchiq((o) => (o === id ? null : id));
  };

  const BOSH_F = { nom: "", birlik: "kg", narx: "", miqdor: "", ikon: "package-variant-closed" };
  const [forma, setForma] = useState(BOSH_F);
  const sonF = (x) => parseFloat(String(x || "").replace(",", ".").replace(/\s/g, "")) || 0;
  const birKgNarx = sonF(forma.miqdor) > 0 ? sonF(forma.narx) / sonF(forma.miqdor) : 0;
  const yangilaF = (k, v) => setForma((p) => ({ ...p, [k]: v }));

  const yangilaNarx = (id, key, v) =>
    setMahsulotNarxlari((p) => ({ ...p, [id]: { ...(p[id] || {}), [key]: v } }));

  // Yangi ingredient: "N kg (litr) = X so'm" — baza birlikda (g/ml) saqlanadi:
  // miqdor = N × 1000, narx = X. 1 kg narxi = X ÷ N (tizim o'zi hisoblaydi).
  const qoshIngredient = () => {
    const nom = forma.nom.trim();
    const narx = sonF(forma.narx);
    const miqdor = sonF(forma.miqdor);
    if (!nom || narx <= 0 || miqdor <= 0) {
      Alert.alert("To'liq emas", `Ingredient nomi, mahsulot narxi va necha ${forma.birlik} ekanini kiriting.`);
      return;
    }
    const id = "x_" + Date.now();
    setCustomMahsulotlar((prev) => [...(prev || []), { id, nom, birlik: forma.birlik, ikon: forma.ikon }]);
    setMahsulotNarxlari((p) => ({ ...p, [id]: { miqdor: String(Math.round(miqdor * 1000)), narx: String(Math.round(narx)) } }));
    setForma(BOSH_F);
    yopKartalar(); // qo'shilgandan keyin forma yopiladi
  };

  const ochirIngredient = (id) =>
    Alert.alert("O'chirish", "Bu ingredientni o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      {
        text: "Ha", style: "destructive", onPress: () => {
          // Tarixdagilar'ga: qaytarilsa narxi ham tiklanadi
          ochirArxivga("ingredient", id, { narx: mahsulotNarxlari[id] });
          setMahsulotNarxlari((p) => { const c = { ...p }; delete c[id]; return c; });
        },
      },
    ]);

  return (
    <View>
      <Card accent style={styles.hint}>
        <View style={styles.hintRow}>
          <Ionicons name="bulb-outline" size={16} color={C.sub} style={styles.hintIcon} />
          <Text style={styles.hintTxt}>
            Har bir xomashyo uchun <Text style={styles.bold}>qancha miqdori = qancha so'm</Text> ekanini kiriting.
            Assortimentda gramm kiritilganda narx <Text style={styles.bold}>avtomatik</Text> hisoblanadi.
            Ikonkani o'zgartirish uchun uning ustiga bosing.
          </Text>
        </View>
      </Card>

      <ExpandableCard
        style={styles.qoshCard}
        header={
          <View style={styles.qoshHead}>
            <Ionicons name="add-circle-outline" size={18} color={C.sub} />
            <Text style={styles.qoshTitle}>Yangi ingredient qo'shish</Text>
          </View>
        }
      >
        <Text style={styles.lbl2}>Nomi *</Text>
        <TextInput value={forma.nom} onChangeText={(v) => yangilaF("nom", v)} placeholder="Masalan: Kunjut" placeholderTextColor={C.muted} style={styles.input} />

        <Text style={styles.lbl2}>O'lchov birligi</Text>
        <View style={styles.unitRow}>
          {["kg", "litr"].map((u) => (
            <Pressable key={u} onPress={() => yangilaF("birlik", u)} style={[styles.unitBtn, forma.birlik === u && styles.unitBtnActive]}>
              <Text style={[styles.unitTxt, forma.birlik === u && styles.unitTxtActive]}>{u}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.lbl2}>Ikonka</Text>
        <View style={styles.ikonlar}>
          {IKON_TANLOV.map((k) => (
            <Pressable
              key={k}
              accessibilityLabel={`Ikonka: ${k}`}
              accessibilityState={{ selected: forma.ikon === k }}
              onPress={() => yangilaF("ikon", k)}
              style={[styles.ikonBtn, forma.ikon === k && styles.ikonBtnActive]}
            >
              <XomashyoIkon ikon={k} size={22} color={forma.ikon === k ? C.onAccent : C.sub} />
            </Pressable>
          ))}
        </View>

        <View style={styles.inputs}>
          <View style={styles.col}>
            <Text style={styles.lbl2}>Mahsulot narxi (so'm) *</Text>
            <TextInput value={forma.narx} onChangeText={(v) => yangilaF("narx", v)} placeholder="Masalan: 120000" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
          </View>
          <View style={styles.col}>
            <Text style={styles.lbl2}>Necha {forma.birlik} *</Text>
            <TextInput value={forma.miqdor} onChangeText={(v) => yangilaF("miqdor", v)} placeholder="Masalan: 25" placeholderTextColor={C.muted} keyboardType="decimal-pad" style={styles.input} />
          </View>
        </View>
        {birKgNarx > 0 && (
          <View style={styles.natija}>
            <Ionicons name="calculator-outline" size={15} color={C.accent} />
            <Text style={styles.natijaTxt}>1 {forma.birlik} = <Text style={styles.bold}>{formatSom(Math.round(birKgNarx))} so'm</Text></Text>
          </View>
        )}

        <View style={styles.qoshActions}>
          <Btn onPress={qoshIngredient}>Qo'shish</Btn>
        </View>
      </ExpandableCard>
      <View style={styles.gap} />

      {royxat.map((m) => {
        const p = mahsulotNarxlari[m.id] || {};
        const miqdor = parseFloat(p.miqdor) || 0;
        const narx = parseFloat(p.narx) || 0;
        const unit = baseUnit(m.birlik);
        const perUnit = miqdor > 0 ? narx / miqdor : 0;
        const kiritilgan = miqdor > 0 && narx > 0;
        const custom = !ASOSIY_IDLAR.has(m.id);
        return (
          <Card key={m.id} style={styles.item}>
            <View style={styles.head}>
              <View style={styles.headLeft}>
                <BosiladiganIkon label={`${m.nom}: ikonkani o'zgartirish`} ochiq={ikonOchiq === m.id} onPress={() => ikonAlmash(m.id)}>
                  <XomashyoIkon m={m} quti size={22} qutiSize={44} />
                </BosiladiganIkon>
                <View style={styles.flex1}>
                  <Text style={styles.nom}>{m.nom}</Text>
                  <Text style={styles.sub}>{unit} bilan o'lchanadi</Text>
                </View>
              </View>
              <View style={styles.headRight}>
                <Text style={styles.per}>1 {m.birlik === "litr" ? "litr" : "kg"} = {perUnit ? formatSom(Math.round(perUnit * 1000)) : "0"} so'm</Text>
                <View style={styles.badge}>
                  <Ionicons name={kiritilgan ? "checkmark-circle-outline" : "ellipse-outline"} size={12} color={kiritilgan ? C.sub : C.muted} />
                  <Text style={kiritilgan ? styles.badgeTxt : styles.badgeNo}> {kiritilgan ? "Narx kiritilgan" : "Narx kiritilmagan"}</Text>
                </View>
              </View>
            </View>
            {ikonOchiq === m.id && (
              <IkonTanlov
                sarlavha={`${m.nom} — ikonka`}
                variantlar={IKON_TANLOV}
                tanlangan={xomashyoIkonKaliti(m, xomashyoIkonlari)}
                onTanla={(k) => xomashyoIkonQoy(m.id, k)}
                onYop={() => ikonAlmash(m.id)}
              />
            )}

            <View style={styles.inputs}>
              <View style={styles.col}>
                <Text style={styles.lbl}>MIQDORI ({unit.toUpperCase()})</Text>
                <TextInput value={p.miqdor ?? ""} onChangeText={(v) => yangilaNarx(m.id, "miqdor", v)} keyboardType="numeric" placeholder="0" placeholderTextColor={C.muted} style={styles.input} />
              </View>
              <View style={styles.col}>
                <Text style={styles.lbl}>NARXI (SO'M)</Text>
                <TextInput value={p.narx ?? ""} onChangeText={(v) => yangilaNarx(m.id, "narx", v)} keyboardType="numeric" placeholder="0" placeholderTextColor={C.muted} style={styles.input} />
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.example}>
                <Ionicons name="bulb-outline" size={13} color={C.muted} />
                <Text style={styles.exTxt}> Misol: retseptda 100{unit} → <Text style={styles.exBold}>{formatSom(Math.round(perUnit * 100))} so'm</Text></Text>
              </View>
              {custom && (
                <Pressable onPress={() => ochirIngredient(m.id)} hitSlop={8} style={styles.delBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                </Pressable>
              )}
            </View>
          </Card>
        );
      })}

    </View>
  );
}

// Eski nom bilan ham ishlashi uchun (ishlab.jsx import)
export const MahsulotNarxi = Xomashyo;

const styles = temaStil(() => StyleSheet.create({
  hint:      { marginBottom: S[4] },
  hintRow:   { flexDirection: "row", gap: S[2] },
  hintIcon:  { marginTop: 1 },
  hintTxt:   { flex: 1, fontSize: T.sm, color: C.sub, lineHeight: 20 },
  bold:      { fontWeight: "800", color: C.text },
  gap:       { height: S[3] },

  item:      { marginBottom: S[3] },
  head:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: S[3] },
  headLeft:  { flexDirection: "row", alignItems: "center", gap: S[2], flex: 1 },

  flex1:     { flex: 1 },
  nom:       { fontSize: T.md, fontWeight: "800", color: C.text },
  sub:       { fontSize: T.xs, color: C.muted, marginTop: 1 },
  headRight: { alignItems: "flex-end" },
  per:       { fontSize: T.sm, fontWeight: "800", color: C.text },
  badge:     { flexDirection: "row", alignItems: "center", marginTop: 2 },
  badgeTxt:  { fontSize: 11, color: C.sub, fontWeight: "600" },
  badgeNo:   { fontSize: 11, color: C.muted, fontWeight: "600" },

  inputs:    { flexDirection: "row", gap: S[3] },
  col:       { flex: 1 },
  lbl:       { fontSize: 10, color: C.sub, fontWeight: "700", letterSpacing: 0.4, marginBottom: 5 },
  input:     { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, fontWeight: "700", color: C.text, backgroundColor: C.surface },

  footer:    { flexDirection: "row", alignItems: "center", gap: S[2], marginTop: S[3] },
  example:   { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.borderSoft, borderRadius: R.sm, paddingVertical: S[2], paddingHorizontal: S[3] },
  exTxt:     { fontSize: T.xs, color: C.sub },
  exBold:    { fontWeight: "800", color: C.text },
  delBtn:    { padding: 8 },

  // Inline forma
  qoshCard:   { marginBottom: 0 },
  qoshHead:   { flexDirection: "row", alignItems: "center", gap: S[2] },
  qoshTitle:  { fontSize: T.md, fontWeight: "800", color: C.text },
  qoshActions:{ marginTop: S[3] },
  lbl2:       { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[2], letterSpacing: 0.3 },
  unitRow:    { flexDirection: "row", gap: S[2] },
  unitBtn:    { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  unitBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  unitTxt:    { fontSize: T.md, fontWeight: "700", color: C.sub },
  unitTxtActive: { color: C.onAccent },
  ikonlar:    { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  ikonBtn:    { width: 42, height: 42, borderRadius: R.sm, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.borderSoft, backgroundColor: C.surface },
  ikonBtnActive:{ backgroundColor: C.accent, borderColor: C.accent },
  natija:     { flexDirection: "row", alignItems: "center", gap: 6, marginTop: S[3], backgroundColor: C.accent + "12", borderRadius: R.sm, paddingVertical: S[2], paddingHorizontal: S[3] },
  natijaTxt:  { fontSize: T.sm, color: C.text },
}));
