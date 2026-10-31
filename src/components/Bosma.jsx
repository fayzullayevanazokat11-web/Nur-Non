// Bosiladigan blok — bosilganda prujina bilan biroz kichrayadi va qo'yib yuborilganda yumshoq qaytadi
// (native driver; shaffoflik o'zgarmaydi — katta kartalarda offscreen chizish va chetlar qorayishi bo'lmasin).
// Navigatsiya tugmalari va plitkalar uchun.
// style — ko'rinadigan blok uslubi; tashqi — joylashuv (masalan, qatorda flex: 1).
import { useMemo, useRef } from "react";
import { Animated, Pressable, Easing } from "react-native";
import { BOS_KIRISH, BOS_QAYTISH } from "../logic/fizika";

export function Bosma({ style, tashqi, children, kichrayish = 0.97, disabled, sezgiTuri = "otish", ...rest }) {
  const v = useRef(new Animated.Value(0)).current;
  // Prujina: bosilganda tez (sakramasdan), qo'yilganda yengil "sakrab" — barcha tugmalar bilan bir xil his
  const anim = (to) =>
    Animated.spring(v, { toValue: to, ...(to ? BOS_KIRISH : BOS_QAYTISH), useNativeDriver: true, restDisplacementThreshold: 0.001, restSpeedThreshold: 0.001 }).start();
  const korinish = useMemo(() => ({
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, kichrayish] }) }],
  }), [v, kichrayish]);
  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => !disabled && anim(1)}
      onPressOut={() => anim(0)}
      style={tashqi}
      sezgiTuri={sezgiTuri}
      animatsiya={false}
      {...rest}
    >
      <Animated.View style={[style, korinish]}>{children}</Animated.View>
    </Pressable>
  );
}
