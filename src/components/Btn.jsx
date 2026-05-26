// Tugma — Pressable asosida. Bosilganda yengil shaffoflashadi + kichrayadi.
import { Pressable, Text, StyleSheet } from "react-native";
import { C, T, R } from "../theme";

export function Btn({
  children,
  onPress,
  color = C.accent,
  textColor = "#FFF3E8",
  disabled = false,
  secondary = false,
  full = true,
  style,
}) {
  const bg = disabled ? C.border : secondary ? "transparent" : color;
  const fg = disabled ? C.muted : secondary ? C.sub : textColor;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          width: full ? "100%" : undefined,
          borderWidth: secondary ? 1 : 0,
          borderColor: C.border,
          opacity: pressed && !disabled ? 0.9 : 1,
          transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: fg }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: R.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: T.md, fontWeight: "700", letterSpacing: 0.2 },
});
