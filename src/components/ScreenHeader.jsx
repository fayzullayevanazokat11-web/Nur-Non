// Ekran sarlavhasi — barcha ekranlarda bir xil: eyebrow (TRACKED CAPS) + title + subtitle.
import { View, Text, StyleSheet } from "react-native";
import { C, T, S } from "../theme";

export function ScreenHeader({ eyebrow, title, subtitle, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {eyebrow ? <Text style={styles.eyebrow}>{String(eyebrow).toUpperCase()}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:     { marginBottom: S[5] },
  eyebrow:  { fontSize: 11, color: C.muted, fontWeight: "700", letterSpacing: 1.4 },
  title:    { fontSize: T.xl, color: C.text, fontWeight: "800", letterSpacing: -0.3, marginTop: S[1] },
  subtitle: { fontSize: T.sm, color: C.sub, fontWeight: "500", marginTop: S[1] },
});
