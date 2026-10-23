// Bosish hissi — tugma va o'tishlarda yengil tebranish (haptik) va yumshoq ovoz.
//   bos     — oddiy tugma: qisqa "tik" + yengil tebranish
//   otish   — sahifa/bo'lim almashishi: havodor "fyut" + tanlov tebranishi
//   tayyor  — muvaffaqiyat (saqlandi, kun yakunlandi): iliq qo'ng'iroq + "success" tebranishi
// Ikkalasi menyuda alohida yoqib/o'chiriladi (qurilma sozlamasi, ma'lumot bilan ko'chmaydi).
// Diqqat: bu fayl `react-native`ni import qilmaydi — u src/i18n/komponentlar.jsx (Pressable
// o'rami) tomonidan chaqiriladi va aylanma import bo'lmasligi kerak.
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

const FAYL = {
  bos: require("../../assets/ovoz/bos.wav"),
  otish: require("../../assets/ovoz/otish.wav"),
  tayyor: require("../../assets/ovoz/tayyor.wav"),
};
const BALANDLIK = { bos: 0.55, otish: 0.5, tayyor: 0.6 };
const NUSXA = { bos: 3, otish: 2, tayyor: 1 }; // tez-tez bosilganda ovozlar bir-birini kesmasin

// ── Sozlamalar (tebranish va ovoz) ──
let sozlama = { tebranish: true, ovoz: true };
const tinglovchilar = new Set();
const xabar = () => tinglovchilar.forEach((f) => f());
AsyncStorage.multiGet(["nurnon:tebranish", "nurnon:ovoz"])
  .then((r) => {
    const o = Object.fromEntries(r);
    sozlama = {
      tebranish: o["nurnon:tebranish"] == null ? true : JSON.parse(o["nurnon:tebranish"]) !== false,
      ovoz: o["nurnon:ovoz"] == null ? true : JSON.parse(o["nurnon:ovoz"]) !== false,
    };
    xabar();
  })
  .catch(() => {});

export const getSezgiSozlama = () => sozlama;
export function setSezgiSozlama(k, v) {
  sozlama = { ...sozlama, [k]: !!v };
  AsyncStorage.setItem(`nurnon:${k}`, JSON.stringify(!!v)).catch(() => {});
  xabar();
}
export function useSezgiSozlama() {
  return useSyncExternalStore((f) => { tinglovchilar.add(f); return () => tinglovchilar.delete(f); }, getSezgiSozlama, getSezgiSozlama);
}

// ── Ovozlar: birinchi kerak bo'lganda yuklanadi ──
let tayyorlanmoqda = null;
const pul = {}; // tur → [Sound, ...]
const navbat = {};
function tayyorla() {
  if (tayyorlanmoqda) return tayyorlanmoqda;
  tayyorlanmoqda = (async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: false, shouldDuckAndroid: true, staysActiveInBackground: false });
    } catch { /* ixtiyoriy */ }
    await Promise.all(Object.keys(FAYL).map(async (tur) => {
      pul[tur] = [];
      for (let i = 0; i < NUSXA[tur]; i++) {
        try {
          const { sound } = await Audio.Sound.createAsync(FAYL[tur], { volume: BALANDLIK[tur], shouldPlay: false });
          pul[tur].push(sound);
        } catch { /* ovoz yuklanmasa — jim ishlaydi */ }
      }
      navbat[tur] = 0;
    }));
  })();
  return tayyorlanmoqda;
}

function ovozChal(tur) {
  tayyorla().then(() => {
    const p = pul[tur];
    if (!p || !p.length) return;
    const s = p[navbat[tur] % p.length];
    navbat[tur] = (navbat[tur] + 1) % p.length;
    s.replayAsync().catch(() => {});
  }).catch(() => {});
}

function tebran(tur) {
  let v;
  try {
    if (tur === "tayyor") v = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (tur === "otish") v = Haptics.selectionAsync();
    else v = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch { return; }
  v?.catch?.(() => {});
}

// Asosiy chaqiruv: sezgi("bos" | "otish" | "tayyor")
export function sezgi(tur = "bos") {
  if (!FAYL[tur]) tur = "bos";
  if (sozlama.tebranish) tebran(tur);
  if (sozlama.ovoz) ovozChal(tur);
}

// Ilova ochilganda oldindan yuklab qo'yish (birinchi bosishda kechikish bo'lmasin)
export const sezgiTayyorla = () => { if (sozlama.ovoz) tayyorla(); };
