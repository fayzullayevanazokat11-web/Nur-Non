// Scroll konteyneri — o'ng chetда doim ko'rinadigan, SUDRALADIGAN (draggable) thumb.
// Animatsiya/useNativeDriver ishlatilmaydi (rendering glitch bo'lmasligi uchun);
// thumb holati onScroll orqali yangilanadi, sudralganda scrollTo bilan suriladi.
import { useRef, useState } from "react";
import { View, ScrollView, PanResponder, StyleSheet } from "react-native";
import { C } from "../theme";

export function ScrollBox({ children, contentContainerStyle, keyboardShouldPersistTaps }) {
  const ref = useRef(null);
  const [vh, setVh] = useState(0);
  const [ch, setCh] = useState(0);
  const [sy, setSy] = useState(0);

  // Thumb DOIM ko'rinadi — chetda tepadan pastga sudraladigan tugma sifatida.
  const korinadi = vh > 0;
  const ratio = ch > 0 ? vh / ch : 1;
  const thumbH = korinadi ? Math.min(vh, Math.max(40, vh * ratio)) : 0;
  const maxScroll = Math.max(1, ch - vh);
  const usable = Math.max(1, vh - thumbH);
  const top = Math.max(0, Math.min(usable, (sy / maxScroll) * usable));

  // Sudrash (drag) — eng so'nggi qiymatlarni ref orqali olamiz
  const m = useRef({});
  m.current = { maxScroll, usable };
  const boshSy = useRef(0);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { boshSy.current = sy; },
      onPanResponderMove: (e, g) => {
        const { maxScroll: ms, usable: us } = m.current;
        let ny = boshSy.current + g.dy * (ms / us);
        ny = Math.max(0, Math.min(ms, ny));
        ref.current?.scrollTo({ y: ny, animated: false });
      },
    })
  ).current;

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={ref}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(e) => setVh(e.nativeEvent.layout.height)}
        onContentSizeChange={(w, h) => setCh(h)}
        onScroll={(e) => setSy(e.nativeEvent.contentOffset.y)}
      >
        {children}
      </ScrollView>
      {korinadi && (
        <View style={styles.track} pointerEvents="box-none">
          <View style={[styles.thumb, { height: thumbH, transform: [{ translateY: top }] }]} {...pan.panHandlers} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { flex: 1 },
  track: { position: "absolute", right: 2, top: 0, bottom: 0, width: 14, alignItems: "center" },
  thumb: { position: "absolute", top: 0, width: 8, borderRadius: 4, backgroundColor: C.accent + "CC" },
});
