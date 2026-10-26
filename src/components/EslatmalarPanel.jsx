// Markazdagi "Diqqat" paneli — kam xomashyo, tasdiqlanmagan so'rovnoma, eski qarz,
// yakunlanmagan kun. Bosilsa tegishli sahifa ochiladi; × — bugunga yashiradi.
// Hech narsa bo'lmasa panel umuman ko'rinmaydi (minimal).
import { tikMs } from "../store/rejim";
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../store/AppData";
import usePersistedState from "../store/usePersistedState";
import { eslatmalar } from "../logic/eslatma";
import { omborRoyxati } from "../logic/konstantalar";
import { bugunSana } from "../logic/hisob";
import { C, T, S, R, temaStil } from "../theme";

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));

export function EslatmalarPanel() {
  const { nonlar, hisobotlarTarixi, ozIshlabQoplar, tashqariSonlar, omborlar, omborSorovlar, qarzlar, customMahsulotlar, lockedDayStats, tayyor } = useApp();
  // Yashirilganlar: { id: sana } — faqat shu kun uchun
  const [yashirin, setYashirin] = usePersistedState("nurnon:yashirinEslatmalar", {}, { hidratsiya: false });
  const [daqiqa, setDaqiqa] = useState(0);
  useEffect(() => { const t = setInterval(() => setDaqiqa((x) => x + 1), tikMs(60000)); return () => clearInterval(t); }, []);

  const royxat = useMemo(() => omborRoyxati(customMahsulotlar), [customMahsulotlar]);
  const hammasi = useMemo(() => (tayyor ? eslatmalar({
    hozir: new Date(), nonlar, hisobotlar: hisobotlarTarixi, ozIshlabQoplar, tashqariSonlar,
    omborlar, omborSorovlar, qarzlar, royxat, lockedDayStats,
  }) : []), [tayyor, nonlar, hisobotlarTarixi, ozIshlabQoplar, tashqariSonlar, omborlar, omborSorovlar, qarzlar, royxat, lockedDayStats, daqiqa]);
  const bugun = bugunSana();
  const korinadi = hammasi.filter((e) => yashirin?.[e.id] !== bugun);

  const yashir = (id) => {
    silliq();
    // Eskirgan yashirishlarni tozalab, faqat bugungisini saqlaymiz
    setYashirin((p) => Object.fromEntries([...Object.entries(p || {}).filter(([, s]) => s === bugun), [id, bugun]]));
  };

  if (!korinadi.length) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Ionicons name="notifications-outline" size={13} color={C.sub} />
        <Text style={styles.headTxt}>DIQQAT</Text>
        <Text style={styles.soni}>{korinadi.length}</Text>
      </View>
      {korinadi.map((e, i) => (
        <Pressable
          key={e.id}
          accessibilityRole="button"
          onPress={() => router.push(e.yol)}
          style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && styles.pressed]}
        >
          <View style={styles.icon}><Ionicons name={e.icon} size={17} color={C.accent} /></View>
          <View style={styles.flex1}>
            <Text style={styles.matn} numberOfLines={1}>{e.matn}</Text>
            <Text style={styles.izoh} numberOfLines={2}>{e.izoh}</Text>
          </View>
          <Pressable accessibilityLabel="Eslatmani yashirish" onPress={() => yashir(e.id)} hitSlop={10} style={styles.yop}>
            <Ionicons name="close" size={16} color={C.muted} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:     { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1.5, borderColor: C.border, marginBottom: S[5], overflow: "hidden" },
  head:     { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: S[4], paddingTop: S[3], paddingBottom: S[1] },
  headTxt:  { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1, flex: 1 },
  soni:     { fontSize: 11, fontWeight: "800", color: C.onAccent, backgroundColor: C.accent, borderRadius: 10, minWidth: 20, textAlign: "center", paddingHorizontal: 6, paddingVertical: 1, overflow: "hidden" },
  row:      { flexDirection: "row", alignItems: "center", gap: S[3], paddingVertical: S[3], paddingHorizontal: S[4] },
  rowBorder:{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  pressed:  { opacity: 0.7 },
  icon:     { width: 34, height: 34, borderRadius: R.sm, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  flex1:    { flex: 1 },
  matn:     { fontSize: T.sm, fontWeight: "800", color: C.text },
  izoh:     { fontSize: T.xs, color: C.sub, marginTop: 2 },
  yop:      { padding: 2 },
}));
