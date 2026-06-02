// Markaz brendi sarlavhasi — jigarrang banner + oq kvadrat ichida "Non" logotipi
// + "Nur-Non" / "Boshqaruv tizimi". O'ng chetda joriy sana va vaqt (har 30s yangilanadi).
import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, T, S, R, shadow } from "../theme";

const LOGO = require("../../assets/logo-tight.png");
const OYLAR = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
const ikki = (n) => String(n).padStart(2, "0");

function hozir() {
  const d = new Date();
  return {
    sana: `${ikki(d.getDate())} ${OYLAR[d.getMonth()]}`,
    vaqt: `${ikki(d.getHours())}:${ikki(d.getMinutes())}`,
  };
}

export function BrandHeader() {
  const [t, setT] = useState(hozir());
  useEffect(() => {
    const id = setInterval(() => setT(hozir()), 30000); // 30s
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.banner}>
      <View style={styles.tile}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.flex1}>
        <Text style={styles.title}>Nur-Non</Text>
        <Text style={styles.sub}>Boshqaruv tizimi</Text>
      </View>
      <View style={styles.clock}>
        <View style={styles.clockRow}>
          <Ionicons name="time-outline" size={12} color="#FFF6EA" />
          <Text style={styles.clockTime}>{t.vaqt}</Text>
        </View>
        <Text style={styles.clockDate}>{t.sana}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: S[3],
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
  logo:  { width: 50, height: 50 },
  flex1: { flex: 1 },
  title: { fontSize: 23, fontWeight: "800", color: "#FFF6EA", letterSpacing: -0.3 },
  sub:   { fontSize: T.sm, color: "#EBD8BF", marginTop: 2, fontWeight: "500" },
  clock: {
    alignItems: "flex-end",
    paddingHorizontal: S[3],
    paddingVertical: 6,
    borderRadius: R.md,
    backgroundColor: "rgba(255,246,234,0.12)",
  },
  clockRow:  { flexDirection: "row", alignItems: "center", gap: 3 },
  clockTime: { fontSize: T.md, color: "#FFF6EA", fontWeight: "800", letterSpacing: 0.3 },
  clockDate: { fontSize: 10, color: "#EBD8BF", fontWeight: "700", marginTop: 1, letterSpacing: 0.4 },
});
