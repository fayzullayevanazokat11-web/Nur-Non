// Tugma — Pressable asosida. Bosilganda silliq (ease-in-out) kichrayadi + shaffoflashadi.
import { useRef } from "react";
import { Animated, Pressable, Text, Easing, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, T, R, ANIM } from "../theme";

export function Btn({
  children,
  onPress,
  color = C.accent,
  textColor = "#FFF3E8",
  icon,
  disabled = false,
  secondary = false,
  full = true,
  style,
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

  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] });

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      onPressIn={() => !disabled && animate(1)}
      onPressOut={() => !disabled && animate(0)}
      style={full ? styles.full : undefined}
    >
      <Animated.View
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

const styles = StyleSheet.create({
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
});
