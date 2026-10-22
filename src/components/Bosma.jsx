// Bosiladigan blok — bosilganda silliq (ease-in-out) biroz kichrayib, xiralashadi va
// qo'yib yuborilganda yumshoq qaytadi. Navigatsiya tugmalari va plitkalar uchun.
// style — ko'rinadigan blok uslubi; tashqi — joylashuv (masalan, qatorda flex: 1).
import { useRef } from "react";
import { Animated, Pressable, Easing } from "react-native";
import { ANIM } from "../theme";

export function Bosma({ style, tashqi, children, kichrayish = 0.97, disabled, ...rest }) {
  const v = useRef(new Animated.Value(0)).current;
  const anim = (to) =>
    Animated.timing(v, { toValue: to, duration: ANIM.pressDuration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
  const korinish = {
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] }),
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, kichrayish] }) }],
  };
  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => !disabled && anim(1)}
      onPressOut={() => anim(0)}
      style={tashqi}
      {...rest}
    >
      <Animated.View style={[style, korinish]}>{children}</Animated.View>
    </Pressable>
  );
}
