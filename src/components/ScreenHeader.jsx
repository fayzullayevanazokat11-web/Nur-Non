// Ekran sarlavhasi — eyebrow (TRACKED CAPS) yoki logo + title + subtitle.
// Ixtiyoriy `icon` — sarlavha yonida neytral (taupe) ikonka (jigarrang faqat tugmalar uchun).
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, T, S, R } from "../theme";

export function ScreenHeader({ eyebrow, title, subtitle, icon, logo, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {logo ? (
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
      ) : eyebrow ? (
        <Text style={styles.eyebrow}>{String(eyebrow).toUpperCase()}</Text>
      ) : null}
      <View style={styles.titleRow}>
        {icon ? (
          <View style={styles.iconBox}>
            <Ionicons name={icon} size={20} color={C.sub} />
          </View>
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:     { marginBottom: S[6] },
  logoWrap: { width: 150, height: 54, overflow: "hidden", marginLeft: -6, marginBottom: 2 },
  logo:     { width: 150, height: 150, marginTop: -48 },
  eyebrow:  { fontSize: 11, color: C.muted, fontWeight: "700", letterSpacing: 1.8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: S[3], marginTop: S[2] },
  iconBox:  { width: 42, height: 42, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.panel },
  title:    { fontSize: T.xl, color: C.text, fontWeight: "800", letterSpacing: -0.6, lineHeight: T.xl + 4, flexShrink: 1 },
  subtitle: { fontSize: T.sm, color: C.sub, fontWeight: "500", marginTop: S[2], lineHeight: 19 },
});

