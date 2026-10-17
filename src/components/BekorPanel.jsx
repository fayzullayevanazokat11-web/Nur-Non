// "Bekor qilish" paneli — katta amaldan keyin (kunni yakunlash, zaxirani nollash)
// 10 soniya pastda turadi; bosilsa hammasi amal oldidagi holatga qaytadi.
import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import { C, T, S, R, temaStil } from "../theme";

const MUDDAT = 10000;

export function BekorPanel() {
  const { bekor, bekorQil, bekorYop } = useApp();
  const insets = useSafeAreaInsets();
  const kirish = useRef(new Animated.Value(0)).current;
  const vaqt = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!bekor) return undefined;
    kirish.setValue(0); vaqt.setValue(1);
    Animated.timing(kirish, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.timing(vaqt, { toValue: 0, duration: MUDDAT, easing: Easing.linear, useNativeDriver: false }).start();
    const t = setTimeout(() => {
      Animated.timing(kirish, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => bekorYop());
    }, MUDDAT);
    return () => clearTimeout(t);
  }, [bekor?.id]);

  if (!bekor) return null;
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: 84 + insets.bottom, opacity: kirish, transform: [{ translateY: kirish.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}
    >
      <View style={styles.panel}>
        <Ionicons name="checkmark-circle" size={18} color={C.onAccent} />
        <Text style={styles.matn} numberOfLines={2}>{bekor.matn}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Amalni bekor qilish" onPress={bekorQil} hitSlop={8} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.btnTxt}>Bekor qilish</Text>
        </Pressable>
        <Animated.View style={[styles.vaqt, { width: vaqt.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
      </View>
    </Animated.View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:  { position: "absolute", left: S[4], right: S[4] },
  panel: { flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.text, borderRadius: R.md, paddingVertical: S[3], paddingLeft: S[4], paddingRight: S[2], overflow: "hidden" },
  matn:  { flex: 1, fontSize: T.sm, fontWeight: "700", color: C.bg },
  btn:   { paddingVertical: 8, paddingHorizontal: 12, borderRadius: R.pill, backgroundColor: C.accent },
  btnTxt:{ fontSize: T.xs, fontWeight: "800", color: C.onAccent },
  vaqt:  { position: "absolute", left: 0, bottom: 0, height: 3, backgroundColor: C.accent },
}));
