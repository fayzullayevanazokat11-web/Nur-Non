// Vaqt (soat:daqiqa) maydoni — sukut bo'yicha HOZIRGI vaqt avtomatik (qiymat bo'sh "").
// Bosilganda shu yerda kichik panel ochiladi: soat va daqiqani −/+ bilan o'zgartirish,
// "Hozir" — yana avtomatik holatga qaytarish. Qiymat "HH:MM" ko'rinishida.
import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, T, S, R, temaStil } from "../theme";

const ikki = (n) => String(n).padStart(2, "0");
export const hozirgiSoat = () => { const d = new Date(); return `${ikki(d.getHours())}:${ikki(d.getMinutes())}`; };
const ajrat = (v) => { const m = /^(\d{1,2}):(\d{2})$/.exec(v || ""); return m ? [+m[1], +m[2]] : null; };

export function VaqtField({ value, onChange }) {
  const [ochiq, setOchiq] = useState(false);
  const [hozir, setHozir] = useState(hozirgiSoat());
  // Avtomatik holatda ko'rinadigan vaqt yangilanib turadi
  useEffect(() => {
    if (value) return undefined;
    const t = setInterval(() => setHozir(hozirgiSoat()), 20000);
    return () => clearInterval(t);
  }, [value]);

  const joriy = ajrat(value) || ajrat(hozir);
  const qoy = (s, d) => onChange(`${ikki((s + 24) % 24)}:${ikki((d + 60) % 60)}`);
  const soatQosh = (x) => qoy(joriy[0] + x, joriy[1]);
  const daqiqaQosh = (x) => {
    let s = joriy[0], d = joriy[1] + x;
    if (d >= 60) { d -= 60; s += 1; } else if (d < 0) { d += 60; s -= 1; }
    qoy(s, d);
  };

  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityLabel="Vaqtni o'zgartirish" style={styles.field} onPress={() => setOchiq((o) => !o)}>
        <Ionicons name="time-outline" size={16} color={C.sub} />
        <Text style={styles.fieldTxt}>{value || hozir}</Text>
        {!value && <Text style={styles.avto}>hozir</Text>}
        <Ionicons name={ochiq ? "chevron-up" : "chevron-down"} size={16} color={C.muted} />
      </Pressable>

      {ochiq && (
        <View style={styles.panel}>
          <View style={styles.qator}>
            <Stepper nom="Soat" qiymat={ikki(joriy[0])} kam={() => soatQosh(-1)} kop={() => soatQosh(1)} />
            <Text style={styles.ikkiNuqta}>:</Text>
            <Stepper nom="Daqiqa" qiymat={ikki(joriy[1])} kam={() => daqiqaQosh(-5)} kop={() => daqiqaQosh(5)} />
          </View>
          <View style={styles.actions}>
            <Pressable accessibilityLabel="Hozirgi vaqt" style={styles.hozirBtn} onPress={() => { onChange(""); setHozir(hozirgiSoat()); setOchiq(false); }}>
              <Text style={styles.hozirTxt}>Hozir</Text>
            </Pressable>
            <Pressable style={styles.yopBtn} onPress={() => setOchiq(false)}>
              <Text style={styles.yopTxt}>Tayyor</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function Stepper({ nom, qiymat, kam, kop }) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepNom}>{nom}</Text>
      <View style={styles.stepQator}>
        <Pressable accessibilityLabel={`${nom}: kamaytirish`} onPress={kam} hitSlop={6} style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}>
          <Ionicons name="remove" size={18} color={C.onAccent} />
        </Pressable>
        <Text style={styles.stepVal}>{qiymat}</Text>
        <Pressable accessibilityLabel={`${nom}: oshirish`} onPress={kop} hitSlop={6} style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}>
          <Ionicons name="add" size={18} color={C.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  field:    { flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: C.surface },
  fieldTxt: { flex: 1, fontSize: T.md, color: C.text, fontWeight: "600" },
  avto:     { fontSize: 11, fontWeight: "700", color: C.muted, marginRight: 4 },
  panel:    { marginTop: S[2], borderWidth: 1, borderColor: C.borderSoft, borderRadius: R.md, padding: S[3], backgroundColor: C.surface },
  qator:    { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: S[3] },
  ikkiNuqta:{ fontSize: 26, fontWeight: "800", color: C.text, marginBottom: 6 },
  stepper:  { alignItems: "center" },
  stepNom:  { fontSize: 11, color: C.sub, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  stepQator:{ flexDirection: "row", alignItems: "center", gap: S[2] },
  stepBtn:  { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: C.accent },
  pressed:  { opacity: 0.75, transform: [{ scale: 0.95 }] },
  stepVal:  { fontSize: 26, fontWeight: "800", color: C.text, minWidth: 40, textAlign: "center" },
  actions:  { flexDirection: "row", gap: S[2], marginTop: S[3] },
  hozirBtn: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: R.md, backgroundColor: C.accent },
  hozirTxt: { fontSize: T.sm, fontWeight: "800", color: C.onAccent },
  yopBtn:   { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: R.md, borderWidth: 1, borderColor: C.border },
  yopTxt:   { fontSize: T.sm, fontWeight: "700", color: C.sub },
}));
