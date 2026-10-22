// Markaz brendi sarlavhasi — jigarrang banner + oq kvadrat ichida "Non" logotipi
// + "Nur-Non" / asosiy akkaunt nomi (yo'q bo'lsa "Boshqaruv tizimi"). O'ng chetda joriy sana va vaqt (har 30s yangilanadi).
// Logotip bosilganda `onLogo` chaqiriladi (Markaz menyusi: Tarixdagilar, yozuv tanlovi).
import { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import { ishKuni } from "../logic/hisob";
import { C, T, S, R, shadow, temaStil } from "../theme";

const LOGO = require("../../assets/logo-tight.png");
const OYLAR = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
const ikki = (n) => String(n).padStart(2, "0");

// Sana — ISH KUNI (tunda 03:00 gacha hali kechagi kun), soat — haqiqiy vaqt
function hozir() {
  const d = new Date();
  const k = ishKuni();
  return {
    sana: `${ikki(k.getDate())} ${OYLAR[k.getMonth()]}`,
    vaqt: `${ikki(d.getHours())}:${ikki(d.getMinutes())}`,
  };
}

export function BrandHeader({ onLogo, menuOchiq = false }) {
  const { akkauntNomi } = useApp();
  const [t, setT] = useState(hozir());
  useEffect(() => {
    const id = setInterval(() => setT(hozir()), 30000); // 30s
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.banner}>
      <Pressable
        accessibilityLabel="Menyu"
        accessibilityRole="button"
        onPress={onLogo}
        disabled={!onLogo}
        hitSlop={6}
        style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        {onLogo ? (
          <View style={styles.tileBadge}>
            <Ionicons name={menuOchiq ? "chevron-up" : "chevron-down"} size={11} color={C.onAccent} />
          </View>
        ) : null}
      </Pressable>
      <View style={styles.flex1}>
        <Text style={styles.title}>Nur-Non</Text>
        {akkauntNomi ? (
          <View style={styles.akkRow}>
            <Ionicons name="person-circle-outline" size={13} color={C.onAccentSub} />
            <Text style={[styles.sub, styles.akk]} numberOfLines={1}>{akkauntNomi}</Text>
          </View>
        ) : (
          <Text style={styles.sub}>Boshqaruv tizimi</Text>
        )}
      </View>
      <View style={styles.clock}>
        <View style={styles.clockRow}>
          <Ionicons name="time-outline" size={12} color={C.onAccent} />
          <Text style={styles.clockTime}>{t.vaqt}</Text>
        </View>
        <Text style={styles.clockDate}>{t.sana}</Text>
      </View>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
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
  tilePressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
  tileBadge: {
    position: "absolute", right: -4, bottom: -4, width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.accent, borderWidth: 2, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center",
  },
  logo:  { width: 50, height: 50 },
  flex1: { flex: 1 },
  title: { fontSize: 23, fontWeight: "800", color: C.onAccent, letterSpacing: -0.3 },
  sub:   { fontSize: T.sm, color: C.onAccentSub, marginTop: 2, fontWeight: "500" },
  akkRow:{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  akk:   { marginTop: 0, fontWeight: "700", flexShrink: 1 },
  clock: {
    alignItems: "flex-end",
    paddingHorizontal: S[3],
    paddingVertical: 6,
    borderRadius: R.md,
    backgroundColor: C.onAccent + "1F",
  },
  clockRow:  { flexDirection: "row", alignItems: "center", gap: 3 },
  clockTime: { fontSize: T.md, color: C.onAccent, fontWeight: "800", letterSpacing: 0.3 },
  clockDate: { fontSize: 10, color: C.onAccentSub, fontWeight: "700", marginTop: 1, letterSpacing: 0.4 },
}));
