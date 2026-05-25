// AsyncStorage orqali saqlanadigan state hook (web localStorage o'rnini bosadi).
// Asinxron: ilk ochilishda boshlang'ich qiymat, so'ng saqlangani yuklanadi.
// Yuklanmaguncha yozmaydi — boshlang'ich qiymat saqlangan ustiga yozilmaydi.
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function usePersistedState(key, initial) {
  const [val, setVal] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let tirik = true;
    AsyncStorage.getItem(key)
      .then((raw) => { if (tirik && raw != null) setVal(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => { if (tirik) setLoaded(true); });
    return () => { tirik = false; };
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(key, JSON.stringify(val)).catch(() => {});
  }, [key, val, loaded]);

  return [val, setVal];
}
