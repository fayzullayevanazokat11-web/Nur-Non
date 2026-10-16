// "Tannarx" — har bir non uchun 1 dona tannarxi, foyda va foiz.
// Gaz/elektr (kunlik) va o'rtacha kunlik qop o'zgartirilsa — darhol qayta hisoblanadi.
// "Sinov narxi" — narxni o'zgartirsangiz qancha foyda qolishini ko'rsatadi (saqlanmaydi).
import { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../store/AppData";
import { Card } from "./Card";
import { ExpandableCard } from "./ExpandableCard";
import { formatSom } from "../logic/hisob";
import { tannarxHisobi, ortachaKunlikQop, sinovFoyda } from "../logic/tannarx";
import { C, T, S, R, temaStil } from "../theme";

const foiz = (x) => `${Math.round(x * 100)}%`;

export function TannarxKalk() {
  const { nonlar, mahsulotNarxlari, ishchilar, gazNarx, setGazNarx, elektroNarx, setElektroNarx, hisobotlarTarixi, ozIshlabQoplar } = useApp();
  const bugungiQop = Object.values(ozIshlabQoplar || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const ortacha = ortachaKunlikQop(hisobotlarTarixi, bugungiQop);
  const [qopKirit, setQopKirit] = useState("");
  const kunlikQop = qopKirit !== "" ? qopKirit : String(ortacha || "");
  const [sinov, setSinov] = useState({});

  const natija = useMemo(
    () => tannarxHisobi({ nonlar, mahsulotNarxlari, ishchilar, gazKunlik: gazNarx, elektrKunlik: elektroNarx, kunlikQop }),
    [nonlar, mahsulotNarxlari, ishchilar, gazNarx, elektroNarx, kunlikQop]
  );

  return (
    <View>
      <Card style={styles.card}>
        <View style={styles.head}>
          <Ionicons name="options-outline" size={18} color={C.sub} />
          <Text style={styles.headTxt}>Umumiy xarajatlar</Text>
        </View>
        <View style={styles.qator2}>
          <View style={styles.flex1}>
            <Text style={styles.lbl}>Gaz (kunlik, so'm)</Text>
            <TextInput value={String(gazNarx ?? "")} onChangeText={setGazNarx} keyboardType="numeric" placeholder="0" placeholderTextColor={C.muted} style={styles.input} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.lbl}>Elektr (kunlik, so'm)</Text>
            <TextInput value={String(elektroNarx ?? "")} onChangeText={setElektroNarx} keyboardType="numeric" placeholder="0" placeholderTextColor={C.muted} style={styles.input} />
          </View>
        </View>
        <Text style={styles.lbl}>O'rtacha kunlik qop</Text>
        <TextInput value={kunlikQop} onChangeText={setQopKirit} keyboardType="numeric" placeholder="0" placeholderTextColor={C.muted} style={styles.input} />
        <Text style={styles.hint}>
          {ortacha > 0 ? `Oxirgi hisobotlar bo'yicha: ${String(ortacha).replace(".", ",")} qop. ` : ""}Kunlik ishchilar haqi, gaz va elektr shu qoplarga bo'lib hisoblanadi.
        </Text>
      </Card>

      {natija.map((r) => {
        const s = sinov[r.id] ?? "";
        const sf = s !== "" ? sinovFoyda(r, s) : null;
        return (
          <ExpandableCard
            key={r.id}
            style={styles.item}
            header={
              <View style={styles.mHead}>
                <View style={styles.flex1}>
                  <Text style={styles.nom} numberOfLines={1}>{r.nom}</Text>
                  <Text style={styles.izoh}>Tannarx {formatSom(r.dona)} · narx {formatSom(r.narx)} so'm</Text>
                </View>
                <View style={styles.foydaBox}>
                  <Text style={[styles.foyda, r.foyda < 0 && { color: C.red }]}>{r.foyda >= 0 ? "+" : ""}{formatSom(r.foyda)}</Text>
                  <Text style={styles.marja}>{foiz(r.marja)}</Text>
                </View>
              </View>
            }
          >
            {r.oz ? (
              <>
                <View style={styles.jadvalBosh}>
                  <Text style={[styles.jNom, styles.jBosh]}>1 qop ({r.nonSoni || 0} dona)</Text>
                  <Text style={[styles.jV, styles.jBosh]}>qop</Text>
                  <Text style={[styles.jV, styles.jBosh]}>dona</Text>
                </View>
                {r.qismlar.map((q) => (
                  <View key={q.k} style={styles.jQator}>
                    <Text style={styles.jNom} numberOfLines={1}>{q.nom}</Text>
                    <Text style={styles.jV}>{formatSom(q.qop)}</Text>
                    <Text style={styles.jV}>{formatSom(q.dona)}</Text>
                  </View>
                ))}
                <View style={[styles.jQator, styles.jJami]}>
                  <Text style={[styles.jNom, styles.qalin]}>Tannarx</Text>
                  <Text style={[styles.jV, styles.qalin]}>{formatSom(r.qopJami)}</Text>
                  <Text style={[styles.jV, styles.qalin]}>{formatSom(r.dona)}</Text>
                </View>
                <Text style={styles.hint}>1 qopdan foyda: {formatSom(r.qopFoyda)} so'm</Text>
                {!r.nonSoni && <Text style={styles.ogoh}>1 qopdan chiqadigan non soni kiritilmagan — Assortimentda kiriting.</Text>}
              </>
            ) : (
              <Text style={styles.hint}>Tashqaridan olinadigan non: tannarx = narx − belgilangan foyda ({formatSom(r.foyda)} so'm).</Text>
            )}

            <Text style={styles.lbl}>Sinov narxi</Text>
            <TextInput
              value={s}
              onChangeText={(v) => setSinov((p) => ({ ...p, [r.id]: v }))}
              keyboardType="numeric"
              placeholder={String(r.narx)}
              placeholderTextColor={C.muted}
              style={styles.input}
            />
            {sf && (
              <View style={styles.sinov}>
                <Text style={styles.sinovTxt}>
                  Foyda: <Text style={[styles.qalin, sf.foyda < 0 && { color: C.red }]}>{formatSom(sf.foyda)} so'm/dona ({foiz(sf.marja)})</Text>
                </Text>
                {sf.qopFoyda != null && <Text style={styles.sinovTxt}>1 qopdan: <Text style={styles.qalin}>{formatSom(sf.qopFoyda)} so'm</Text> ({sf.qopFoyda - r.qopFoyda >= 0 ? "+" : ""}{formatSom(sf.qopFoyda - r.qopFoyda)})</Text>}
              </View>
            )}
          </ExpandableCard>
        );
      })}
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  flex1:    { flex: 1 },
  card:     { marginBottom: S[4] },
  head:     { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[1] },
  headTxt:  { fontSize: T.md, fontWeight: "800", color: C.text },
  qator2:   { flexDirection: "row", gap: S[2] },
  lbl:      { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[3], letterSpacing: 0.3 },
  input:    { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  hint:     { fontSize: 11, color: C.muted, marginTop: S[2], lineHeight: 16 },
  ogoh:     { fontSize: T.xs, color: C.red, marginTop: S[2], fontWeight: "600" },

  item:     { marginBottom: S[3] },
  mHead:    { flexDirection: "row", alignItems: "center", gap: S[2] },
  nom:      { fontSize: T.md, fontWeight: "700", color: C.text },
  izoh:     { fontSize: T.xs, color: C.muted, marginTop: 2 },
  foydaBox: { alignItems: "flex-end" },
  foyda:    { fontSize: T.md, fontWeight: "800", color: C.accent },
  marja:    { fontSize: 11, fontWeight: "700", color: C.sub, marginTop: 1 },

  jadvalBosh:{ flexDirection: "row", paddingBottom: 6 },
  jBosh:    { fontSize: 11, color: C.muted, fontWeight: "800" },
  jQator:   { flexDirection: "row", paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  jJami:    { borderTopWidth: 1, borderTopColor: C.border },
  jNom:     { flex: 1, fontSize: T.sm, color: C.sub },
  jV:       { width: 78, textAlign: "right", fontSize: T.sm, color: C.text, fontWeight: "600" },
  qalin:    { fontWeight: "800", color: C.text },
  sinov:    { marginTop: S[2], backgroundColor: C.accent + "0D", borderRadius: R.sm, padding: S[3], gap: 4 },
  sinovTxt: { fontSize: T.sm, color: C.sub },
}));
