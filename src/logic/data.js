// Boshlang'ich (SEED) ma'lumotlar. Faqat birinchi ochilishda ishlatiladi.

export const SEED_ISHCHILAR = [
  { id: 1, ism: "Feruz aka",           lavozimId: "nonYopuvchi", lavozimCustom: "",                  haqTuri: "qop",    miqdor: 30000,  tel: "", holat: "Aktiv", tatilQaytishSana: "", tahrirSoni: 0, nonTurlari: ["Issiq non"],               nonNarxlari: { "Issiq non": 30000 } },
  { id: 2, ism: "Otabek va Vahob aka", lavozimId: "nonYopuvchi", lavozimCustom: "",                  haqTuri: "qop",    miqdor: 60000,  tel: "", holat: "Aktiv", tatilQaytishSana: "", tahrirSoni: 0, nonTurlari: ["Issiq non"],               nonNarxlari: { "Issiq non": 60000 } },
  { id: 3, ism: "Dilshod aka",         lavozimId: "nonYopuvchi", lavozimCustom: "",                  haqTuri: "qop",    miqdor: 25000,  tel: "", holat: "Aktiv", tatilQaytishSana: "", tahrirSoni: 0, nonTurlari: ["Issiq non"],               nonNarxlari: { "Issiq non": 25000 } },
  { id: 4, ism: "Nigora opa",          lavozimId: "nonYopuvchi", lavozimCustom: "",                  haqTuri: "qop",    miqdor: 25000,  tel: "", holat: "Aktiv", tatilQaytishSana: "", tahrirSoni: 0, nonTurlari: ["Issiq non"],               nonNarxlari: { "Issiq non": 25000 } },
  { id: 5, ism: "Dilsora opa",         lavozimId: "checha",      lavozimCustom: "",                  haqTuri: "kunlik", miqdor: 200000, tel: "", holat: "Aktiv", tatilQaytishSana: "", tahrirSoni: 0, nonTurlari: [],                          nonNarxlari: {} },
  { id: 6, ism: "Surayyo opa",         lavozimId: "checha",      lavozimCustom: "",                  haqTuri: "kunlik", miqdor: 120000, tel: "", holat: "Aktiv", tatilQaytishSana: "", tahrirSoni: 0, nonTurlari: [],                          nonNarxlari: {} },
  { id: 8, ism: "Diyor va Sardor",     lavozimId: "nonYopuvchi", lavozimCustom: "Patirchi/Qora non", haqTuri: "qop",    miqdor: 0,      tel: "", holat: "Aktiv", tatilQaytishSana: "", tahrirSoni: 0, nonTurlari: ["Patir", "Katta qora non"], nonNarxlari: { "Patir": 150000, "Katta qora non": 200000 } },
];

export const SEED_NONLAR = [
  {
    id: 1, nom: "Issiq non", narx: 8000, nonSoni: 105, ozIshlab: true,
    mahsulotlar: [
      { id: "oqUn",     nom: "Oq un",          birlik: "g",  emoji: "🌾", miqdor: 25000, narx: 0 },
      { id: "sariqUn",  nom: "Sariq un",        birlik: "g",  emoji: "🌾", miqdor: 25000, narx: 0 },
      { id: "suv",      nom: "Suv",             birlik: "ml", emoji: "💧", miqdor: 24800, narx: 0 },
      { id: "yog",      nom: "Yog'",            birlik: "ml", emoji: "🫗", miqdor: 3800,  narx: 0 },
      { id: "tuz",      nom: "Tuz",             birlik: "g",  emoji: "🧂", miqdor: 1000,  narx: 0 },
      { id: "shakar",   nom: "Shakar",          birlik: "g",  emoji: "🍬", miqdor: 300,   narx: 0 },
      { id: "quruqSut", nom: "Quruq sut",       birlik: "g",  emoji: "🥄", miqdor: 350,   narx: 0 },
      { id: "achitqi",  nom: "Achitqi (Droja)", birlik: "g",  emoji: "🍞", miqdor: 50,    narx: 0 },
    ],
  },
  {
    id: 2, nom: "Patir", narx: 15000, nonSoni: 90, ozIshlab: true,
    mahsulotlar: [
      { id: "oqUn",    nom: "Oq un",            birlik: "g",  emoji: "🌾", miqdor: 25000, narx: 0 },
      { id: "sariqUn", nom: "Sariq un",          birlik: "g",  emoji: "🌾", miqdor: 25000, narx: 0 },
      { id: "suv",     nom: "Suv",              birlik: "ml", emoji: "💧", miqdor: 24300, narx: 0 },
      { id: "yog",     nom: "Yog'",             birlik: "ml", emoji: "🫗", miqdor: 1700,  narx: 0 },
      { id: "jir",     nom: "Jir (hayvon yog')", birlik: "g", emoji: "🥓", miqdor: 3800,  narx: 0 },
      { id: "tuz",     nom: "Tuz",              birlik: "g",  emoji: "🧂", miqdor: 1000,  narx: 0 },
      { id: "shakar",  nom: "Shakar",           birlik: "g",  emoji: "🍬", miqdor: 300,   narx: 0 },
      { id: "achitqi", nom: "Achitqi (Droja)",  birlik: "g",  emoji: "🍞", miqdor: 50,    narx: 0 },
    ],
  },
  {
    id: 3, nom: "Katta qora non", narx: 15000, nonSoni: 68, ozIshlab: true,
    mahsulotlar: [
      { id: "qoraUn",  nom: "Qora un",          birlik: "g",  emoji: "🌾", miqdor: 25000, narx: 0 },
      { id: "oqUn",    nom: "Oq un",            birlik: "g",  emoji: "🌾", miqdor: 12500, narx: 0 },
      { id: "sariqUn", nom: "Sariq un",          birlik: "g",  emoji: "🌾", miqdor: 12500, narx: 0 },
      { id: "suv",     nom: "Suv",              birlik: "ml", emoji: "💧", miqdor: 18000, narx: 0 },
      { id: "sut",     nom: "Sut",              birlik: "ml", emoji: "🥛", miqdor: 10000, narx: 0 },
      { id: "shakar",  nom: "Shakar",           birlik: "g",  emoji: "🍬", miqdor: 300,   narx: 0 },
      { id: "tuz",     nom: "Tuz",              birlik: "g",  emoji: "🧂", miqdor: 1000,  narx: 0 },
      { id: "yog",     nom: "Yog'",             birlik: "ml", emoji: "🫗", miqdor: 4000,  narx: 0 },
      { id: "achitqi", nom: "Achitqi (Droja)",  birlik: "g",  emoji: "🍞", miqdor: 50,    narx: 0 },
    ],
  },
  { id: 4, nom: "Kichik garmqoqi",        narx: 10000, nonSoni: 0, ozIshlab: false, tashqariFoyda: 2000, olishNarxi: 8000, mahsulotlar: [] },
  { id: 5, nom: "Katta garmqoqi",         narx: 10000, nonSoni: 0, ozIshlab: false, tashqariFoyda: 2000, olishNarxi: 8000, mahsulotlar: [] },
  { id: 6, nom: "Katta qora garmqoqi",    narx: 15000, nonSoni: 0, ozIshlab: false, tashqariFoyda: 2000, olishNarxi: 13000, mahsulotlar: [] },
  { id: 7, nom: "Kulcha (Samarqand non)", narx: 15000, nonSoni: 0, ozIshlab: false, tashqariFoyda: 2000, olishNarxi: 13000, mahsulotlar: [] },
];

export const SEED_MAHSULOT_NARXLARI = {
  oqUn:     { miqdor: "50000", narx: "288000" },
  sariqUn:  { miqdor: "50000", narx: "230000" },
  qoraUn:   { miqdor: "50000", narx: "230000" },
  sut:      { miqdor: "1000",  narx: "7000"   },
  yog:      { miqdor: "15000", narx: "285000" },
  jir:      { miqdor: "1000",  narx: "25000"  },
  achitqi:  { miqdor: "500",   narx: "44000"  },
  quruqSut: { miqdor: "1000",  narx: "30000"  },
  shakar:   { miqdor: "1000",  narx: "15700"  },
  tuz:      { miqdor: "1000",  narx: "4000"   },
};
