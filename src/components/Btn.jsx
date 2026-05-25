// Tugma — Pressable asosida. Bosilganda ozgina shaffoflashadi.
import { Pressable, Text, StyleSheet } from "react-native";
import { C, T } from "../theme";

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
          opacity: pressed && !disabled ? 0.85 : 1,
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
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: T.md, fontWeight: "800", letterSpacing: 0.3 },
});
