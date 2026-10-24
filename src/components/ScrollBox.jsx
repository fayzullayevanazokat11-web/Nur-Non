// Scroll konteyneri — scroll chizig'i ko'rinmaydi (toza ko'rinish).
// Sahifa ochilganda va pastki paneldan bo'lim tanlanganda kontent silliq paydo bo'ladi
// (shaffoflik + biroz ko'tarilish) — sahifalar sakrab emas, yumshoq almashadi.
// Animatsiya paytida kontent bitta qatlam bo'lib chiziladi (Android'da tugma chetlari
// qorayib ko'rinmasligi uchun), tugagach oddiy holatga qaytadi.
import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { View, ScrollView, Animated, Easing, StyleSheet } from "react-native";
import { NavigationContext } from "@react-navigation/native";

// Pastki paneldagi bo'lim bosilgan vaqt (surib o'tishda kontent allaqachon ko'rinib turadi)
let oxirgiTabBosish = 0;
export const tabBosildi = () => { oxirgiTabBosish = Date.now(); };

// Pastki panel kontent ustida "suzib" turadi — bo'lim sahifalari oxirida shuncha bo'sh joy
// qoldiriladi (oxirgi kartalar panel tagida qolib ketmasin). Boshqa sahifalarda 0.
export const PastkiJoy = createContext(0);

export const ScrollBox = forwardRef(function ScrollBox(
  { children, contentContainerStyle, keyboardShouldPersistTaps, style },
  outerRef
) {
  const ref = useRef(null);
  useImperativeHandle(outerRef, () => ({
    scrollTo: (opts) => ref.current?.scrollTo(opts),
    scrollToTop: (animated = true) => ref.current?.scrollTo({ y: 0, animated }),
  }), []);

  // Paydo bo'lish animatsiyasi
  const kir = useRef(new Animated.Value(0)).current;
  const [animda, setAnimda] = useState(true);
  const korsat = () => {
    kir.setValue(0);
    setAnimda(true);
    Animated.timing(kir, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      .start(() => setAnimda(false));
  };
  useEffect(() => { korsat(); }, []);
  const navigation = useContext(NavigationContext);
  const pastkiJoy = useContext(PastkiJoy);
  // Sahifadan chiqilganda scroll boshiga qaytadi (qaytib kelinganda sahifa sukut holatida)
  useEffect(() => {
    if (!navigation?.addListener) return undefined;
    return navigation.addListener("blur", () => ref.current?.scrollTo({ y: 0, animated: false }));
  }, [navigation]);
  useEffect(() => {
    if (!navigation?.addListener) return undefined;
    return navigation.addListener("focus", () => { if (Date.now() - oxirgiTabBosish < 600) korsat(); });
  }, [navigation]);
  const kirish = { opacity: kir, transform: [{ translateY: kir.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] };

  return (
    <Animated.View
      style={[styles.wrap, style, kirish]}
      needsOffscreenAlphaCompositing={animda}
      renderToHardwareTextureAndroid={animda}
    >
      <ScrollView
        ref={ref}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {children}
        {pastkiJoy > 0 && <View style={{ height: pastkiJoy }} />}
      </ScrollView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: { flex: 1 },
});
