// Qidiruv maydoni — ro'yxatlarni ism yoki sana bo'yicha filtrlash uchun.
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, T, S, R, temaStil } from "../theme";

// Katta-kichik harf, apostrof turlari va ortiqcha bo'shliq farq qilmaydi
export const qidiruvMos = (matn, soz) => {
  const n = (x) => String(x || "").toLowerCase().replace(/[ʻʼ‘’`´]/g, "'").replace(/\s+/g, " ").trim();
  const q = n(soz);
  return !q || n(matn).includes(q);
};

export function Qidiruv({ value, onChange, placeholder = "Qidirish", style }) {
  return (
    <View style={[styles.wrap, style]}>
      <Ionicons name="search-outline" size={17} color={C.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        autoCorrect={false}
        returnKeyType="search"
        style={styles.input}
      />
      {value ? (
        <Pressable accessibilityLabel="Qidiruvni tozalash" onPress={() => onChange("")} hitSlop={10}>
          <Ionicons name="close-circle" size={17} color={C.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:  { flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.pill, paddingHorizontal: S[4], backgroundColor: C.surface, marginBottom: S[3] },
  input: { flex: 1, paddingVertical: 10, fontSize: T.sm, color: C.text },
}));
