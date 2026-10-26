// Suzuvchi barlar (tepa banner, pastki panel, menyu) foni — soya yo'q, yarim shaffof rang qatlami.
// iOS'da ortidagi kontent haqiqiy xiralashadi (BlurView yengil ishlaydi). Android'da real vaqt blur
// (dimezisBlurView) har kadrda ekranni qayta chizadi va sahifa almashganda titratadi — shuning uchun
// u yerda faqat rang qatlami; xiralikni barlar ortidagi XiraZona beradi.
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { temaQorongi } from "../theme";

export function SuzuvchiFon({ rang, radius, kuch = 40 }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: "hidden" }]}>
      {Platform.OS !== "android" && (
        <BlurView intensity={kuch} tint={temaQorongi() ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: rang }]} />
    </View>
  );
}
