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
  // "Tandir" palitrasi — tandirdan endi chiqqan non: iliq to'q sariq-oltin aksent,
  // un oqi fon, non mag'zi rangidagi kartalar.
  // Kontrast tekshirilgan: matn 13,3:1, tugma matni 4,7:1, aksent karta ustida 4,5:1.
  non: {
    nom: "Non", qorongi: false,
    ranglar: {
      bg: "#FFFDF8",          // asosiy ekran foni — un oqi (sof oqdan iliqroq)
      surface: "#FFFFFF",     // input/inset — oq
      card: "#FCF4E4",        // bloklar — non mag'zi rangi
      panel: "#F7EAD2",       // ichki band / chuqurroq
      border: "#EBD5AE", borderSoft: "#F3E5CB",  // bug'doy rangidagi yumshoq chegara
      accent: "#AC5A14",      // tandir qobig'i — FAQAT asosiy harakatlar (tugmalar) uchun
      red: "#5C220C",         // xavfli harakat — kuygan qobiq toni (qizil YO'Q)
      text: "#3A2412",        // asosiy matn — iliq quyuq jigarrang
      sub: "#86643F",         // ikkilamchi matn / dekorativ ikonkalar
      muted: "#B0916A",       // uchlamchi / hint
      onAccent: "#FFF8EC", onAccentSub: "#FBE6CC", // aksent fon ustidagi matn
      bar: "#FFFDF8",         // pastki panel
      dangerBg: "#FAECE3", dangerBorder: "#EDCDB8",
      accentBg: "#F8E8D2", accentBorder: "#ECCFA8",
      overlay: "rgba(58,36,18,0.35)",
      musbat: "#AC5A14", manfiy: "#2A7BA6", // grafik: foyda / zarar (validator: PASS)
    },
  },
  tun: {
    nom: "Tun", qorongi: true,
    ranglar: {
      bg: "#16100A", surface: "#1D150E", card: "#22180F", panel: "#2C2016",
      border: "#403020", borderSoft: "#33261A",
      accent: "#E58E40", red: "#EFA27E",            // tunda — yorqin tandir olovi
      text: "#F4E6D4", sub: "#C4A888", muted: "#8E7758",
      onAccent: "#26150A", onAccentSub: "#55301A",
      bar: "#1B130C",
      dangerBg: "#2E1C14", dangerBorder: "#4B2E21",
      accentBg: "#2C1F14", accentBorder: "#4D3520",
      overlay: "rgba(0,0,0,0.55)",
      musbat: "#C2702C", manfiy: "#3A93C6",
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
