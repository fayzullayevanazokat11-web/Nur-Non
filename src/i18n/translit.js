// O'zbek lotin ⇄ kirill transliteratsiyasi (qoidaga asoslangan, lug'atsiz).
// Shuning uchun dasturga qo'shiladigan HAR QANDAY yangi matn ham avtomatik o'giriladi —
// alohida tarjima kiritish shart emas.

const APOS = "'’ʻʼ`‘";
const isApos = (ch) => !!ch && APOS.includes(ch);
const isLetter = (ch) => !!ch && /\p{L}/u.test(ch);

const LAT = {
  a: "а", b: "б", c: "ц", d: "д", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж", k: "к", l: "л",
  m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с", t: "т", u: "у", v: "в", w: "в",
  x: "х", y: "й", z: "з",
};
const YVOWEL = { o: "ё", u: "ю", a: "я", e: "е" };

// Lotin → Kirill
export function latToCyr(s) {
  let out = "";
  for (let i = 0; i < s.length; ) {
    const c = s[i];
    const lc = c.toLowerCase();
    const up = c !== lc;
    const n1 = s[i + 1] || "";
    const ln1 = n1.toLowerCase();
    const cs = (cyr) => (up ? cyr.toUpperCase() : cyr);

    // o' → ў, g' → ғ
    if ((lc === "o" || lc === "g") && isApos(n1)) { out += cs(lc === "o" ? "ў" : "ғ"); i += 2; continue; }
    // sh → ш, ch → ч
    if ((lc === "s" || lc === "c") && ln1 === "h") { out += cs(lc === "s" ? "ш" : "ч"); i += 2; continue; }
    // yo/yu/ya/ye → ё/ю/я/е  (lekin "yo'" = й + ў, masalan "yo'q" → "йўқ")
    if (lc === "y" && YVOWEL[ln1] && !(ln1 === "o" && isApos(s[i + 2]))) { out += cs(YVOWEL[ln1]); i += 2; continue; }
    // e: so'z boshida э, ichida е
    if (lc === "e") { out += cs(isLetter(s[i - 1]) || isApos(s[i - 1]) ? "е" : "э"); i++; continue; }
    // tutuq belgisi (ma'lumot) → ъ; boshqa apostroflar (qo'shtirnoq) o'zgarmaydi
    if (isApos(c) && isLetter(s[i - 1]) && isLetter(n1)) { out += "ъ"; i++; continue; }
    if (LAT[lc]) { out += cs(LAT[lc]); i++; continue; }
    out += c; i++;
  }
  return out;
}

const CYR = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k",
  л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x",
  ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "'", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
  ў: "o'", қ: "q", ғ: "g'", ҳ: "h",
};

// Kirill → Lotin (foydalanuvchi kirill bilan yozgan ma'lumot lotin rejimida ham to'g'ri chiqadi)
export function cyrToLat(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const lc = c.toLowerCase();
    let lat;
    if (lc === "е") lat = isLetter(s[i - 1]) ? "e" : "ye";
    else lat = CYR[lc];
    if (lat === undefined) { out += c; continue; }
    if (c !== lc && lat) {
      // Butun so'z katta harfda bo'lsa (ЎЧИРИШ → O'CHIRISH), aks holda faqat bosh harf (Шакар → Shakar)
      const katta = (ch) => isLetter(ch) && ch !== ch.toLowerCase();
      const sozKatta = katta(s[i + 1]) || (!isLetter(s[i + 1]) && katta(s[i - 1]));
      lat = sozKatta ? lat.toUpperCase() : lat[0].toUpperCase() + lat.slice(1);
    }
    out += lat;
  }
  return out;
}

const LOTIN_HARF = /[A-Za-z]/;
const KIRILL_HARF = /[Ѐ-ӿ]/;
const kesh = { lotin: new Map(), kirill: new Map() };

// Matnni tanlangan yozuvga o'giradi. til: "lotin" | "kirill"
export function ogir(s, til) {
  if (typeof s !== "string" || !s) return s;
  if (til === "kirill" ? !LOTIN_HARF.test(s) : !KIRILL_HARF.test(s)) return s;
  const m = kesh[til];
  let r = m.get(s);
  if (r === undefined) {
    r = til === "kirill" ? latToCyr(s) : cyrToLat(s);
    if (m.size > 4000) m.clear();
    m.set(s, r);
  }
  return r;
}
