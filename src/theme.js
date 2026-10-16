// Markazlashtirilgan dizayn tizimi — ranglar (C), tipografiya (T),
// spacing (S), radius (R) va yumshoq soya (shadow).
// RN'da fontSize/spacing SON bo'ladi (px emas).
//
// MAVZULAR: foydalanuvchi Markaz menyusidan dizaynni almashtiradi (Non — yorug',
// Tun — qorong'i). `C` — joriy mavzu ranglari (jonli obyekt, almashganda yangilanadi).
// Uslublar `temaStil(() => StyleSheet.create({...}))` bilan e'lon qilinadi —
// mavzu almashganda o'zi qayta hisoblanadi. Ekranlar app/_layout.jsx'da qayta chiziladi.
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Har bir mavzu: bir xil kalitlar to'plami. Grafik ranglari (musbat/manfiy)
// dataviz validator bilan karta foniga nisbatan tekshirilgan.
export const TEMALAR = {
  non: {
    nom: "Non", qorongi: false,
    ranglar: {
      // Premium minimalist: OQ asosiy fon, QAYMOQ bloklar (qatlamlararo farq + yumshoq soya)
      bg: "#FFFFFF",          // asosiy ekran foni — oq
      surface: "#FFFFFF",     // input/inset — oq (qaymoq karta ustida toza ko'rinadi)
      card: "#FBF6EC",        // bloklar — yumshoq qaymoq
      panel: "#F6EEDF",       // ichki band / chuqurroq qaymoq
      border: "#E2D2B4", borderSoft: "#EDE2CF",  // sezilarli, lekin yumshoq chegara chizig'i
      accent: "#A0612A",      // jigarrang — FAQAT asosiy harakatlar (tugmalar) uchun
      red: "#3A1E08",         // xavfli harakat — issiq palitra toni (qizil YO'Q)
      text: "#33200E",        // asosiy matn — iliq quyuq jigarrang
      sub: "#8A7458",         // ikkilamchi matn / dekorativ ikonkalar
      muted: "#B5A07E",       // uchlamchi / hint
      onAccent: "#FFF3E8", onAccentSub: "#EBD8BF", // accent fon ustidagi matn
      bar: "#FFFFFF",         // pastki panel
      dangerBg: "#F8EDE7", dangerBorder: "#E8C9B6",
      accentBg: "#F5EBDA", accentBorder: "#E7D3B4",
      overlay: "rgba(58,30,8,0.35)",
      musbat: "#A0612A", manfiy: "#1C7FA8", // grafik: foyda / zarar
    },
  },
  tun: {
    nom: "Tun", qorongi: true,
    ranglar: {
      bg: "#14100C", surface: "#1B1510", card: "#211A13", panel: "#2B2219",
      border: "#3D3125", borderSoft: "#30271D",
      accent: "#D9924F", red: "#EFA27E",
      text: "#F2E6D6", sub: "#BCA88E", muted: "#857259",
      onAccent: "#23160B", onAccentSub: "#4F3620",
      bar: "#1A1410",
      dangerBg: "#2E1C14", dangerBorder: "#4B2E21",
      accentBg: "#2A2016", accentBorder: "#47361F",
      overlay: "rgba(0,0,0,0.55)",
      musbat: "#C47A35", manfiy: "#3A93C6",
    },
  },
};

// Hosila tokenlar (eski nomlar ham ishlayveradi)
const toliq = (r) => ({
  ...r,
  accentDim: r.accent + "12",
  redDim: r.red + "0D",
  green: r.accent, greenDim: r.accent + "0D",
  blue: r.accent, blueDim: r.accent + "0D",
});

let joriy = "non";
export const C = toliq(TEMALAR.non.ranglar);

// ── Mavzu holati (butun ilova bo'yicha) ──
const tinglovchilar = new Set();
const xabarBer = () => tinglovchilar.forEach((f) => f());

function qoy(id) {
  if (!TEMALAR[id] || id === joriy) return false;
  joriy = id;
  Object.assign(C, toliq(TEMALAR[id].ranglar));
  return true;
}

export const getTema = () => joriy;
export const temaQorongi = () => !!TEMALAR[joriy]?.qorongi;

export function setTema(id) {
  if (!qoy(id)) return;
  AsyncStorage.setItem("nurnon:tema", JSON.stringify(id)).catch(() => {});
  xabarBer();
}

// Silliq almashtirish: ildiz layout o'tish pardasini ro'yxatdan o'tkazadi
// (parda yopiladi → mavzu almashadi → parda ochiladi). Bo'lmasa — darhol.
let almashtiruvchi = null;
export const temaAlmashtiruvchi = (f) => { almashtiruvchi = f; return () => { if (almashtiruvchi === f) almashtiruvchi = null; }; };
export function temaAlmashtir(id) {
  if (!TEMALAR[id] || id === joriy) return;
  if (almashtiruvchi) almashtiruvchi(id); else setTema(id);
}

export function useTema() {
  return useSyncExternalStore(
    (f) => { tinglovchilar.add(f); return () => tinglovchilar.delete(f); },
    getTema,
    getTema
  );
}

// Saqlangan mavzuni yuklaymiz (splash ekrani paytida tugaydi)
AsyncStorage.getItem("nurnon:tema")
  .then((raw) => { if (raw && qoy(JSON.parse(raw))) xabarBer(); })
  .catch(() => {});

// Mavzuga bog'liq uslublar: birinchi murojaatda va mavzu almashganda qayta hisoblanadi
export function temaStil(yasash) {
  let tema = null;
  let uslub = null;
  const ol = () => {
    if (tema !== joriy) { uslub = yasash(); tema = joriy; }
    return uslub;
  };
  return new Proxy({}, {
    get: (_, k) => ol()[k],
    has: (_, k) => k in ol(),
    ownKeys: () => Reflect.ownKeys(ol()),
    getOwnPropertyDescriptor: (_, k) => {
      const d = Reflect.getOwnPropertyDescriptor(ol(), k);
      return d ? { ...d, configurable: true } : undefined;
    },
  });
}

export const T = { xs: 12, sm: 13, md: 15, lg: 19, xl: 28, xxl: 34 };

// 4pt asosidagi spacing shkalasi
export const S = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40 };

// Burchak radiuslari — yumshoqroq (premium)
export const R = { sm: 14, md: 18, lg: 24, xl: 30, pill: 999 };

// Juda yengil neytral soya — burchaklarda qalin halo bermaydi (chegara asosiy)
export const shadow = {
  shadowColor: "#000000",
  shadowOpacity: 0.05,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

// Animatsiya — yagona ease-in-out konfiguratsiyasi
export const ANIM = { duration: 220, pressDuration: 140 };
