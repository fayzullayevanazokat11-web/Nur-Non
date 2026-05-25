// "Xodimlar" ekrani — kasb emoji bilan (rasmsiz).
import { useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { C, T } from "../../src/theme";
import { formatSom } from "../../src/logic/hisob";
import { getLavozimEmoji, getLavozimLabel } from "../../src/logic/konstantalar";

export default function Xodimlar() {
  const { ishchilar, setIshchilar } = useApp();

  const aktiv = (ishchilar || []).filter((w) => w.holat === "Aktiv");
  const oylikFond = useMemo(
    () => aktiv.reduce((s, w) => s + (parseFloat(w.miqdor) || 0) * (w.haqTuri === "kunlik" ? 30 : 1), 0),
    [aktiv]
  );

  const ochir = (id) =>
    Alert.alert("O'chirish", "Bu xodimni o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => setIshchilar((p) => p.filter((w) => w.id !== id)) },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Jamoa</Text>
        <Text style={styles.title}>Xodimlar</Text>

        <View style={styles.statsRow}>
          <Card style={styles.statTile}>
            <Text style={styles.statLabel}>AKTIV XODIMLAR</Text>
            <Text style={[styles.statValue, { color: C.text }]}>{aktiv.length}</Text>
            <Text style={styles.statUnit}>nafar</Text>
          </Card>
          <Card style={styles.statTile}>
            <Text style={styles.statLabel}>OYLIK FOND (TAXM.)</Text>
            <Text style={[styles.statValue, { color: C.green }]} numberOfLines={1}>{formatSom(oylikFond)}</Text>
            <Text style={styles.statUnit}>so'm / oy</Text>
          </Card>
        </View>

        <View style={styles.gap14} />
        <Btn onPress={() => Alert.alert("Tez orada", "Xodim qo'shish formasi keyingi bosqichda.")}>+ Yangi ishchi kiritish</Btn>
        <View style={styles.gap14} />

        {(ishchilar || []).length === 0 ? (
          <Card><Text style={styles.muted}>Xodimlar hali kiritilmagan</Text></Card>
        ) : (
          ishchilar.map((w) => (
            <Card key={w.id} style={styles.item}>
              <View style={styles.rowBetween}>
                <View style={styles.left}>
                  <View style={styles.avatar}><Text style={styles.avatarEmoji}>{getLavozimEmoji(w)}</Text></View>
                  <View style={styles.flex1}>
                    <Text style={styles.ism}>{w.ism}</Text>
                    <Text style={styles.lavozim}>{getLavozimLabel(w)}</Text>
                  </View>
                </View>
                <Pressable onPress={() => ochir(w.id)} hitSlop={8} style={styles.del}>
                  <Ionicons name="trash-outline" size={18} color={C.red} />
                </Pressable>
              </View>
              <View style={styles.divider} />
              <View style={styles.rowBetween}>
                <Text style={[styles.badge, { color: w.holat === "Aktiv" ? C.green : C.sub }]}>{w.holat}</Text>
                <Text style={styles.haq}>
                  {formatSom(w.miqdor)} so'm{w.haqTuri === "qop" ? "/qop" : "/kun"}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 16, paddingBottom: 32 },
  eyebrow:   { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  title:     { fontSize: T.xl, fontWeight: "900", color: C.text, marginTop: 2, marginBottom: 14 },
  statsRow:  { flexDirection: "row", gap: 8 },
  statTile:  { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  statLabel: { fontSize: 9, color: C.muted, fontWeight: "700", letterSpacing: 0.6, marginBottom: 5 },
  statValue: { fontSize: 24, fontWeight: "900" },
  statUnit:  { fontSize: 10, color: C.muted, marginTop: 2 },
  gap14:     { height: 14 },
  item:      { marginBottom: 10 },
  rowBetween:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left:      { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar:    { width: 42, height: 42, borderRadius: 12, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.borderSoft },
  avatarEmoji:{ fontSize: 20 },
  flex1:     { flex: 1 },
  ism:       { fontSize: T.md, fontWeight: "900", color: C.text },
  lavozim:   { fontSize: T.sm, color: C.sub, marginTop: 1 },
  del:       { padding: 6 },
  divider:   { height: 1, backgroundColor: C.border, marginVertical: 8 },
  badge:     { fontSize: T.xs, fontWeight: "800" },
  haq:       { fontSize: T.sm, fontWeight: "900", color: C.accent },
  muted:     { fontSize: T.sm, color: C.muted },
});
