// Kun xulosasi (ish kuni tunda 03:00 da tugaganda) va ertalabki salom (04:00 dan keyingi
// birinchi ochilishda) gaplari. Statistikaga qarab holat aniqlanadi va shu holatdagi
// gaplardan biri tanlanadi (sanaga bog'liq — bir kunda bir xil, kunlar orasida turlicha).
// Xulosa: 85 ta asosiy + 20 ta qo'shimcha gap; salom: 46 ta sarlavha + 59 ta matn.
import { formatSom } from "./hisob";
import { OYLAR_TOLIQ } from "./davr";

const son = (x) => parseFloat(x) || 0;
const HAFTA = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const sanaD = (s) => { const [y, m, d] = String(s || "").split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };

// Barqaror "tasodif": bir xil kalit — bir xil tanlov
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const tanla = (arr, kalit) => arr[hash(kalit) % arr.length];
const toldir = (t, v) => String(t).replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? ""));
const som = (x) => `${formatSom(Math.round(x))} so'm`;

// ═══════════════════════════ KUN XULOSASI ═══════════════════════════
const XULOSA = {
  yakunlanmagan: [
    ["Kecha yakunlanmay qoldi", "{kun} kuni «Kunni yakunlash» bosilmadi. Kiritilgan qoplar saqlangan — Kunlik qop hisobida sanani kechaga qo'yib yakunlash mumkin."],
    ["Hisobot yozilmay qoldi", "Kechagi kun tarixga tushmadi. Sanani kechaga qo'yib kunni yakunlang — statistika to'liq bo'ladi."],
    ["Bir qadam yetmadi", "Kecha hamma narsa kiritilgan, faqat yakunlash qolib ketgan. Ikki daqiqa — va hisobot tayyor."],
    ["Kun ochiq qolgan", "{kun} kuni hisob yopilmadi. Yakunlanmagan kunlar statistikada ko'rinmaydi — bugun albatta yopib qo'ying."],
    ["Charchoq ustun keldi", "Kecha yakunlash esdan chiqqan ko'rinadi. Hisobni yopsangiz, foyda va ish haqi to'g'ri hisoblanadi."],
    ["Kechagi hisob kutyapti", "Qoplar kiritilgan, lekin kun yopilmagan. Kunlik qop hisobini ochib, sanani tekshirib yakunlang."],
    ["Hisob to'liq emas", "Kecha yakunlanmagani uchun kechagi foyda hali noma'lum. Yakunlasangiz — darhol tahlil qilib beraman."],
  ],
  dam: [
    ["Dam olish kuni", "Kecha ish bo'lmadi. Yaxshi dam olgan bo'lsangiz — bugun yangi kuch bilan boshlaymiz!"],
    ["Tinch kun", "{kun} kuni hech qanday yozuv kiritilmadi. Kuch yig'ib olish ham ishning bir qismi."],
    ["Tandir ham dam oldi", "Kecha tandir sovuq turdi. Bugun yana issiq non hidi taraladi!"],
    ["Bo'sh sahifa", "Kecha hisobda yozuv yo'q. Agar ish bo'lgan bo'lsa, sanani kechaga qo'yib kiritib qo'ying."],
    ["Jim o'tgan kun", "Kecha jim o'tdi. Dam olish — yaxshi natijaning yarmi."],
  ],
  zarar: [
    ["Kecha zarar bilan yopildi", "{kun} kuni sof natija {foyda}. Xarajatlar daromaddan oshib ketdi — sababini Statistikada ko'rib chiqaylik."],
    ["Qiyin kun bo'ldi", "Kecha {foyda} natija. Bunday kunlar bo'lib turadi — muhimi, sababini topib, takrorlamaslik."],
    ["Hisob minusda", "Kechagi natija: {foyda}. Qop soni, narxlar va qo'shimcha xarajatlarni bir ko'zdan kechiring."],
    ["Xarajat og'ir keldi", "Kecha xarajatlar ustun keldi va kun {foyda} bilan yopildi. Bugun buni qoplash imkoni bor."],
    ["Saboq bo'ladigan kun", "Kecha zarar ko'rildi ({foyda}). Har bir zarar keyingi foydaga yo'l ko'rsatadi."],
    ["Diqqat: zarar", "Kechagi daromad {daromad}, lekin xarajatlar ko'proq bo'ldi. Tannarx bo'limida narxlarni tekshirib ko'ring."],
    ["Yo'qotish kuni", "Kecha sof natija salbiy: {foyda}. Bugun yana tiklanamiz — eng muhimi, mijozlar qolmoqda."],
    ["Muvozanat buzildi", "Kecha chiqim kirimdan ko'p bo'ldi ({foyda}). Brak va xarajatlar ro'yxatiga bir qarab qo'ying."],
  ],
  birinchi: [
    ["Birinchi hisobot tayyor!", "Tabriklayman! Birinchi kun yakunlandi: sof foyda {foyda}, {non} dona non sotildi."],
    ["Yo'l boshlandi", "Birinchi kun tarixga yozildi. Har kuni yakunlab borsangiz, statistika tobora aniq bo'ladi."],
    ["Ilk sahifa", "Hisob kitobining birinchi sahifasi to'ldi: {foyda} sof foyda. Davom etamiz!"],
    ["Muborak bo'lsin!", "Birinchi hisobot: {non} dona non, {qop} qop. Endi har kuni natijani solishtirib boramiz."],
    ["Start berildi", "Kecha birinchi marta kun yakunlandi. Bir hafta o'tgach, o'rtacha ko'rsatkichlar paydo bo'ladi."],
  ],
  rekord: [
    ["Yangi rekord!", "Kecha eng yuqori sof foyda qayd etildi: {foyda}. Bunday kunlar ko'paysin!"],
    ["Eng yaxshi kun", "Saqlangan hisobotlar ichida kecha — eng foydali kun: {foyda}. Qoyil!"],
    ["Cho'qqi zabt etildi", "{kun} kuni sof foyda {foyda} — bu hozirgacha eng yuqori natija."],
    ["Tarixiy kun", "Kecha rekord o'rnatildi: {foyda} sof foyda, {non} dona non. Jamoaga rahmat aytishni unutmang!"],
    ["Rekord yangilandi", "Oldingi eng yaxshi natija ortda qoldi. Kechagi sof foyda: {foyda}."],
    ["Zo'r natija!", "Kecha barcha avvalgi kunlardan yaxshiroq bo'ldi — {foyda}. Nima to'g'ri qilinganini eslab qoling."],
    ["Oltin kun", "Tandirdan oltin chiqqandek: kecha {foyda} sof foyda — bu rekord!"],
    ["Eng yuqori pog'ona", "Kechagi natija hozirgacha eng balandi: {foyda}. Shu sur'atni ushlab turamiz!"],
  ],
  yangi: [
    ["Kun yakunlandi", "Kecha sof foyda {foyda}, {non} dona non sotildi. Bir necha kundan keyin o'rtacha bilan solishtira boshlayman."],
    ["Natija yozildi", "{kun}: {foyda} sof foyda, {qop} qop. Hisobotlar ko'paygan sari tahlil aniqlashadi."],
    ["Yaxshi qadam", "Kecha {non} dona non sotildi, sof foyda {foyda}. Har kuni yakunlab boring."],
    ["Hisob tayyor", "Kechagi kun yopildi: daromad {daromad}, sof foyda {foyda}."],
    ["Bir kun ortda", "Kecha {qop} qop ishlab chiqarildi va {foyda} sof foyda qoldi. Davom etamiz!"],
  ],
  zor: [
    ["Ajoyib kun bo'ldi!", "Kecha sof foyda {foyda} — o'rtachadan {foiz}% yuqori. Shunday davom eting!"],
    ["Kuchli natija", "{kun} kuni foyda odatdagidan {foiz}% ko'p bo'ldi: {foyda}."],
    ["Savdo gurilladi", "Kecha {non} dona non sotildi, sof foyda {foyda} (+{foiz}%). Mijozlar mamnun!"],
    ["Yuqoriga qarab", "O'rtacha {ortacha} edi, kecha esa {foyda}. Bu {foiz}% o'sish!"],
    ["Tandir qizg'in ishladi", "Kecha {qop} qop non pishdi va foyda {foiz}% oshdi. Barakalla!"],
    ["Omadli kun", "Kechagi sof foyda {foyda} — so'nggi kunlar o'rtachasidan ancha baland."],
    ["Rekordga yaqin", "Kecha {foiz}% yuqori natija: {foyda}. Yana biroz — va rekord!"],
    ["Mehnat samarasi", "Kechagi harakatlar o'zini oqladi: sof foyda {foyda}, o'rtachadan +{foiz}%."],
    ["Baraka bo'ldi", "Kecha baraka mo'l bo'ldi: {foyda} sof foyda. Shukr!"],
    ["Zo'r sur'at", "Sof foyda {foyda}, {non} dona non. O'rtachadan {foiz}% yaxshi — jamoaga rahmat!"],
  ],
  yaxshi: [
    ["Yaxshi kun", "Kecha sof foyda {foyda} — o'rtachadan {foiz}% ko'p."],
    ["Biroz yaxshiroq", "{kun} kuni natija odatdagidan {foiz}% baland bo'ldi: {foyda}."],
    ["O'sish bor", "Kecha {foyda} sof foyda qoldi. Kichik, ammo ishonchli o'sish: +{foiz}%."],
    ["To'g'ri yo'ldamiz", "Kechagi sof foyda {foyda}. O'rtacha {ortacha} edi — demak, yaxshilanyapmiz."],
    ["Mamnun bo'lsa bo'ladi", "Kecha {non} dona non sotildi, foyda {foiz}% yuqori."],
    ["Bir pog'ona yuqori", "Kechagi natija odatdagidan biroz yaxshi: {foyda}."],
    ["Ijobiy kun", "Sof foyda {foyda}, {qop} qop. O'rtachadan +{foiz}%."],
    ["Barqaror o'sish", "Kecha kutilganidan yaxshi o'tdi: {foyda} (+{foiz}%)."],
    ["Yaxshi belgi", "Kechagi daromad {daromad}, sof foyda {foyda}. Ko'rsatkich o'sishda."],
    ["Ishlar joyida", "Kecha foyda {foiz}% ko'proq bo'ldi. Shu tarzda davom etamiz!"],
  ],
  barqaror: [
    ["Odatdagidek kun", "Kecha sof foyda {foyda} — o'rtachaga juda yaqin."],
    ["Barqaror natija", "{kun} kuni hammasi me'yorda o'tdi: {foyda} sof foyda, {non} dona non."],
    ["Bir maromda", "Kecha {qop} qop non pishdi, natija odatdagidek — {foyda}."],
    ["Tekis kun", "Kechagi sof foyda {foyda}. O'rtacha {ortacha} atrofida — barqarorlik ham yutuq."],
    ["Hammasi joyida", "Kecha kutilgan natija bo'ldi: {foyda}. Bugun undan ham yaxshiroq bo'lsin!"],
    ["Muvozanat", "Kecha daromad {daromad}, sof foyda {foyda}. Odatdagi maromda."],
    ["Ishonchli kun", "Sotuv ham, foyda ham o'rtacha darajada: {non} dona, {foyda}."],
    ["Kun yopildi", "Kecha {foyda} sof foyda qoldi — so'nggi kunlarga mos natija."],
    ["Me'yorda", "Kechagi ko'rsatkichlar odatdagidan deyarli farq qilmadi: {foyda}."],
    ["Tinch va barqaror", "Kecha {non} dona non sotildi. Natija barqaror — {foyda}."],
  ],
  past: [
    ["Biroz pastroq", "Kecha sof foyda {foyda} — o'rtachadan {foiz}% kam."],
    ["Sustroq kun", "{kun} kuni natija odatdagidan {foiz}% past bo'ldi: {foyda}."],
    ["Kichik pasayish", "Kecha {foyda} sof foyda. O'rtacha {ortacha} edi — bugun qaytarib olamiz."],
    ["Savdo sekinlashdi", "Kecha {non} dona non sotildi, foyda {foiz}% kamroq."],
    ["Ozroq qoldi", "Kechagi natija {foyda}. Qop soni yoki qoldiqlarni tekshirib ko'ring."],
    ["Hali hammasi oldinda", "Kecha biroz past o'tdi (−{foiz}%). Bugun yangi imkoniyat!"],
    ["E'tibor bering", "Sof foyda {foyda}, odatdagidan {foiz}% kam. Statistikada sababini ko'rish mumkin."],
    ["Sekinroq kun", "Kecha kutilganidan biroz kam: {foyda}. Hech gap emas — bugun yaxshiroq bo'ladi."],
    ["Ozgina orqada", "Kechagi foyda {foyda}. O'rtachaga yetish uchun ozgina yetmadi."],
  ],
  judaPast: [
    ["Og'ir kun bo'ldi", "Kecha sof foyda {foyda} — o'rtachadan {foiz}% kam. Sababini birga ko'rib chiqaylik."],
    ["Keskin pasayish", "{kun} kuni natija odatdagidan ancha past: {foyda} (−{foiz}%)."],
    ["Diqqat talab", "Kecha foyda keskin tushdi. Qoplar, brak va xarajatlarni tekshirib ko'ring."],
    ["Kutilmagan pasayish", "Kechagi sof foyda {foyda}, o'rtacha esa {ortacha}. Nima o'zgarganini aniqlaylik."],
    ["Sust kun", "Kecha atigi {non} dona non sotildi. Bugun sotuvga ko'proq e'tibor beramiz."],
    ["Pastga sakrash", "Kecha {foiz}% past natija bo'ldi. Bir kunlik pasayish — hali tendensiya emas."],
    ["Qiyinroq kun", "Sof foyda {foyda}. Odatdagidan ancha kam — lekin taslim bo'lmaymiz!"],
    ["Tahlil kerak", "Kecha foyda {foiz}% pasaydi. Statistika bo'limida sabablar ko'rsatilgan."],
  ],
};

// Qo'shimcha gaplar (asosiy xulosaga ilova)
const QOSHIMCHA = {
  sotuvRekord: [
    "Sotilgan non soni — rekord: {non} dona!",
    "{non} dona — bir kunda sotilgan eng ko'p non.",
    "Mijozlar kecha ayniqsa ko'p bo'ldi: {non} dona non sotildi — rekord.",
    "Sotuv bo'yicha kecha eng yaxshi kun bo'ldi: {non} dona.",
  ],
  seriya: [
    "Foyda ketma-ket {seriya} kundan beri o'syapti!",
    "{seriya} kun ketma-ket o'sish — zo'r tendensiya.",
    "Bu {seriya}-kun ketma-ket yaxshilanish. Shu yo'ldan qaytmaylik!",
    "O'sish seriyasi davom etmoqda: {seriya} kun.",
  ],
  brak: [
    "Brak odatdagidan ko'p bo'ldi ({brak}) — xamir va tandirni bir tekshirib qo'ying.",
    "Kechagi brak {brak}. Uni kamaytirish — eng oson foyda.",
    "Diqqat: brak {brak}. Qaysi nonda ko'p bo'lganini Brak bo'limida ko'ring.",
  ],
  xarajat: [
    "Qo'shimcha xarajat katta bo'ldi: {xarajat}.",
    "Kechagi qo'shimcha xarajatlar ({xarajat}) foydaga ta'sir qildi.",
    "Xarajatlar odatdagidan ko'p: {xarajat}. Barchasi kerakmidi — bir ko'rib chiqing.",
  ],
  hafta: [
    "Hafta yakuni: {haftaSoni} kunda jami {haftaFoyda} sof foyda.",
    "Bu hafta {haftaFoyda} sof foyda bilan yopildi. Yangi haftaga omad!",
    "Haftalik natija: {haftaFoyda} ({haftaSoni} ish kuni).",
  ],
  oy: [
    "{oy} oyi yakunlandi: jami {oyFoyda} sof foyda.",
    "Oy oxiri! {oy} oyining sof foydasi — {oyFoyda}.",
    "{oy} yakuni: {oyKun} kunda {oyFoyda}. Oylik hisobni Statistikada ko'ring.",
  ],
};

const IKON = {
  yakunlanmagan: "time-outline", dam: "cafe-outline", zarar: "alert-circle-outline", birinchi: "ribbon-outline",
  rekord: "trophy-outline", yangi: "checkmark-done-outline", zor: "rocket-outline", yaxshi: "trending-up-outline",
  barqaror: "pulse-outline", past: "trending-down-outline", judaPast: "thunderstorm-outline",
};

// Hisobot (yoki uning yo'qligi) bo'yicha kun xulosasi.
// sana — xulosa qilinayotgan ish kuni ("YYYY-MM-DD"); faollik — hisobot yo'q, lekin kiritma bor edi.
export function kunXulosasi({ sana, hisobotlar, faollik = false }) {
  const h = (hisobotlar || []).find((x) => x.sana === sana) || null;
  const d = sanaD(sana);
  const v = { kun: HAFTA[d.getDay()] };
  const kalit = `x:${sana}`;
  if (!h) {
    const tur = faollik ? "yakunlanmagan" : "dam";
    const [sarlavha, matn] = tanla(XULOSA[tur], kalit);
    return { tur, ikon: IKON[tur], sarlavha, matn: toldir(matn, v), qoshimcha: [], h: null };
  }
  const oldingi = (hisobotlar || []).filter((x) => x.id !== h.id && String(x.sana) < String(sana))
    .sort((a, b) => String(b.sana).localeCompare(String(a.sana)));
  const sof = son(h.sofFoyda);
  const songgi = oldingi.slice(0, 7);
  const ortacha = songgi.length >= 3 ? songgi.reduce((s, x) => s + son(x.sofFoyda), 0) / songgi.length : null;
  const foiz = ortacha != null && Math.abs(ortacha) >= 1 ? Math.round(((sof - ortacha) / Math.abs(ortacha)) * 100) : null;
  Object.assign(v, {
    foyda: som(sof), daromad: som(son(h.daromad)), non: formatSom(son(h.sotilganNon)),
    qop: String(Math.round(son(h.jamiQop) * 10) / 10).replace(".", ","),
    ortacha: ortacha != null ? som(ortacha) : "", foiz: foiz != null ? Math.abs(foiz) : "",
  });

  let tur;
  if (sof < 0) tur = "zarar";
  else if (!oldingi.length) tur = "birinchi";
  else if (oldingi.length >= 5 && sof > Math.max(...oldingi.map((x) => son(x.sofFoyda)))) tur = "rekord";
  else if (foiz == null) tur = "yangi";
  else if (foiz >= 20) tur = "zor";
  else if (foiz >= 5) tur = "yaxshi";
  else if (foiz > -5) tur = "barqaror";
  else if (foiz > -20) tur = "past";
  else tur = "judaPast";

  const [sarlavha, matn] = tanla(XULOSA[tur], kalit);

  // Qo'shimcha faktlar (ko'pi bilan 2 ta)
  const q = [];
  if (oldingi.length >= 5 && son(h.sotilganNon) > Math.max(...oldingi.map((x) => son(x.sotilganNon)))) q.push(["sotuvRekord", {}]);
  let seriya = 1;
  for (let i = 0, joriy = sof; i < oldingi.length; i++) {
    const s = son(oldingi[i].sofFoyda);
    if (joriy > s) { seriya++; joriy = s; } else break;
  }
  if (seriya >= 3) q.push(["seriya", { seriya }]);
  const ortBrak = songgi.length ? songgi.reduce((s, x) => s + son(x.arxiv?.brakSum), 0) / songgi.length : 0;
  const brak = son(h.arxiv?.brakSum);
  if (brak > 20000 && brak > ortBrak * 1.5) q.push(["brak", { brak: som(brak) }]);
  const ortXar = songgi.length ? songgi.reduce((s, x) => s + son(x.xarajatJami), 0) / songgi.length : 0;
  const xar = son(h.xarajatJami);
  if (xar > 50000 && xar > ortXar * 1.5) q.push(["xarajat", { xarajat: som(xar) }]);
  if (d.getDay() === 0) {
    const hafta = [h, ...oldingi].filter((x) => (d - sanaD(x.sana)) / 864e5 < 7);
    if (hafta.length >= 3) q.push(["hafta", { haftaSoni: hafta.length, haftaFoyda: som(hafta.reduce((s, x) => s + son(x.sofFoyda), 0)) }]);
  }
  const ertaga = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  if (ertaga.getDate() === 1) {
    const oyda = [h, ...oldingi].filter((x) => String(x.sana).slice(0, 7) === String(sana).slice(0, 7));
    if (oyda.length >= 3) q.push(["oy", { oy: OYLAR_TOLIQ[d.getMonth()], oyKun: oyda.length, oyFoyda: som(oyda.reduce((s, x) => s + son(x.sofFoyda), 0)) }]);
  }
  const qoshimcha = q.slice(0, 2).map(([k, qv]) => toldir(tanla(QOSHIMCHA[k], `${kalit}:${k}`), { ...v, ...qv }));

  return { tur, ikon: IKON[tur], sarlavha, matn: toldir(matn, v), qoshimcha, h, foiz, ortacha };
}

// ═══════════════════════════ ERTALABKI SALOM ═══════════════════════════
const SARLAVHA = {
  erta: [ // 04:00–05:59
    "Erta turibsiz!", "Tong otmasdan ishga!", "Assalomu alaykum, saharda!", "Tandir qiziyaptimi?",
    "Erta turgan — ko'p non yopadi!", "Xayrli tong, novvoy!", "Saharda salom!", "Hali hamma uxlab yotibdi...",
    "Erta boshlangan kun — barakali", "Xamir tayyormi?",
  ],
  tong: [ // 06:00–08:59
    "Xayrli tong!", "Assalomu alaykum!", "Yangi kun muborak!", "Tong bilan!", "Issiq non vaqti!",
    "Kun boshlandi!", "Xush kelibsiz!", "Tandir qizidi, kun boshlandi!", "Barakali tong!",
    "Yaxshi kayfiyat bilan boshlaymiz!", "Bugun ham omad yor bo'lsin!", "Non hidi — tong belgisi!",
  ],
  kunduz: [ // 09:00–11:59
    "Xayrli kun!", "Assalomu alaykum!", "Ish qizg'in pallada!", "Kun qizib bormoqda", "Salom, kun yarmiga yetyapti",
    "Savdo vaqti!", "Xush kelibsiz!", "Ishlar qalay?", "Kunning eng faol payti", "Omadli kun tilayman!",
  ],
  tush: [ // 12:00–16:59
    "Tushlikdan keyin salom!", "Kunning ikkinchi yarmi", "Xayrli kun!", "Salom! Bugun birinchi kirishingiz",
    "Hali kun tugamagan!", "Kun davom etmoqda", "Ishlar qizg'in!", "Kechroq bo'lsa ham — salom!",
  ],
  kech: [ // 17:00–03:59
    "Xayrli kech!", "Kechqurun salom!", "Kun oxirlab qoldi", "Kechki salom!", "Bugun kech kirdingiz", "Oqshom muborak!",
  ],
};

// Bayramlar va maxsus kunlar ("OO-KK")
const BAYRAM = {
  "01-01": "Yangi yil muborak! Yangi yilda tandiringiz hech sovimasin, savdongiz baraka topsin.",
  "03-08": "8-mart — Xalqaro xotin-qizlar kuni muborak! Jamoadagi opa-singillarni tabriklashni unutmang.",
  "03-21": "Navro'z muborak! Bahor bayrami bilan — dasturxonlar to'kin, nonlar issiq bo'lsin.",
  "05-09": "Xotira va qadrlash kuni. Bugun yaqinlarni yo'qlash, keksalarni e'zozlash kuni.",
  "06-01": "Bolalar kuni! Bugun shirin nonlarga talab ko'p bo'lishi mumkin.",
  "09-01": "Mustaqillik kuni muborak! Bayram dasturxoniga eng mazali nonlar sizdan.",
  "10-01": "Ustoz va murabbiylar kuni muborak! Hunarni o'rgatgan ustozlarni bir eslab qo'ying.",
  "12-08": "Konstitutsiya kuni muborak! Dam olish kuni — savdo rejasini oldindan o'ylab qo'ying.",
  "12-31": "Yilning oxirgi kuni! Bir yillik mehnat uchun rahmat — kelgusi yil yanada barakali bo'lsin.",
};
const OY_BOSHI = "Yangi oy boshlandi! {oy} oyi barakali va foydali o'tsin.";

const KECHA_MATN = {
  rekord: [
    "Kecha rekord o'rnatildi — bugun ham shu ruhda!",
    "Kechagi rekord natijadan keyin kayfiyat a'lo bo'lsa kerak!",
    "Kechagi eng yaxshi kunni bugun takrorlaymizmi?",
  ],
  yaxshi: [
    "Kecha yaxshi natija bo'ldi — bugun ham shu sur'atda davom etamiz.",
    "Kechagi o'sishni bugun mustahkamlaymiz!",
    "Kecha foyda o'rtachadan yuqori bo'ldi. Ajoyib boshlanish uchun asos bor.",
    "Kechagi muvaffaqiyat — bugungi g'ayrat manbai.",
  ],
  barqaror: [
    "Kecha odatdagidek, barqaror o'tdi. Bugun undan ham yaxshiroq bo'lsin!",
    "Kechagi barqaror natija — ishonchli poydevor.",
    "Kecha hammasi me'yorida bo'ldi. Bugun yangi marralar sari!",
  ],
  past: [
    "Kecha biroz past bo'ldi — bugun qaytarib olamiz!",
    "Kechagi pasayish — vaqtinchalik. Bugun yangi imkoniyat.",
    "Kecha natija kamroq bo'ldi. Bugun sotuvga alohida e'tibor beraylik.",
  ],
  zarar: [
    "Kecha qiyin kun bo'ldi. Bugun xarajatlarni nazoratda tutib, o'rnini to'ldiramiz.",
    "Kechagi zarar — saboq. Bugun yangi sahifa ochamiz!",
    "Kecha minusda yopildi, lekin bugun hammasi o'z qo'lingizda.",
  ],
  yakunlanmagan: [
    "Kechagi kun yakunlanmay qolgan — avval uni yopib qo'yamizmi?",
    "Eslatma: kechagi hisobot hali yozilmagan. Kunlik qop hisobida yakunlab qo'ying.",
    "Kechagi qoplar kiritilgan, lekin kun yopilmagan. Bir daqiqada tuzatsa bo'ladi.",
  ],
  dam: [
    "Kecha dam oldingiz — bugun yangi kuch bilan!",
    "Dam olishdan keyin ish yanada unumli bo'ladi. Boshladik!",
  ],
};

const HAFTA_MATN = {
  0: ["Yakshanba — haftaning so'nggi kuni. Haftani yaxshi yakunlaylik!", "Yakshanba bozori qizg'in bo'ladi — nonlar yetarlimi?"],
  1: ["Yangi hafta boshlandi! Haftalik rejani bir ko'zdan kechiring.", "Dushanba — yangi hafta, yangi imkoniyatlar."],
  2: ["Seshanba — hafta endi qizimoqda. Omad!", "Seshanba kuni ham barakali o'tsin."],
  3: ["Chorshanba — haftaning o'rtasi. Natijalarni o'tgan hafta bilan solishtirib ko'ring.", "Hafta yarmi — kuchni to'g'ri taqsimlaymiz."],
  4: ["Payshanba — dam olish kunlari yaqin, buyurtmalar ko'payishi mumkin.", "Payshanba kuni ham omad yor bo'lsin!"],
  5: ["Juma muborak! Bugun non ko'p olinadigan kun.", "Juma kuni — baraka kuni. Tandir to'la bo'lsin!"],
  6: ["Shanba — to'y va mehmondorchilik kuni, optom buyurtmalarga tayyor turing.", "Shanba kuni savdo qizg'in bo'ladi — xamir ko'proq qorilsinmi?"],
};

const UMUMIY = [
  "Har bir non — mehnat va mehr mahsuli.",
  "Bugungi kichik qadamlar — ertangi katta natija.",
  "Sifat — eng yaxshi reklama. Mijoz qaytib keladi!",
  "Hisob aniq bo'lsa — foyda ham ko'rinadi.",
  "Issiq non va iliq so'z — mijozni ushlab qoladi.",
  "Bugun ham har bir qopni hisobga olishni unutmang.",
  "Jamoa bilan salomlashing — kayfiyat yaxshi bo'lsa, non ham shirin bo'ladi.",
  "Brakni kamaytirish — eng oson foyda.",
  "Qarzlarni vaqtida undirish — savdo aylanmasini tezlashtiradi.",
  "Omborni tekshirib qo'ysangiz, kun o'rtasida xomashyo tugab qolmaydi.",
  "Kechqurun «Kunni yakunlash»ni unutmang — statistika shu bilan to'ladi.",
  "Yaxshi kun yaxshi rejadan boshlanadi.",
  "Tandir qizg'in, niyat xolis bo'lsa — baraka o'zi keladi.",
  "Har kuni ozgina yaxshilanish — bir oyda katta farq.",
];

const vaqtOraligi = (soat) => (soat >= 4 && soat < 6 ? "erta" : soat < 9 && soat >= 6 ? "tong" : soat >= 9 && soat < 12 ? "kunduz" : soat >= 12 && soat < 17 ? "tush" : "kech");
export const SALOM_IKON = { erta: "moon-outline", tong: "sunny-outline", kunduz: "sunny", tush: "partly-sunny-outline", kech: "cloudy-night-outline" };

// Ertalabki salom. sana — bugungi ish kuni; kechaTur — kechagi xulosa turi (bo'lsa)
export function ertalabSalomi({ sana, hozir = new Date(), kechaTur = null }) {
  const d = sanaD(sana);
  const oraliq = vaqtOraligi(hozir.getHours());
  const kalit = `s:${sana}`;
  const sarlavha = tanla(SARLAVHA[oraliq], kalit);
  const ok = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  let matn;
  if (BAYRAM[ok]) matn = BAYRAM[ok];
  else if (d.getDate() === 1) matn = toldir(OY_BOSHI, { oy: OYLAR_TOLIQ[d.getMonth()] });
  else {
    // Kechagi natija, hafta kuni yoki umumiy tilak — kunlar orasida almashib turadi
    const kechaGuruh = kechaTur === "rekord" ? "rekord"
      : kechaTur === "zor" || kechaTur === "yaxshi" ? "yaxshi"
      : kechaTur === "past" || kechaTur === "judaPast" ? "past"
      : kechaTur && KECHA_MATN[kechaTur] ? kechaTur
      : kechaTur === "barqaror" || kechaTur === "yangi" || kechaTur === "birinchi" ? "barqaror" : null;
    const manba = hash(kalit + ":m") % 3;
    if (kechaGuruh && (manba === 0 || kechaGuruh === "yakunlanmagan" || kechaGuruh === "rekord" || kechaGuruh === "zarar")) matn = tanla(KECHA_MATN[kechaGuruh], kalit);
    else if (manba === 1) matn = tanla(HAFTA_MATN[d.getDay()], kalit);
    else matn = tanla(UMUMIY, kalit);
  }
  return { oraliq, ikon: SALOM_IKON[oraliq], sarlavha, matn };
}

// Gaplar soni (tekshirish uchun)
export const GAP_SONI = {
  xulosa: Object.values(XULOSA).reduce((s, a) => s + a.length, 0) + Object.values(QOSHIMCHA).reduce((s, a) => s + a.length, 0),
  salom: Object.values(SARLAVHA).reduce((s, a) => s + a.length, 0) + Object.keys(BAYRAM).length + 1
    + Object.values(KECHA_MATN).reduce((s, a) => s + a.length, 0) + Object.values(HAFTA_MATN).reduce((s, a) => s + a.length, 0) + UMUMIY.length,
};
