// Joriy yozuv (til) holati: "lotin" | "kirill". AsyncStorage'da saqlanadi.
// useTil() — o'zgarganda barcha matnlar darhol qayta chiziladi.
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ogir } from "./translit";

const KALIT = "nurnon:til";
let til = "lotin";
const tinglovchilar = new Set();
const xabar = () => tinglovchilar.forEach((f) => f());

AsyncStorage.getItem(KALIT)
  .then((v) => { if ((v === "kirill" || v === "lotin") && v !== til) { til = v; xabar(); } })
  .catch(() => {});

export const getTil = () => til;

export function setTil(yangi) {
  if (yangi !== "lotin" && yangi !== "kirill") return;
  if (yangi === til) return;
  til = yangi;
  AsyncStorage.setItem(KALIT, yangi).catch(() => {});
  xabar();
}

const obuna = (f) => { tinglovchilar.add(f); return () => tinglovchilar.delete(f); };

export function useTil() {
  return useSyncExternalStore(obuna, getTil, getTil);
}

// Joriy tilga o'girish (komponentdan tashqarida, masalan tab nomlari uchun)
export const t = (s) => ogir(s, til);
