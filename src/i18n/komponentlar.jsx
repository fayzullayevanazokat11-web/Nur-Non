// Text / TextInput / Alert o'ramlari — barcha UI matnini joriy yozuvga (lotin/kirill) o'giradi.
// Ilova kodi bularni to'g'ridan-to'g'ri import qilmaydi: metro.config.js `react-native`
// importini shu yerga yo'naltiradi, shuning uchun kelajakdagi har qanday yangi matn ham
// avtomatik o'giriladi.
import { forwardRef } from "react";
import { Text as RNText, TextInput as RNTextInput, Alert as RNAlert } from "react-native";
import { useTil, getTil } from "./til";
import { ogir } from "./translit";

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

export const Alert = {
  alert(title, message, buttons, options) {
    const til = getTil();
    return RNAlert.alert(
      ogir(title, til),
      ogir(message, til),
      buttons && buttons.map((b) => ({ ...b, text: ogir(b.text, til) })),
      options,
    );
  },
  prompt: (...args) => RNAlert.prompt?.(...args),
};
