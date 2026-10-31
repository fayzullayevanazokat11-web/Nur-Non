// Bosiladigan blok — bosilganda silliq (ease-in-out) biroz kichrayib, xiralashadi va
// qo'yib yuborilganda yumshoq qaytadi. Navigatsiya tugmalari va plitkalar uchun.
// style — ko'rinadigan blok uslubi; tashqi — joylashuv (masalan, qatorda flex: 1).
import { useRef } from "react";
import { Animated, Pressable, Easing } from "react-native";
import { BOS_KIRISH, BOS_QAYTISH } from "../logic/fizika";

export function Bosma({ style, tashqi, children, kichrayish = 0.97, disabled, sezgiTuri = "otish", ...rest }) {
  const v = useRef(new Animated.Value(0)).current;
  // Prujina: bosilganda tez (sakramasdan), qo'yilganda yengil "sakrab" — barcha tugmalar bilan bir xil his
  const anim = (to) =>
    Animated.spring(v, { toValue: to, ...(to ? BOS_KIRISH : BOS_QAYTISH), useNativeDriver: true, restDisplacementThreshold: 0.001, restSpeedThreshold: 0.001 }).start();
  const korinish = {
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] }),
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, kichrayish] }) }],
  };
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
      <Animated.View needsOffscreenAlphaCompositing style={[style, korinish]}>{children}</Animated.View>
    </Pressable>
  );
}
