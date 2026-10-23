// Kechqurungi "Kunni yakunlashni unutmang" bildirishnomasi (telefonning o'zida,
// internetsiz). Keyingi 7 kun uchun soat 20:00 ga rejalashtiriladi; kun yakunlansa —
// bugungisi bekor qilinadi. Ilova har ochilganda ro'yxat qayta tuziladi.
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export const ESLATMA_SOAT = 20;
const PREFIKS = "kun-yakun-";
const KANAL = "eslatmalar";
const ikki = (n) => String(n).padStart(2, "0");
const sanaKalit = (d) => `${d.getFullYear()}-${ikki(d.getMonth() + 1)}-${ikki(d.getDate())}`;

let sozlandi = false;
async function sozla() {
  if (sozlandi) return;
  sozlandi = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(KANAL, { name: "Eslatmalar", importance: Notifications.AndroidImportance.DEFAULT });
  }
}

// Ruxsat so'raladi (Android 13+ da tizim oynasi chiqadi). Qaytaradi: true/false
export async function ruxsatSora() {
  if (Platform.OS === "web") return false;
  try {
    await sozla();
    const joriy = await Notifications.getPermissionsAsync();
    if (joriy.granted) return true;
    if (!joriy.canAskAgain) return false;
    const javob = await Notifications.requestPermissionsAsync();
    return !!javob.granted;
  } catch { return false; }
}

// Joriy ruxsat holati (so'ramasdan): "bor" | "yoq" | "web"
export async function ruxsatHolati() {
  if (Platform.OS === "web") return "web";
  try {
    const joriy = await Notifications.getPermissionsAsync();
    return joriy.granted ? "bor" : "yoq";
  } catch { return "yoq"; }
}

// Eslatmalarni qayta tuzish. yakunlanganSana — bugun yakunlangan bo'lsa shu sana.
export async function kunYakunEslatmalari({ yoqilgan, yakunlanganSana, sarlavha, matn }) {
  if (Platform.OS === "web") return;
  try {
    await sozla();
    const rejada = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(rejada.filter((n) => String(n.identifier).startsWith(PREFIKS))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
    if (!yoqilgan) return;
    const ruxsat = await Notifications.getPermissionsAsync();
    if (!ruxsat.granted) return;
    const hozir = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(hozir.getFullYear(), hozir.getMonth(), hozir.getDate() + i, ESLATMA_SOAT, 0, 0);
      if (d.getTime() <= hozir.getTime() + 60000) continue;
      if (sanaKalit(d) === yakunlanganSana) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: PREFIKS + sanaKalit(d),
        content: { title: sarlavha, body: matn },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: d, channelId: KANAL },
      });
    }
  } catch {
    // bildirishnoma ishlamasa ham ilova ishlashda davom etadi
  }
}
