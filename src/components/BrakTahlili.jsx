// Brak tahlili (oxirgi 30 kun): qaysi non turida, qaysi xodimda va qaysi kunlari
// brak ko'proq. Joriy yozuvlar + kunlik hisobotlar arxividagi braklar birlashtiriladi.
import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useApp } from "../store/AppData";
import { formatSom } from "../logic/hisob";
import { HAFTA } from "../logic/davr";
import { C, T, S, R, temaStil } from "../theme";

const KESIMLAR = [{ k: "non", nom: "Non turi" }, { k: "xodim", nom: "Xodim" }, { k: "kun", nom: "Hafta kuni" }];

export function brakYozuvlari(braklar, hisobotlar, kun = 30) {
  const chegara = Date.now() - kun * 864e5;
  const m = new Map();
  [...(braklar || []), ...(hisobotlar || []).flatMap((h) => h.arxiv?.braklar || [])].forEach((b) => {
    if (b && b.id != null && (b.vaqt || 0) >= chegara) m.set(b.id, b);
  });
  return [...m.values()];
}

export function BrakTahlili() {
  const { braklar, hisobotlarTarixi } = useApp();
  const [kesim, setKesim] = useState("non");
  const yozuvlar = useMemo(() => brakYozuvlari(braklar, hisobotlarTarixi), [braklar, hisobotlarTarixi]);

  const qatorlar = useMemo(() => {
    const yig = new Map();
    const kalit = (b) => {
      if (kesim === "non") return b.nonNomi || "—";
      if (kesim === "xodim") return b.ishchiIsm || "—";
      const [y, mo, d] = String(b.sana || "").split("-").map(Number);
      return y ? HAFTA[(new Date(y, mo - 1, d).getDay() + 6) % 7] : "—";
    };
    yozuvlar.forEach((b) => {
      const k = kalit(b);
      const x = yig.get(k) || { nom: k, soni: 0, summa: 0 };
      x.soni += parseFloat(b.soni) || 0;
      x.summa += parseFloat(b.summa) || 0;
      yig.set(k, x);
    });
    const arr = [...yig.values()];
    if (kesim === "kun") return HAFTA.map((h) => yig.get(h) || { nom: h, soni: 0, summa: 0 });
    return arr.sort((a, b) => b.summa - a.summa);
  }, [yozuvlar, kesim]);

  if (yozuvlar.length < 3) return null;
  const max = Math.max(1, ...qatorlar.map((x) => x.summa));
  const jami = yozuvlar.reduce((s, b) => s + (parseFloat(b.summa) || 0), 0);
  const eng = qatorlar.reduce((a, b) => (b.summa > (a?.summa || 0) ? b : a), null);

  return (
    <View style={styles.karta}>
      <Text style={styles.sarlavha}>Brak tahlili · 30 kun</Text>
      <Text style={styles.izoh}>Jami {formatSom(jami)} so'm · {yozuvlar.length} ta yozuv{eng ? ` · eng ko'p: ${eng.nom}` : ""}</Text>
      <View style={styles.seg}>
        {KESIMLAR.map((x) => (
          <Pressable key={x.k} onPress={() => setKesim(x.k)} style={[styles.segBtn, kesim === x.k && styles.segActive]}>
            <Text style={[styles.segTxt, kesim === x.k && styles.segTxtActive]}>{x.nom}</Text>
          </Pressable>
        ))}
      </View>
      {qatorlar.map((x) => (
        <View key={x.nom} style={styles.qator}>
          <Text style={[styles.nom, x === eng && styles.qalin]} numberOfLines={1}>{x.nom}</Text>
          <View style={styles.trek}>
            <View style={[styles.bar, { width: `${x.summa ? Math.max(3, (x.summa / max) * 100) : 0}%`, opacity: x === eng ? 1 : 0.6 }]} />
          </View>
          <Text style={[styles.val, x === eng && styles.qalin]} numberOfLines={1}>{x.soni ? `${x.soni} dona` : "—"}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  karta:   { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1.5, borderColor: C.border, padding: S[4], marginBottom: S[5] },
  sarlavha:{ fontSize: T.md, fontWeight: "800", color: C.text },
  izoh:    { fontSize: T.xs, color: C.sub, marginTop: 2 },
  seg:     { flexDirection: "row", backgroundColor: C.panel, borderRadius: R.pill, padding: 3, marginTop: S[3], marginBottom: S[3] },
  segBtn:  { flex: 1, alignItems: "center", paddingVertical: 7, borderRadius: R.pill },
  segActive:{ backgroundColor: C.accent },
  segTxt:  { fontSize: T.xs, fontWeight: "700", color: C.sub },
  segTxtActive:{ color: C.onAccent },
  qator:   { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  nom:     { width: 104, fontSize: T.xs, color: C.sub, fontWeight: "600" },
  trek:    { flex: 1, height: 10, borderRadius: 5, backgroundColor: C.panel, overflow: "hidden" },
  bar:     { height: "100%", borderRadius: 5, backgroundColor: C.red },
  val:     { width: 62, textAlign: "right", fontSize: T.xs, color: C.text, fontWeight: "600" },
  qalin:   { fontWeight: "800", color: C.text },
}));
