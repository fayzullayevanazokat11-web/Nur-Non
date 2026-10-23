// Tugma — Pressable asosida. Bosilganda silliq (ease-in-out) kichrayadi + shaffoflashadi.
// Yozuvi o'zgarsa (masalan "Saqlash" → "Saqlandi") — yangi holat yumshoq paydo bo'ladi.
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, Easing, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, T, R, ANIM, temaStil } from "../theme";

export function Btn({
  children,
  onPress,
  color = C.accent,
  textColor = C.onAccent,
  icon,
  disabled = false,
  secondary = false,
  full = true,
  style,
  sezgiTuri = "bos",
}) {
  const bg = disabled ? C.border : secondary ? "transparent" : color;
  const fg = disabled ? C.muted : secondary ? C.sub : textColor;

  const v = useRef(new Animated.Value(0)).current;
  const animate = (to) =>
    Animated.timing(v, {
      toValue: to,
      duration: ANIM.pressDuration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

  // Holat almashganda (yozuv yoki ikonka) — qisqa "pop"
  const holat = `${String(children)}|${icon || ""}`;
  const pop = useRef(new Animated.Value(1)).current;
  const birinchi = useRef(true);
  useEffect(() => {
    if (birinchi.current) { birinchi.current = false; return; }
    pop.setValue(0);
    Animated.timing(pop, { toValue: 1, duration: 260, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }).start();
  }, [holat]);

  const scale = Animated.multiply(
    v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }),
    pop.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] })
  );
  const opacity = Animated.multiply(
    v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }),
    pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] })
  );

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      sezgiTuri={sezgiTuri}
      onPressIn={() => !disabled && animate(1)}
      onPressOut={() => !disabled && animate(0)}
      style={full ? styles.full : undefined}
    >
      <Animated.View
        needsOffscreenAlphaCompositing
        style={[
          styles.base,
          {
            backgroundColor: bg,
            width: full ? "100%" : undefined,
            borderWidth: secondary ? 1 : 0,
            borderColor: C.border,
            opacity,
            transform: [{ scale }],
          },
          style,
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={fg} style={styles.icon} /> : null}
        <Text style={[styles.label, { color: fg }]}>{children}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = temaStil(() => StyleSheet.create({
  full: { width: "100%" },
  base: {
    flexDirection: "row",
    borderRadius: R.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  icon:  { marginRight: 8 },
  label: { fontSize: T.md, fontWeight: "700", letterSpacing: 0.2 },
}));
