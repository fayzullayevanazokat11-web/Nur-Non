// Qidiruv maydoni — ro'yxatlarni ism yoki sana bo'yicha filtrlash uchun.
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, T, S, R, temaStil } from "../theme";

// Katta-kichik harf, apostrof turlari va ortiqcha bo'shliq farq qilmaydi
export const qidiruvMos = (matn, soz) => {
  const n = (x) => String(x || "").toLowerCase().replace(/[ʻʼ‘’`´]/g, "'").replace(/\s+/g, " ").trim();
  const q = n(soz);
  if (!q) return true;
  // So'z boshidan mos kelishi kerak: "shanba" — "Shanba"ni topadi, lekin "Yakshanba"/"Dushanba"ni emas
  const t = n(matn);
  for (let i = t.indexOf(q); i >= 0; i = t.indexOf(q, i + 1)) {
    if (i === 0 || !/[\p{L}\p{N}']/u.test(t[i - 1])) return true;
  }
  return false;
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
  wrap:  { flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.pill, paddingHorizontal: S[4], backgroundColor: C.surface, marginBottom: S[4] },
  input: { flex: 1, paddingVertical: 10, fontSize: T.sm, color: C.text },
}));
