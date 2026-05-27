// Markaz brendi sarlavhasi — jigarrang banner + oq kvadrat ichida "Non" logotipi
// + "Nur-Non" / "Boshqaruv tizimi".
import { View, Text, Image, StyleSheet } from "react-native";
import { C, T, S, R, shadow } from "../theme";

const LOGO = require("../../assets/logo.png");

export function BrandHeader() {
  return (
    <View style={styles.banner}>
      <View style={styles.tile}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.flex1}>
        <Text style={styles.title}>Nur-Non</Text>
        <Text style={styles.sub}>Boshqaruv tizimi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: S[4],
    backgroundColor: C.accent,
    borderRadius: R.xl,
    paddingVertical: S[4],
    paddingHorizontal: S[4],
    marginBottom: S[6],
    ...shadow,
  },
  tile: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logo:  { width: 54, height: 54 },
  flex1: { flex: 1 },
  title: { fontSize: 23, fontWeight: "800", color: "#FFF6EA", letterSpacing: -0.3 },
  sub:   { fontSize: T.sm, color: "#EBD8BF", marginTop: 2, fontWeight: "500" },
});
