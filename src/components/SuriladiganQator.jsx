// Chapga suriladigan qator: surilganda o'ng tomonda bo'shagan joyda "O'chirish" tasdiq tugmasi
// paydo bo'ladi — bosilsagina o'chiriladi (tasodifiy surish o'chirmaydi). O'ngga surish yoki
// boshqa qatorni ochish bilan yopiladi. Tik yo'nalishdagi scroll'ga xalaqit bermaydi.
// Fizika: chegaradan o'tganda rezina qarshiligi, qo'yib yuborilganda tezlikni saqlovchi prujina.
import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, PanResponder, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sezgi } from "../logic/sezgi";
import { rezina, otilish, PRUJINA } from "../logic/fizika";
import { C, T, R, temaStil } from "../theme";

const KENG = 96; // ochilgan tugma kengligi
let ochiqYopish = null; // bir vaqtda faqat bitta qator ochiq

// `ichki` — Guruh kartasi ichida: qator o'z fonida suriladi, tugma butun balandlikni egallaydi
export function SuriladiganQator({ children, onOchir, matn = "O'chirish", style, nom = "", ichki = false }) {
  const x = useRef(new Animated.Value(0)).current;
  const ochiq = useRef(false);
  // Prujina — qo'yib yuborilgandagi barmoq tezligidan davom etadi
  const yop = (tezlik = 0) => { ochiq.current = false; Animated.spring(x, { toValue: 0, velocity: tezlik, ...PRUJINA, useNativeDriver: true }).start(); };
  const och = (tezlik = 0) => {
    if (ochiqYopish && ochiqYopish !== yop) ochiqYopish();
    ochiqYopish = yop; ochiq.current = true; sezgi("bos");
    Animated.spring(x, { toValue: -KENG, velocity: tezlik, ...PRUJINA, useNativeDriver: true }).start();
  };
  useEffect(() => () => { if (ochiqYopish === yop) ochiqYopish = null; }, []);
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
    onPanResponderMove: (_, g) => {
      // Tugma kengligidan o'tib tortilsa (yoki o'ngga) — rezinadek qarshilik
      const p = (ochiq.current ? -KENG : 0) + g.dx;
      x.setValue(p < -KENG ? -KENG - rezina(-KENG - p, KENG * 0.5) : p > 0 ? rezina(p, 24) : p);
    },
    onPanResponderRelease: (_, g) => {
      // Tez "chertilsa" masofa kam bo'lsa ham ochiladi/yopiladi (tezlik bo'yicha taxmin)
      const p = (ochiq.current ? -KENG : 0) + g.dx + otilish(g.vx);
      if (p < -KENG / 2) och(g.vx); else yop(g.vx);
    },
    onPanResponderTerminate: () => (ochiq.current ? och() : yop()),
  })).current;
  const tugmaOpacity = x.interpolate({ inputRange: [-KENG, -20, 0], outputRange: [1, 0.4, 0], extrapolate: "clamp" });
  return (
    <View style={[styles.wrap, style]}>
      <Animated.View style={[styles.orqa, ichki && styles.orqaIchki, { opacity: tugmaOpacity }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${nom ? nom + ": " : ""}${matn} (tasdiqlash)`}
          onPress={() => { yop(); sezgi("tayyor"); onOchir?.(); }}
          style={({ pressed }) => [styles.tugma, ichki && styles.tugmaIchki, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="trash-outline" size={20} color="#FFF8EC" />
          <Text style={styles.tugmaTxt}>{matn}</Text>
        </Pressable>
      </Animated.View>
      <Animated.View style={[ichki && styles.oldIchki, { transform: [{ translateX: x }] }]} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:   { position: "relative" },
  orqa:   { position: "absolute", top: 0, bottom: 0, right: 0, width: KENG - 6, justifyContent: "center", alignItems: "flex-end" },
  tugma:  { flex: 1, alignSelf: "stretch", width: KENG - 10, borderRadius: R.lg, backgroundColor: C.red, alignItems: "center", justifyContent: "center", gap: 3 },
  orqaIchki:{ width: KENG },
  tugmaIchki:{ width: KENG, borderRadius: 0 },
  oldIchki: { backgroundColor: C.card },
  tugmaTxt:{ fontSize: 11, fontWeight: "800", color: "#FFF8EC" },
}));
