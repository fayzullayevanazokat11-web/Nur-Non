// AsyncStorage orqali saqlanadigan state hook (web localStorage o'rnini bosadi).
// Asinxron: ilk ochilishda boshlang'ich qiymat, so'ng saqlangani yuklanadi.
// Yuklanmaguncha yozmaydi — boshlang'ich qiymat saqlangan ustiga yozilmaydi.
// `useHidratsiya()` — barcha kalitlar yuklanib bo'lganini bildiradi (tozalash,
// eslatmalar va avtomatik nusxa faqat shundan keyin ishlaydi).
import { useState, useEffect, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { kalit } from "./rejim";

// Yuklanishi kutilayotgan hook nusxalari (nom emas, nusxa bo'yicha — rejim almashganda bir xil kalitli
// eski va yangi nusxalar bir-birining holatini o'chirib yubormasin)
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
// Test maydonida kalit "nurnon-test:..." bo'ladi (rejim almashganda provider qayta o'rnatiladi)
export default function usePersistedState(asliKey, initial, { hidratsiya = true } = {}) {
  const [key] = useState(() => kalit(asliKey));
  const [val, setVal] = useState(initial);
  const [belgi] = useState(() => ({ key })); // shu hook nusxasining noyob belgisi
  const [loaded, setLoaded] = useState(() => { if (hidratsiya) { kutilmoqda.add(belgi); royxatdanOtdi = true; } return false; });

  useEffect(() => {
    let tirik = true;
    AsyncStorage.getItem(key)
      .then((raw) => { if (tirik && raw != null) setVal(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => {
        if (!tirik) return;
        setLoaded(true);
        kutilmoqda.delete(belgi);
        xabarBer();
      });
    // Yuklanib ulgurmay o'chirilsa (rejim almashganda) — kutish ro'yxatidan chiqadi, "tayyor" tiqilib qolmaydi
    return () => { tirik = false; if (kutilmoqda.delete(belgi)) xabarBer(); };
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(key, JSON.stringify(val)).catch(() => {});
  }, [key, val, loaded]);

  return [val, setVal];
}
