// "PDFlar arxivi" — logotip menyusidan ochiladi. Oxirgi 30 kunning kunlik hisobot PDF'lari
// (qop rasmlari bilan). PDF kun yakunlanganda telefon xotirasiga saqlanadi; bosilsa — ochish/ulashish.
import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { ScrollBox } from "../src/components/ScrollBox";
import { SahifaSarlavha } from "../src/components/SahifaSarlavha";
import { sanaChiroyli } from "../src/logic/davr";
import { formatSom } from "../src/logic/hisob";
import { C, T, S, R, temaStil } from "../src/theme";

const D = 86400000;
const hajmMatni = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default function Pdflar() {
  const { hisobotlarTarixi, pdfArxiv, hisobotPdfUlash } = useApp();
  const [band, setBand] = useState(null);
  const royxat = useMemo(() => {
    const chegara = Date.now() - 30 * D;
    return (hisobotlarTarixi || []).filter((h) => (h.vaqt || 0) >= chegara)
      .sort((a, b) => String(b.sana).localeCompare(String(a.sana)));
  }, [hisobotlarTarixi]);

  const och = async (h) => {
    if (band) return;
    setBand(h.id);
    try { await hisobotPdfUlash(h); } catch { Alert.alert("Xatolik", "PDF ochib bo'lmadi."); }
    setBand(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <SahifaSarlavha eyebrow="ARXIV" title="PDFlar arxivi" subtitle={`Oxirgi 30 kun · ${royxat.length} ta hisobot`} icon="document-text-outline" />

        {royxat.length === 0 ? (
          <Card>
            <View style={styles.bosh}>
              <Ionicons name="document-text-outline" size={28} color={C.muted} />
              <Text style={styles.boshTxt}>Hali PDF yo'q. Kun yakunlanganda kunlik hisobot PDF'i (qop rasmlari bilan) shu yerga saqlanadi.</Text>
            </View>
          </Card>
        ) : (
          <Card style={styles.royxat}>
            {royxat.map((h, i) => {
              const e = (pdfArxiv || []).find((x) => x.hisobotId === h.id);
              const tayyorlanmoqda = !e && Platform.OS !== "web";
              const rasmSoni = e?.rasmSoni ?? h.tafsilot?.rasmSoni;
              const izoh = [
                `Sof foyda ${formatSom(h.sofFoyda)} so'm`,
                rasmSoni ? `${rasmSoni} ta rasm` : null,
                e?.hajm ? hajmMatni(e.hajm) : null,
              ].filter(Boolean).join(" · ");
              return (
                <Pressable
                  key={h.id}
                  accessibilityRole="button"
                  accessibilityLabel={`PDF: ${h.sana}`}
                  onPress={() => och(h)}
                  style={({ pressed }) => [styles.qator, i > 0 && styles.chiziq, pressed && { opacity: 0.75 }]}
                >
                  <View style={styles.ikon}><Ionicons name="document-text" size={20} color={C.accent} /></View>
                  <View style={styles.flex1}>
                    <Text style={styles.nom}>{sanaChiroyli(h.sana)}</Text>
                    <Text style={styles.izoh} numberOfLines={1}>{tayyorlanmoqda ? "PDF tayyorlanmoqda…" : izoh}</Text>
                  </View>
                  <Ionicons name={band === h.id ? "hourglass-outline" : "share-outline"} size={18} color={C.muted} />
                </Pressable>
              );
            })}
          </Card>
        )}
        <Text style={styles.pastIzoh}>PDF'lar shu telefonda 30 kun saqlanadi, so'ng o'zi o'chadi. Bosilsa — ochish yoki ulashish.</Text>
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  flex1:    { flex: 1 },
  bosh:     { alignItems: "center", gap: S[2], paddingVertical: S[3] },
  boshTxt:  { fontSize: T.sm, color: C.muted, textAlign: "center", lineHeight: 20 },
  royxat:   { paddingVertical: S[1] },
  qator:    { flexDirection: "row", alignItems: "center", gap: S[3], paddingVertical: S[3] },
  chiziq:   { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  ikon:     { width: 40, height: 40, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  nom:      { fontSize: T.sm, fontWeight: "800", color: C.text },
  izoh:     { fontSize: 11, color: C.muted, marginTop: 2 },
  pastIzoh: { fontSize: 11, color: C.muted, textAlign: "center", marginTop: S[4] },
}));
