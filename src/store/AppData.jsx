// Butun ilova holati — har bir kolleksiya "nurnon:" prefiksi bilan AsyncStorage'da.
import { createContext, useContext, useState, useEffect } from "react";
import usePersistedState from "./usePersistedState";
import { SEED_NONLAR, SEED_ISHCHILAR, SEED_MAHSULOT_NARXLARI } from "../logic/data";

const AppDataContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useApp() faqat <AppDataProvider> ichida ishlaydi");
  return ctx;
}

export function AppDataProvider({ children }) {
  // ── Saqlanadigan ma'lumotlar ──
  const [nonlar, setNonlar]                       = usePersistedState("nurnon:nonlar", SEED_NONLAR);
  const [ishchilar, setIshchilar]                 = usePersistedState("nurnon:ishchilar", SEED_ISHCHILAR);
  const [mahsulotNarxlari, setMahsulotNarxlari]   = usePersistedState("nurnon:mahsulotNarxlari", SEED_MAHSULOT_NARXLARI);
  const [customMahsulotlar, setCustomMahsulotlar] = usePersistedState("nurnon:customMahsulotlar", []);
  const [qarzlar, setQarzlar]                     = usePersistedState("nurnon:qarzlar", []);
  const [optomlar, setOptomlar]                   = usePersistedState("nurnon:optomlar", []);
  const [kartalar, setKartalar]                   = usePersistedState("nurnon:kartalar", []);
  const [omborlar, setOmborlar]                   = usePersistedState("nurnon:omborlar", []);
  const [omborSorovlar, setOmborSorovlar]         = usePersistedState("nurnon:omborSorovlar", []);
  const [omborTasdiqlar, setOmborTasdiqlar]       = usePersistedState("nurnon:omborTasdiqlar", []);
  const [hisobotlarTarixi, setHisobotlarTarixi]   = usePersistedState("nurnon:hisobotlarTarixi", []);
  const [tasdiqlanganKunlar, setTasdiqlanganKunlar] = usePersistedState("nurnon:tasdiqlanganKunlar", []);
  const [kunlikQoplar, setKunlikQoplar]           = usePersistedState("nurnon:kunlikQoplar", []);
  const [braklar, setBraklar]                     = usePersistedState("nurnon:braklar", []);
  const [gazNarx, setGazNarx]                     = usePersistedState("nurnon:gazNarx", "350000");
  const [elektroNarx, setElektroNarx]             = usePersistedState("nurnon:elektroNarx", "0");

  // ── Kunlik kiritmalar (ham saqlanadi) ──
  const [ozIshlabQoplar, setOzIshlabQoplar]       = usePersistedState("nurnon:ozIshlabQoplar", {});
  const [tashqariSonlar, setTashqariSonlar]       = usePersistedState("nurnon:tashqariSonlar", {});
  const [sotilmaganNon, setSotilmaganNon]         = usePersistedState("nurnon:sotilmaganNon", {});
  const [kunlikQopSoni, setKunlikQopSoni]         = usePersistedState("nurnon:kunlikQopSoni", "");
  // Partiyaviy inventarizatsiya: kechagi qoldiq (bugungi tonggi zaxira) + bugungi qo'lda yaroqsizlar.
  const [boshlangichQoldiq, setBoshlangichQoldiq] = usePersistedState("nurnon:boshlangichQoldiq", {});
  const [qoldaYaroqsiz, setQoldaYaroqsiz]         = usePersistedState("nurnon:qoldaYaroqsiz", {});
  // Kunlik qo'shimcha xarajatlar (7 kun saqlanadi, kunlik sof foydadan ayriladi)
  const [kunlikXarajatlar, setKunlikXarajatlar]   = usePersistedState("nurnon:kunlikXarajatlar", []);
  // Oxirgi "kunni yakunlash" vaqti (ms). Markaz uchun bugungi karta/brak/xarajat
  // filtri: faqat vaqti > shu qiymat bo'lganlar "hozirgi kun"da hisoblanadi.
  // Yakunlangandan keyin oldingilari avtomatik tarixga o'tadi.
  const [oxirgiYakunlashVaqti, setOxirgiYakunlashVaqti] = usePersistedState("nurnon:oxirgiYakunlashVaqti", 0);
  // "Kunni tugatish" → Markaz ko'rsatkichlari shu kunning oxirigacha
  // (23:59) muhrlangan qiymatda turadi. Tuzilishi: { sana, lockedUntil, snapshot }.
  // Snapshot ichida sofFoyda, kartaSum, brakSum, optomSum, xarajatSum va h.k.
  const [lockedDayStats, setLockedDayStats]             = usePersistedState("nurnon:lockedDayStats", null);
  // "Tarixdagilar" — foydalanuvchi o'chirgan barcha narsalar 7 kun saqlanadi va qaytarilishi mumkin.
  // Yozuv: { id, tur, vaqt, element, qoshimcha: { indeks, ... } }
  const [ochirilganlar, setOchirilganlar]               = usePersistedState("nurnon:ochirilganlar", []);

  // ── Vaqtinchalik oqim bayroqlari (saqlanmaydi) ──
  const [qopTasdiqlandi, setQopTasdiqlandi]       = useState(false);
  const [hisobotYopildi, setHisobotYopildi]       = useState(false);

  // Avtomatik tozalash: karta/optom va to'langan qarz 7 kun, kunlik hisobotlar
  // 30 kun saqlanadi. AsyncStorage hidratsiyasi async bo'lgani uchun shu funksiya
  // 5 soniya kutib ham, ma'lumotlar yuklangach (uzunlik o'zgarganda) ham ishlaydi.
  useEffect(() => {
    const yuritish = () => {
      const now = Date.now();
      const D = 86400000;
      const yosh = (e) => now - (e.vaqt || (e.sana ? Date.parse(e.sana) : now) || now);
      setKartalar((p) => p.filter((k) => yosh(k) < 7 * D));
      setOptomlar((p) => p.filter((o) => yosh(o) < 7 * D));
      setQarzlar((p) => p.filter((q) => !q.tolangan || (now - (q.tolanganVaqt || now)) < 7 * D));
      setBraklar((p) => p.filter((b) => (now - (b.vaqt || now)) < 7 * D));
      setHisobotlarTarixi((p) => p.filter((h) => (now - (h.vaqt || now)) < 30 * D));
      setOmborTasdiqlar((p) => p.filter((t) => (now - (t.vaqt || now)) < 30 * D));
      setKunlikXarajatlar((p) => p.filter((x) => (now - (x.vaqt || now)) < 7 * D));
      setOchirilganlar((p) => (p || []).filter((x) => (now - (x.vaqt || now)) < 7 * D));
    };
    // 5s kutamiz (hidratsiya ulgursin), keyin har 6 soatda ham yuritamiz
    const t1 = setTimeout(yuritish, 5000);
    const t2 = setInterval(yuritish, 6 * 60 * 60 * 1000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  // O'zaro integratsiya: nonlar o'zgarganda, mavjud non id'lariga tegishli bo'lmagan
  // qoldiq/yaroqsiz/qop yozuvlarini avtomatik tozalash (storage'da yetim qolmasligi uchun).
  useEffect(() => {
    const idlar = new Set((nonlar || []).map((n) => String(n.id)));
    const tozala = (obj) => {
      const yangi = {};
      let ozgardi = false;
      Object.keys(obj || {}).forEach((k) => {
        if (idlar.has(String(k))) yangi[k] = obj[k];
        else ozgardi = true;
      });
      return ozgardi ? yangi : obj;
    };
    setBoshlangichQoldiq((p) => tozala(p));
    setSotilmaganNon((p) => tozala(p));
    setQoldaYaroqsiz((p) => tozala(p));
    setOzIshlabQoplar((p) => tozala(p));
    setTashqariSonlar((p) => tozala(p));
  }, [nonlar]);

  // ── Tarixdagilar: o'chirish (arxivga) va qaytarish ──
  // tur → [joriy ro'yxat, setter]
  const KOLLEKSIYA = {
    qarz: [qarzlar, setQarzlar],
    optom: [optomlar, setOptomlar],
    karta: [kartalar, setKartalar],
    brak: [braklar, setBraklar],
    xarajat: [kunlikXarajatlar, setKunlikXarajatlar],
    ishchi: [ishchilar, setIshchilar],
    non: [nonlar, setNonlar],
    hisobot: [hisobotlarTarixi, setHisobotlarTarixi],
    omborSorov: [omborSorovlar, setOmborSorovlar],
    omborSet: [omborlar, setOmborlar],
    omborTasdiq: [omborTasdiqlar, setOmborTasdiqlar],
    ingredient: [customMahsulotlar, setCustomMahsulotlar],
  };

  // Elementni ro'yxatdan olib tashlaydi va "Tarixdagilar"ga yozadi (asl o'rni bilan).
  // qoshimcha — qaytarishda kerak bo'ladigan bog'liq ma'lumotlar (masalan, ishchi narxlari).
  const ochirArxivga = (tur, id, qoshimcha = {}) => {
    const k = KOLLEKSIYA[tur];
    if (!k) return;
    const [royxat, set] = k;
    const indeks = (royxat || []).findIndex((x) => x.id === id);
    if (indeks < 0) return;
    const element = royxat[indeks];
    set((p) => (p || []).filter((x) => x.id !== id));
    setOchirilganlar((p) => [
      { id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`, tur, vaqt: Date.now(), element, qoshimcha: { ...qoshimcha, indeks } },
      ...(p || []),
    ]);
  };

  // Elementni asl ro'yxatiga, asl o'rniga qaytaradi
  const qaytar = (yozuvId) => {
    const y = (ochirilganlar || []).find((x) => x.id === yozuvId);
    if (!y || !KOLLEKSIYA[y.tur]) return false;
    const q = y.qoshimcha || {};
    const kirit = (set, el, indeks) => set((p) => {
      const a = [...(p || [])];
      if (a.some((x) => x.id === el.id)) return a; // allaqachon bor — takrorlamaymiz
      a.splice(Math.min(indeks ?? a.length, a.length), 0, el);
      return a;
    });
    kirit(KOLLEKSIYA[y.tur][1], y.element, q.indeks);
    if (y.tur === "ingredient" && q.narx) {
      setMahsulotNarxlari((p) => ({ ...p, [y.element.id]: q.narx }));
    }
    if (y.tur === "omborTasdiq" && q.omborEntry) {
      kirit(setOmborlar, q.omborEntry, 0);
    }
    if (y.tur === "non" && q.ishchiNarxlari) {
      const nom = y.element.nom;
      setIshchilar((p) => (p || []).map((w) => {
        if (!(w.id in q.ishchiNarxlari)) return w;
        const turlari = w.nonTurlari || [];
        return {
          ...w,
          nonNarxlari: { ...(w.nonNarxlari || {}), [nom]: q.ishchiNarxlari[w.id] },
          nonTurlari: turlari.includes(nom) ? turlari : [...turlari, nom],
        };
      }));
    }
    setOchirilganlar((p) => (p || []).filter((x) => x.id !== yozuvId));
    return true;
  };

  const butunlayOchir = (yozuvId) => setOchirilganlar((p) => (p || []).filter((x) => x.id !== yozuvId));

  const value = {
    nonlar, setNonlar,
    ishchilar, setIshchilar,
    mahsulotNarxlari, setMahsulotNarxlari,
    customMahsulotlar, setCustomMahsulotlar,
    qarzlar, setQarzlar,
    optomlar, setOptomlar,
    kartalar, setKartalar,
    omborlar, setOmborlar,
    omborSorovlar, setOmborSorovlar,
    omborTasdiqlar, setOmborTasdiqlar,
    hisobotlarTarixi, setHisobotlarTarixi,
    tasdiqlanganKunlar, setTasdiqlanganKunlar,
    kunlikQoplar, setKunlikQoplar,
    braklar, setBraklar,
    gazNarx, setGazNarx,
    elektroNarx, setElektroNarx,
    ozIshlabQoplar, setOzIshlabQoplar,
    tashqariSonlar, setTashqariSonlar,
    sotilmaganNon, setSotilmaganNon,
    kunlikQopSoni, setKunlikQopSoni,
    boshlangichQoldiq, setBoshlangichQoldiq,
    qoldaYaroqsiz, setQoldaYaroqsiz,
    kunlikXarajatlar, setKunlikXarajatlar,
    oxirgiYakunlashVaqti, setOxirgiYakunlashVaqti,
    lockedDayStats, setLockedDayStats,
    ochirilganlar, ochirArxivga, qaytar, butunlayOchir,
    qopTasdiqlandi, setQopTasdiqlandi,
    hisobotYopildi, setHisobotYopildi,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
