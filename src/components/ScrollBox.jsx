// Scroll konteyneri — o'ng chetда doim ko'rinadigan thumb (faqat vizual indikator).
// Sudrash xususiyati olib tashlandi — kontent bo'ylab oddiy swipe scroll ishlatiladi
// (Android'da thumb tile'larning tap sohasini bloklab qo'yardi).
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { C, temaStil } from "../theme";

export const ScrollBox = forwardRef(function ScrollBox(
  { children, contentContainerStyle, keyboardShouldPersistTaps, style },
  outerRef
) {
  const ref = useRef(null);
  useImperativeHandle(outerRef, () => ({
    scrollTo: (opts) => ref.current?.scrollTo(opts),
    scrollToTop: (animated = true) => ref.current?.scrollTo({ y: 0, animated }),
  }), []);
  const [vh, setVh] = useState(0);
  const [ch, setCh] = useState(0);
  const [sy, setSy] = useState(0);

  // Thumb DOIM ko'rinadi (vizual indikator); kontent kerakli darajada bo'lganda.
  const korinadi = vh > 0 && ch > vh;
  const ratio = ch > 0 ? vh / ch : 1;
  const thumbH = korinadi ? Math.min(vh, Math.max(40, vh * ratio)) : 0;
  const maxScroll = Math.max(1, ch - vh);
  const usable = Math.max(1, vh - thumbH);
  const top = Math.max(0, Math.min(usable, (sy / maxScroll) * usable));

  return (
    <View style={[styles.wrap, style]}>
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
        // pointerEvents="none" — tap sohasini bloklamasligi uchun. Faqat vizual.
        <View style={styles.track} pointerEvents="none">
          <View style={[styles.thumb, { height: thumbH, transform: [{ translateY: top }] }]} />
        </View>
      )}
    </View>
  );
});

const styles = temaStil(() => StyleSheet.create({
  wrap:  { flex: 1 },
  track: { position: "absolute", right: 2, top: 0, bottom: 0, width: 8, alignItems: "center" },
  thumb: { position: "absolute", top: 0, width: 6, borderRadius: 3, backgroundColor: C.accent + "CC" },
}));
