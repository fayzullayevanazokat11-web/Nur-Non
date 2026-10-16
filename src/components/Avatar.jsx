// Xodim avatari — bosh harflar (initials) tinti doirada.
import { View, Text, StyleSheet } from "react-native";
import { C, R, temaStil } from "../theme";

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ name, size = 44 }) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: R.md }]}>
      <Text style={styles.txt}>{initials(name)}</Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap: { backgroundColor: C.accent + "16", alignItems: "center", justifyContent: "center" },
  txt:  { color: C.accent, fontWeight: "800", fontSize: 16, letterSpacing: 0.3 },
}));
