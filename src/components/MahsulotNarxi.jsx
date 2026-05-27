// "Mahsulot narxi" — xomashyo narxlari muharriri.
// Har bir xomashyo uchun: qancha miqdor = qancha so'm. Bu narxlar Assortimentdagi
// tannarx hisobiga (getIngNarx) avtomatik ulanadi.
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import { Card } from "./Card";
import { OMBOR_MAYDONLAR } from "../logic/konstantalar";
import { formatSom } from "../logic/hisob";
import { C, T, S, R } from "../theme";

const baseUnit = (birlik) => (birlik === "litr" ? "ml" : "g");

export function MahsulotNarxi() {
  const { mahsulotNarxlari, setMahsulotNarxlari } = useApp();
  const yangila = (id, key, v) =>
    setMahsulotNarxlari((p) => ({ ...p, [id]: { ...(p[id] || {}), [key]: v } }));

  return (
    <View>
      <Card accent style={styles.hint}>
        <View style={styles.hintRow}>
          <Ionicons name="bulb" size={16} color={C.accent} style={styles.hintIcon} />
          <Text style={styles.hintTxt}>
            Har bir xomashyo uchun <Text style={styles.bold}>qancha miqdori = qancha so'm</Text> ekanini kiriting.
            Assortiment bo'limida gramm kiritganingizda narx <Text style={styles.bold}>avtomatik</Text> hisoblanadi.
          </Text>
        </View>
      </Card>

      {OMBOR_MAYDONLAR.map((m) => {
        const p = mahsulotNarxlari[m.id] || {};
        const miqdor = parseFloat(p.miqdor) || 0;
        const narx = parseFloat(p.narx) || 0;
        const unit = baseUnit(m.birlik);
        const perUnit = miqdor > 0 ? narx / miqdor : 0;
        const kiritilgan = miqdor > 0 && narx > 0;
        return (
          <Card key={m.id} style={styles.item}>
            <View style={styles.head}>
              <View style={styles.headLeft}>
                <View style={styles.emojiBox}><Text style={styles.emoji}>{m.emoji}</Text></View>
                <View style={styles.flex1}>
                  <Text style={styles.nom}>{m.nom}</Text>
                  <Text style={styles.sub}>{unit} bilan o'lchanadi</Text>
                </View>
              </View>
              <View style={styles.headRight}>
                <Text style={styles.per}>1{unit} = {perUnit ? perUnit.toFixed(2) : "0"} so'm</Text>
                {kiritilgan ? (
                  <View style={styles.badge}>
                    <Ionicons name="checkmark-circle" size={12} color={C.accent} />
                    <Text style={styles.badgeTxt}> Narx kiritilgan</Text>
                  </View>
                ) : (
                  <View style={styles.badge}>
                    <Ionicons name="ellipse-outline" size={11} color={C.muted} />
                    <Text style={styles.badgeNo}> Narx kiritilmagan</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.inputs}>
              <View style={styles.col}>
                <Text style={styles.lbl}>MIQDORI ({unit.toUpperCase()})</Text>
                <TextInput
                  value={p.miqdor ?? ""}
                  onChangeText={(v) => yangila(m.id, "miqdor", v)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.muted}
                  style={styles.input}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.lbl}>NARXI (SO'M)</Text>
                <TextInput
                  value={p.narx ?? ""}
                  onChangeText={(v) => yangila(m.id, "narx", v)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.muted}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.example}>
              <Ionicons name="bulb-outline" size={13} color={C.muted} />
              <Text style={styles.exTxt}> Misol: 1000{unit} → <Text style={styles.exBold}>{formatSom(Math.round(perUnit * 1000))} so'm</Text></Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hint:      { marginBottom: S[4] },
  hintRow:   { flexDirection: "row", gap: S[2] },
  hintIcon:  { marginTop: 1 },
  hintTxt:   { flex: 1, fontSize: T.sm, color: C.sub, lineHeight: 20 },
  bold:      { fontWeight: "800", color: C.text },

  item:      { marginBottom: S[3] },
  head:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: S[3] },
  headLeft:  { flexDirection: "row", alignItems: "center", gap: S[2], flex: 1 },
  emojiBox:  { width: 42, height: 42, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "0D", borderWidth: 1, borderColor: C.border },
  emoji:     { fontSize: 20 },
  flex1:     { flex: 1 },
  nom:       { fontSize: T.md, fontWeight: "800", color: C.text },
  sub:       { fontSize: T.xs, color: C.muted, marginTop: 1 },
  headRight: { alignItems: "flex-end" },
  per:       { fontSize: T.sm, fontWeight: "800", color: C.accent },
  badge:     { flexDirection: "row", alignItems: "center", marginTop: 2 },
  badgeTxt:  { fontSize: 11, color: C.accent, fontWeight: "600" },
  badgeNo:   { fontSize: 11, color: C.muted, fontWeight: "600" },

  inputs:    { flexDirection: "row", gap: S[3] },
  col:       { flex: 1 },
  lbl:       { fontSize: 10, color: C.sub, fontWeight: "700", letterSpacing: 0.4, marginBottom: 5 },
  input:     { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, fontWeight: "700", color: C.text, backgroundColor: C.surface },

  example:   { flexDirection: "row", alignItems: "center", marginTop: S[3], backgroundColor: C.surface, borderWidth: 1, borderColor: C.borderSoft, borderRadius: R.sm, paddingVertical: S[2], paddingHorizontal: S[3] },
  exTxt:     { fontSize: T.xs, color: C.sub },
  exBold:    { fontWeight: "800", color: C.accent },
});
