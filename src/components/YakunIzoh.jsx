// Kun yakunlangan bo'lsa formalar tepasida eslatma: yangi yozuv ertangi ish kuniga tushadi
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../store/AppData";
import { C, T, S, R, temaStil } from "../theme";

export function YakunIzoh() {
  const { kunYakunlangan, yozuvSanasi } = useApp();
  if (!kunYakunlangan) return null;
  return (
    <View style={styles.quti} testID="yakun-izoh">
      <Ionicons name="moon-outline" size={14} color={C.accent} />
      <Text style={styles.matn}>Bugungi kun yakunlangan — yangi yozuv ertangi ({yozuvSanasi()}) hisobiga tushadi.</Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  quti: { flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.accentBg, borderWidth: 1, borderColor: C.accentBorder, borderRadius: R.md, padding: S[3], marginBottom: S[3] },
  matn: { flex: 1, fontSize: T.xs, color: C.sub, fontWeight: "600" },
}));
