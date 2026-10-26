// Tashqaridan keladigan non kirimi — kuniga 2 mahal (ertalab va obeddan keyin) har bir tashqi non
// turidan nechta kelgani yoziladi. Yig'indisi Kunlik qop hisobidagi "olingan dona"ga tushadi va
// sotib olish narxi × son sof foydadan ayriladi. Kunlik vazifa (4-qadam) va undan keyin ham tahrirlanadi.
import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

import { useApp } from "../store/AppData";
import { formatSom, olishNarxi, bugunSana } from "../logic/hisob";
import { C, T, S, R, temaStil } from "../theme";

export const MAHALLAR = [["m1", "Ertalab"], ["m2", "Obeddan keyin"]];

function SonMaydon({ nom, qiymat, onSaqla }) {
  const [matn, setMatn] = useState(qiymat ? String(qiymat) : "");
  useEffect(() => { setMatn(qiymat ? String(qiymat) : ""); }, [qiymat]);
  return (
    <TextInput
      accessibilityLabel={nom}
      value={matn}
      onChangeText={(v) => { const t = v.replace(/[^\d]/g, ""); setMatn(t); onSaqla(t); }}
      placeholder="0"
      placeholderTextColor={C.muted}
      keyboardType="number-pad"
      style={styles.input}
    />
  );
}

// Tashqi nonlar ro'yxati (bo'sh bo'lsa — qadam ko'rsatilmaydi)
export const tashqiNonlar = (nonlar) => (nonlar || []).filter((n) => n.ozIshlab === false);

export function TashqiKirim({ sana = bugunSana() }) {
  const { nonlar, tashqiKirim, tashqiKirimQoy } = useApp();
  const royxat = tashqiNonlar(nonlar);
  const kun = (tashqiKirim || {})[sana] || {};
  const son = (m, id) => parseInt((kun[m] || {})[id]) || 0;
  const jamiDona = royxat.reduce((s, n) => s + son("m1", n.id) + son("m2", n.id), 0);
  const jamiSumma = royxat.reduce((s, n) => s + (son("m1", n.id) + son("m2", n.id)) * olishNarxi(n), 0);
  if (!royxat.length) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.qator}>
        <Text style={[styles.nom, styles.ustun]}>Non</Text>
        {MAHALLAR.map(([k, l]) => <Text key={k} style={[styles.ustunNom, styles.ustun]}>{l}</Text>)}
      </View>
      {royxat.map((n) => (
        <View key={n.id} style={styles.qator}>
          <View style={styles.nomQ}>
            <Text style={styles.nom} numberOfLines={1}>{n.nom}</Text>
            <Text style={styles.narx} numberOfLines={1}>olish {formatSom(olishNarxi(n))}</Text>
          </View>
          {MAHALLAR.map(([k, l]) => (
            <SonMaydon key={k} nom={`${n.nom}: ${l.toLowerCase()}`} qiymat={son(k, n.id)} onSaqla={(v) => tashqiKirimQoy(sana, k, n.id, v)} />
          ))}
        </View>
      ))}
      <Text style={styles.jami}>
        {jamiDona > 0
          ? `Jami ${formatSom(jamiDona)} dona · ${formatSom(jamiSumma)} so'm — sotib olish narxi sof foydadan ayriladi`
          : "Tashqaridan kelgan nonlar sonini yozing (ertalab va obeddan keyin)"}
      </Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:     { marginTop: S[1] },
  qator:    { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: 6 },
  ustun:    { fontSize: 10, fontWeight: "800", color: C.muted, letterSpacing: 0.3 },
  ustunNom: { width: 74, textAlign: "center" },
  nomQ:     { flex: 1, minWidth: 0 },
  nom:      { flex: 1, fontSize: 12, fontWeight: "700", color: C.text },
  narx:     { fontSize: 10, color: C.muted, fontWeight: "600", marginTop: 1 },
  input:    { width: 74, borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 8, paddingHorizontal: 8, fontSize: T.sm, fontWeight: "800", color: C.text, backgroundColor: C.surface, textAlign: "center" },
  jami:     { fontSize: 11, fontWeight: "700", color: C.accent, marginTop: 4, lineHeight: 15 },
}));
