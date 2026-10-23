// Navigatsiya yordamchilari. expo-router 4 da `navigate` boshqa sahifaga yangi nusxa
// qo'shadi — Markazga qaytishda avval ustidagi sahifalar yopiladi (ekranlar
// ustma-ust yig'ilib qolmasin), so'ng Markaz bo'limi tanlanadi.
import { router } from "expo-router";

const yopibTashla = () => {
  try { if (router.canDismiss()) router.dismissAll(); } catch { /* yopadigan sahifa yo'q */ }
};

export function markazga() {
  yopibTashla();
  router.navigate("/");
}

// Markaz ustida bitta sahifa ochish (masalan, Statistika)
export function markazdan(yol) {
  yopibTashla();
  router.push(yol);
}
