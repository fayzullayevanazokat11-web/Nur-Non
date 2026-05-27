// Kartochka — minimalistik: oq fon + yupqa chegara (shaklni belgilaydi) + nozik soya.
// Paydo bo'lganda silliq ease-out fade + ko'tarilish animatsiyasi.
// danger / accent — yengil fon tinti + mos chegara.
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { C, R, S, shadow, ANIM } from "../theme";

export function Card({ children, danger = false, accent = false, animate = true, style }) {
  const v = useRef(new Animated.Value(animate ? 0 : 1)).current;
  useEffect(() => {
    if (!animate) return;
    Animated.timing(v, {
      toValue: 1,
      duration: ANIM.duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [animate, v]);

  const variant = danger
    ? { backgroundColor: C.red + "0D", borderColor: C.red + "2E" }
    : accent
    ? { backgroundColor: C.accent + "10", borderColor: C.accent + "33" }
    : { backgroundColor: C.card, borderColor: C.border };

  const entrance = {
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  };

  return <Animated.View style={[styles.base, variant, entrance, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: R.lg,
    borderWidth: 1.5,
    padding: S[5],
    ...shadow,
  },
});
