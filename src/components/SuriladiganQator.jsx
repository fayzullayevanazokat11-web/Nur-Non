// Chapga suriladigan qator: surilganda o'ng tomonda bo'shagan joyda "O'chirish" tasdiq tugmasi
// paydo bo'ladi — bosilsagina o'chiriladi (tasodifiy surish o'chirmaydi). O'ngga surish yoki
// boshqa qatorni ochish bilan yopiladi. Tik yo'nalishdagi scroll'ga xalaqit bermaydi.
import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, PanResponder, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sezgi } from "../logic/sezgi";
import { C, T, R, temaStil } from "../theme";

const KENG = 96; // ochilgan tugma kengligi
let ochiqYopish = null; // bir vaqtda faqat bitta qator ochiq

export function SuriladiganQator({ children, onOchir, matn = "O'chirish", style, nom = "" }) {
  const x = useRef(new Animated.Value(0)).current;
  const ochiq = useRef(false);
  const yop = () => { ochiq.current = false; Animated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start(); };
  const och = () => {
    if (ochiqYopish && ochiqYopish !== yop) ochiqYopish();
    ochiqYopish = yop; ochiq.current = true; sezgi("bos");
    Animated.spring(x, { toValue: -KENG, useNativeDriver: true, bounciness: 0 }).start();
  };
  useEffect(() => () => { if (ochiqYopish === yop) ochiqYopish = null; }, []);
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
    onPanResponderMove: (_, g) => {
      const boshi = ochiq.current ? -KENG : 0;
      x.setValue(Math.max(-KENG * 1.3, Math.min(0, boshi + g.dx)));
    },
    onPanResponderRelease: (_, g) => {
      const boshi = ochiq.current ? -KENG : 0;
      if (boshi + g.dx < -KENG / 2) och(); else yop();
    },
    onPanResponderTerminate: () => (ochiq.current ? och() : yop()),
  })).current;
  const tugmaOpacity = x.interpolate({ inputRange: [-KENG, -20, 0], outputRange: [1, 0.4, 0], extrapolate: "clamp" });
  return (
    <View style={[styles.wrap, style]}>
      <Animated.View style={[styles.orqa, { opacity: tugmaOpacity }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${nom ? nom + ": " : ""}${matn} (tasdiqlash)`}
          onPress={() => { yop(); sezgi("tayyor"); onOchir?.(); }}
          style={({ pressed }) => [styles.tugma, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="trash-outline" size={20} color="#FFF8EC" />
          <Text style={styles.tugmaTxt}>{matn}</Text>
        </Pressable>
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX: x }] }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:   { position: "relative" },
  orqa:   { position: "absolute", top: 0, bottom: 0, right: 0, width: KENG - 6, justifyContent: "center", alignItems: "flex-end" },
  tugma:  { flex: 1, alignSelf: "stretch", width: KENG - 10, borderRadius: R.lg, backgroundColor: C.red, alignItems: "center", justifyContent: "center", gap: 3 },
  tugmaTxt:{ fontSize: 11, fontWeight: "800", color: "#FFF8EC" },
}));
