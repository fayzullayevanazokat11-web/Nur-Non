// "Saqlandi ✓" — qisqa tasdiq xabarchasi (ekran pastida 1.6 soniya). Istalgan joydan:
//   saqlandiXabar()  yoki  saqlandiXabar("Qarz qo'shildi")
import { PRUJINA, PRUJINA_YUMSHOQ } from "../logic/fizika";
import { useEffect, useRef, useState } from "react";
import { Text, Animated, Easing, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C, T, S, R, temaStil } from "../theme";

let tinglovchi = null;
export function saqlandiXabar(matn = "Saqlandi") { tinglovchi?.(matn); }

export function Xabarcha() {
  const insets = useSafeAreaInsets();
  const [matn, setMatn] = useState(null);
  const a = useRef(new Animated.Value(0)).current;
  const t = useRef(null);
  useEffect(() => {
    tinglovchi = (m) => {
      clearTimeout(t.current);
      setMatn(m);
      a.setValue(0);
      Animated.spring(a, { toValue: 1, ...PRUJINA, useNativeDriver: true }).start();
      t.current = setTimeout(() => {
        Animated.timing(a, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setMatn(null));
      }, 1600);
    };
    return () => { tinglovchi = null; clearTimeout(t.current); };
  }, []);
  if (!matn) return null;
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[styles.quti, { bottom: insets.bottom + 110, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}
    >
      <Ionicons name="checkmark-circle" size={18} color={C.onAccent} />
      <Text style={styles.matn}>{matn}</Text>
    </Animated.View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  quti: { position: "absolute", alignSelf: "center", flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.accent, borderRadius: R.pill, paddingVertical: 10, paddingHorizontal: 18, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 10 },
  matn: { fontSize: T.sm, fontWeight: "800", color: C.onAccent },
}));
