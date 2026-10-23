// Bosish hissi — tugma va o'tishlarda yengil tebranish (haptik). Doim yoqiq, ovoz yo'q.
//   bos     — oddiy tugma: yengil zarb
//   otish   — sahifa/bo'lim almashishi: tanlov tebranishi
//   tayyor  — muvaffaqiyat (saqlandi, kun yakunlandi): "success" tebranishi
// Diqqat: bu fayl `react-native`ni import qilmaydi — u src/i18n/komponentlar.jsx (Pressable
// o'rami) tomonidan chaqiriladi va aylanma import bo'lmasligi kerak.
import * as Haptics from "expo-haptics";

export function sezgi(tur = "bos") {
  let v;
  try {
    if (tur === "tayyor") v = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (tur === "otish") v = Haptics.selectionAsync();
    else v = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch { return; }
  v?.catch?.(() => {});
}
