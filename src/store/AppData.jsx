// Butun ilova holati — har bir kolleksiya "nurnon:" prefiksi bilan AsyncStorage'da.
import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { LayoutAnimation, AppState } from "react-native";
import usePersistedState, { useHidratsiya } from "./usePersistedState";
import { arxivla } from "../logic/davr";
import { kunYakunEslatmalari } from "../logic/bildirishnoma";
import { nusxaSaqla, nusxaBormi } from "../logic/avtoZaxira";
import { bugunSana } from "../logic/hisob";
import { getTil } from "../i18n/til";
import { ogir } from "../i18n/translit";
import { SEED_NONLAR, SEED_ISHCHILAR, SEED_MAHSULOT_NARXLARI } from "../logic/data";

const AppDataContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useApp() faqat <AppDataProvider> ichida ishlaydi");
  return ctx;
}

// Import qilinayotgan qiymat kutilgan turga mosmi
export function BAZA_TUR_MOS(qiymat, tur) {
  if (tur === "array") return Array.isArray(qiymat);
  if (tur === "object") return !!qiymat && typeof qiymat === "object" && !Array.isArray(qiymat);
  if (tur === "objectOrNull") return qiymat === null || (typeof qiymat === "object" && !Array.isArray(qiymat));
  if (tur === "string") return typeof qiymat === "string";
  if (tur === "number") return typeof qiymat === "number" && isFinite(qiymat);
  return false;
}

// Ro'yxatga element qo'shilsa yoki o'chirilsa — qolganlari silliq siljiydi (barcha sahifalarda)
const silliqAnim = () =>
  LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
const silliqSetter = (set) => (v) =>
  set((p) => {
    const n = typeof v === "function" ? v(p) : v;
    if (Array.isArray(n) && Array.isArray(p) && n.length !== p.length) silliqAnim();
    return n;
  });

// Import: id'li yozuvlar ro'yxatida faqat id'si bor obyektlar qoladi —
// buzilgan matn ilovani ishdan chiqarmasligi uchun
const ID_ROYXATLAR = new Set(["nonlar", "ishchilar", "customMahsulotlar", "qarzlar", "optomlar", "kartalar", "omborlar",
  "omborSorovlar", "omborTasdiqlar", "hisobotlarTarixi", "braklar", "kunlikXarajatlar", "ochirilganlar", "ishHaqiYozuvlari"]);
export function tozalaRoyxat(kalit, qiymat) {
  if (!ID_ROYXATLAR.has(kalit) || !Array.isArray(qiymat)) return qiymat;
  return qiymat.filter((x) => x && typeof x === "object" && !Array.isArray(x) && x.id != null);
}

export function AppDataProvider({ children }) {
  // ── Saqlanadigan ma'lumotlar ──
  const [nonlar, setNonlarXom]                    = usePersistedState("nurnon:nonlar", SEED_NONLAR);
  const [ishchilar, setIshchilarXom]              = usePersistedState("nurnon:ishchilar", SEED_ISHCHILAR);
  const [mahsulotNarxlari, setMahsulotNarxlari]   = usePersistedState("nurnon:mahsulotNarxlari", SEED_MAHSULOT_NARXLARI);
  const [customMahsulotlar, setCustomMahsulotlarXom] = usePersistedState("nurnon:customMahsulotlar", []);
  const [qarzlar, setQarzlarXom]                  = usePersistedState("nurnon:qarzlar", []);
  const [optomlar, setOptomlarXom]                = usePersistedState("nurnon:optomlar", []);
  const [kartalar, setKartalarXom]                = usePersistedState("nurnon:kartalar", []);
  const [omborlar, setOmborlarXom]                = usePersistedState("nurnon:omborlar", []);
  const [omborSorovlar, setOmborSorovlarXom]      = usePersistedState("nurnon:omborSorovlar", []);
  const [omborTasdiqlar, setOmborTasdiqlarXom]    = usePersistedState("nurnon:omborTasdiqlar", []);
  const [hisobotlarTarixi, setHisobotlarTarixiXom] = usePersistedState("nurnon:hisobotlarTarixi", []);
  const [tasdiqlanganKunlar, setTasdiqlanganKunlar] = usePersistedState("nurnon:tasdiqlanganKunlar", []);
  const [kunlikQoplar, setKunlikQoplar]           = usePersistedState("nurnon:kunlikQoplar", []);
  const [braklar, setBraklarXom]                  = usePersistedState("nurnon:braklar", []);
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
  const [kunlikXarajatlar, setKunlikXarajatlarXom] = usePersistedState("nurnon:kunlikXarajatlar", []);
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
  const [ochirilganlar, setOchirilganlarXom]            = usePersistedState("nurnon:ochirilganlar", []);
  // Asosiy akkaunt nomi (Markaz sarlavhasida ko'rinadi, ma'lumot uzatishda birga ketadi)
  const [akkauntNomi, setAkkauntNomi]                   = usePersistedState("nurnon:akkauntNomi", "");
  // Ma'lumot yuklashdan oldingi holat — "Oldingi holatga qaytarish" uchun: { vaqt, akkaunt, data }
  const [importZaxira, setImportZaxira]                 = usePersistedState("nurnon:importZaxira", null);
  // Oylik ish haqi yozuvlari: avans / jarima / bonus / to'lov (400 kun saqlanadi)
  const [ishHaqiYozuvlari, setIshHaqiYozuvlariXom]      = usePersistedState("nurnon:ishHaqiYozuvlari", []);
  // 30 kundan eskirgan kunlik hisobotlarning oylik yig'masi (oylar taqqoslash, oylik ish haqi)
  const [oylikArxiv, setOylikArxiv]                     = usePersistedState("nurnon:oylikArxiv", {});
  // Kechqurungi "Kunni yakunlash" eslatmasi (bildirishnoma) yoqilganmi
  const [eslatmaYoqilgan, setEslatmaYoqilgan]           = usePersistedState("nurnon:eslatmaYoqilgan", true);
  // Davomat: { "2026-10-17": [kelmagan ishchi id'lari] } — 60 kun saqlanadi
  const [davomat, setDavomat]                           = usePersistedState("nurnon:davomat", {});
  // Xomashyo narxlari o'zgarish tarixi: [{ id, nom, eski, yangi, vaqt }] — 180 kun
  const [narxTarixi, setNarxTarixi]                     = usePersistedState("nurnon:narxTarixi", []);
  // Barcha saqlangan ma'lumot yuklandi. Tashqi signal sinxron render qiladi, yuklangan
  // qiymatlar esa oddiy navbatda — shuning uchun "tayyor"ni alohida holat orqali
  // keyingi navbatga qo'yamiz: u true bo'lgan renderda barcha qiymatlar allaqachon bor.
  const yuklandi = useHidratsiya();
  const [tayyor, setTayyor] = useState(false);
  useEffect(() => {
    if (!yuklandi || tayyor) return undefined;
    const t = setTimeout(() => setTayyor(true), 0);
    return () => clearTimeout(t);
  }, [yuklandi, tayyor]);

  // Ro'yxat setterlari — uzunlik o'zgarsa silliq animatsiya bilan (identifikatori barqaror)
  const setNonlar = useMemo(() => silliqSetter(setNonlarXom), [setNonlarXom]);
  const setIshchilar = useMemo(() => silliqSetter(setIshchilarXom), [setIshchilarXom]);
  const setCustomMahsulotlar = useMemo(() => silliqSetter(setCustomMahsulotlarXom), [setCustomMahsulotlarXom]);
  const setQarzlar = useMemo(() => silliqSetter(setQarzlarXom), [setQarzlarXom]);
  const setOptomlar = useMemo(() => silliqSetter(setOptomlarXom), [setOptomlarXom]);
  const setKartalar = useMemo(() => silliqSetter(setKartalarXom), [setKartalarXom]);
  const setOmborlar = useMemo(() => silliqSetter(setOmborlarXom), [setOmborlarXom]);
  const setOmborSorovlar = useMemo(() => silliqSetter(setOmborSorovlarXom), [setOmborSorovlarXom]);
  const setOmborTasdiqlar = useMemo(() => silliqSetter(setOmborTasdiqlarXom), [setOmborTasdiqlarXom]);
  const setHisobotlarTarixi = useMemo(() => silliqSetter(setHisobotlarTarixiXom), [setHisobotlarTarixiXom]);
  const setBraklar = useMemo(() => silliqSetter(setBraklarXom), [setBraklarXom]);
  const setKunlikXarajatlar = useMemo(() => silliqSetter(setKunlikXarajatlarXom), [setKunlikXarajatlarXom]);
  const setOchirilganlar = useMemo(() => silliqSetter(setOchirilganlarXom), [setOchirilganlarXom]);
  const setIshHaqiYozuvlari = useMemo(() => silliqSetter(setIshHaqiYozuvlariXom), [setIshHaqiYozuvlariXom]);

  // ── Vaqtinchalik oqim bayroqlari (saqlanmaydi) ──
  const [qopTasdiqlandi, setQopTasdiqlandi]       = useState(false);
  const [hisobotYopildi, setHisobotYopildi]       = useState(false);

  // Avtomatik tozalash: karta/optom va to'langan qarz 7 kun, kunlik hisobotlar
  // 30 kun saqlanadi (eskirganlari oylik arxivga yig'ma bo'lib o'tadi), ish haqi
  // yozuvlari 400 kun. Saqlangan ma'lumot to'liq yuklangandan keyin va har 6 soatda ishlaydi.
  const hisobotRef = useRef(hisobotlarTarixi);
  hisobotRef.current = hisobotlarTarixi;
  useEffect(() => {
    if (!tayyor) return undefined;
    const yuritish = () => {
      const now = Date.now();
      const D = 86400000;
      const yosh = (e) => now - (e.vaqt || (e.sana ? Date.parse(e.sana) : now) || now);
      const eski = (hisobotRef.current || []).filter((h) => (now - (h.vaqt || now)) >= 30 * D);
      if (eski.length) {
        const idlar = new Set(eski.map((h) => h.id));
        setOylikArxiv((a) => arxivla(a, eski));
        setHisobotlarTarixiXom((p) => (p || []).filter((h) => !idlar.has(h.id)));
      }
      setKartalarXom((p) => p.filter((k) => yosh(k) < 7 * D));
      setOptomlarXom((p) => p.filter((o) => yosh(o) < 7 * D));
      setQarzlarXom((p) => p.filter((q) => !q.tolangan || (now - (q.tolanganVaqt || now)) < 7 * D));
      setBraklarXom((p) => p.filter((b) => (now - (b.vaqt || now)) < 7 * D));
      setOmborTasdiqlarXom((p) => p.filter((t) => (now - (t.vaqt || now)) < 30 * D));
      setKunlikXarajatlarXom((p) => p.filter((x) => (now - (x.vaqt || now)) < 7 * D));
      setOchirilganlarXom((p) => (p || []).filter((x) => (now - (x.vaqt || now)) < 7 * D));
      setIshHaqiYozuvlariXom((p) => (p || []).filter((x) => (now - (x.vaqt || now)) < 400 * D));
      setNarxTarixi((p) => (p || []).filter((x) => (now - (x.vaqt || now)) < 180 * D));
      setDavomat((p) => Object.fromEntries(Object.entries(p || {}).filter(([s]) => (now - (Date.parse(s) || now)) < 60 * D)));
    };
    yuritish();
    const t = setInterval(yuritish, 6 * 60 * 60 * 1000);
    return () => clearInterval(t);
  }, [tayyor]);

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

  // Kechqurungi bildirishnoma rejasi — sozlama, yakunlangan kun yoki yozuv o'zgarsa yangilanadi
  const yakunSana = lockedDayStats?.sana || "";

  // ── Xomashyo narxi o'zgarishlarini yozib borish (yozish tugagach, 2.5 soniyadan keyin) ──
  // Faqat 1 birlik (g/ml) narxi haqiqatan o'zgarganda yoziladi; vaqtincha bo'sh maydon e'tiborsiz.
  const narxRef = useRef(null);
  useEffect(() => {
    if (!tayyor) return undefined;
    const birlik = (p) => (p && parseFloat(p.miqdor) > 0 && parseFloat(p.narx) > 0 ? parseFloat(p.narx) / parseFloat(p.miqdor) : null);
    if (narxRef.current === null) { narxRef.current = { ...(mahsulotNarxlari || {}) }; return undefined; }
    const t = setTimeout(() => {
      const eski = narxRef.current || {};
      const yangi = mahsulotNarxlari || {};
      const vaqt = Date.now();
      const ozgar = [];
      const keyingi = { ...eski };
      Object.keys(yangi).forEach((id) => {
        const b = birlik(yangi[id]);
        if (b == null) return;
        const a = birlik(eski[id]);
        if (a != null && Math.abs(a - b) > 1e-9) ozgar.push({ id: `${id}-${vaqt}`, xId: id, eski: eski[id], yangi: yangi[id], vaqt });
        keyingi[id] = yangi[id];
      });
      narxRef.current = keyingi;
      if (ozgar.length) setNarxTarixi((p) => [...ozgar, ...(p || [])].slice(0, 100));
    }, 2500);
    return () => clearTimeout(t);
  }, [tayyor, mahsulotNarxlari]);

  // ── Davomat: bugun kelmagan xodimlarga kunlik haq yozilmaydi ──
  const bugun = bugunSana();
  const kelmaganlar = useMemo(() => (davomat || {})[bugun] || [], [davomat, bugun]);
  const kelmadiAlmash = (id) => setDavomat((p) => {
    const joriy = (p || {})[bugun] || [];
    const yangi = joriy.includes(id) ? joriy.filter((x) => x !== id) : [...joriy, id];
    return { ...(p || {}), [bugun]: yangi };
  });
  // Haq hisoblash uchun xodimlar ro'yxati (kelmaganlar belgilangan)
  const ishchilarHaq = useMemo(
    () => (ishchilar || []).map((w) => (kelmaganlar.includes(w.id) ? { ...w, kelmadi: true } : w)),
    [ishchilar, kelmaganlar]
  );
  useEffect(() => {
    if (!tayyor) return;
    const til = getTil();
    kunYakunEslatmalari({
      yoqilgan: !!eslatmaYoqilgan,
      yakunlanganSana: yakunSana,
      sarlavha: ogir("Kunni yakunlashni unutmang", til),
      matn: ogir("Bugungi qop hisobini kiriting va «Kunni yakunlash»ni bosing.", til),
    });
  }, [tayyor, eslatmaYoqilgan, yakunSana]);

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
    ishHaqi: [ishHaqiYozuvlari, setIshHaqiYozuvlari],
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

  // ── Ma'lumotlarni uzatish: butun baza bitta matnga va qaytib ──
  // kalit → [joriy qiymat, setter, kutilgan tur]
  const BAZA = {
    nonlar: [nonlar, setNonlar, "array"],
    ishchilar: [ishchilar, setIshchilar, "array"],
    mahsulotNarxlari: [mahsulotNarxlari, setMahsulotNarxlari, "object"],
    customMahsulotlar: [customMahsulotlar, setCustomMahsulotlar, "array"],
    qarzlar: [qarzlar, setQarzlar, "array"],
    optomlar: [optomlar, setOptomlar, "array"],
    kartalar: [kartalar, setKartalar, "array"],
    omborlar: [omborlar, setOmborlar, "array"],
    omborSorovlar: [omborSorovlar, setOmborSorovlar, "array"],
    omborTasdiqlar: [omborTasdiqlar, setOmborTasdiqlar, "array"],
    hisobotlarTarixi: [hisobotlarTarixi, setHisobotlarTarixi, "array"],
    tasdiqlanganKunlar: [tasdiqlanganKunlar, setTasdiqlanganKunlar, "array"],
    kunlikQoplar: [kunlikQoplar, setKunlikQoplar, "array"],
    braklar: [braklar, setBraklar, "array"],
    gazNarx: [gazNarx, setGazNarx, "string"],
    elektroNarx: [elektroNarx, setElektroNarx, "string"],
    ozIshlabQoplar: [ozIshlabQoplar, setOzIshlabQoplar, "object"],
    tashqariSonlar: [tashqariSonlar, setTashqariSonlar, "object"],
    sotilmaganNon: [sotilmaganNon, setSotilmaganNon, "object"],
    kunlikQopSoni: [kunlikQopSoni, setKunlikQopSoni, "string"],
    boshlangichQoldiq: [boshlangichQoldiq, setBoshlangichQoldiq, "object"],
    qoldaYaroqsiz: [qoldaYaroqsiz, setQoldaYaroqsiz, "object"],
    kunlikXarajatlar: [kunlikXarajatlar, setKunlikXarajatlar, "array"],
    oxirgiYakunlashVaqti: [oxirgiYakunlashVaqti, setOxirgiYakunlashVaqti, "number"],
    lockedDayStats: [lockedDayStats, setLockedDayStats, "objectOrNull"],
    ochirilganlar: [ochirilganlar, setOchirilganlar, "array"],
    ishHaqiYozuvlari: [ishHaqiYozuvlari, setIshHaqiYozuvlari, "array"],
    oylikArxiv: [oylikArxiv, setOylikArxiv, "object"],
    davomat: [davomat, setDavomat, "object"],
    narxTarixi: [narxTarixi, setNarxTarixi, "array"],
  };

  // Joriy bazaning to'liq nusxasi
  const eksportMalumot = () => {
    const data = {};
    Object.keys(BAZA).forEach((k) => { data[k] = BAZA[k][0]; });
    return { v: 1, ilova: "nur-non", akkaunt: akkauntNomi || "", vaqt: Date.now(), data };
  };

  // Matndan kelgan bazani o'rnatadi (faqat to'g'ri turdagi kalitlar). Avval joriy
  // holat zaxiraga olinadi — kerak bo'lsa "Oldingi holatga qaytarish" mumkin.
  const importMalumot = (paket, { zaxiraOl = true } = {}) => {
    const data = paket?.data || {};
    if (zaxiraOl) setImportZaxira(eksportMalumot());
    let soni = 0;
    Object.keys(BAZA).forEach((k) => {
      if (!(k in data) || !BAZA_TUR_MOS(data[k], BAZA[k][2])) return;
      BAZA[k][1](tozalaRoyxat(k, data[k]));
      soni++;
    });
    if (typeof paket?.akkaunt === "string" && paket.akkaunt.trim()) setAkkauntNomi(paket.akkaunt.trim());
    setQopTasdiqlandi(false);
    setHisobotYopildi(false);
    return soni;
  };

  // ── Avtomatik zaxira nusxa: ilova ochilganda (faqat bugungi yo'q bo'lsa — ochilishdagi
  //    holat bugungi yaxshi nusxani bosib ketmasin), kun yakunlanganda
  //    va ilova fonga o'tganda (eng ko'pi 10 daqiqada bir) bugungi nusxa yoziladi ──
  const eksportRef = useRef(eksportMalumot);
  eksportRef.current = eksportMalumot;
  const [oxirgiNusxa, setOxirgiNusxa] = useState(0);
  const oxirgiNusxaRef = useRef(0);
  const nusxaOl = (majburiy = false) => {
    const hozir = Date.now();
    if (!majburiy && hozir - oxirgiNusxaRef.current < 10 * 60 * 1000) return;
    oxirgiNusxaRef.current = hozir;
    nusxaSaqla(eksportRef.current(), bugunSana()).then(() => setOxirgiNusxa(Date.now())).catch(() => {});
  };
  useEffect(() => {
    if (!tayyor) return undefined;
    const t = setTimeout(() => {
      nusxaBormi(bugunSana()).then((bor) => { if (!bor) nusxaOl(true); else setOxirgiNusxa(Date.now()); }).catch(() => {});
    }, 3000);
    const sub = AppState.addEventListener("change", (h) => { if (h === "background") nusxaOl(); });
    return () => { clearTimeout(t); sub.remove(); };
  }, [tayyor]);
  useEffect(() => { if (tayyor && yakunSana) nusxaOl(true); }, [tayyor, yakunSana]);

  // ── Katta amallarni bekor qilish (10 soniya): amal oldidagi holat saqlanadi ──
  const [bekor, setBekor] = useState(null); // { id, matn, paket }
  const bekorTaklif = (matn, paket) => setBekor({ id: Date.now(), matn, paket });
  const bekorQil = () => {
    if (!bekor) return false;
    importMalumot(bekor.paket, { zaxiraOl: false });
    setBekor(null);
    return true;
  };
  const bekorYop = () => setBekor(null);

  const zaxiradanQaytar = () => {
    if (!importZaxira) return false;
    importMalumot(importZaxira, { zaxiraOl: false });
    setAkkauntNomi(importZaxira.akkaunt || "");
    setImportZaxira(null);
    return true;
  };

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
    akkauntNomi, setAkkauntNomi,
    ishHaqiYozuvlari, setIshHaqiYozuvlari,
    oylikArxiv, setOylikArxiv,
    eslatmaYoqilgan, setEslatmaYoqilgan,
    davomat, setDavomat, kelmaganlar, kelmadiAlmash, ishchilarHaq,
    narxTarixi, setNarxTarixi,
    oxirgiNusxa, nusxaOl,
    bekor, bekorTaklif, bekorQil, bekorYop,
    tayyor,
    eksportMalumot, importMalumot, importZaxira, zaxiradanQaytar,
    qopTasdiqlandi, setQopTasdiqlandi,
    hisobotYopildi, setHisobotYopildi,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
