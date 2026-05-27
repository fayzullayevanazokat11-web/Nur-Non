// Ekran sarlavhasi — barcha ekranlarda bir xil: eyebrow (TRACKED CAPS) + title + subtitle.
// Ixtiyoriy `icon` — sarlavha yonida accent rangli ikonka.
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, T, S, R } from "../theme";

export function ScreenHeader({ eyebrow, title, subtitle, icon, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {eyebrow ? <Text style={styles.eyebrow}>{String(eyebrow).toUpperCase()}</Text> : null}
      <View style={styles.titleRow}>
        {icon ? (
          <View style={styles.iconBox}>
            <Ionicons name={icon} size={18} color={C.accent} />
          </View>
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:     { marginBottom: S[5] },
  eyebrow:  { fontSize: 11, color: C.muted, fontWeight: "700", letterSpacing: 1.4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: S[2], marginTop: S[1] },
  iconBox:  { width: 34, height: 34, borderRadius: R.sm, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "0D", borderWidth: 1, borderColor: C.accent + "2E" },
  title:    { fontSize: T.xl, color: C.text, fontWeight: "800", letterSpacing: -0.3, flexShrink: 1 },
  subtitle: { fontSize: T.sm, color: C.sub, fontWeight: "500", marginTop: S[1] },
});
