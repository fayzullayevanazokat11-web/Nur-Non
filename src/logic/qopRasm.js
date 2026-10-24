// Ertalabgi qop rasmlari: kamera yoki galereyadan olinadi, telefon xotirasida
// (ilova papkasida) saqlanadi va 7 kundan keyin o'chiriladi. Rasmlar faqat shu
// telefonda turadi — ma'lumot ko'chirish matniga qo'shilmaydi (hajmi katta).
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const PAPKA = (FileSystem.documentDirectory || "") + "qop-rasmlar/";
const WEB = Platform.OS === "web";

// Natija: { uri[] } yoki { xato } — foydalanuvchi bekor qilsa bo'sh ro'yxat
export async function rasmTanla(manba) {
  try {
    if (manba === "kamera") {
      const r = await ImagePicker.requestCameraPermissionsAsync();
      if (!r.granted) return { xato: "Kamera uchun ruxsat berilmadi. Telefon sozlamalarida Nur-Non ilovasiga kamerani yoqing." };
      const n = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.6 });
      return { uri: n.canceled ? [] : n.assets.map((a) => a.uri) };
    }
    if (!WEB) {
      const r = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!r.granted) return { xato: "Galereya uchun ruxsat berilmadi. Telefon sozlamalarida ruxsat bering." };
    }
    const n = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6, allowsMultipleSelection: true, selectionLimit: 10 });
    return { uri: n.canceled ? [] : n.assets.map((a) => a.uri) };
  } catch {
    return { xato: "Rasm olib bo'lmadi." };
  }
}

// Vaqtinchalik rasmni ilova papkasiga ko'chiradi (web'da o'zi qoladi)
export async function rasmSaqla(uri, id) {
  if (WEB || !FileSystem.documentDirectory) return uri;
  try {
    await FileSystem.makeDirectoryAsync(PAPKA, { intermediates: true }).catch(() => {});
    const yangi = `${PAPKA}${id}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: yangi });
    return yangi;
  } catch {
    return uri;
  }
}

// PDF uchun: shu kunning rasmlari (vaqt tartibida). Telefonda fayl base64 qilib o'qiladi —
// PDF yaratuvchi ilova papkasidagi fayllarni to'g'ridan-to'g'ri ko'rmasligi mumkin.
export async function pdfRasmlari(qopRasmlari, kun) {
  const list = (qopRasmlari || []).filter((r) => r.kun === kun).sort((a, b) => (a.vaqt || 0) - (b.vaqt || 0));
  const natija = [];
  for (const r of list) {
    if (WEB || !r.uri || r.uri.startsWith("data:")) { natija.push({ src: r.uri, vaqt: r.vaqt }); continue; }
    try {
      const b64 = await FileSystem.readAsStringAsync(r.uri, { encoding: FileSystem.EncodingType.Base64 });
      natija.push({ src: `data:image/jpeg;base64,${b64}`, vaqt: r.vaqt });
    } catch { /* fayl o'chgan bo'lsa — o'tkazib yuboriladi */ }
  }
  return natija;
}

export function rasmFaylOchir(uri) {
  if (WEB || !uri || !uri.startsWith(PAPKA)) return;
  FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
}
