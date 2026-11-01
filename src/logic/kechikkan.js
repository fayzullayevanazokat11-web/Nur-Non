// Kechiktirib saqlash: maydonga yozilganda umumiy ma'lumot (AppData) har harfda emas, yozish to'xtagach
// (300 ms) yangilanadi — har harf butun ilovani (barcha ochiq bo'limlarni) qayta chizmasin.
// Kutilayotgan qiymat yo'qolmaydi va eskirmaydi — darhol yoziladi:
//   • istalgan tugma bosilganda (Pressable o'rami: bosish tugagach yoziladi, tugma ishi keyingi kadrda
//   yangi holat bilan bajariladi), • ilova fonga o'tganda (AppData), • komponent yopilganda.
// Maydondan chiqilganda (onBlur) darhol yozilmaydi: web'da blur barmoq tekkan paytda bo'ladi va sahifa
// o'zgarib, bosilayotgan tugma siljib ketardi — 300 ms taymer baribir yozadi.
// react-native'ni import qilmaydi (Pressable o'rami bilan aylanma import bo'lmasin).
import { useCallback, useEffect, useRef } from "react";

const kutilayotgan = new Set();
// Qaytaradi: biror qiymat yozildimi (tugma bu holda ishini keyingi kadrga — yangilangan holatga — qoldiradi)
export function hammasiniYoz() {
  if (!kutilayotgan.size) return false;
  [...kutilayotgan].forEach((f) => { try { f(); } catch {} });
  return true;
}

// [chaqir, yoz]: chaqir(...args) — kechiktirib saqlash; yoz() — kutilayotganini darhol saqlash
export function useKechikkan(saqla, kut = 300) {
  const ref = useRef(saqla); ref.current = saqla;
  const h = useRef({ t: null, args: null });
  const yoz = useCallback(() => {
    clearTimeout(h.current.t); h.current.t = null;
    kutilayotgan.delete(yoz);
    if (h.current.args) { const a = h.current.args; h.current.args = null; ref.current(...a); }
  }, []);
  const chaqir = useCallback((...a) => {
    h.current.args = a;
    clearTimeout(h.current.t);
    h.current.t = setTimeout(yoz, kut);
    kutilayotgan.add(yoz);
  }, [kut, yoz]);
  useEffect(() => () => yoz(), [yoz]);
  return [chaqir, yoz];
}
