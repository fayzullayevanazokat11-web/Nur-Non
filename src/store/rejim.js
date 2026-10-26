// Ilova rejimi: "asl" (haqiqiy ish) yoki "test" (Test maydoni — parallel, noldan ochiladigan tizim).
//
// Test maydoni asl tizimga TEGMAYDI:
//   • barcha ma'lumot kalitlari "nurnon-test:" bilan saqlanadi (asl — "nurnon:");
//   • avtomatik zaxira nusxa va bildirishnomalar test rejimida ishlamaydi;
//   • dastur qayta ochilganda doim asl tizim ochiladi — testni menyudan "Davom ettirish" bilan qaytarish mumkin
//     (test ma'lumoti va uning soati saqlanib turadi).
//
// Virtual soat: test rejimida global Date o'rnini virtual soat egallaydi (Date.now() va new Date()).
// Tezlik: 1× — haqiqiy vaqt, 60× — 1 daqiqa = 1 soat, 1440× — 1 daqiqa = 1 kun. Test maydonidan
// chiqilganda soat to'xtaydi; davom ettirilganda qolgan joyidan yuradi.
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

const ASL_DATE = globalThis.Date;
const realNow = () => ASL_DATE.now();
const TEST_OLD = "nurnon-test:";
const SOAT_KALIT = "nurnon-test:__soat";

export const TEZLIKLAR = [
  { k: 1, nom: "1×", izoh: "haqiqiy vaqt" },
  { k: 60, nom: "60×", izoh: "1 daqiqa = 1 soat" },
  { k: 1440, nom: "Ultra", izoh: "1 daqiqa = 1 kun" },
];

let holat = { rejim: "asl", avlod: 0, tezlik: 1 };
let baza = { real: realNow(), virt: realNow() };
const tinglovchilar = new Set();
const xabar = () => tinglovchilar.forEach((f) => f());
const ozgar = (patch) => { holat = { ...holat, ...patch }; xabar(); };

export const getRejim = () => holat.rejim;
// Haqiqiy (virtual emas) vaqt — bildirishnomalar kabi tashqi dunyo bilan ishlaydigan joylar uchun
export const haqiqiySana = (...a) => new ASL_DATE(...(a.length ? a : [realNow()]));
export const testmi = () => holat.rejim === "test";
export function useRejim() {
  return useSyncExternalStore((f) => { tinglovchilar.add(f); return () => tinglovchilar.delete(f); }, () => holat, () => holat);
}

// Saqlash kaliti: test rejimida "nurnon:x" → "nurnon-test:x". Foydalanuvchi sozlamalari (salom, kechki
// eslatma, yo'riqnoma ko'rilgani) umumiy — test ham asl tizimdagi tanlovga amal qiladi.
const UMUMIY = new Set(["nurnon:salomOchirTest", "nurnon:tanishuv"]);
export const kalit = (k) => (holat.rejim === "test" && String(k).startsWith("nurnon:") && !UMUMIY.has(k) ? TEST_OLD + String(k).slice(7) : k);
export const getTezlik = () => (holat.rejim === "test" ? holat.tezlik : 1);

// Davriy tekshiruvlar oralig'i: test rejimida vaqt tez yurishi mumkin — har soniyada
export const tikMs = (asl) => (holat.rejim === "test" ? Math.min(asl, 1000) : asl);

// ── Virtual soat ──
// Virtual vaqt bir tekis tezlashmaydi: soniya ichida haqiqiy tezlikda yuradi, har to'liq soniyada esa
// (tezlik − 1) soniya oldinga sakraydi. Natija bir xil (Ultra: 1 daqiqa = 1 kun), lekin animatsiyalar
// (ular ham Date.now() dan foydalanadi) normal vaqtni ko'radi — tez rejimda karusel/animatsiya buzilmaydi.
const virtNow = () => {
  const otdi = realNow() - baza.real;
  if (holat.tezlik <= 1) return baza.virt + otdi;
  const soniya = Math.floor(otdi / 1000);
  return baza.virt + soniya * 1000 * holat.tezlik + (otdi - soniya * 1000);
};
function VirtualDate(...a) {
  if (!(this instanceof VirtualDate)) return new ASL_DATE(virtNow()).toString(); // Date() funksiya sifatida — satr
  return a.length ? new ASL_DATE(...a) : new ASL_DATE(virtNow());
}
VirtualDate.prototype = ASL_DATE.prototype;
VirtualDate.now = virtNow;
VirtualDate.parse = ASL_DATE.parse;
VirtualDate.UTC = ASL_DATE.UTC;
const soatniYoq = () => { globalThis.Date = VirtualDate; };
const soatniOchir = () => { globalThis.Date = ASL_DATE; };

const soatniSaqla = () => (holat.rejim === "test"
  ? AsyncStorage.setItem(SOAT_KALIT, JSON.stringify({ virt: virtNow(), tezlik: holat.tezlik })).catch(() => {})
  : Promise.resolve());
let saqlashTaymer = null;

async function testKalitlari() {
  const hammasi = await AsyncStorage.getAllKeys().catch(() => []);
  return (hammasi || []).filter((k) => k.startsWith(TEST_OLD));
}
// Test maydonining fayllari (PDF arxivi, qop rasmlari) — alohida papkalarda; nollashda o'chiriladi
async function testFayllariniOchir() {
  if (Platform.OS === "web" || !FileSystem.documentDirectory) return;
  for (const p of ["pdf-arxiv-test/", "qop-rasmlar-test/"]) {
    await FileSystem.deleteAsync(FileSystem.documentDirectory + p, { idempotent: true }).catch(() => {});
  }
}

// Oldingi test bormi (Davom ettirish tugmasi uchun)
export async function testBormi() {
  return (await testKalitlari()).some((k) => k !== SOAT_KALIT);
}
export async function testSoati() {
  const raw = await AsyncStorage.getItem(SOAT_KALIT).catch(() => null);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

// Test maydonini ochish: yangi — noldan (oldingi test o'chiriladi), aks holda davom ettiriladi
export async function testniOch({ yangi = false } = {}) {
  if (yangi) { await AsyncStorage.multiRemove(await testKalitlari()).catch(() => {}); await testFayllariniOchir(); }
  const s = yangi ? null : await testSoati();
  baza = { real: realNow(), virt: s?.virt || realNow() };
  holat = { ...holat, tezlik: s?.tezlik || 1 };
  soatniYoq();
  clearInterval(saqlashTaymer);
  saqlashTaymer = setInterval(soatniSaqla, 5000);
  ozgar({ rejim: "test", avlod: holat.avlod + 1 });
  soatniSaqla();
}

// Asl tizimga qaytish — test soati to'xtaydi (saqlanadi)
export async function testdanChiq() {
  await soatniSaqla();
  clearInterval(saqlashTaymer);
  soatniOchir();
  ozgar({ rejim: "asl", avlod: holat.avlod + 1 });
}

// Test maydonini nollash: ma'lumot o'chadi, soat hozirgi vaqtga qaytadi (tezlik saqlanadi)
export async function testniNolla() {
  await AsyncStorage.multiRemove(await testKalitlari()).catch(() => {});
  await testFayllariniOchir();
  baza = { real: realNow(), virt: realNow() };
  ozgar({ avlod: holat.avlod + 1 });
  soatniSaqla();
}

// Vaqt tezligini o'zgartirish — virtual vaqt uzilmaydi (shu paytdan yangi tezlikda yuradi)
export function tezlikQoy(tezlik) {
  baza = { real: realNow(), virt: virtNow() };
  ozgar({ tezlik });
  soatniSaqla();
}
