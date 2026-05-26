// Kartochka — minimal: oq fon + yumshoq soya (chegarasiz).
// danger / accent — chegara o'rniga juda yengil fon tinti.
import { View, StyleSheet } from "react-native";
import { C, R, S, shadow } from "../theme";

export function Card({ children, danger = false, accent = false, style }) {
  const variant = danger
    ? { backgroundColor: C.red + "0D", borderColor: C.red + "26", borderWidth: 1 }
    : accent
    ? { backgroundColor: C.accent + "0D", borderColor: C.accent + "24", borderWidth: 1 }
    : { backgroundColor: C.card, borderWidth: 0 };
  return <View style={[styles.base, variant, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: R.lg,
    padding: S[4],
    ...shadow,
  },
});
