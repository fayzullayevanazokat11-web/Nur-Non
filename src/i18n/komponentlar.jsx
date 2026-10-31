// Text / TextInput / Alert o'ramlari — barcha UI matnini joriy yozuvga (lotin/kirill) o'giradi.
// Ilova kodi bularni to'g'ridan-to'g'ri import qilmaydi: metro.config.js `react-native`
// importini shu yerga yo'naltiradi, shuning uchun kelajakdagi har qanday yangi matn ham
// avtomatik o'giriladi.
import { forwardRef, useEffect, useRef, useState } from "react";
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
// Animatsiya: barmoq tekkanda tugma prujina bilan biroz kichrayadi, qo'yilganda yumshoq qaytadi.
//  • native driver (UI thread) — JS band bo'lsa ham silliq, kadr tashlamaydi;
//  • renderda yangi animatsiya tuguni yaratilmaydi (interpolate yo'q) va o'lcham state'da emas —
//    bosish qayta render qilmaydi;
//  • qisqarish o'lchamga mos: kichik tugma ~6%, katta karta ~1–2% (chetlari ~3px ichkariga) — tabiiy;
//  • tugmaning o'z dizaynidagi style({ pressed }) scale'i bo'lsa — aynan shu qiymatga, lekin bir kadrda
//    sakramasdan, prujina bilan boradi; bosilgandagi shaffoflik e'tiborsiz (Android'da soyali elementning
//    chetlari qorayardi), boshqa farqlar (masalan, fon rangi) bosilganda qo'llanadi;
//  • scroll ichida: bosish 70 ms kechikib boshlanadi — ro'yxat aylantirilganda kartalar "silkinmaydi";
//  • animatsiya={false} — o'chirish (ichida o'z bosish animatsiyasi bor bo'lsa: Bosma, Btn).
const AnimPressable = Animated.createAnimatedComponent(RNPressable);
const WEB = Platform.OS === "web";
const tekis = (s) => StyleSheet.flatten(s) || {};
const scaleOl = (t) => {
  if (!Array.isArray(t)) return null;
  const x = t.find((o) => o && typeof o.scale === "number");
  return x ? x.scale : null;
};
const scalesiz = (t) => (Array.isArray(t) ? t.filter((o) => !(o && "scale" in o)) : []);

export const Pressable = forwardRef(function Pressable(
  { onPress, sezgiTuri = "bos", animatsiya = true, style, onPressIn, onPressOut, onLayout, disabled, unstable_pressDelay, ...props },
  ref
) {
  const bosildi = onPress
    ? (e) => { if (sezgiTuri) sezgi(sezgiTuri); onPress(e); }
    : undefined;
  const v = useRef(new Animated.Value(1)).current; // to'g'ridan-to'g'ri scale
  const enRef = useRef(0);
  const bosRef = useRef(false);
  const funk = typeof style === "function";
  const [bosilgan, setBosilgan] = useState(false); // faqat style funksiya bo'lsa (fon rangi kabi farqlar uchun)
  const faol = !!(onPress || props.onLongPress) && !disabled;
  const anim = animatsiya !== false && faol;

  let uslub;
  let dam = 1, maqsad = null;
  if (!anim) {
    uslub = funk ? style({ pressed: bosilgan }) : style;
  } else {
    const ochiq = tekis(funk ? style({ pressed: false }) : style);
    const bosiq = funk ? tekis(style({ pressed: true })) : ochiq;
    dam = scaleOl(ochiq.transform) ?? 1;
    const b = scaleOl(bosiq.transform);
    maqsad = b != null && b !== dam ? b : null;
    const { transform: _t, opacity: _o, ...qolgan } = funk && bosilgan ? bosiq : ochiq;
    const tr = [...scalesiz(ochiq.transform), { scale: v }];
    uslub = ochiq.opacity != null ? [qolgan, { opacity: ochiq.opacity, transform: tr }] : [qolgan, { transform: tr }];
  }
  const holat = useRef({}); holat.current = { dam, maqsad, anim };
  // Tinch holatdagi scale o'zgarsa (kamdan-kam) — qiymat moslanadi
  useEffect(() => { if (!bosRef.current) v.setValue(dam); }, [dam, v]);

  const prujina = (to, cfg) => Animated.spring(v, { toValue: to, ...cfg, useNativeDriver: !WEB, restDisplacementThreshold: 0.0005, restSpeedThreshold: 0.001 }).start();
  return (
    <AnimPressable
      ref={ref}
      onPress={bosildi}
      disabled={disabled}
      unstable_pressDelay={unstable_pressDelay ?? (WEB ? undefined : 70)}
      onPressIn={(e) => {
        bosRef.current = true;
        if (funk) setBosilgan(true);
        const h = holat.current;
        if (h.anim) {
          const en = enRef.current;
          prujina(h.maqsad ?? h.dam * (1 - (en > 0 ? Math.min(0.06, 6 / en) : 0.04)), KIRISH);
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        bosRef.current = false;
        if (funk) setBosilgan(false);
        if (holat.current.anim) prujina(holat.current.dam, QAYTISH);
        onPressOut?.(e);
      }}
      onLayout={(e) => { enRef.current = e.nativeEvent.layout.width; onLayout?.(e); }}
      style={uslub}
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
