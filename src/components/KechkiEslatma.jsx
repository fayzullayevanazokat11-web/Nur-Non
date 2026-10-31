// Kechki eslatma (standart funksiya, o'chirib bo'lmaydi) — kechqurun 19:00 dan ish kuni tugaguncha
// (tunda 03:00) kun yakunlanmagan bo'lsa Markazda ko'zga tashlanadigan banner. Bosilsa — Kunlik qop hisobi.
// Telefon bildirishnomasi esa har kuni 20:00 da keladi (src/logic/bildirishnoma.js).
import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Bosma } from "./Bosma";
import { YAKUN_SOAT } from "../logic/eslatma";
import { C, T, S, R, temaStil } from "../theme";

export const kechqurunmi = (d = new Date()) => d.getHours() >= YAKUN_SOAT || d.getHours() < 3;

export function KechkiEslatma({ korinadi }) {
  // Oy ikonkasi sekin "nafas oladi" (native driver — JS'ga yuk bermaydi)
  const nafas = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!korinadi) return undefined;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(nafas, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(nafas, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [korinadi, nafas]);
  if (!korinadi) return null;
  const scale = nafas.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  return (
    <Bosma accessibilityRole="button" accessibilityLabel="Kechki eslatma: kunni yakunlash" onPress={() => router.push("/qop")} style={styles.wrap} testID="kechki-eslatma">
      <Animated.View style={[styles.ikon, { transform: [{ scale }] }]}>
        <Ionicons name="moon" size={20} color={C.onAccent} />
      </Animated.View>
      <View style={styles.flex1}>
        <Text style={styles.nom}>Kun oxiri — kunni yakunlash vaqti</Text>
        <Text style={styles.izoh} numberOfLines={2}>Qop, sut va rasmlarni tekshirib, «Kunni yakunlash»ni bosing</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.onAccentSub} />
    </Bosma>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:  { flexDirection: "row", alignItems: "center", gap: S[3], backgroundColor: C.accent, borderRadius: R.lg, paddingVertical: S[3], paddingHorizontal: S[4], marginBottom: S[4] },
  ikon:  { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)" },
  flex1: { flex: 1 },
  nom:   { fontSize: T.md, fontWeight: "800", color: C.onAccent },
  izoh:  { fontSize: 11, fontWeight: "600", color: C.onAccentSub, marginTop: 2, lineHeight: 15 },
}));
