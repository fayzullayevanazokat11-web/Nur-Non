// Bosiladigan navigatsiya qatori — ikonka, nom, izoh va o'q (bir xil ko'rinish uchun).
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, T, S, R, temaStil, shadow } from "../theme";

export function NavQator({ icon, nom, izoh, onPress, accessibilityLabel, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || nom}
      onPress={onPress}
      android_ripple={{ color: C.accent + "1A" }}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed, style]}
    >
      <View style={styles.icon}><Ionicons name={icon} size={21} color={C.accent} /></View>
      <View style={styles.flex1}>
        <Text style={styles.nom}>{nom}</Text>
        {izoh ? <Text style={styles.izoh} numberOfLines={1}>{izoh}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.muted} />
    </Pressable>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:    { flexDirection: "row", alignItems: "center", gap: S[3], backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1.5, borderColor: C.border, paddingVertical: S[3], paddingHorizontal: S[4], ...shadow },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  icon:    { width: 42, height: 42, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  flex1:   { flex: 1 },
  nom:     { fontSize: T.md, fontWeight: "800", color: C.text },
  izoh:    { fontSize: T.xs, color: C.sub, marginTop: 2 },
}));
