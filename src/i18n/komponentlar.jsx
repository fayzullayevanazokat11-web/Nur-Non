// Text / TextInput / Alert o'ramlari — barcha UI matnini joriy yozuvga (lotin/kirill) o'giradi.
// Ilova kodi bularni to'g'ridan-to'g'ri import qilmaydi: metro.config.js `react-native`
// importini shu yerga yo'naltiradi, shuning uchun kelajakdagi har qanday yangi matn ham
// avtomatik o'giriladi.
import { forwardRef, useRef, useState } from "react";
import { Text as RNText, TextInput as RNTextInput, Alert as RNAlert, Pressable as RNPressable, Platform, Animated, StyleSheet } from "react-native";
import { useTil, getTil } from "./til";
import { ogir } from "./translit";
import { sezgi } from "../logic/sezgi";
import { BOS_KIRISH as KIRISH, BOS_QAYTISH as QAYTISH } from "../logic/fizika";

const ogirBola = (c, til) =>
  typeof c === "string" ? ogir(c, til) : Array.isArray(c) ? c.map((x) => ogirBola(x, til)) : c;

export const Text = forwardRef(function Text(props, ref) {
  const til = useTil();
  return <RNText ref={ref} {...props}>{ogirBola(props.children, til)}</RNText>;
});

// Faqat placeholder o'giriladi — kiritilgan qiymat (value) foydalanuvchi ma'lumoti, tegilmaydi
export const TextInput = forwardRef(function TextInput(props, ref) {
  const til = useTil();
  return <RNTextInput ref={ref} {...props} placeholder={ogir(props.placeholder, til)} />;
});

// Pressable — bosilganda yengil tebranish va BOSISH ANIMATSIYASI (ilovadagi barcha tugmalar uchun).
// sezgiTuri: "bos" (sukut), "otish" (sahifa/bo'lim almashishi), "tayyor" yoki false (jim).
//
// Animatsiya: barmoq tekkanda tugma prujina bilan biroz kichrayadi, qo'yilganda yumshoq "sakrab" qaytadi.
//  • native driver (UI thread) — JS band bo'lsa ham silliq, kadr tashlamaydi;
//  • qisqarish o'lchamga mos: kichik tugma ~6%, katta karta ~1–2% (chetlari ~3px ichkariga) — tabiiy;
//  • shaffoflik o'zgarmaydi (Android'da soyali elementning chetlari qorayardi);
//  • o'z transform animatsiyasi bor tugmalar (Bosma, Btn, style({pressed}) da scale) — tegilmaydi;
//  • animatsiya={false} — o'chirish (masalan, ichida o'z animatsiyasi bor bo'lsa).
const AnimPressable = Animated.createAnimatedComponent(RNPressable);
const transformBormi = (s) => { const f = StyleSheet.flatten(s); return !!(f && f.transform); };

export const Pressable = forwardRef(function Pressable(
  { onPress, sezgiTuri = "bos", animatsiya = true, style, onPressIn, onPressOut, onLayout, disabled, ...props },
  ref
) {
  const bosildi = onPress
    ? (e) => { if (sezgiTuri) sezgi(sezgiTuri); onPress(e); }
    : undefined;
  const v = useRef(new Animated.Value(0)).current;
  const [en, setEn] = useState(0);
  const [bosilgan, setBosilgan] = useState(false);
  const faol = !!(onPress || props.onLongPress) && !disabled;
  // style funksiya bo'lsa — joriy bosilgan holat bilan hisoblanadi
  const joriy = typeof style === "function" ? style({ pressed: bosilgan }) : style;
  const oziAnimli = typeof style === "function" ? transformBormi(style({ pressed: true })) || transformBormi(joriy) : transformBormi(joriy);
  const anim = animatsiya !== false && faol && !oziAnimli;
  const chuqurlik = en > 0 ? Math.min(0.06, 6 / en) : 0.04;
  const prujina = (to) => Animated.spring(v, { toValue: to, ...(to ? KIRISH : QAYTISH), useNativeDriver: Platform.OS !== "web", restDisplacementThreshold: 0.001, restSpeedThreshold: 0.001 }).start();
  return (
    <AnimPressable
      ref={ref}
      onPress={bosildi}
      disabled={disabled}
      onPressIn={(e) => { if (typeof style === "function") setBosilgan(true); if (anim) prujina(1); onPressIn?.(e); }}
      onPressOut={(e) => { if (typeof style === "function") setBosilgan(false); if (anim) prujina(0); onPressOut?.(e); }}
      onLayout={(e) => { const w = e.nativeEvent.layout.width; if (Math.abs(w - en) > 1) setEn(w); onLayout?.(e); }}
      style={anim ? [joriy, { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1 - chuqurlik] }) }] }] : joriy}
      {...props}
    />
  );
});

// Web'da RN Alert hech narsa qilmaydi — brauzerning confirm/alert oynasi bilan almashtiramiz
function webAlert(title, message, buttons) {
  const matn = [title, message].filter(Boolean).join("\n\n");
  const tugmalar = buttons || [];
  if (tugmalar.length < 2) { window.alert(matn); tugmalar[0]?.onPress?.(); return; }
  const bekor = tugmalar.find((b) => b.style === "cancel");
  const asosiy = [...tugmalar].reverse().find((b) => b.style !== "cancel");
  if (window.confirm(matn)) asosiy?.onPress?.(); else bekor?.onPress?.();
}

export const Alert = {
  alert(title, message, buttons, options) {
    const til = getTil();
    if (Platform.OS === "web" && typeof window !== "undefined" && window.confirm) {
      return webAlert(ogir(title, til), ogir(message, til), buttons);
    }
    return RNAlert.alert(
      ogir(title, til),
      ogir(message, til),
      buttons && buttons.map((b) => ({ ...b, text: ogir(b.text, til) })),
      options,
    );
  },
  prompt: (...args) => RNAlert.prompt?.(...args),
};
