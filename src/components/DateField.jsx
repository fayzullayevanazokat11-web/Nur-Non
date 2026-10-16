// Sana tanlash maydoni — bosilganda kichik kalendar shu yerda DARROV ochiladi
// (Modal/Bottom Sheet ishlatilmaydi). Qiymat "YYYY-MM-DD" ko'rinishida.
import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, T, S, R, temaStil } from "../theme";

const HAFTA = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const OYLAR = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

const ikki = (n) => String(n).padStart(2, "0");
const sanaStr = (y, m, d) => `${y}-${ikki(m + 1)}-${ikki(d)}`;

export function DateField({ value, onChange }) {
  const [ochiq, setOchiq] = useState(false);
  const bugun = new Date();
  const boshlang = value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? { y: +value.slice(0, 4), m: +value.slice(5, 7) - 1 }
    : { y: bugun.getFullYear(), m: bugun.getMonth() };
  const [yil, setYil] = useState(boshlang.y);
  const [oy, setOy] = useState(boshlang.m);

  const kunlarSoni = new Date(yil, oy + 1, 0).getDate();
  const birinchi = (new Date(yil, oy, 1).getDay() + 6) % 7; // Dushanba = 0
  const katak = [];
  for (let i = 0; i < birinchi; i++) katak.push(null);
  for (let d = 1; d <= kunlarSoni; d++) katak.push(d);

  const oyOzgartir = (delta) => {
    let m = oy + delta, y = yil;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    setOy(m); setYil(y);
  };
  const tanla = (d) => { onChange(sanaStr(yil, oy, d)); setOchiq(false); };

  const bugunStr = sanaStr(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());

  return (
    <View>
      <Pressable style={styles.field} onPress={() => setOchiq((o) => !o)}>
        <Ionicons name="calendar-outline" size={16} color={C.sub} />
        <Text style={styles.fieldTxt}>{value || "Sanani tanlang"}</Text>
        <Ionicons name={ochiq ? "chevron-up" : "chevron-down"} size={16} color={C.muted} />
      </Pressable>

      {ochiq && (
        <View style={styles.panel}>
          <View style={styles.head}>
            <Text style={styles.headLabel}>Yil</Text>
            <View style={styles.navRow}>
              <Pressable accessibilityLabel="Oldingi yil" onPress={() => setYil(yil - 1)} hitSlop={10} style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}>
                <Ionicons name="chevron-back" size={20} color={C.onAccent} />
              </Pressable>
              <Text style={styles.navTitle}>{yil}</Text>
              <Pressable accessibilityLabel="Keyingi yil" onPress={() => setYil(yil + 1)} hitSlop={10} style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}>
                <Ionicons name="chevron-forward" size={20} color={C.onAccent} />
              </Pressable>
            </View>
          </View>

          <View style={styles.head}>
            <Text style={styles.headLabel}>Oy</Text>
            <View style={styles.navRow}>
              <Pressable accessibilityLabel="Oldingi oy" onPress={() => oyOzgartir(-1)} hitSlop={10} style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}>
                <Ionicons name="chevron-back" size={20} color={C.onAccent} />
              </Pressable>
              <Text style={styles.navTitle}>{OYLAR[oy]}</Text>
              <Pressable accessibilityLabel="Keyingi oy" onPress={() => oyOzgartir(1)} hitSlop={10} style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}>
                <Ionicons name="chevron-forward" size={20} color={C.onAccent} />
              </Pressable>
            </View>
          </View>

          <View style={styles.hafta}>
            {HAFTA.map((h) => <Text key={h} style={styles.haftaTxt}>{h}</Text>)}
          </View>

          <View style={styles.grid}>
            {katak.map((d, i) => {
              if (d === null) return <View key={i} style={styles.kun} />;
              const ds = sanaStr(yil, oy, d);
              const tanlangan = ds === value;
              const buKun = ds === bugunStr;
              return (
                <Pressable key={i} style={styles.kun} onPress={() => tanla(d)}>
                  <Text style={[styles.kunTxt, tanlangan && styles.kunTxtTanlangan, buKun && !tanlangan && styles.kunBugun]}>{d}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.bugunBtn} onPress={() => { const b = new Date(); setYil(b.getFullYear()); setOy(b.getMonth()); onChange(bugunStr); setOchiq(false); }}>
              <Text style={styles.bugunTxt}>Bugun</Text>
            </Pressable>
            <Pressable style={styles.yopBtn} onPress={() => setOchiq(false)}>
              <Text style={styles.yopTxt}>Yopish</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  field:    { flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: C.surface },
  fieldTxt: { flex: 1, fontSize: T.md, color: C.text, fontWeight: "600" },
  panel:    { marginTop: S[2], borderWidth: 1, borderColor: C.borderSoft, borderRadius: R.md, padding: S[3], backgroundColor: C.surface },
  head:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S[2] },
  headLabel:{ fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  navRow:   { flexDirection: "row", alignItems: "center", gap: S[2] },
  navBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: R.pill, backgroundColor: C.accent },
  navBtnPressed: { opacity: 0.75, transform: [{ scale: 0.95 }] },
  navTitle: { fontSize: T.sm, fontWeight: "800", color: C.text, minWidth: 84, textAlign: "center" },
  hafta:    { flexDirection: "row", marginBottom: S[1], marginTop: S[2] },
  haftaTxt: { flex: 1, textAlign: "center", fontSize: 11, color: C.muted, fontWeight: "700" },
  grid:     { flexDirection: "row", flexWrap: "wrap" },
  kun:      { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  kunTxt:   { fontSize: T.sm, color: C.text, width: 32, height: 32, borderRadius: 16, textAlign: "center", textAlignVertical: "center", lineHeight: 32 },
  kunTxtTanlangan: { backgroundColor: C.accent, color: C.onAccent, fontWeight: "800", overflow: "hidden" },
  kunBugun: { color: C.accent, fontWeight: "800" },
  actions:  { flexDirection: "row", gap: S[2], marginTop: S[3] },
  bugunBtn: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: R.md, backgroundColor: C.accent },
  bugunTxt: { fontSize: T.sm, fontWeight: "800", color: C.onAccent },
  yopBtn:   { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: R.md, borderWidth: 1, borderColor: C.border },
  yopTxt:   { fontSize: T.sm, fontWeight: "700", color: C.sub },
}));
