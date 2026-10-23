// Qo'lda tanlangan sana allaqachon yakunlangan kunga tushsa — yozuv o'sha kun hisobotiga
// qo'shilmaydi (hisobot yozib bo'lingan) va hech qayerda hisoblanmay qoladi. Shuning uchun so'raymiz.
import { Alert } from "react-native";

export function yakunlanganSanaTekshir({ sana, bugun, hisobotlar, saqla }) {
  const yopiq = sana < bugun && (hisobotlar || []).some((h) => h.sana === sana);
  if (!yopiq) { saqla(sana); return; }
  Alert.alert(
    "Bu kun yakunlangan",
    `${sana} kunining hisoboti allaqachon yozilgan — bu yozuv unga qo'shilmaydi va kunlik hisobga kirmaydi. Bugungi (${bugun}) hisobga yozilsinmi?`,
    [
      { text: "Bekor", style: "cancel" },
      { text: "Shu sanada qoldirish", onPress: () => saqla(sana) },
      { text: "Bugunga yozish", onPress: () => saqla(bugun) },
    ]
  );
}
