// Bo'sh holat kartasi: ikonka, qisqa izoh va (ixtiyoriy) birinchi qadam tugmasi
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { Btn } from "./Btn";
import { C, T, S, R, temaStil } from "../theme";

export function BoshHolat({ icon = "sparkles-outline", sarlavha, matn, tugma, onPress, style }) {
  return (
    <Card style={[styles.card, style]}>
      <View style={styles.ikon}><Ionicons name={icon} size={26} color={C.accent} /></View>
      {sarlavha ? <Text style={styles.sarlavha}>{sarlavha}</Text> : null}
      {matn ? <Text style={styles.matn}>{matn}</Text> : null}
      {tugma && onPress ? <View style={styles.tugma}><Btn icon="add-circle-outline" onPress={onPress}>{tugma}</Btn></View> : null}
    </Card>
  );
}

const styles = temaStil(() => StyleSheet.create({
  card:     { alignItems: "center", paddingVertical: S[5] },
  ikon:     { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14", marginBottom: S[3] },
  sarlavha: { fontSize: T.md, fontWeight: "800", color: C.text, textAlign: "center" },
  matn:     { fontSize: T.sm, color: C.sub, textAlign: "center", marginTop: 4, lineHeight: 20 },
  tugma:    { marginTop: S[4], alignSelf: "stretch" },
}));
