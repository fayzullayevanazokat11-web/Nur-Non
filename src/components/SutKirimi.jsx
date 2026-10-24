// Sut kirimi — kuniga 2 mahal keladi, litri yoziladi. Omborda turmaydi: shu kunning
// daromadidan (litr × Xomashyodagi 1 litr narxi) to'g'ridan-to'g'ri ayriladi.
// Kunlik vazifa (3-qadam) va Kunlik qop hisobida ishlatiladi.
import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

import { useApp } from "../store/AppData";
import { formatSom, sutLitrNarxi, sutLitri, bugunSana } from "../logic/hisob";
import { C, T, S, R, temaStil } from "../theme";

const MAHALLAR = [["m1", "1-mahal"], ["m2", "2-mahal"]];

function LitrMaydon({ sana, mahal, nom, qiymat, onSaqla }) {
  const [matn, setMatn] = useState(qiymat ? String(qiymat) : "");
  useEffect(() => { setMatn(qiymat ? String(qiymat) : ""); }, [qiymat, sana]);
  return (
    <View style={styles.maydon}>
      <Text style={styles.mahal}>{nom}</Text>
      <View style={styles.inputQator}>
        <TextInput
          accessibilityLabel={`Sut ${nom} (litr)`}
          value={matn}
          onChangeText={(v) => {
            const t = v.replace(",", ".").replace(/[^\d.]/g, "");
            setMatn(t);
            onSaqla(parseFloat(t) || 0);
          }}
          placeholder="0"
          placeholderTextColor={C.muted}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <Text style={styles.birlik}>l</Text>
      </View>
    </View>
  );
}

export function SutKirimi({ sana = bugunSana(), ixcham = false }) {
  const { sutKirimi, sutQoy, mahsulotNarxlari } = useApp();
  const kun = (sutKirimi || {})[sana] || {};
  const litr = sutLitri(kun);
  const narx = sutLitrNarxi(mahsulotNarxlari);
  return (
    <View style={[styles.wrap, ixcham && styles.ixcham]}>
      <View style={styles.qator}>
        {MAHALLAR.map(([k, nom]) => (
          <LitrMaydon key={k} sana={sana} mahal={k} nom={nom} qiymat={kun[k]} onSaqla={(v) => sutQoy(sana, k, v)} />
        ))}
      </View>
      <Text style={[styles.jami, !narx && litr > 0 && styles.ogoh]}>
        {litr > 0
          ? (narx ? `Jami ${String(litr).replace(".", ",")} l × ${formatSom(narx)} = ${formatSom(Math.round(litr * narx))} so'm — bugungi daromaddan ayriladi`
                  : `Jami ${String(litr).replace(".", ",")} l — sut narxi kiritilmagan (Ishlab chiqarish › Xomashyo)`)
          : "Kelgan sut litrini yozing (ertalab va kechqurun)"}
      </Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:   { marginTop: S[1] },
  ixcham: { marginTop: 0 },
  qator:  { flexDirection: "row", gap: S[2] },
  maydon: { flex: 1, minWidth: 0 },
  mahal:  { fontSize: 11, fontWeight: "800", color: C.sub, marginBottom: 4, letterSpacing: 0.3 },
  inputQator: { flexDirection: "row", alignItems: "center", gap: 6 },
  input:  { flex: 1, minWidth: 0, width: "100%", borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 9, paddingHorizontal: 12, fontSize: T.md, fontWeight: "800", color: C.text, backgroundColor: C.surface },
  birlik: { fontSize: T.sm, fontWeight: "700", color: C.sub },
  jami:   { fontSize: 11, fontWeight: "700", color: C.accent, marginTop: 6, lineHeight: 15 },
  ogoh:   { color: C.red },
}));
