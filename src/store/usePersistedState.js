// AsyncStorage orqali saqlanadigan state hook (web localStorage o'rnini bosadi).
// Asinxron: ilk ochilishda boshlang'ich qiymat, so'ng saqlangani yuklanadi.
// Yuklanmaguncha yozmaydi — boshlang'ich qiymat saqlangan ustiga yozilmaydi.
// `useHidratsiya()` — barcha kalitlar yuklanib bo'lganini bildiradi (tozalash,
// eslatmalar va avtomatik nusxa faqat shundan keyin ishlaydi).
import { useState, useEffect, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const kutilmoqda = new Set();
let royxatdanOtdi = false;
const tinglovchilar = new Set();
const xabarBer = () => tinglovchilar.forEach((f) => f());
const tayyormi = () => royxatdanOtdi && kutilmoqda.size === 0;

export function useHidratsiya() {
  return useSyncExternalStore(
    (f) => { tinglovchilar.add(f); return () => tinglovchilar.delete(f); },
    tayyormi,
    tayyormi
  );
}

// hidratsiya: false — ilova umumiy "tayyor" holatiga ta'sir qilmaydigan mayda sozlamalar uchun
export default function usePersistedState(key, initial, { hidratsiya = true } = {}) {
  const [val, setVal] = useState(initial);
  const [loaded, setLoaded] = useState(() => { if (hidratsiya) { kutilmoqda.add(key); royxatdanOtdi = true; } return false; });

  useEffect(() => {
    let tirik = true;
    AsyncStorage.getItem(key)
      .then((raw) => { if (tirik && raw != null) setVal(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => {
        if (!tirik) return;
        setLoaded(true);
        kutilmoqda.delete(key);
        xabarBer();
      });
    return () => { tirik = false; };
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(key, JSON.stringify(val)).catch(() => {});
  }, [key, val, loaded]);

  return [val, setVal];
}
