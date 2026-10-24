// Sahifa fokusni yo'qotganda (boshqa bo'lim yoki sahifa ochilganda) UI holatini sukutga
// qaytarish: ochiq tanlovlar, raqamlar qatori, kattalashtirilgan rasm va h.k. yopiladi.
// Faqat ko'rinish tiklanadi — kiritilgan ma'lumot (son, forma qiymatlari) saqlanadi.
import { useContext, useEffect, useRef } from "react";
import { NavigationContext } from "@react-navigation/native";

export function useTiklash(fn) {
  const navigation = useContext(NavigationContext); // navigatordan tashqarida — undefined
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!navigation?.addListener) return undefined;
    return navigation.addListener("blur", () => ref.current?.());
  }, [navigation]);
}
