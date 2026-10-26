// Suzuvchi barlar (tepa banner va pastki panel) foni — soya o'rniga ortidagi kontent xiralashadi
// ("muzli shisha"). Ustida yarim shaffof rang qatlami: o'qilishi uchun rang saqlanadi.
// Android'da haqiqiy xiralashtirish uchun dimezisBlurView ishlatiladi.
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { temaQorongi } from "../theme";

export function SuzuvchiFon({ rang, radius, kuch = 40 }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: "hidden" }]}>
      <BlurView
        intensity={kuch}
        tint={temaQorongi() ? "dark" : "light"}
        experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: rang }]} />
    </View>
  );
}
