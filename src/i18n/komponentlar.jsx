// Text / TextInput / Alert o'ramlari — barcha UI matnini joriy yozuvga (lotin/kirill) o'giradi.
// Ilova kodi bularni to'g'ridan-to'g'ri import qilmaydi: metro.config.js `react-native`
// importini shu yerga yo'naltiradi, shuning uchun kelajakdagi har qanday yangi matn ham
// avtomatik o'giriladi.
import { forwardRef } from "react";
import { Text as RNText, TextInput as RNTextInput, Alert as RNAlert, Pressable as RNPressable, Platform } from "react-native";
import { useTil, getTil } from "./til";
import { ogir } from "./translit";
import { sezgi } from "../logic/sezgi";

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

// Pressable — bosilganda yengil tebranish (doim yoqiq).
// sezgiTuri: "bos" (sukut), "otish" (sahifa/bo'lim almashishi), "tayyor" yoki false (jim).
export const Pressable = forwardRef(function Pressable({ onPress, sezgiTuri = "bos", ...props }, ref) {
  const bosildi = onPress
    ? (e) => { if (sezgiTuri) sezgi(sezgiTuri); onPress(e); }
    : undefined;
  return <RNPressable ref={ref} onPress={bosildi} {...props} />;
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
