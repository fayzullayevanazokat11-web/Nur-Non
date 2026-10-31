// Yagona sahifa sarlavhasi — barcha bo'limlarda bir xil ko'rinish:
//   [← Markaz]                          (faqat ichki sahifalarda)
//   [ikonka]  EYEBROW
//             Sarlavha
//             izoh
// Paydo bo'lganda silliq ko'tariladi; orqaga tugmasi bosilganda yumshoq kichrayadi.
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { C, T, S, R, temaStil } from "../theme";

const orqagaQayt = () => (router.canGoBack() ? router.back() : router.replace("/"));

export function SahifaSarlavha({ eyebrow, title, subtitle, icon, image, ton = "accent", orqaga = "Markaz", style }) {
  const rang = C[ton] || C.accent;



  return (
    <View style={[styles.wrap, style]}>
      {orqaga ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Orqaga"
          onPress={orqagaQayt}
          sezgiTuri="otish"
          hitSlop={8}
          style={styles.backWrap}
        >
          {/* Bosish animatsiyasi — umumiy prujina (Pressable o'rami), boshqa tugmalar bilan bir xil */}
          <View style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={C.text} />
            <Text style={styles.backTxt}>{orqaga}</Text>
          </View>
        </Pressable>
      ) : null}

      {/* Alohida kirish animatsiyasi yo'q — sahifa o'zi fade bilan ochiladi (ustma-ust animatsiya miltillatardi) */}
      <View style={styles.titleRow}>
        {image || icon ? (
          <View style={[styles.iconBox, { backgroundColor: rang + "14" }]}>
            {image
              ? <Image source={image} style={[styles.img, { tintColor: rang }]} resizeMode="contain" />
              : <Ionicons name={icon} size={22} color={rang} />}
          </View>
        ) : null}
        <View style={styles.flex1}>
          {eyebrow ? <Text style={styles.eyebrow}>{String(eyebrow).toUpperCase()}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:     { marginBottom: S[5] },
  backWrap: { alignSelf: "flex-start", marginBottom: S[3] },
  backBtn:  { flexDirection: "row", alignItems: "center", gap: 4 },
  backTxt:  { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: S[3] },
  iconBox:  { width: 44, height: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center" },
  img:      { width: 24, height: 24 },
  flex1:    { flex: 1 },
  eyebrow:  { fontSize: 11, color: C.muted, fontWeight: "700", letterSpacing: 1.8 },
  title:    { fontSize: T.xl, color: C.text, fontWeight: "800", letterSpacing: -0.6, marginTop: 2 },
  subtitle: { fontSize: T.sm, color: C.sub, fontWeight: "500", marginTop: 3 },
}));
