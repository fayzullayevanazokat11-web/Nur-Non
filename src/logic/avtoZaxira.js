// Avtomatik zaxira nusxa: har kuni butun baza telefonga fayl bo'lib saqlanadi
// (oxirgi 7 kun). Ilova fonga o'tganda bugungi nusxa yangilanadi — kun oxiridagi
// holat doim saqlanadi. Web'da brauzer xotirasida (oxirgi 3 kun).
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { matngaAylantir, matndanOqi } from "./uzatish";

const SAQLASH_KUN = 7;
const WEB_KUN = 3;
const WEB_PREFIKS = "nurnon-avtozaxira:";
const papka = () => `${FileSystem.documentDirectory}zaxira/`;
const nomi = (sana) => `nur-non-${sana}.txt`;
const sanaFayldan = (f) => (String(f).match(/(\d{4}-\d{2}-\d{2})/) || [])[1];

export async function nusxalar() {
  try {
    if (Platform.OS === "web") {
      return Object.keys(localStorage).filter((k) => k.startsWith(WEB_PREFIKS)).map((k) => {
        const v = localStorage.getItem(k) || "";
        return { sana: k.slice(WEB_PREFIKS.length), hajm: v.length, kalit: k };
      }).sort((a, b) => b.sana.localeCompare(a.sana));
    }
    const dir = papka();
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) return [];
    const fayllar = await FileSystem.readDirectoryAsync(dir);
    const r = [];
    for (const f of fayllar) {
      const sana = sanaFayldan(f);
      if (!sana) continue;
      const i = await FileSystem.getInfoAsync(dir + f);
      r.push({ sana, hajm: i.size || 0, uri: dir + f });
    }
    return r.sort((a, b) => b.sana.localeCompare(a.sana));
  } catch { return []; }
}

// Bugungi nusxa bormi
export async function nusxaBormi(sana) {
  return (await nusxalar()).some((x) => x.sana === sana);
}

export async function nusxaSaqla(paket, sana) {
  const matn = matngaAylantir(paket);
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(WEB_PREFIKS + sana, matn);
      const eski = (await nusxalar()).slice(WEB_KUN);
      eski.forEach((x) => localStorage.removeItem(x.kalit));
    } catch { /* xotira to'lgan bo'lsa — o'tkazib yuboramiz */ }
    return;
  }
  const dir = papka();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  await FileSystem.writeAsStringAsync(dir + nomi(sana), matn);
  const eski = (await nusxalar()).slice(SAQLASH_KUN);
  await Promise.all(eski.map((x) => FileSystem.deleteAsync(x.uri, { idempotent: true })));
}

export async function nusxaOqi(x) {
  const matn = Platform.OS === "web" ? localStorage.getItem(x.kalit) : await FileSystem.readAsStringAsync(x.uri);
  return matndanOqi(matn);
}

export async function nusxaUlash(x) {
  if (Platform.OS === "web") {
    const matn = localStorage.getItem(x.kalit) || "";
    const url = URL.createObjectURL(new Blob([matn], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url; a.download = nomi(x.sana); a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  await Sharing.shareAsync(x.uri, { mimeType: "text/plain", dialogTitle: "Nur-Non zaxira nusxa", UTI: "public.plain-text" });
}
