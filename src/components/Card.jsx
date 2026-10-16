// Kartochka — oq/qaymoq fon + yupqa chegara + nozik soya.
// `animate` true bo'lsa paydo bo'lganda silliq fade+ko'tarilish; aks holda oddiy View
// (ko'p kartali ro'yxatlarда scroll ravon bo'lishi uchun).
import { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import { C, R, S, shadow, ANIM, temaStil } from "../theme";

export function Card({ children, danger = false, accent = false, animate = true, style }) {
  // Fon SHAFFOFMAS (opaque) — yarim-shaffof fon + elevation Android'да
  // burchaklarda soya "sizib o'tishi" (qalin halo) artefaktini beradi.
  const variant = danger
    ? { backgroundColor: C.dangerBg, borderColor: C.dangerBorder }
    : accent
    ? { backgroundColor: C.accentBg, borderColor: C.accentBorder }
    : { backgroundColor: C.card, borderColor: C.border };

  if (!animate) {
    return <View style={[styles.base, variant, style]}>{children}</View>;
  }
  return <AnimatedCard variant={variant} style={style}>{children}</AnimatedCard>;
}

function AnimatedCard({ variant, style, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: ANIM.duration, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, [v]);
  const entrance = {
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  };
  return <Animated.View style={[styles.base, variant, entrance, style]}>{children}</Animated.View>;
}

const styles = temaStil(() => StyleSheet.create({
  base: {
    borderRadius: R.lg,
    borderWidth: 1.5,
    padding: S[5],
    ...shadow,
  },
}));
