// Son silliq o'zgaradi: eski qiymatdan yangisiga ~0.65s ichida "sanab" boradi
// (ease-out). Birinchi ko'rinishda 0 dan boshlanadi.
import { createElement, useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import { formatSom } from "../logic/hisob";

export function useAnimSon(qiymat, davom = 650) {
  const [korinish, setKorinish] = useState(0);
  const joriy = useRef(0);
  useEffect(() => {
    const boshi = joriy.current;
    const oxiri = Number(qiymat) || 0;
    if (boshi === oxiri) return undefined;
    let raf;
    let t0 = null;
    const qadam = (t) => {
      if (t0 === null) t0 = t;
      const k = Math.min(1, (t - t0) / davom);
      const v = k === 1 ? oxiri : boshi + (oxiri - boshi) * (1 - Math.pow(1 - k, 3));
      joriy.current = v;
      setKorinish(Math.round(v)); // butun son — o'zgarmagan kadrda qayta chizilmaydi
      if (k < 1) raf = requestAnimationFrame(qadam);
    };
    raf = requestAnimationFrame(qadam);
    return () => cancelAnimationFrame(raf);
  }, [qiymat, davom]);
  return korinish;
}

// Animatsiyali son matni — alohida komponent: har kadrda faqat shu Text qayta chiziladi (butun sahifa emas)
export function AnimSon({ qiymat, style, qoshimcha = " so'm", ...rest }) {
  const k = useAnimSon(qiymat);
  return createElement(Text, { style, ...rest }, `${formatSom(Math.round(k))}${qoshimcha}`);
}
