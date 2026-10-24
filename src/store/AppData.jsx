// Butun ilova holati — har bir kolleksiya "nurnon:" prefiksi bilan AsyncStorage'da.
import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { LayoutAnimation, AppState, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import usePersistedState, { useHidratsiya } from "./usePersistedState";
import { arxivla } from "../logic/davr";
import { kunYakunEslatmalari } from "../logic/bildirishnoma";
import { nusxaSaqla, nusxaBormi } from "../logic/avtoZaxira";
import { bugunSana, keyingiSana } from "../logic/hisob";
import { rasmSaqla, rasmFaylOchir, pdfRasmlari } from "../logic/qopRasm";
import { kunlikHtml, pdfUlash, pdfFaylYarat, pdfFaylUlash, pdfFaylOchir } from "../logic/ulashish";
import { getTil } from "../i18n/til";
import { ogir } from "../i18n/translit";
import { SEED_NONLAR, SEED_ISHCHILAR, SEED_MAHSULOT_NARXLARI } from "../logic/data";

export const AppDataContext = createContext(null);

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
  // (ish kuni tugaguncha — tunda 03:00) muhrlangan qiymatda turadi. Tuzilishi: { sana, lockedUntil, snapshot }.
  // Snapshot ichida sofFoyda, kartaSum, brakSum, optomSum, xarajatSum va h.k.
  const [lockedDayStats, setLockedDayStats]             = usePersistedState("nurnon:lockedDayStats", null);
  // Kun yakunini bekor qilish uchun (shu kun oxirigacha): yakunlashdan oldingi holat
  // { kun, vaqt, snapId, sorovId, oldin: { ... } }
  const [yakunBekor, setYakunBekor]                     = usePersistedState("nurnon:yakunBekor", null);
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
  // Xodimlar kelgan vaqti (qo'lda kiritiladi): { "2026-10-17": { ishchiId: "07:30" } } — 60 kun
  const [kelishVaqtlari, setKelishVaqtlari]             = usePersistedState("nurnon:kelishVaqtlari", {});
  // Xomashyo narxlari o'zgarish tarixi: [{ id, nom, eski, yangi, vaqt }] — 180 kun
  const [narxTarixi, setNarxTarixi]                     = usePersistedState("nurnon:narxTarixi", []);
  // Kun xulosasi (03:00) va ertalabki salom ekranlari yoqilganmi (qurilma sozlamasi)
  const [salomYoqilgan, setSalomYoqilgan]               = usePersistedState("nurnon:salomYoqilgan", true);
  // Ertalabgi qop rasmlari (7 kun, faqat shu telefonda): [{ id, kun, uri, vaqt }]
  const [qopRasmlari, setQopRasmlari]                   = usePersistedState("nurnon:qopRasmlari", []);
  // PDFlar arxivi (30 kun, faqat shu telefonda): [{ hisobotId, sana, uri, hajm, rasmSoni, vaqt }]
  const [pdfArxiv, setPdfArxiv]                         = usePersistedState("nurnon:pdfArxiv", []);
  // Ertalabgi tekshiruv (har ish kuni, 03:00 dan): { kun, davomat, ombor, rasm, tugallandi: ms }
  const [ertalabTekshiruv, setErtalabTekshiruv]         = usePersistedState("nurnon:ertalabTekshiruv", null);
  // Foydalanuvchi o'zgartirgan xomashyo ikonkalari: { xomashyoId: ikonKaliti }
  const [xomashyoIkonlari, setXomashyoIkonlari]         = usePersistedState("nurnon:xomashyoIkonlari", {});
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
      // Qop rasmlari 7 kun saqlanadi — eskilari fayli bilan o'chiriladi
      setQopRasmlari((p) => (p || []).filter((r) => {
        const qol = (now - (r.vaqt || now)) < 7 * D;
        if (!qol) rasmFaylOchir(r.uri);
        return qol;
      }));
      setDavomat((p) => Object.fromEntries(Object.entries(p || {}).filter(([s]) => (now - (Date.parse(s) || now)) < 60 * D)));
      setKelishVaqtlari((p) => Object.fromEntries(Object.entries(p || {}).filter(([s]) => (now - (Date.parse(s) || now)) < 60 * D)));
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
  const yakunSana = lockedDayStats?.kun || lockedDayStats?.sana || "";

  // ── KUNNI YAKUNLASH — kuniga bir marta. Hamma o'zgarish bitta joyda (atomik):
  //    hisobot tarixga, Markaz muhrlanadi, xomashyo so'rovnomasi, ertangi tonggi qoldiq.
  //    Oldingi holat saqlanadi — shu kun oxirigacha Markazdan bekor qilish mumkin.
  // Har chaqirilganda yangidan tekshiriladi (tunda 03:00 dan keyin eski qiymat qolib ketmasin)
  const kunYakunlanganmi = () => !!(lockedDayStats
    && (lockedDayStats.kun || lockedDayStats.sana) === bugunSana()
    && (!lockedDayStats.lockedUntil || Date.now() <= lockedDayStats.lockedUntil));
  const kunYakunlangan = kunYakunlanganmi();
  // Yangi yozuv (karta, brak, optom, qarz, xarajat) sanasi: bugun yakunlangan bo'lsa —
  // ertangi ish kuni (aks holda 03:00 gacha kiritilgani hech bir hisobotga tushmay qolardi).
  const yozuvSanasi = () => (kunYakunlanganmi() ? keyingiSana(bugunSana()) : bugunSana());

  const kunYakunla = ({ snap, lock, sorov, forma }) => {
    // O'tgan sana bilan yakunlash (unutilgan kun): hisobot tarixga yoziladi, qoldiq ertangi
    // tonggiga o'tadi, lekin BUGUNGI kun yakunlangan deb belgilanmaydi va bugungi yozuvlar
    // (karta, xarajat...) yo'qolmaydi — shuning uchun muhr va "oxirgi yakunlash vaqti" tegilmaydi.
    const bugunmi = snap.sana === bugunSana();
    if (bugunmi && kunYakunlanganmi()) return false;
    const vaqt = Date.now();
    const almashganHisobot = (hisobotlarTarixi || []).find((h) => h.sana === snap.sana) || null;
    const almashganSorov = sorov ? (omborSorovlar || []).find((s) => s.sana === sorov.sana) || null : null;
    if (bugunmi) {
      setYakunBekor({
        kun: bugunSana(), vaqt, snapId: snap.id, sorovId: sorov?.id || null,
        oldin: {
          lockedDayStats, oxirgiYakunlashVaqti, boshlangichQoldiq,
          ozIshlabQoplar: forma.ozIshlabQoplar, tashqariSonlar: forma.tashqariSonlar,
          sotilmaganNon: forma.sotilmaganNon, qoldaYaroqsiz: forma.qoldaYaroqsiz,
          almashganHisobot, almashganSorov,
        },
      });
      setLockedDayStats({ ...lock, kun: bugunSana() });
    }
    setHisobotlarTarixi((prev) => [snap, ...(prev || []).filter((h) => h.sana !== snap.sana)].sort((a, b) => String(b.sana).localeCompare(String(a.sana))));
    if (sorov) setOmborSorovlar((prev) => [sorov, ...(prev || []).filter((s) => s.sana !== sorov.sana)]);
    if (bugunmi) setOxirgiYakunlashVaqti(vaqt);
    // Kun oxiri qoldiq → ertangi tonggi zaxira; bugungi kiritmalar tozalanadi
    setBoshlangichQoldiq(forma.sotilmaganNon || {});
    setSotilmaganNon({}); setOzIshlabQoplar({}); setTashqariSonlar({}); setQoldaYaroqsiz({});
    return true;
  };

  // Bekor qilish mumkinmi: faqat shu kuni va yakun hali turgan bo'lsa
  const yakunBekorMumkinmi = () => !!(yakunBekor && yakunBekor.kun === bugunSana() && kunYakunlanganmi());
  const yakunBekorMumkin = yakunBekorMumkinmi();

  const kunYakuniniBekor = () => {
    if (!yakunBekorMumkinmi()) return false;
    const { snapId, sorovId, oldin } = yakunBekor;
    // Tarixdagilar'ga: bekor qilingan yakunni qayta tiklash mumkin bo'lsin
    const snap = (hisobotlarTarixi || []).find((h) => h.id === snapId);
    if (snap) {
      const tasdiq = sorovId ? (omborTasdiqlar || []).find((t) => t.sorovId === sorovId) : null;
      const sorov = sorovId
        ? (omborSorovlar || []).find((s) => s.id === sorovId)
          || (tasdiq ? { id: sorovId, sana: tasdiq.sana, vaqt: tasdiq.vaqt, manba: tasdiq.manba, maydonlar: tasdiq.maydonlar } : null)
        : null;
      amalArxivga("kunYakuni", {
        kun: yakunBekor.kun, sana: snap.sana, snap, lock: lockedDayStats, sorov,
        forma: {
          ozIshlabQoplar: oldin.ozIshlabQoplar || {}, tashqariSonlar: oldin.tashqariSonlar || {},
          sotilmaganNon: oldin.sotilmaganNon || {}, qoldaYaroqsiz: oldin.qoldaYaroqsiz || {},
        },
      });
    }
    setHisobotlarTarixi((prev) => {
      const qolgan = (prev || []).filter((h) => h.id !== snapId);
      if (oldin.almashganHisobot && !qolgan.some((h) => h.id === oldin.almashganHisobot.id)) qolgan.push(oldin.almashganHisobot);
      return qolgan.sort((a, b) => String(b.sana).localeCompare(String(a.sana)));
    });
    if (sorovId) {
      // So'rovnoma tasdiqlangan bo'lsa — ombor chiqimi ham qaytariladi
      const tasdiq = (omborTasdiqlar || []).find((t) => t.sorovId === sorovId);
      if (tasdiq) {
        setOmborTasdiqlar((prev) => (prev || []).filter((t) => t.id !== tasdiq.id));
        setOmborlar((prev) => (prev || []).filter((h) => h.id !== tasdiq.omborId));
      }
      setOmborSorovlar((prev) => {
        const q = (prev || []).filter((s) => s.id !== sorovId);
        return oldin.almashganSorov && !q.some((s) => s.id === oldin.almashganSorov.id) ? [oldin.almashganSorov, ...q] : q;
      });
    }
    // Yakundan keyin ertangi sanaga yozilganlar — yana bugungi kunga qaytadi
    const ertaga = keyingiSana(yakunBekor.kun), bugun = yakunBekor.kun;
    const bugungaQaytar = (arr) => {
      if (!(arr || []).some((e) => e.sana === ertaga && (e.vaqt || 0) > (yakunBekor.vaqt || 0))) return arr;
      return arr.map((e) => (e.sana === ertaga && (e.vaqt || 0) > (yakunBekor.vaqt || 0) ? { ...e, sana: bugun } : e));
    };
    setKartalarXom(bugungaQaytar); setBraklarXom(bugungaQaytar); setOptomlarXom(bugungaQaytar); setQarzlarXom(bugungaQaytar); setKunlikXarajatlarXom(bugungaQaytar);
    setLockedDayStats(oldin.lockedDayStats || null);
    setOxirgiYakunlashVaqti(oldin.oxirgiYakunlashVaqti || 0);
    setBoshlangichQoldiq(oldin.boshlangichQoldiq || {});
    setOzIshlabQoplar(oldin.ozIshlabQoplar || {});
    setTashqariSonlar(oldin.tashqariSonlar || {});
    setSotilmaganNon(oldin.sotilmaganNon || {});
    setQoldaYaroqsiz(oldin.qoldaYaroqsiz || {});
    setYakunBekor(null);
    return true;
  };

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

  // ── Ish kuni almashishini kuzatish ──
  // Ilova tun 03:00 dan oshib ochiq tursa, "bugun" eskirib qolmasin: kun o'zgargan zahoti
  // butun ilova qayta chiziladi (davomat, ertalabgi tekshiruv va h.k. yangi kunga o'tadi).
  const [, setKunKalit] = useState(bugunSana());
  useEffect(() => {
    const tekshir = () => setKunKalit((p) => { const b = bugunSana(); return p === b ? p : b; });
    const t = setInterval(tekshir, 30000);
    const sub = AppState.addEventListener("change", (h) => { if (h === "active") tekshir(); });
    return () => { clearInterval(t); sub.remove(); };
  }, []);

  // ── Davomat: bugun kelmagan xodimlarga kunlik haq yozilmaydi ──
  const bugun = bugunSana();
  const kelmaganlar = useMemo(() => (davomat || {})[bugun] || [], [davomat, bugun]);
  const kelmadiAlmash = (id) => setDavomat((p) => {
    const joriy = (p || {})[bugun] || [];
    const yangi = joriy.includes(id) ? joriy.filter((x) => x !== id) : [...joriy, id];
    return { ...(p || {}), [bugun]: yangi };
  });
  // Bugun kelgan vaqtlar va ularni o'rnatish ("" — o'chirish)
  const kelishVaqti = useMemo(() => (kelishVaqtlari || {})[bugun] || {}, [kelishVaqtlari, bugun]);
  const kelishVaqtiQoy = (id, soat) => setKelishVaqtlari((p) => {
    const kun = { ...((p || {})[bugun] || {}) };
    if (soat) kun[id] = soat; else delete kun[id];
    return { ...(p || {}), [bugun]: kun };
  });
  // Haq hisoblash uchun xodimlar ro'yxati (kelmaganlar belgilangan)
  const ishchilarHaq = useMemo(
    () => (ishchilar || []).map((w) => (kelmaganlar.includes(w.id) ? { ...w, kelmadi: true } : w)),
    [ishchilar, kelmaganlar]
  );
  // Bildirishnoma ruxsati berilgach eslatmalarni qayta rejalashtirish uchun
  const [eslatmaKalit, setEslatmaKalit] = useState(0);
  const eslatmaYangila = () => setEslatmaKalit((k) => k + 1);
  useEffect(() => {
    if (!tayyor) return;
    const til = getTil();
    kunYakunEslatmalari({
      yoqilgan: !!eslatmaYoqilgan,
      yakunlanganSana: yakunSana,
      sarlavha: ogir("Kunni yakunlashni unutmang", til),
      matn: ogir("Bugungi qop hisobini kiriting va «Kunni yakunlash»ni bosing.", til),
    });
  }, [tayyor, eslatmaYoqilgan, yakunSana, eslatmaKalit]);

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

  // Salbiy amallar (haydash, zaxirani nollash, to'lovni bekor qilish, kun yakunini
  // bekor qilish, ma'lumot yuklash) — ro'yxatdan hech narsa olinmaydi, faqat qaytarish
  // uchun "Tarixdagilar"ga yoziladi. element — amalni ortga qaytarishga yetadigan ma'lumot.
  const amalArxivga = (tur, element, qoshimcha = {}) => setOchirilganlar((p) => [
    { id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`, tur, vaqt: Date.now(), amal: true, element, qoshimcha },
    ...(p || []),
  ]);

  // Har bir amalni ortga qaytarish. Natija: true yoki nima uchun bo'lmagani (matn)
  const AMALLAR = {
    haydash: (e) => {
      if (!(ishchilar || []).some((w) => w.id === e.id)) return "Xodim topilmadi — o'chirilgan bo'lishi mumkin.";
      setIshchilar((p) => (p || []).map((w) => (w.id === e.id ? { ...w, holat: e.holat || "Aktiv", tatilQaytishSana: e.tatilQaytishSana || "" } : w)));
      return true;
    },
    nollash: (e) => {
      if (!(omborlar || []).some((h) => h.id === e.id)) return "Bu nollash allaqachon bekor qilingan.";
      setOmborlar((p) => (p || []).filter((h) => h.id !== e.id));
      return true;
    },
    tolovBekor: (e) => {
      const qismlar = (e.qismlar || []).filter((x) => x && x.tolov);
      if (!qismlar.some((x) => (qarzlar || []).some((q) => q.id === x.qarzId))) return "Qarz topilmadi — o'chirilgan bo'lishi mumkin.";
      // Qarz keyinroq boshqa to'lov bilan yopilgan bo'lsa — qayta tiklash ikki marta to'lash bo'lardi
      const ortiqcha = qismlar.some((x) => {
        const q = (qarzlar || []).find((y) => y.id === x.qarzId);
        if (!q || (q.tolovlar || []).some((t) => t.id === x.tolov.id)) return false;
        const tolangan = (q.tolovlar || []).reduce((s, t) => s + (parseFloat(t.summa) || 0), 0);
        const qoldiq = q.tolangan && !(q.tolovlar || []).length ? 0 : (parseFloat(q.summa) || 0) - tolangan;
        return (parseFloat(x.tolov.summa) || 0) > qoldiq + 0.5;
      });
      if (ortiqcha) return "Bu qarz keyinroq boshqa to'lov bilan yopilgan — eski to'lovni qayta tiklab bo'lmaydi.";
      setQarzlar((p) => (p || []).map((q) => {
        const mos = qismlar.filter((x) => x.qarzId === q.id);
        if (!mos.length) return q;
        const tolovlar = [...(q.tolovlar || [])];
        mos.forEach((x) => { if (!tolovlar.some((t) => t.id === x.tolov.id)) tolovlar.push(x.tolov); });
        tolovlar.sort((a, b) => (a.vaqt || 0) - (b.vaqt || 0));
        const yopiq = tolovlar.reduce((s, t) => s + (parseFloat(t.summa) || 0), 0) >= (parseFloat(q.summa) || 0) - 0.5;
        return { ...q, tolovlar, tolangan: yopiq, tolanganVaqt: yopiq ? (q.tolanganVaqt || mos[0].tolanganVaqt || mos[0].tolov.vaqt) : null };
      }));
      return true;
    },
    kunYakuni: (e) => {
      if (!e.snap) return "Hisobot ma'lumoti topilmadi.";
      if (e.kun === bugunSana()) {
        // Shu ish kuni hali tugamagan — kun xuddi avvalgidek qayta yakunlanadi
        if (kunYakunlanganmi()) return "Bugun kun qayta yakunlangan. Avval uni Markazdan bekor qiling.";
        kunYakunla({ snap: e.snap, lock: e.lock, sorov: e.sorov, forma: e.forma || {} });
        return true;
      }
      // Kun o'tib ketgan — hisobot tarixga qaytadi
      if ((hisobotlarTarixi || []).some((h) => h.sana === e.snap.sana)) return `${e.snap.sana} uchun hisobot allaqachon bor.`;
      setHisobotlarTarixi((p) => [...(p || []), e.snap].sort((a, b) => String(b.sana).localeCompare(String(a.sana))));
      return true;
    },
    import: (e) => {
      if (!importZaxira || importZaxira.vaqt !== e.zaxiraVaqt) return "Yuklashdan oldingi holat nusxasi topilmadi.";
      zaxiradanQaytar();
      return true;
    },
  };

  // Elementni asl ro'yxatiga, asl o'rniga qaytaradi (amal bo'lsa — amalni ortga qaytaradi).
  // Natija: true, false yoki qaytarib bo'lmaganining sababi (matn)
  const qaytar = (yozuvId) => {
    const y = (ochirilganlar || []).find((x) => x.id === yozuvId);
    if (!y) return false;
    if (y.amal) {
      const f = AMALLAR[y.tur];
      if (!f) return false;
      const n = f(y.element || {}, y.qoshimcha || {});
      if (n !== true) return n || false;
      setOchirilganlar((p) => (p || []).filter((x) => x.id !== yozuvId));
      return true;
    }
    if (!KOLLEKSIYA[y.tur]) return false;
    // Bir sanaga ikkita hisobot bo'lmasin (o'chirilgandan keyin shu kun qayta yakunlangan bo'lishi mumkin)
    if (y.tur === "hisobot" && (hisobotlarTarixi || []).some((h) => h.sana === y.element?.sana && h.id !== y.element?.id))
      return `${y.element.sana} uchun hisobot allaqachon bor.`;
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

  // ── Ertalabgi tekshiruv: davomat va ombor ko'rilgach "tugallandi" ──
  // Faqat joriy ish kuniga tegishli; yangi kun (03:00) boshlanganda o'zi bo'shaydi.
  const ertalabOl = () => {
    const e = ertalabTekshiruv;
    return e && e.kun === bugunSana() ? e : { kun: bugunSana(), davomat: false, ombor: false, rasm: false, tugallandi: 0 };
  };
  const ertalab = ertalabOl();
  // Funksional yangilash: ketma-ket chaqiruvlar (rasm qo'shish, belgilash) bir-birining ustiga yozmasin
  const ertalabBosh = () => ({ kun: bugunSana(), davomat: false, ombor: false, rasm: false, tugallandi: 0 });
  const ertalabBelgila = (qadam, qiymat = true) =>
    setErtalabTekshiruv((p) => ({ ...(p && p.kun === bugunSana() ? p : ertalabBosh()), [qadam]: !!qiymat }));
  const ertalabTugalla = () =>
    setErtalabTekshiruv((p) => ({ ...(p && p.kun === bugunSana() ? p : ertalabBosh()), tugallandi: Date.now() }));
  // Markazdagi havoladan kelinganini bildiradi — sahifada "Tayyor" belgisi chiqadi
  const [ertalabYonalish, setErtalabYonalish] = useState(null); // "davomat" | "ombor" | null
  const [ertalabPanel, setErtalabPanel] = useState(false);
  // Kalkulyatordan Qarz/Optom formasiga o'tkaziladigan savat: { tur: "qarz" | "optom", savat }
  const [tayyorSavat, setTayyorSavat] = useState(null);

  // ── Qop rasmlari (Kunlik qop hisobi tagida olinadi; kun — qaysi ish kuniga tegishli) ──
  const bugungiRasmlar = (qopRasmlari || []).filter((r) => r.kun === bugunSana());
  const qopRasmQosh = async (urilar, kun = bugunSana()) => {
    const yangilar = [];
    for (const [i, uri] of (urilar || []).entries()) {
      const id = `${Date.now()}-${i}`;
      yangilar.push({ id, kun, uri: await rasmSaqla(uri, id), vaqt: Date.now() });
    }
    if (!yangilar.length) return 0;
    setQopRasmlari((p) => [...(p || []), ...yangilar]);
    return yangilar.length;
  };
  const qopRasmOchir = (id) => setQopRasmlari((p) => (p || []).filter((r) => {
    if (r.id !== id) return true;
    rasmFaylOchir(r.uri);
    return false;
  }));

  // ── PDFlar arxivi: har bir kunlik hisobot (oxirgi 30 kun) uchun PDF fayl rasmlari bilan
  //    saqlanadi. Kun yakunlanganda darrov yaratiladi (rasmlar 7 kundan keyin o'chsa ham PDF qoladi);
  //    yakun bekor qilinsa yoki hisobot 30 kundan eskirsa — fayli o'chiriladi.
  const pdfArxivRef = useRef(pdfArxiv); pdfArxivRef.current = pdfArxiv;
  const pdfMalumot = useRef({}); pdfMalumot.current = { hisobotlarTarixi, qopRasmlari, akkauntNomi, nonlar };
  const pdfBand = useRef(false);
  const [pdfTik, setPdfTik] = useState(0);
  const pdfKutish = useRef(false);
  useEffect(() => {
    if (!tayyor || Platform.OS === "web") return;
    if (pdfBand.current) { pdfKutish.current = true; return; }
    pdfBand.current = true;
    (async () => {
      try {
        const { hisobotlarTarixi: hs, qopRasmlari: rs, akkauntNomi: akk, nonlar: nl } = pdfMalumot.current;
        const chegara = Date.now() - 30 * 86400000;
        const hisobotlar = (hs || []).filter((h) => (h.vaqt || 0) >= chegara);
        const idlar = new Set(hisobotlar.map((h) => h.id));
        const ortiqcha = (pdfArxivRef.current || []).filter((e) => !idlar.has(e.hisobotId));
        if (ortiqcha.length) {
          ortiqcha.forEach((e) => pdfFaylOchir(e.uri));
          setPdfArxiv((p) => (p || []).filter((e) => idlar.has(e.hisobotId)));
        }
        const bor = new Set((pdfArxivRef.current || []).map((e) => e.hisobotId));
        for (const h of hisobotlar) {
          if (bor.has(h.id)) continue;
          const rasmlar = await pdfRasmlari(rs, h.sana);
          const f = await pdfFaylYarat(kunlikHtml(h, { akkaunt: akk, nonlar: nl, rasmlar }), `nur-non-${h.sana}-${h.id}`).catch(() => null);
          if (!f) continue;
          setPdfArxiv((p) => [...(p || []).filter((e) => e.hisobotId !== h.id), { hisobotId: h.id, sana: h.sana, uri: f.uri, hajm: f.hajm, rasmSoni: rasmlar.length, vaqt: Date.now() }]);
        }
      } finally {
        pdfBand.current = false;
        if (pdfKutish.current) { pdfKutish.current = false; setPdfTik((x) => x + 1); }
      }
    })();
  }, [tayyor, hisobotlarTarixi, pdfTik]);

  // Hisobot PDF'ini ulashish: arxivda tayyor fayl bo'lsa — o'sha, bo'lmasa yangidan yaratiladi
  const hisobotPdfUlash = async (h) => {
    const e = (pdfArxiv || []).find((x) => x.hisobotId === h.id);
    if (e?.uri && Platform.OS !== "web") {
      const fayl = await FileSystem.getInfoAsync(e.uri).catch(() => null);
      if (fayl?.exists) return pdfFaylUlash(e.uri, `nur-non-${h.sana}`);
    }
    const rasmlar = await pdfRasmlari(qopRasmlari, h.sana);
    return pdfUlash(kunlikHtml(h, { akkaunt: akkauntNomi, nonlar, rasmlar }), `nur-non-${h.sana}`);
  };

  // ── Ikonkalar: xomashyo (asosiylari ham) va non ikonkasini almashtirish ──
  const xomashyoIkonQoy = (id, kalit) => {
    setXomashyoIkonlari((p) => ({ ...(p || {}), [id]: kalit }));
    setCustomMahsulotlarXom((p) => (p || []).map((m) => (m.id === id ? { ...m, ikon: kalit } : m)));
  };

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
    kelishVaqtlari: [kelishVaqtlari, setKelishVaqtlari, "object"],
    narxTarixi: [narxTarixi, setNarxTarixi, "array"],
    xomashyoIkonlari: [xomashyoIkonlari, setXomashyoIkonlari, "object"],
    ertalabTekshiruv: [ertalabTekshiruv, setErtalabTekshiruv, "objectOrNull"],
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
    const zaxira = zaxiraOl ? eksportMalumot() : null;
    if (zaxira) setImportZaxira(zaxira);
    let soni = 0;
    Object.keys(BAZA).forEach((k) => {
      if (!(k in data) || !BAZA_TUR_MOS(data[k], BAZA[k][2])) return;
      BAZA[k][1](tozalaRoyxat(k, data[k]));
      soni++;
    });
    // Tarixdagilar'ga (yuklangan ro'yxat ustiga): oldingi holatga qaytarish mumkin
    if (zaxira && soni > 0) amalArxivga("import", { akkaunt: zaxira.akkaunt || "", zaxiraVaqt: zaxira.vaqt, yangiAkkaunt: String(paket?.akkaunt || "") });
    if (typeof paket?.akkaunt === "string" && paket.akkaunt.trim()) setAkkauntNomi(paket.akkaunt.trim());
    if (zaxiraOl) setYakunBekor(null); // boshqa ma'lumot yuklandi — eski kun yakunini bekor qilib bo'lmaydi
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
    kunYakunlangan, kunYakunlanganmi, yozuvSanasi, kunYakunla, yakunBekor, yakunBekorMumkin, yakunBekorMumkinmi, kunYakuniniBekor,
    ochirilganlar, ochirArxivga, amalArxivga, qaytar, butunlayOchir,
    akkauntNomi, setAkkauntNomi,
    ishHaqiYozuvlari, setIshHaqiYozuvlari,
    oylikArxiv, setOylikArxiv,
    eslatmaYoqilgan, setEslatmaYoqilgan, eslatmaYangila,
    davomat, setDavomat, kelmaganlar, kelmadiAlmash, ishchilarHaq,
    kelishVaqtlari, kelishVaqti, kelishVaqtiQoy,
    narxTarixi, setNarxTarixi,
    xomashyoIkonlari, xomashyoIkonQoy,
    salomYoqilgan, setSalomYoqilgan,
    tayyorSavat, setTayyorSavat,
    qopRasmlari, bugungiRasmlar, qopRasmQosh, qopRasmOchir,
    pdfArxiv, hisobotPdfUlash,
    ertalab, ertalabBelgila, ertalabTugalla, ertalabYonalish, setErtalabYonalish, ertalabPanel, setErtalabPanel,
    oxirgiNusxa, nusxaOl,
    bekor, bekorTaklif, bekorQil, bekorYop,
    tayyor,
    eksportMalumot, importMalumot, importZaxira, zaxiradanQaytar,
    qopTasdiqlandi, setQopTasdiqlandi,
    hisobotYopildi, setHisobotYopildi,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
