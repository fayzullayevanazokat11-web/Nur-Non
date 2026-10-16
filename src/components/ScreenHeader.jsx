// Bo'lim (tab) sarlavhasi — ichki sahifalar bilan bir xil ko'rinish uchun
// yagona SahifaSarlavha'dan foydalanadi (orqaga tugmasisiz).
import { SahifaSarlavha } from "./SahifaSarlavha";

export function ScreenHeader({ eyebrow, title, subtitle, icon, image, style }) {
  return <SahifaSarlavha eyebrow={eyebrow} title={title} subtitle={subtitle} icon={icon} image={image} orqaga={null} style={style} />;
}
