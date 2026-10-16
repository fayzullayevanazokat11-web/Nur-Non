// Markaz menyusi — Nur-Non logotipi bosilganda sarlavha ostida silliq ochiladi (Modal yo'q).
//   • Akkaunt va ma'lumotlar — akkaunt nomi, ma'lumotlarni yuborish/qabul qilish
//   • Tarixdagilar — o'chirilgan narsalar (7 kun), qaytarish mumkin
//   • Yozuv — Lotin / Кирилл (butun ilova matni darhol o'zgaradi)
import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useApp } from "../store/AppData";
import { useTil, setTil } from "../i18n/til";
import { C, T, S, R, ANIM } from "../theme";

export function MarkazMenyu({ onYop }) {
  const { ochirilganlar, akkauntNomi } = useApp();
  const til = useTil();
  const soni = (ochirilganlar || []).length;

  // Ochilish animatsiyasi: shaffoflik + yuqoridan sirpanish
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: ANIM.duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [a]);
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] });

  return (
    <Animated.View style={[styles.wrap, { opacity: a, transform: [{ translateY }] }]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => { onYop?.(); router.push("/akkaunt"); }}
        android_ripple={{ color: C.accent + "1A" }}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <View style={styles.icon}><Ionicons name="person-circle-outline" size={22} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Akkaunt va ma'lumotlar</Text>
          <Text style={styles.sub} numberOfLines={1}>{akkauntNomi ? `${akkauntNomi} · ` : ""}Ma'lumotlarni yuborish va qabul qilish</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        accessibilityRole="button"
        onPress={() => { onYop?.(); router.push("/ochirilganlar"); }}
        android_ripple={{ color: C.accent + "1A" }}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <View style={styles.icon}><Ionicons name="archive-outline" size={20} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Tarixdagilar</Text>
          <Text style={styles.sub}>O'chirilganlar 7 kun saqlanadi · qaytarish mumkin</Text>
        </View>
        {soni > 0 && <View style={styles.badge}><Text style={styles.badgeTxt}>{soni}</Text></View>}
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </Pressable>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.icon}><Ionicons name="language-outline" size={20} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Yozuv</Text>
          <Text style={styles.sub}>Butun ilova matni</Text>
        </View>
        <View style={styles.seg}>
          {[["lotin", "Lotin"], ["kirill", "Кирилл"]].map(([k, nom]) => (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityState={{ selected: til === k }}
              onPress={() => setTil(k)}
              style={[styles.segBtn, til === k && styles.segBtnActive]}
            >
              <Text style={[styles.segTxt, til === k && styles.segTxtActive]}>{nom}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap:      { backgroundColor: C.card, borderRadius: R.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, marginTop: -S[3], marginBottom: S[5], overflow: "hidden" },
  row:       { flexDirection: "row", alignItems: "center", gap: S[3], paddingVertical: S[3], paddingHorizontal: S[4] },
  rowPressed:{ opacity: 0.75 },
  icon:      { width: 40, height: 40, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  flex1:     { flex: 1 },
  label:     { fontSize: T.md, fontWeight: "800", color: C.text },
  sub:       { fontSize: T.xs, color: C.sub, marginTop: 2 },
  badge:     { minWidth: 24, height: 24, paddingHorizontal: 7, borderRadius: 12, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" },
  badgeTxt:  { fontSize: 12, fontWeight: "800", color: "#FFF3E8" },
  divider:   { height: StyleSheet.hairlineWidth, backgroundColor: C.borderSoft, marginHorizontal: S[4] },
  seg:       { flexDirection: "row", backgroundColor: C.panel, borderRadius: R.pill, padding: 3 },
  segBtn:    { paddingVertical: 7, paddingHorizontal: 12, borderRadius: R.pill },
  segBtnActive: { backgroundColor: C.accent },
  segTxt:    { fontSize: T.xs, fontWeight: "700", color: C.sub },
  segTxtActive: { color: "#FFF3E8" },
});
