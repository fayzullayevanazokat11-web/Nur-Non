// Oylik maqsad (sof foyda): bu oy qancha bajarildi, qancha qoldi va qolgan kunlarda kuniga
// o'rtacha qancha kerak. Maqsad Statistikaning o'zida qo'yiladi / o'zgartiriladi.
import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import { Btn } from "./Btn";
import { saqlandiXabar } from "./Xabarcha";
import { formatQisqa, ishKuni, sonOl } from "../logic/hisob";
import { oylar, joriyOy, oyNomi } from "../logic/davr";
import { C, T, S, R, temaStil } from "../theme";

export function OylikMaqsad() {
  const { hisobotlarTarixi, oylikArxiv, oylikMaqsad, setOylikMaqsad } = useApp();
  const [tahrir, setTahrir] = useState(false);
  const [matn, setMatn] = useState("");
  const oy = joriyOy();
  const bajarildi = useMemo(() => oylar(hisobotlarTarixi, oylikArxiv)[oy]?.sofFoyda || 0, [hisobotlarTarixi, oylikArxiv, oy]);
  const bugun = ishKuni();
  const oyKunlari = new Date(bugun.getFullYear(), bugun.getMonth() + 1, 0).getDate();
  const qolganKun = Math.max(1, oyKunlari - bugun.getDate() + 1);
  const maqsad = Number(oylikMaqsad) || 0;
  const foiz = maqsad > 0 ? Math.max(0, Math.min(100, Math.round((bajarildi / maqsad) * 100))) : 0;
  const qoldi = Math.max(0, maqsad - bajarildi);

  const saqla = () => {
    const v = sonOl(matn);
    setOylikMaqsad(v > 0 ? v : 0);
    setTahrir(false);
    saqlandiXabar(v > 0 ? "Oylik maqsad saqlandi" : "Maqsad olib tashlandi");
  };

  if (tahrir || maqsad <= 0) {
    return (
      <View style={styles.karta}>
        <View style={styles.bosh}>
          <Ionicons name="flag-outline" size={16} color={C.accent} />
          <Text style={styles.nom}>{oyNomi(oy)} uchun maqsad (sof foyda)</Text>
        </View>
        <TextInput
          accessibilityLabel="Oylik maqsad summasi"
          value={matn}
          onChangeText={(v) => setMatn(v.replace(/[^\d]/g, ""))}
          placeholder={maqsad ? String(maqsad) : "Masalan: 40000000"}
          placeholderTextColor={C.muted}
          keyboardType="number-pad"
          style={styles.input}
        />
        <View style={styles.tugmalar}>
          <View style={styles.flex1}><Btn icon="flag-outline" onPress={saqla}>Maqsadni saqlash</Btn></View>
          {tahrir && <View style={styles.flex1}><Btn secondary onPress={() => setTahrir(false)}>Bekor</Btn></View>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.karta}>
      <View style={styles.bosh}>
        <Ionicons name="flag" size={16} color={C.accent} />
        <Text style={styles.nom}>{oyNomi(oy)} maqsadi</Text>
        <Pressable accessibilityLabel="Maqsadni o'zgartirish" onPress={() => { setMatn(String(maqsad)); setTahrir(true); }} hitSlop={8}>
          <Ionicons name="create-outline" size={18} color={C.sub} />
        </Pressable>
      </View>
      <Text style={styles.qiymat}>
        {formatQisqa(bajarildi)} <Text style={styles.qiymatKichik}>/ {formatQisqa(maqsad)} so'm</Text>
      </Text>
      <View style={styles.chiziq}><View style={[styles.toldi, { width: `${foiz}%` }]} /></View>
      <Text style={styles.izoh}>
        {foiz >= 100
          ? "Maqsad bajarildi! 🎉"
          : `${foiz}% · qoldi ${formatQisqa(qoldi)} so'm · ${qolganKun} kunda kuniga ~${formatQisqa(qoldi / qolganKun)} so'm`}
      </Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  karta:  { backgroundColor: C.card, borderRadius: R.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, padding: S[4], marginBottom: S[4] },
  bosh:   { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  nom:    { flex: 1, fontSize: 11, fontWeight: "800", color: C.sub, letterSpacing: 0.6, textTransform: "uppercase" },
  qiymat: { fontSize: 26, fontWeight: "800", color: C.accent, letterSpacing: -0.5 },
  qiymatKichik: { fontSize: 15, fontWeight: "700", color: C.sub },
  chiziq: { height: 10, borderRadius: 5, backgroundColor: C.panel, overflow: "hidden", marginTop: S[2] },
  toldi:  { height: "100%", borderRadius: 5, backgroundColor: C.accent },
  izoh:   { fontSize: 12, fontWeight: "700", color: C.sub, marginTop: S[2] },
  input:  { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 14, fontSize: T.md, fontWeight: "700", color: C.text, backgroundColor: C.surface, marginBottom: S[3] },
  tugmalar:{ flexDirection: "row", gap: S[2] },
  flex1:  { flex: 1 },
}));
