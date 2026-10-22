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
  // "Qobiq" palitrasi — pishgan non qobig'i: iliq oltin-asal aksent, un rangidagi fon.
  // Kontrast tekshirilgan: aksent ustidagi matn 5:1, aksent karta ustida 4,7:1, matn 12,5:1.
  non: {
    nom: "Non", qorongi: false,
    ranglar: {
      bg: "#FFFEFA",          // asosiy ekran foni — un oqi (sof oqdan iliqroq)
      surface: "#FFFFFF",     // input/inset — oq
      card: "#FBF4E2",        // bloklar — yumshoq non ichi (mag'iz) rangi
      panel: "#F5EBD3",       // ichki band / chuqurroq
      border: "#E8D8A8", borderSoft: "#F0E6C8",  // bug'doy rangidagi yumshoq chegara
      accent: "#93640E",      // qobiq oltini — FAQAT asosiy harakatlar (tugmalar) uchun
      red: "#5A2E0E",         // xavfli harakat — kuygan qobiq toni (qizil YO'Q)
      text: "#3B2A12",        // asosiy matn — iliq quyuq jigarrang
      sub: "#806A33",         // ikkilamchi matn / dekorativ ikonkalar
      muted: "#A8935C",       // uchlamchi / hint
      onAccent: "#FFFBF0", onAccentSub: "#F6EBCB", // aksent fon ustidagi matn
      bar: "#FFFEFA",         // pastki panel
      dangerBg: "#F9EDE2", dangerBorder: "#EBCDB4",
      accentBg: "#F6EBCF", accentBorder: "#E7D3A2",
      overlay: "rgba(59,42,18,0.35)",
      musbat: "#93640E", manfiy: "#2A7BA6", // grafik: foyda / zarar (validator: PASS)
    },
  },
  tun: {
    nom: "Tun", qorongi: true,
    ranglar: {
      bg: "#15110B", surface: "#1C170F", card: "#211A12", panel: "#2B2318",
      border: "#3E3322", borderSoft: "#31281B",
      accent: "#D9A23A", red: "#EFA27E",            // tunda — yorqin oltin qobiq
      text: "#F3E8D2", sub: "#C2AD84", muted: "#8C7A55",
      onAccent: "#241806", onAccentSub: "#4E3A12",
      bar: "#1A150E",
      dangerBg: "#2E1C14", dangerBorder: "#4B2E21",
      accentBg: "#2A2214", accentBorder: "#4A3A1C",
      overlay: "rgba(0,0,0,0.55)",
      musbat: "#B5822A", manfiy: "#3A93C6",
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
