// Kartochka — View asosida, soya (elevation) bilan.
// danger / accent proplari fon va chegara rangini moslaydi.
import { View, StyleSheet } from "react-native";
import { C } from "../theme";

export function Card({ children, danger = false, accent = false, style }) {
  const bg = danger ? C.red + "10" : accent ? C.accent + "10" : C.card;
  const border = danger ? C.red + "50" : accent ? C.accent + "40" : C.border;
  return (
    <View style={[styles.base, { backgroundColor: bg, borderColor: border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
