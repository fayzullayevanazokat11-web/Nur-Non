// Doimiy ko'rinadigan vertikal scrollbar (thumb) bilan ScrollView.
// Kontent balandligi viewportdan oshsa, o'ngда thumb doim ko'rinadi va scrollга ergashadi.
import { useRef, useState } from "react";
import { View, ScrollView, Animated, StyleSheet } from "react-native";
import { C } from "../theme";

export function ScrollBox({ children, contentContainerStyle, keyboardShouldPersistTaps }) {
  const [vh, setVh] = useState(0);   // viewport balandligi
  const [ch, setCh] = useState(0);   // kontent balandligi
  const y = useRef(new Animated.Value(0)).current;

  const korinadi = ch > vh + 2;
  const thumbH = korinadi ? Math.max(28, (vh * vh) / ch) : 0;
  const maxOff = Math.max(1, ch - vh);
  const ty = y.interpolate({ inputRange: [0, maxOff], outputRange: [0, Math.max(0, vh - thumbH)], extrapolate: "clamp" });

  return (
    <View style={styles.wrap}>
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(e) => setVh(e.nativeEvent.layout.height)}
        onContentSizeChange={(w, h) => setCh(h)}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true })}
      >
        {children}
      </ScrollView>
      {korinadi && (
        <View style={styles.track} pointerEvents="none">
          <Animated.View style={[styles.thumb, { height: thumbH, transform: [{ translateY: ty }] }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { flex: 1 },
  track: { position: "absolute", right: 2, top: 4, bottom: 4, width: 5, borderRadius: 3, backgroundColor: C.accent + "14", alignItems: "center" },
  thumb: { width: 5, borderRadius: 3, backgroundColor: C.accent + "80" },
});
