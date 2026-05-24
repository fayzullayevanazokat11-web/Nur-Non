// ============================================================
// NUR-NON — Boshqaruv tizimi  |  Yangilangan versiya
// ============================================================
// Bosqich 1 → Logo o'chirildi, "Ishdan ketganlar" o'chirildi
// Bosqich 2 → Ta'til: "Qaytish sanasi" + "Qolgan kunlar"
// Bosqich 3 → Optom: Ko'p mahsulotli savatcha + 7 kunlik log
// Bosqich 4 → Tahrirlash cheklovi: 2 ta tahrirdan so'ng bloklash
// ============================================================

import React, { useState, useEffect } from "react";

// ─── RANGLAR ─────────────────────────────────────────────────────
const C = {
  bg: "#F2E6D5", surface: "#F9F0E4", card: "#FFFFFF",
  border: "#DEC9A8", borderSoft: "#E8D8C0",
  accent: "#A06020", accentDim: "#A0602018",
  red: "#c94f4f", redDim: "#c94f4f15",
  green: "#5a8a5a", greenDim: "#5a8a5a15",
  blue: "#7a8ab0", blueDim: "#7a8ab015",
  text: "#3A1E08", sub: "#C8A478", muted: "#C8A478",
};

const T = { xs:"12px", sm:"13px", md:"15px", lg:"18px", xl:"22px", xxl:"30px" };

const STYLES = `
@keyframes splashIn{0%{opacity:0;transform:translateY(24px) scale(0.94)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes splashOut{0%{opacity:1}100%{opacity:0;transform:scale(1.03)}}
@keyframes slideUp{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}
@keyframes popIn{0%{opacity:0;transform:scale(0.88)}70%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
@keyframes toastIn{0%{opacity:0;transform:translateY(24px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
.toast-item{animation:toastIn 0.3s cubic-bezier(.22,.68,0,1.2) both}
.slide-up{animation:slideUp 0.3s cubic-bezier(.22,.68,0,1.2) both}
.fade-in{animation:fadeIn 0.25s ease both}
.pop-in{animation:popIn 0.28s cubic-bezier(.34,1.56,.64,1) both}
.shake{animation:shake 0.35s ease}
.s1{animation-delay:.04s}.s2{animation-delay:.09s}.s3{animation-delay:.14s}.s4{animation-delay:.19s}.s5{animation-delay:.24s}
@keyframes overlayIn{0%{opacity:0;backdrop-filter:blur(0px)}100%{opacity:1;backdrop-filter:blur(4px)}}
@keyframes modalIn{0%{opacity:0;transform:translateY(40px) scale(0.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes rowIn{0%{opacity:0;transform:translateX(-12px)}100%{opacity:1;transform:translateX(0)}}
.modal-overlay{animation:overlayIn 0.35s ease both}
.modal-content{animation:modalIn 0.45s cubic-bezier(.22,.68,0,1.2) both}
.hisobot-row{animation:rowIn 0.4s cubic-bezier(.22,.68,0,1.2) both;opacity:0}
.hr1{animation-delay:.10s}.hr2{animation-delay:.22s}.hr3{animation-delay:.34s}.hr4{animation-delay:.46s}.hr5{animation-delay:.58s}.hr6{animation-delay:.70s}.hr7{animation-delay:.82s}.hr8{animation-delay:.94s}.hr9{animation-delay:1.06s}.hr10{animation-delay:1.18s}.hr11{animation-delay:1.30s}.hr12{animation-delay:1.42s}
.btn:active{transform:scale(0.96);transition:transform 0.08s}
input:focus{outline:none;border-color:#A06020 !important}
*{box-sizing:border-box}
`;

// ─── TOAST (ogohlantirish / muvaffaqiyat xabarlari) ───────────────
let _toastListeners = [];
let _toastId = 0;
function notify(msg, type = "warn") {
  const t = { id: ++_toastId, msg, type };
  _toastListeners.forEach(fn => fn(t));
}
function ToastHost() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const fn = (t) => {
      setToasts(p => [...p, t]);
      setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 2600);
    };
    _toastListeners.push(fn);
    return () => { _toastListeners = _toastListeners.filter(x => x !== fn); };
  }, []);
  if (!toasts.length) return null;
  return (
    <div style={{ position:"fixed", left:0, right:0, bottom:24, display:"flex", flexDirection:"column", alignItems:"center", gap:8, zIndex:9999, pointerEvents:"none", padding:"0 16px" }}>
      {toasts.map(t => {
        const ok = t.type === "success";
        return (
          <div key={t.id} className="toast-item" style={{
            maxWidth:420, width:"100%", background:C.card,
            border:`1px solid ${ok?C.green:C.red}`,
            borderLeft:`5px solid ${ok?C.green:C.red}`,
            borderRadius:12, padding:"12px 16px", color:C.text, fontSize:T.sm,
            boxShadow:"0 8px 24px rgba(58,30,8,0.18)", display:"flex", alignItems:"center", gap:10,
          }}>
            <span style={{ fontSize:18 }}>{ok ? "✅" : "⚠️"}</span>
            <span style={{ fontWeight:600 }}>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── LAVOZIMLAR ───────────────────────────────────────────────────
const LAVOZIMLAR = [
  { id:"nonYopuvchi", label:"Non yopuvchi", emoji:"🫓" },
  { id:"xamirchi",    label:"Xamirchi",     emoji:"🌾" },
  { id:"yordamchi",   label:"Yordamchi",    emoji:"🙋" },
  { id:"kassir",      label:"Kassir",       emoji:"🧾" },
  { id:"checha",      label:"Checha (Pazanda)", emoji:"👩" },
  { id:"boshqasi",    label:"Boshqasi",     emoji:"✏️" },
];

// ─── BOSQICH 2: tatilQaytishSana qo'shildi ────────────────────────
// ─── BOSQICH 4: tahrirSoni → yangi xodim uchun 0 dan boshlanadi ──
const EMPTY_WORKER_FORM = {
  ism:"", lavozimId:"nonYopuvchi", lavozimCustom:"",
  haqTuri:"qop", miqdor:"", tel:"", holat:"Aktiv",
  tatilQaytishSana:"",   // Bosqich 2
  nonTurlari: [],
  nonNarxlari: {},
};

function getLavozimLabel(w) {
  if (!w) return "Xodim";
  if (w.lavozimId==="boshqasi") return w.lavozimCustom||"Boshqasi";
  return LAVOZIMLAR.find(l=>l.id===w.lavozimId)?.label||w.lavozimId;
}
function getLavozimEmoji(w) {
  if (!w) return "👤";
  return LAVOZIMLAR.find(l=>l.id===w.lavozimId)?.emoji||"👤";
}

// ─── BOSQICH 2: Ta'tildan qolgan kunlarni hisoblash ───────────────
function qolganKunlarHisob(qaytishSana) {
  if (!qaytishSana) return null;
  const qaytish = new Date(qaytishSana);
  const bugun   = new Date();
  bugun.setHours(0, 0, 0, 0);
  return Math.ceil((qaytish - bugun) / (1000 * 60 * 60 * 24));
}

// ─── SPLASH ──────────────────────────────────────────────────────
const LOGO_SRC = "data:image/jpeg;base64,/9j/4QF4RXhpZgAATU0AKgAAAAgABgEAAAMAAAABBDgAAAEBAAMAAAABBAsAAAExAAIAAAAmAAAAVodpAAQAAAABAAAAkAESAAMAAAABAAEAAAEyAAIAAAAUAAAAfAAAAABBbmRyb2lkIFVQMUEuMjMxMDA1LjAwNy5BMTM1RlhYU0VFWkIyADIwMjY6MDU6MjIgMjA6MjA6NDAAAAWQAwACAAAAFAAAANKSkQACAAAABDUwOACQEAACAAAABwAAAOaQEQACAAAABwAAAO2SCAADAAAAAQAAAAAAAAAAMjAyNjowNToyMiAyMDoyMDo0MAArMDU6MDAAKzA1OjAwAAAFAQAAAwAAAAEEOAAAAQEAAwAAAAEECwAAATEAAgAAACYAAAE2ARIAAwAAAAEAAQAAATIAAgAAABQAAAFcAAAAAEFuZHJvaWQgVVAxQS4yMzEwMDUuMDA3LkExMzVGWFhTRUVaQjIAMjAyNjowNToyMiAyMDoyMDo0MAD/4AAQSkZJRgABAQIAOwA7AAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCALPAtIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/90ABAAu/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/IL/gqN/wAn1+Of+3D/ANN9tRR/wVG/5Pr8c/8Abh/6b7aigD//0P38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD8gv+Co3/ACfX45/7cP8A0321FH/BUb/k+vxz/wBuH/pvtqKAP//R/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPyC/4Kjf8AJ9fjn/tw/wDTfbUUf8FRv+T6/HP/AG4f+m+2ooA//9L9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/IL/gqN/wAn1+Of+3D/ANN9tRR/wVG/5Pr8c/8Abh/6b7aigD//0/38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD8gv+Co3/ACfX45/7cP8A0321FH/BUb/k+vxz/wBuH/pvtqKAP//U/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPyC/4Kjf8AJ9fjn/tw/wDTfbUUf8FRv+T6/HP/AG4f+m+2ooA//9X9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/IL/gqN/wAn1+Of+3D/ANN9tRR/wVG/5Pr8c/8Abh/6b7aigD//1v38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD8gv+Co3/ACfX45/7cP8A0321FH/BUb/k+vxz/wBuH/pvtqKAP//X/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPyC/4Kjf8AJ9fjn/tw/wDTfbUUf8FRv+T6/HP/AG4f+m+2ooA//9D9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/IL/gqN/wAn1+Of+3D/ANN9tRR/wVG/5Pr8c/8Abh/6b7aigD//0f38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD8gv+Co3/ACfX45/7cP8A0321FH/BUb/k+vxz/wBuH/pvtqKAP//S/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPyC/4Kjf8AJ9fjn/tw/wDTfbUUf8FRv+T6/HP/AG4f+m+2ooA//9P9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/IL/gqN/wAn1+Of+3D/ANN9tRR/wVG/5Pr8c/8Abh/6b7aigD//1P38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD8gv+Co3/ACfX45/7cP8A0321FH/BUb/k+vxz/wBuH/pvtqKAP//V/fyiiigAooooAKKKQHn2pXAWijrQTimAUUUgOc0ALRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUZ5oAKKKKACiiigAooooAKKKKACijNFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH5Bf8FRv+T6/HP8A24f+m+2oo/4Kjf8AJ9fjn/tw/wDTfbUUAf/W/fyiiigAoNFIxwKAK+p6rbaNaPPd3ENtAnLPI4RV/E1ylz+0L4JspfLk8U6Gren2xD/Wvzr/AOCq/wAf/EOv/H+/8KR6jc22h6PHGq20TlVkdlBZmx1r5LySc9T61+ZZvx+sNiJYelTvyu12foWU8CvFYaNerU5ebWyR+5UX7QPgqb7vijQzk/8AP5H/AI1Yi+NvhGYgL4k0Qkn/AJ/Y/wDGvwupRIyE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321FH/BUb/k+vxz/ANuH/pvtqKAP/9b9/KKKKACiiigAIzRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUdKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/IL/AIKjf8n1+Of+3D/0321FH/BUb/k+vxz/ANuH/pvtqKAP/9f9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/IL/gqN/wAn1+Of+3D/ANN9tRR/wVG/5Pr8c/8Abh/6b7aigD//0P38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD8gv+Co3/ACfX45/7cP8A0321FH/BUb/k+vxz/wBuH/pvtqKAP//R/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPyC/4Kjf8AJ9fjn/tw/wDTfbUUf8FRv+T6/HP/AG4f+m+2ooA//9L9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/IL/gqN/wAn1+Of+3D/ANN9tRR/wVG/5Pr8c/8Abh/6b7aigD//0/38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD8gv+Co3/ACfX45/7cP8A0321FH/BUb/k+vxz/wBuH/pvtqKAP//U/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPyC/4Kjf8AJ9fjn/tw/wDTfbUUf8FRv+T6/HP/AG4f+m+2ooA//9X9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/IL/gqN/wAn1+Of+3D/ANN9tRR/wVG/5Pr8c/8Abh/6b7aigD//1v38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD8gv+Co3/ACfX45/7cP8A0321FH/BUb/k+vxz/wBuH/pvtqKAP//X/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPyC/4Kjf8AJ9fjn/tw/wDTfbUUf8FRv+T6/HP/AG4f+m+2ooA//9D9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/IL/gqN/wAn1+Of+3D/ANN9tRR/wVG/5Pr8c/8Abh/6b7aigD//0f38ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD8gv+Co3/ACfX45/7cP8A0321FH/BUb/k+vxz/wBuH/pvtqKAP//S/fyiiigAooooAKKKKACiiigAooooAKKK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ODkwMzQ0NjE5NzUsXCJtQ2VudGVyWVwiOjAuNDk3MDUzNTYzNTk0ODE4MSxcIm1XaWR0aFwiOjAuNjY4Nzc3ODgzMDUyODI1OSxcIm1IZWlnaHRcIjowLjY5NTIwOTg2MDgwMTY5NjgsXCJtUm90YXRpb25cIjowLFwibVJvdGF0ZVwiOjAsXCJtSEZsaXBcIjowLFwibVZGbGlwXCI6MCxcIm1Sb3RhdGlvbkVmZmVjdFwiOjAsXCJtUm90YXRlRWZmZWN0XCI6MCxcIm1IRmxpcEVmZmVjdFwiOjAsXCJtVkZsaXBFZmZlY3RcIjowLFwibUhvelBlcnNwZWN0aXZlXCI6MCxcIm1WZXJQZXJzcGVjdGl2ZVwiOjB9IiwidG9uZVZhbHVlIjoie1wiYnJpZ2h0bmVzc1wiOjEwMCxcImV4cG9zdXJlXCI6MTAwLFwiY29udHJhc3RcIjoxMDAsXCJzYXR1cmF0aW9uXCI6MTAwLFwiaHVlXCI6MTAwLFwid2JNb2RlXCI6LTEsXCJ3YlRlbXBlcmF0dXJlXCI6MTAwLFwidGludFwiOjEwMCxcInNoYWRvd1wiOjEwMCxcImhpZ2hsaWdodFwiOjEwMCxcImxpZ2h0YmFsYW5jZVwiOjEwMCxcInNoYXJwbmVzc1wiOjEwMCxcImRlZmluaXRpb25cIjoxMDAsXCJpc0JyaWdodG5lc3NJUEVcIjpmYWxzZSxcImlzRXhwb3N1cmVJUEVcIjpmYWxzZSxcImlzQ29udHJhc3RJUEVcIjpmYWxzZSxcImlzU2F0dXJhdGlvbklQRVwiOmZhbHNlfSIsImVmZmVjdFZhbHVlIjoie1wiZmlsdGVySW5kaWNhdGlvblwiOjQwOTcsXCJmaWx0ZXJUeXBlXCI6MCxcImFscGhhVmFsdWVcIjoxMDB9IiwiaXNCbGVuZGluZyI6dHJ1ZSwiaXNOb3RSZUVkaXQiOmZhbHNlLCJzZXBWZXJzaW9uIjoiMTUwMTAwIiwibmRlVmVyc2lvbiI6MSwicmVTaXplIjo0LCJpc1NjYWxlQUkiOmZhbHNlLCJyb3RhdGlvbiI6MSwiYWRqdXN0bWVudFZhbHVlIjoie1wibUNyb3BTdGF0ZVwiOjEzMTA3Nn0iLCJpc0FwcGx5U2hhcGVDb3JyZWN0aW9uIjpmYWxzZSwiaXNOZXdSZUVkaXRPbmx5IjpmYWxzZSwiaXNEZWNvUmVFZGl0T25seSI6ZmFsc2V9AAChCxYAAABPcmlnaW5hbF9QYXRoX0hhc2hfS2V5NDEyODU1MGM2OTk3ZGFkZDg5Zjg0YmZkM2E4MmJmMTlmMzU4N2IwYWE5MTU5NzA0YWFjOWYyMDlmMWM3MjM4Ny82NDA4MVNFRkhrAAAABAAAAAAAoQ0iBgAAqQAAAAAAUQx5BQAAJgAAAAAAoQtTBQAA7wQAAAAAoQtkAAAAZAAAADwAAABTRUZU";
const ICON_DASHBOARD = "data:image/jpeg;base64,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MjB1YzJGdGMzVnVaeTVoYm1SeWIybGtMbUZ3Y0M1bWJHRnphR0Z1Ym05MFlYUmxMa1pzWVhOb1FXNXViM1JoZEdWQlkzUnBkbWwwZVNKOQAAUQwUAAAAU2Ftc3VuZ19DYXB0dXJlX0luZm9TY3JlZW5zaG90AAChCxgAAABQaG90b0VkaXRvcl9SZV9FZGl0X0RhdGF7Im9yaWdpbmFsUGF0aCI6IlwvZGF0YVwvc2VjXC9waG90b2VkaXRvclwvMFwvNzdlZjZiOWMzMWExYzBhOTYzNWI3OWIzNGI0ODQzZTQxNTM3ZjE5MTY0MzkwYTk2NWU4NDg1NGZkZjQyYTYwNF83MTM2OS5qcGciLCJyZXByZXNlbnRhdGl2ZUZyYW1lTG9jIjotMSwic3RhcnRNb3Rpb25WaWRlbyI6LTEsImVuZE1vdGlvblZpZGVvIjotMSwiaXNNb3Rpb25WaWRlb011dGUiOmZhbHNlLCJpc1RyaW1Nb3Rpb25WaWRlbyI6ZmFsc2UsImNsaXBJbmZvVmFsdWUiOiJ7XCJtQ2VudGVyWFwiOjAuNDk2ODMzNTYyODUwOTUyMTUsXCJtQ2VudGVyWVwiOjAuNTAxMDQxNzY5OTgxMzg0MyxcIm1XaWR0aFwiOjAuODcxMzc0MDExMDM5NzMzOSxcIm1IZWlnaHRcIjowLjgzNjcxMjk1NjQyODUyNzgsXCJtUm90YXRpb25cIjowLFwibVJvdGF0ZVwiOjAsXCJtSEZsaXBcIjowLFwibVZGbGlwXCI6MCxcIm1Sb3RhdGlvbkVmZmVjdFwiOjAsXCJtUm90YXRlRWZmZWN0XCI6MCxcIm1IRmxpcEVmZmVjdFwiOjAsXCJtVkZsaXBFZmZlY3RcIjowLFwibUhvelBlcnNwZWN0aXZlXCI6MCxcIm1WZXJQZXJzcGVjdGl2ZVwiOjB9IiwidG9uZVZhbHVlIjoie1wiYnJpZ2h0bmVzc1wiOjEwMCxcImV4cG9zdXJlXCI6MTAwLFwiY29udHJhc3RcIjoxMDAsXCJzYXR1cmF0aW9uXCI6MTAwLFwiaHVlXCI6MTAwLFwid2JNb2RlXCI6LTEsXCJ3YlRlbXBlcmF0dXJlXCI6MTAwLFwidGludFwiOjEwMCxcInNoYWRvd1wiOjEwMCxcImhpZ2hsaWdodFwiOjEwMCxcImxpZ2h0YmFsYW5jZVwiOjEwMCxcInNoYXJwbmVzc1wiOjEwMCxcImRlZmluaXRpb25cIjoxMDAsXCJpc0JyaWdodG5lc3NJUEVcIjpmYWxzZSxcImlzRXhwb3N1cmVJUEVcIjpmYWxzZSxcImlzQ29udHJhc3RJUEVcIjpmYWxzZSxcImlzU2F0dXJhdGlvbklQRVwiOmZhbHNlfSIsImVmZmVjdFZhbHVlIjoie1wiZmlsdGVySW5kaWNhdGlvblwiOjQwOTcsXCJmaWx0ZXJUeXBlXCI6MCxcImFscGhhVmFsdWVcIjoxMDB9IiwiaXNCbGVuZGluZyI6dHJ1ZSwiaXNOb3RSZUVkaXQiOmZhbHNlLCJzZXBWZXJzaW9uIjoiMTUwMTAwIiwibmRlVmVyc2lvbiI6MSwicmVTaXplIjo0LCJpc1NjYWxlQUkiOmZhbHNlLCJyb3RhdGlvbiI6MSwiYWRqdXN0bWVudFZhbHVlIjoie1wibUNyb3BTdGF0ZVwiOjEzMTA3Nn0iLCJpc0FwcGx5U2hhcGVDb3JyZWN0aW9uIjpmYWxzZSwiaXNOZXdSZUVkaXRPbmx5IjpmYWxzZSwiaXNEZWNvUmVFZGl0T25seSI6ZmFsc2V9AAChCxYAAABPcmlnaW5hbF9QYXRoX0hhc2hfS2V5ZWE1ZDI0ZTdhNTdjNTBiNWFhYzUzN2RiOWM0YWU1MmY3ZmE3ZDY2ZDc3M2E2ZTJlMTk3ODUzMzhlZDJmZDgxMS83MTM2OVNFRkhrAAAABAAAAAAAoQ0iBgAAqQAAAAAAUQx5BQAAJgAAAAAAoQtTBQAA7wQAAAAAoQtkAAAAZAAAADwAAABTRUZU";
const ICON_PRODUCTION = "data:image/jpeg;base64,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MyxcIm1XaWR0aFwiOjAuNzAyMzkxODAzMjY0NjE3OSxcIm1IZWlnaHRcIjowLjg4MTM2MjczNjIyNTEyODIsXCJtUm90YXRpb25cIjowLFwibVJvdGF0ZVwiOjAsXCJtSEZsaXBcIjowLFwibVZGbGlwXCI6MCxcIm1Sb3RhdGlvbkVmZmVjdFwiOjAsXCJtUm90YXRlRWZmZWN0XCI6MCxcIm1IRmxpcEVmZmVjdFwiOjAsXCJtVkZsaXBFZmZlY3RcIjowLFwibUhvelBlcnNwZWN0aXZlXCI6MCxcIm1WZXJQZXJzcGVjdGl2ZVwiOjB9IiwidG9uZVZhbHVlIjoie1wiYnJpZ2h0bmVzc1wiOjEwMCxcImV4cG9zdXJlXCI6MTAwLFwiY29udHJhc3RcIjoxMDAsXCJzYXR1cmF0aW9uXCI6MTAwLFwiaHVlXCI6MTAwLFwid2JNb2RlXCI6LTEsXCJ3YlRlbXBlcmF0dXJlXCI6MTAwLFwidGludFwiOjEwMCxcInNoYWRvd1wiOjEwMCxcImhpZ2hsaWdodFwiOjEwMCxcImxpZ2h0YmFsYW5jZVwiOjEwMCxcInNoYXJwbmVzc1wiOjEwMCxcImRlZmluaXRpb25cIjoxMDAsXCJpc0JyaWdodG5lc3NJUEVcIjp0cnVlLFwiaXNFeHBvc3VyZUlQRVwiOnRydWUsXCJpc0NvbnRyYXN0SVBFXCI6dHJ1ZSxcImlzU2F0dXJhdGlvbklQRVwiOnRydWV9IiwiZWZmZWN0VmFsdWUiOiJ7XCJmaWx0ZXJJbmRpY2F0aW9uXCI6NDA5NyxcImZpbHRlclR5cGVcIjowLFwiYWxwaGFWYWx1ZVwiOjEwMH0iLCJpc0JsZW5kaW5nIjp0cnVlLCJpc05vdFJlRWRpdCI6ZmFsc2UsInNlcFZlcnNpb24iOiIxNTAxMDAiLCJuZGVWZXJzaW9uIjoxLCJyZVNpemUiOjQsImlzU2NhbGVBSSI6ZmFsc2UsInJvdGF0aW9uIjoxLCJhZGp1c3RtZW50VmFsdWUiOiJ7XCJtQ3JvcFN0YXRlXCI6MTMxMDc2fSIsImlzQXBwbHlTaGFwZUNvcnJlY3Rpb24iOmZhbHNlLCJpc05ld1JlRWRpdE9ubHkiOmZhbHNlLCJpc0RlY29SZUVkaXRPbmx5IjpmYWxzZX0AAKELFgAAAE9yaWdpbmFsX1BhdGhfSGFzaF9LZXk4NmE3OWViNGYxMTBiODVlZDVjMDVkZmI2NzYwZTYzNzA3OTA4MWE4ZjY1Yzg3MGQwM2U2YWNiMGYwMThjZTQ4LzIxMTE2MFNFRkhrAAAABAAAAAAAoQ0fBgAAqQAAAAAAUQx2BQAAJgAAAAAAoQtQBQAA6wQAAAAAoQtlAAAAZQAAADwAAABTRUZU";
const ICON_ISHCHILAR = "data:image/jpeg;base64,/9j/4QF4RXhpZgAATU0AKgAAAAgABgEAAAMAAAABAVgAAAEBAAMAAAABAUgAAAExAAIAAAAmAAAAVodpAAQAAAABAAAAkAESAAMAAAABAAEAAAEyAAIAAAAUAAAAfAAAAABBbmRyb2lkIFVQMUEuMjMxMDA1LjAwNy5BMTM1RlhYU0VFWkIyADIwMjY6MDU6MjIgMjE6MDM6MDQAAAWQAwACAAAAFAAAANKSkQACAAAABDIyOACQEAACAAAABwAAAOaQEQACAAAABwAAAO2SCAADAAAAAQAAAAAAAAAAMjAyNjowNToyMiAyMTowMzowNAArMDU6MDAAKzA1OjAwAAAFAQAAAwAAAAEBWAAAAQEAAwAAAAEBSAAAATEAAgAAACYAAAE2ARIAAwAAAAEAAQAAATIAAgAAABQAAAFcAAAAAEFuZHJvaWQgVVAxQS4yMzEwMDUuMDA3LkExMzVGWFhTRUVaQjIAMjAyNjowNToyMiAyMTowMzowNAD/4AAQSkZJRgABAQIAOwA7AAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAFDAUcDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/90ABAAV/9oADAMBAAIRAxEAPwD93KKKK8c6AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA4T9qX/AJNj+I3/AGK+p/8ApJLRR+1L/wAmx/Eb/sV9T/8ASSWiu3CbMzqH/9D93KKKK8c6AooooAKKKKACiiigAooooAKKKKACiiigBoP70j2H9adTR/rz/uj+tOoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA4T9qX/k2P4jf9ivqf/pJLRR+1L/ybH8Rv+xX1P8A9JJaK7cJszOof//R/dyiiivHOgKKKKACiiigAooooAKKKKACiiigAooooATbh8+oApcdKciBhknGKNmOeMA4pXC42ineWA3XjvSgBByM47+tFwuMop64YHPynrSsoPTB+nai4iPNFIAecAmlQEsBxn+VFxhRTyvy5IGO1Gzb68jNLmAZRSuAijHJP6UpUIMcZp3C42igkqM4zTgBtPI9fpS5guNopysCvAHP6UFQi8CncBtFCkqM9semaRWI9M0uYBaKf5YEfbHrTVj2n73P86fMAlFJOuI8qckdcUQsIwCSCD60uYBaKepy2dowf0pMY5457elHMgG0U6MlZMMBz070kgCsB3Ipc4I4P9qX/k2P4jf9ivqf/pJLRTP2omP/AAzL8RweP+KY1PHv/oktFd+Dd4szqH//0v3cooorxzoCiiigAooooAKKKKACiiigAooooAKBRRQA4HI64pyINoyQM1GAWwB19qcBtOcAkCl1EKykt14FNDBievHahG+bAIyOcUkkyxx7mIHHJJwBSGgPAz1JPbtSqMZ4II5NfL/7Wv8AwWE+Af7F7zW3i7xxZTavECf7L00rc3RPptyMV8KeOv8Ag6lufGeoTW3wm+CPiPxFGjbEurqViHPb5VjGPzqXNGscPOWyP2MjwzAk846U4x4OD8pPevxD1j/g5K/aG8Hwtfaz8B7Sy0yBlE7yLIgjJ6KW6A16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cAUobzF7UrAgBDJ0HPb0pYUCknpijHlouMdetETZBHGT3zRdbAgmAkUkGkjAAAwDmlLg+gpCvIIyPWhoYoUbjximlyCO39aci5H40wv5ON3UUAiQPvUYB+lRuwUZxjniposbQQMZFNkUMoXvn8qPQR57+1PGW/Zl+IzAnA8L6ln/AMBJaKf+1Gvl/sw/Edeg/wCEW1PH/gJLRXoYJe6zOof/0P3cooorxzoAdakBwcdic1GOtPPByevSpkAAiI9OvSlUfMcAZ9u1NztfGDQx2kEEjv1pWF0HNIQAM5xTAxBpWOcU3tTSGxdx9elIeaKKdgBCUwQeacHIptFFgHbzikEhxSUUWAd5rAfSlE7Y9aZRRYBQSKFYqKSiiwABxg80DKrjNFFFkAY4HtSYyQe9LRRYAxgcHpShsDAPHpSUYosAAkADPSlyQeOKSinYAIBNBJx1oopWABxSiQ98UlFFkAEZOcmlDkDFJRRZALuO3bnIoU7fekoo5UABjjHFOErCm0UWQDvOI9BTZP3uAeQKKKLAKGIAwTxTjMSOxplFFkBwv7U7Fv2Y/iMCf+ZX1L/0klopP2pf+TY/iN/2K+p/+kktFd2EXuszqH//0f3cooorxzoFXr9KftCnOevSo1JBFSqOMAZ70mIjyQOMEj9acoJUEAUj43+nFIcqi/qaVgQsnDelNoz047UU0NhRRRTAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA4T9qX/k2P4jf9ivqf/pJLRR+1L/ybH8Rv+xX1P8A9JJaK7cJszOof//S/dyiiivHOgB1qUFkJGODzx2qIDJqdfkTAOc0gGHBPI98mmsSyjoRnp6UpPTp0pcHg8YxUgthrHp702nvwBTKpKwBRRRTAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA4T9qX/k2P4jf9ivqf8A6SS0UftS/wDJsfxG/wCxX1P/ANJJaK7cJszOof/T/dyiiivHOgB1qYMycY46/SiigBpALdximgkKCMHtj0ooqUC2EY8DrzSUUU0AUUUUwCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOE/al/5Nj+I3/Yr6n/6SS0UUV24TZmdQ//ZAAChDREAAABDYXB0dXJlZF9BcHBfSW5mb2V5SmpiMjF3SWpvaVkyOXRMbk5oYlhOMWJtY3VZVzVrY205cFpDNWhjSEF1YzIxaGNuUmpZWEIwZFhKbFhDOWpiMjB1YzJGdGMzVnVaeTVoYm1SeWIybGtMbUZ3Y0M1bWJHRnphR0Z1Ym05MFlYUmxMa1pzWVhOb1FXNXViM1JoZEdWQlkzUnBkbWwwZVNKOQAAUQwUAAAAU2Ftc3VuZ19DYXB0dXJlX0luZm9TY3JlZW5zaG90AAChCxgAAABQaG90b0VkaXRvcl9SZV9FZGl0X0RhdGF7Im9yaWdpbmFsUGF0aCI6IlwvZGF0YVwvc2VjXC9waG90b2VkaXRvclwvMFwvZWVhYzBlMWU1MmY0OWI4NTk3ZWE5MTQzZTMyOTI4YmJiODY4MDMwOWM0YTc2Y2YxNmQ3MGM2MmJmOGRjOTc3YV82MzEyOS5qcGciLCJyZXByZXNlbnRhdGl2ZUZyYW1lTG9jIjotMSwic3RhcnRNb3Rpb25WaWRlbyI6LTEsImVuZE1vdGlvblZpZGVvIjotMSwiaXNNb3Rpb25WaWRlb011dGUiOmZhbHNlLCJpc1RyaW1Nb3Rpb25WaWRlbyI6ZmFsc2UsImNsaXBJbmZvVmFsdWUiOiJ7XCJtQ2VudGVyWFwiOjAuNTI0Mzk4Mzg2NDc4NDI0MSxcIm1DZW50ZXJZXCI6MC40OTE4MjI2ODk3NzE2NTIyLFwibVdpZHRoXCI6MC45NTEyMDMyMjcwNDMxNTE5LFwibUhlaWdodFwiOjAuOTgzNjQ1Mzc5NTQzMzA0NCxcIm1Sb3RhdGlvblwiOjAsXCJtUm90YXRlXCI6MCxcIm1IRmxpcFwiOjAsXCJtVkZsaXBcIjowLFwibVJvdGF0aW9uRWZmZWN0XCI6MCxcIm1Sb3RhdGVFZmZlY3RcIjowLFwibUhGbGlwRWZmZWN0XCI6MCxcIm1WRmxpcEVmZmVjdFwiOjAsXCJtSG96UGVyc3BlY3RpdmVcIjowLFwibVZlclBlcnNwZWN0aXZlXCI6MH0iLCJ0b25lVmFsdWUiOiJ7XCJicmlnaHRuZXNzXCI6MTAwLFwiZXhwb3N1cmVcIjoxMDAsXCJjb250cmFzdFwiOjEwMCxcInNhdHVyYXRpb25cIjoxMDAsXCJodWVcIjoxMDAsXCJ3Yk1vZGVcIjotMSxcIndiVGVtcGVyYXR1cmVcIjoxMDAsXCJ0aW50XCI6MTAwLFwic2hhZG93XCI6MTAwLFwiaGlnaGxpZ2h0XCI6MTAwLFwibGlnaHRiYWxhbmNlXCI6MTAwLFwic2hhcnBuZXNzXCI6MTAwLFwiZGVmaW5pdGlvblwiOjEwMCxcImlzQnJpZ2h0bmVzc0lQRVwiOnRydWUsXCJpc0V4cG9zdXJlSVBFXCI6dHJ1ZSxcImlzQ29udHJhc3RJUEVcIjp0cnVlLFwiaXNTYXR1cmF0aW9uSVBFXCI6dHJ1ZX0iLCJlZmZlY3RWYWx1ZSI6IntcImZpbHRlckluZGljYXRpb25cIjo0MDk3LFwiZmlsdGVyVHlwZVwiOjAsXCJhbHBoYVZhbHVlXCI6MTAwfSIsImlzQmxlbmRpbmciOnRydWUsImlzTm90UmVFZGl0IjpmYWxzZSwic2VwVmVyc2lvbiI6IjE1MDEwMCIsIm5kZVZlcnNpb24iOjEsInJlU2l6ZSI6NCwiaXNTY2FsZUFJIjpmYWxzZSwicm90YXRpb24iOjEsImFkanVzdG1lbnRWYWx1ZSI6IntcIm1Dcm9wU3RhdGVcIjoxMzEwNzZ9IiwiaXNBcHBseVNoYXBlQ29ycmVjdGlvbiI6ZmFsc2UsImlzTmV3UmVFZGl0T25seSI6ZmFsc2UsImlzRGVjb1JlRWRpdE9ubHkiOmZhbHNlfQAAoQsWAAAAT3JpZ2luYWxfUGF0aF9IYXNoX0tleTQ1OTE1MGQzMTc1NzEwYjUzMTk5OWJkNTY3YmYyOWE1Y2E5ZjcxZDFlNjk4NWVjY2NiYzRjYTZlMGM3MzhlY2UvNjMxMjlTRUZIawAAAAQAAAAAAKENHQYAAKkAAAAAAFEMdAUAACYAAAAAAKELTgUAAOoEAAAAAKELZAAAAGQAAAA8AAAAU0VGVA==";
const ICON_OMBOR = "data:image/jpeg;base64,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MjB1YzJGdGMzVnVaeTVoYm1SeWIybGtMbUZ3Y0M1bWJHRnphR0Z1Ym05MFlYUmxMa1pzWVhOb1FXNXViM1JoZEdWQlkzUnBkbWwwZVNKOQAAUQwUAAAAU2Ftc3VuZ19DYXB0dXJlX0luZm9TY3JlZW5zaG90AAChCxgAAABQaG90b0VkaXRvcl9SZV9FZGl0X0RhdGF7Im9yaWdpbmFsUGF0aCI6IlwvZGF0YVwvc2VjXC9waG90b2VkaXRvclwvMFwvODE3YjZiMTEyNTk3NGYyODM0YTJiODgyYWYxMWY5YjQ4NWZlNGRjZmNiY2ZmOTg1ODAwMmJlNTdiZWFmZGEwYV8xNTA1MDEuanBnIiwicmVwcmVzZW50YXRpdmVGcmFtZUxvYyI6LTEsInN0YXJ0TW90aW9uVmlkZW8iOi0xLCJlbmRNb3Rpb25WaWRlbyI6LTEsImlzTW90aW9uVmlkZW9NdXRlIjpmYWxzZSwiaXNUcmltTW90aW9uVmlkZW8iOmZhbHNlLCJjbGlwSW5mb1ZhbHVlIjoie1wibUNlbnRlclhcIjowLjUzMjQzMDExMjM2MTkwOCxcIm1DZW50ZXJZXCI6MC40OTk5OTk5NzAxOTc2Nzc2LFwibVdpZHRoXCI6MC43MTQ0Mzg3MzY0Mzg3NTEyLFwibUhlaWdodFwiOjAuOTk5OTk5ODgwNzkwNzEwNCxcIm1Sb3RhdGlvblwiOjAsXCJtUm90YXRlXCI6MCxcIm1IRmxpcFwiOjAsXCJtVkZsaXBcIjowLFwibVJvdGF0aW9uRWZmZWN0XCI6MCxcIm1Sb3RhdGVFZmZlY3RcIjowLFwibUhGbGlwRWZmZWN0XCI6MCxcIm1WRmxpcEVmZmVjdFwiOjAsXCJtSG96UGVyc3BlY3RpdmVcIjowLFwibVZlclBlcnNwZWN0aXZlXCI6MH0iLCJ0b25lVmFsdWUiOiJ7XCJicmlnaHRuZXNzXCI6MTAwLFwiZXhwb3N1cmVcIjoxMDAsXCJjb250cmFzdFwiOjEwMCxcInNhdHVyYXRpb25cIjoxMDAsXCJodWVcIjoxMDAsXCJ3Yk1vZGVcIjotMSxcIndiVGVtcGVyYXR1cmVcIjoxMDAsXCJ0aW50XCI6MTAwLFwic2hhZG93XCI6MTAwLFwiaGlnaGxpZ2h0XCI6MTAwLFwibGlnaHRiYWxhbmNlXCI6MTAwLFwic2hhcnBuZXNzXCI6MTAwLFwiZGVmaW5pdGlvblwiOjEwMCxcImlzQnJpZ2h0bmVzc0lQRVwiOnRydWUsXCJpc0V4cG9zdXJlSVBFXCI6dHJ1ZSxcImlzQ29udHJhc3RJUEVcIjp0cnVlLFwiaXNTYXR1cmF0aW9uSVBFXCI6dHJ1ZX0iLCJlZmZlY3RWYWx1ZSI6IntcImZpbHRlckluZGljYXRpb25cIjo0MDk3LFwiZmlsdGVyVHlwZVwiOjAsXCJhbHBoYVZhbHVlXCI6MTAwfSIsImlzQmxlbmRpbmciOnRydWUsImlzTm90UmVFZGl0IjpmYWxzZSwic2VwVmVyc2lvbiI6IjE1MDEwMCIsIm5kZVZlcnNpb24iOjEsInJlU2l6ZSI6NCwiaXNTY2FsZUFJIjpmYWxzZSwicm90YXRpb24iOjEsImFkanVzdG1lbnRWYWx1ZSI6IntcIm1Dcm9wU3RhdGVcIjoxMzEwNzZ9IiwiaXNBcHBseVNoYXBlQ29ycmVjdGlvbiI6ZmFsc2UsImlzTmV3UmVFZGl0T25seSI6ZmFsc2UsImlzRGVjb1JlRWRpdE9ubHkiOmZhbHNlfQAAoQsWAAAAT3JpZ2luYWxfUGF0aF9IYXNoX0tleTkzMTQzYzVhZjQ1N2E0N2I2ZGQwMTlmZDljMTQ3ZWY3MmNiZGI4OTMwMzY4NDdlZGM1ZGRkMjg3Mzg1OWFjNTIvMTUwNTAxU0VGSGsAAAAEAAAAAAChDR4GAACpAAAAAABRDHUFAAAmAAAAAAChC08FAADqBAAAAAChC2UAAABlAAAAPAAAAFNFRlQ=";

function Splash({ onDone }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 2000);
    const t2 = setTimeout(onDone, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,background:"#FFFFFF",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"opacity 0.6s ease",opacity:out?0:1 }}>
      <div style={{ animation:"popIn 0.7s cubic-bezier(.22,.68,0,1.2) 0.1s both" }}>
        <img src={LOGO_SRC} alt="Nur-Non" style={{ width:220,height:220,objectFit:"contain" }} />
      </div>
      <div style={{ animation:"splashIn 0.6s cubic-bezier(.22,.68,0,1.2) 0.45s both",textAlign:"center",marginTop:8 }}>
        <div style={{ fontSize:T.xs,color:"#B89878",letterSpacing:3,textTransform:"uppercase",fontWeight:600 }}>Boshqaruv tizimi</div>
      </div>
    </div>
  );
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────
function Badge({ color, children }) {
  return <span style={{ background:color+"15",border:`1px solid ${color}35`,borderRadius:6,padding:"2px 8px",fontSize:T.xs,fontWeight:700,color,letterSpacing:0.5 }}>{children}</span>;
}
function Btn({ onClick, color=C.accent, tc="#FFF3E8", children, disabled, secondary, full=true }) {
  return (
    <button onClick={onClick} disabled={disabled} className="btn"
      style={{ width:full?"100%":"auto",border:secondary?`1px solid ${C.border}`:"none",background:disabled?C.border:secondary?"transparent":color,borderRadius:12,padding:"13px 16px",color:disabled?C.muted:secondary?C.sub:tc,fontSize:T.md,fontWeight:800,cursor:disabled?"default":"pointer",letterSpacing:0.3,transition:"all 0.15s" }}>
      {children}
    </button>
  );
}
function SLabel({ children }) {
  return <div style={{ fontSize:T.xs,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12 }}>{children}</div>;
}
function Card({ children, style={}, danger, accent }) {
  const bc = danger ? C.red+"50" : accent ? C.accent+"40" : C.border;
  return <div style={{ background:C.card,border:`1px solid ${bc}`,borderRadius:16,padding:16,...style }}>{children}</div>;
}
function Bar({ pct, color }) {
  return (
    <div style={{ background:C.border,borderRadius:6,height:6,overflow:"hidden" }}>
      <div style={{ background:color,borderRadius:6,height:"100%",width:`${Math.min(pct,100)}%`,transition:"width 0.8s cubic-bezier(.22,.68,0,1.2)" }} />
    </div>
  );
}
function StatCard({ label, value, unit, trend, color, trendDown, delay=0 }) {
  // Qiymat uzunligiga qarab shriftni avtomatik moslashtirish
  const valLen = String(value||"").length;
  const valSize = valLen > 9 ? 14 : valLen > 7 ? 16 : valLen > 5 ? 18 : 20;
  return (
    <div className="slide-up" style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 9px",animationDelay:`${delay}s`,overflow:"hidden",minWidth:0 }}>
      <div style={{ fontSize:9,color:C.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:0.6,fontWeight:700,lineHeight:1.2 }}>{label}</div>
      <div style={{ fontSize:valSize,fontWeight:900,color,lineHeight:1.1,wordBreak:"break-word" }}>{value}</div>
      <div style={{ fontSize:10,color:C.muted,marginTop:2 }}>{unit}</div>
      <div style={{ fontSize:9,color:trendDown?C.red:color,marginTop:5,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{trend}</div>
    </div>
  );
}
function AlertCard({ type, msg, delay=0 }) {
  const col = { warning:C.accent,danger:C.red,info:C.blue,success:C.green };
  const ico = { warning:"⚠️",danger:"🚨",info:"ℹ️",success:"✅" };
  const c = col[type];
  return (
    <div className="slide-up" style={{ background:C.card,borderLeft:`4px solid ${c}`,border:`1px solid ${c}20`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10,animationDelay:`${delay}s` }}>
      <span style={{ fontSize:T.md }}>{ico[type]}</span>
      <span style={{ fontSize:T.sm,color:C.text,lineHeight:1.5 }}>{msg}</span>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────
// Bosqich 3: Optom savatcha va 7 kunlik log shu yerda yangilandi
function TashqariNonInput({ nonId, tashqariSonlar, setTashqariSonlar }) {
  return (
    <input type="number" value={tashqariSonlar[nonId]||""}
      onChange={e=>setTashqariSonlar(p=>({...p,[nonId]:e.target.value}))}
      placeholder="Nechta keldi?"
      style={{ width:"100%",background:C.card,border:`1px solid ${C.green}40`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:T.sm,fontWeight:700 }} />
  );
}

function Dashboard({ nonlar=[], qarzlar=[], setQarzlar, optomlar=[], setOptomlar,
  ishchilar=[],
  mahsulotNarxlari={},
  kunlikQopSoni, setKunlikQopSoni, sotilmaganNon, setSotilmaganNon,
  qopTasdiqlandi, setQopTasdiqlandi,
  hisobotYopildi, setHisobotYopildi,
  hisobotlarTarixi=[], setHisobotlarTarixi,
  tashqariSonlar={}, setTashqariSonlar,
  ozIshlabQoplar={}, setOzIshlabQoplar,
  tasdiqlanganKunlar=[], onNav }) {
  const stats = [
    { label:"Bugungi daromad",  value:"4,320,000", unit:"so'm", trend:"↑ +12%", color:C.green, delay:0.05 },
    // "Sotilgan non" va "Kunlik qop" qiymatlari pastda — kunlik qop hisobi helperlaridan keyin to'ldiriladi
  ];

  const nowMs     = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  // ── Qarz state ──
  const [showKunlikQop, setShowKunlikQop]  = useState(false);
  const [hisobotSanasi, setHisobotSanasi]   = useState(new Date().toISOString().split("T")[0]);
  const [tanlangonTarix, setTanlangonTarix] = useState(null);
  const [showTarix,      setShowTarix]      = useState(false);
  const [showQarzForm,  setShowQarzForm]  = useState(false);
  const [qarzSavat,     setQarzSavat]     = useState([]);
  const [qarzIsm,       setQarzIsm]       = useState("");
  const [qarzSana,      setQarzSana]      = useState(new Date().toISOString().split("T")[0]);
  const [qarzErr,       setQarzErr]       = useState(false);
  const [editQarzId,    setEditQarzId]    = useState(null);
  const [delQarzId,     setDelQarzId]     = useState(null);
  const [editOptomId,   setEditOptomId]   = useState(null);
  const [delOptomId,    setDelOptomId]    = useState(null);
  const [clearQarzHistConfirm,  setClearQarzHistConfirm]  = useState(false);
  const [clearOptomHistConfirm, setClearOptomHistConfirm] = useState(false);

  // ── Optom state ──
  const [showOptomForm, setShowOptomForm] = useState(false);
  const [optomXaridor,  setOptomXaridor]  = useState("");
  const [optomSavat,    setOptomSavat]    = useState([]);
  const [optomChegirma, setOptomChegirma] = useState("");
  const [optomErr,      setOptomErr]      = useState(false);

  const activeQarzlar  = qarzlar.filter(q => !q.tolangan);
  const tarihQarzlar   = qarzlar.filter(q => q.tolangan && (nowMs - q.tolanganVaqt) < sevenDays);
  const recentOptomlar = [...optomlar].filter(o => (nowMs - o.vaqt) < sevenDays).reverse();

  const inpStyle = (err) => ({
    width:"100%", background:C.surface, border:`1px solid ${err?C.red:C.border}`,
    borderRadius:9, padding:"10px 12px", color:C.text, fontSize:T.sm, fontWeight:600
  });
  const labelStyle = { fontSize:9, color:C.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:0.8 };

  // ── Kunlik qop helperlari ──
  const getQopNorma = (n) => parseFloat(n.qopNorma) || parseFloat(n.nonSoni) || 10;
  // Har bir ingredientning real narxini dinamik hisoblash (mahsulotNarxlari'dan)
  const getIngNarx = (m) => {
    const p = mahsulotNarxlari[m.id];
    if (p && p.miqdor && p.narx && m.miqdor) {
      return Math.round((parseFloat(m.miqdor)/parseFloat(p.miqdor))*parseFloat(p.narx));
    }
    return parseFloat(m.narx)||0;
  };
  // Bitta qop tannarxini hisoblash
  const getQopTannarx = (n) => (n.mahsulotlar||[]).reduce((s,m)=>s+getIngNarx(m),0);
  const ozJamiQop = nonlar.filter(n=>n.ozIshlab!==false)
    .reduce((s,n)=>s + (parseInt(ozIshlabQoplar[n.id])||0), 0);
  const ozJamiDona = nonlar.filter(n=>n.ozIshlab!==false)
    .reduce((s,n)=>s + (parseInt(ozIshlabQoplar[n.id])||0) * getQopNorma(n), 0);
  const tashqariJamiDona = nonlar.filter(n=>n.ozIshlab===false)
    .reduce((s,n)=>s + (parseInt(tashqariSonlar[n.id])||0), 0);

  // Dashboard ko'rsatkichlari (kunlik qop hisobidan)
  const jamiNon         = ozJamiDona + tashqariJamiDona;
  const jamiSotilmagan  = Object.values(sotilmaganNon||{}).reduce((s,v)=>s+(parseInt(v)||0),0);
  const sotilganNonSoni = Math.max(0, jamiNon - jamiSotilmagan);

  // Optom/qarz orqali ketgan nonlar shu kunlik hisobdan chiqariladi —
  // ularning foydasi pastdagi optom/qarz bo'limida alohida sanaladi (har non bir marta).
  // Qarz nonlari berilgan (sotilgan) sana bo'yicha ayriladi, foydasi esa to'langan sanada ko'rsatiladi.
  const bugunSana = new Date().toISOString().split("T")[0];
  const divertedByNon = {};
  (optomlar||[]).filter(o => o.sana === bugunSana).forEach(o =>
    (o.savat||[]).forEach(s => { divertedByNon[s.nonNomi] = (divertedByNon[s.nonNomi]||0) + (s.soni||0); })
  );
  (qarzlar||[]).filter(q => q.sana === bugunSana).forEach(q => {
    const savat = q.savat || [{ nonNomi:q.nonNomi, soni:q.soni }];
    savat.forEach(s => { divertedByNon[s.nonNomi] = (divertedByNon[s.nonNomi]||0) + (s.soni||0); });
  });

  // Sof foyda hisobi: faqat sotilgan nonlardan keladigan tushum
  // Har bir non turi uchun: (qop_soni × norma − sotilmagan − optom/qarz) × sotuv_narxi
  let bugunDaromad   = 0;
  let bugunXomashyo  = 0;
  nonlar.forEach(n => {
    const norma = parseFloat(n.nonSoni)||0;
    const narx  = parseFloat(n.narx)||0;
    const sotilmaganShu = parseInt((sotilmaganNon||{})[n.id])||0;
    const divertedShu   = divertedByNon[n.nom]||0;
    if (n.ozIshlab !== false) {
      // O'zimizniki
      const qopSoni  = parseInt(ozIshlabQoplar[n.id])||0;
      const ishlabchiqarilgan = qopSoni * norma;
      const retailSold = Math.max(0, ishlabchiqarilgan - sotilmaganShu - divertedShu);
      bugunDaromad += retailSold * narx;
      // Xom-ashyo xarajati - qancha qilingan bo'lsa shuncha (dinamik narx),
      // optom/qarz nonlari xarajati esa o'sha bo'limga o'tkaziladi.
      const perBreadCost = norma > 0 ? getQopTannarx(n) / norma : 0;
      bugunXomashyo += qopSoni * getQopTannarx(n) - Math.min(divertedShu, ishlabchiqarilgan) * perBreadCost;
    } else {
      // Tashqaridan
      const olinganDona = parseInt(tashqariSonlar[n.id])||0;
      const retailSold = Math.max(0, olinganDona - sotilmaganShu - divertedShu);
      bugunDaromad += retailSold * narx;
      // Tashqaridan kelganlar uchun xarajat = sotuv narxi − bittadan foyda
      const bittaFoyda = parseFloat(n.tashqariFoyda)||2000;
      const tannarx    = Math.max(0, narx - bittaFoyda);
      bugunXomashyo += (olinganDona - Math.min(divertedShu, olinganDona)) * tannarx;
    }
  });

  // Ishchi haqi: shu non turini qilgan har bir xodim TO'LIQ qop sonini oladi
  // (1 qop Patir qilindi → unga hissa qo'shgan har bir xodim 1 qoplik haq oladi)
  let bugunIshchiHaq = 0;
  nonlar.filter(n=>n.ozIshlab!==false).forEach(n => {
    const qopSoni = parseInt(ozIshlabQoplar[n.id])||0;
    if (qopSoni <= 0) return;
    const shuNonniQilQopchilar = (ishchilar||[]).filter(w =>
      w.holat==="Aktiv" && w.haqTuri==="qop" && (w.nonTurlari||[]).includes(n.nom)
    );
    shuNonniQilQopchilar.forEach(w => {
      const narxQop = parseFloat((w.nonNarxlari||{})[n.nom]) || parseFloat(w.miqdor) || 0;
      bugunIshchiHaq += qopSoni * narxQop;
    });
  });
  // Kunlik fix xodimlar (oshpaz, farrosh va h.k.)
  (ishchilar||[]).filter(w => w.holat==="Aktiv" && w.haqTuri==="kunlik").forEach(w => {
    bugunIshchiHaq += parseFloat(w.miqdor)||0;
  });

  // Hech qanday ma'lumot kiritilmaguncha sof foyda 0 (xodim haqi ayrilib ketmasin).
  // Ma'lumot kirita boshlangach to'liq hisob ishlaydi.
  const malumotKiritilgan = ozJamiQop > 0 || tashqariJamiDona > 0;
  const bugunSofFoyda = malumotKiritilgan ? Math.round(bugunDaromad - bugunXomashyo - bugunIshchiHaq) : 0;

  // Stats massivining birinchi elementini almashtirib, bugungi daromadni qo'yamiz
  stats[0] = { label:"Bugungi sof foyda", value: bugunSofFoyda.toLocaleString(), unit:"so'm",
    trend: qopTasdiqlandi
      ? (bugunSofFoyda>=0?"↑ foyda":"↓ zarar")
      : "⏳ kiritilmagan",
    color: bugunSofFoyda>=0?C.green:C.red, delay:0.05 };
  stats.push(
    { label:"Sotilgan non", value: sotilganNonSoni.toLocaleString(), unit:"dona", trend: qopTasdiqlandi?"✓ tasdiqlangan":"⏳ kutilmoqda", color:C.accent, delay:0.1 },
    { label:"Kunlik qop",   value: String(ozJamiQop),                  unit:"qop",  trend: qopTasdiqlandi?"✓ tasdiqlangan":"⏳ kutilmoqda", color:C.blue,   delay:0.15 }
  );

  const tasdiqlashQop = () => {
    // Ma'lumot kiritilmagan bo'lsa — to'xtatamiz
    if (ozJamiQop === 0 && tashqariJamiDona === 0) {
      notify("Avval kunlik qop ma'lumotini kiriting"); return;
    }
    // Bir kunda faqat bitta hisobot — duplikat tekshiruv
    const mavjud = (hisobotlarTarixi||[]).find(h => h.sana === hisobotSanasi);
    if (mavjud) {
      const sanaFmt = new Date(hisobotSanasi).toLocaleDateString("uz-UZ",{year:"numeric",month:"long",day:"numeric"});
      const javob = window.confirm(`⚠️ Diqqat!\n\n${sanaFmt} sanasi uchun hisobot allaqachon mavjud.\n\nEski yozuvni almashtirib, yangisini saqlashni xohlaysizmi?`);
      if (!javob) return;
    }
    // 1) Joriy hisobot snapshotini yaratamiz
    // Har bir non uchun bittaQopTannarxni saqlab qo'yamiz (tarix uchun)
    const tannarxMap = {};
    nonlar.forEach(n => { tannarxMap[n.id] = getQopTannarx(n); });
    const snapshot = {
      id: Date.now(),
      sana: hisobotSanasi,
      vaqt: Date.now(),
      // Kiritilgan ma'lumotlar (asl)
      ozIshlabQoplar: {...ozIshlabQoplar},
      tashqariSonlar: {...tashqariSonlar},
      sotilmaganNon: {...sotilmaganNon},
      // Nonlar va ishchilar holatini ham saqlaymiz (kelajakda o'zgarishlardan himoya)
      nonlarSnapshot: JSON.parse(JSON.stringify(nonlar)),
      ishchilarSnapshot: JSON.parse(JSON.stringify(ishchilar)),
      mahsulotNarxlariSnapshot: JSON.parse(JSON.stringify(mahsulotNarxlari)),
      tannarxMap,
      // Yakuniy hisoblar
      daromad: Math.round(bugunDaromad),
      xomashyo: Math.round(bugunXomashyo),
      ishchiHaq: Math.round(bugunIshchiHaq),
      sofFoyda: bugunSofFoyda,
      sotilganNon: sotilganNonSoni,
      jamiQop: ozJamiQop,
    };
    // 2) 30 kundan eski hisobotlarni filtrlash
    const sonRaqami = 30 * 24 * 60 * 60 * 1000;  // 30 kun (ms)
    const hozir = Date.now();
    const yangilangan = [snapshot, ...(hisobotlarTarixi||[])
      .filter(h => h.sana !== hisobotSanasi)   // Bir kun ikki marta saqlanmasin
      .filter(h => (hozir - (h.vaqt||0)) < sonRaqami)
    ];
    setHisobotlarTarixi(yangilangan);
    notify("Kunlik hisobot saqlandi", "success");
    // 3) Modalni ochish
    setQopTasdiqlandi(true);
    setHisobotYopildi(false);
    setShowKunlikQop(false);
    // 4) Joriy formani tozalash (yangi kun uchun)
    // setOzIshlabQoplar({}); setTashqariSonlar({}); setSotilmaganNon({});
    // ↑ Hozircha tozalanmaydi — keyingi marta avtomatik tozalanishini foydalanuvchi
    //   "+ Ma'lumot qo'shish" qaytishi bilan boshqarishi mumkin
  };

  // Tarix elementini ochish
  const ochTarix = (h) => { setTanlangonTarix(h); };
  const yopTarix = () => { setTanlangonTarix(null); };
  // Tarix elementini o'chirish
  const ochTarixOchir = (id) => {
    setHisobotlarTarixi(p => (p||[]).filter(h => h.id !== id));
    setTanlangonTarix(null);
    notify("Hisobot o'chirildi", "success");
  };

  // ── Qarz savatcha ──
  const addToQarzSavat = (nom) => {
    setQarzSavat(p => {
      const exist = p.find(s => s.nonNomi===nom);
      if (exist) return p.map(s => s.nonNomi===nom ? {...s, soni:s.soni+1} : s);
      return [...p, { nonNomi:nom, soni:1 }];
    });
  };
  const updateQarzSoni = (nom, val) => {
    const n = Math.max(0, parseInt(val)||0);
    if (n===0) setQarzSavat(p => p.filter(s => s.nonNomi!==nom));
    else setQarzSavat(p => p.map(s => s.nonNomi===nom ? {...s, soni:n} : s));
  };
  const qarzJamiDona = qarzSavat.reduce((s,x) => s + x.soni, 0);

  const openEditQarz = (q) => {
    setQarzIsm(q.ism);
    setQarzSana(q.sana);
    setQarzSavat(q.savat ? [...q.savat] : [{ nonNomi:q.nonNomi, soni:q.soni }]);
    setEditQarzId(q.id);
    setShowQarzForm(true);
    setShowOptomForm(false);
  };
  const resetQarzForm = () => {
    setQarzIsm(""); setQarzSana(new Date().toISOString().split("T")[0]);
    setQarzSavat([]); setEditQarzId(null); setShowQarzForm(false);
  };

  const saveQarz = () => {
    if (!qarzIsm.trim()) {
      setQarzErr(true); setTimeout(() => setQarzErr(false), 600);
      notify("Qarz oluvchi ismini kiriting"); return;
    }
    if (qarzSavat.length===0) {
      setQarzErr(true); setTimeout(() => setQarzErr(false), 600);
      notify("Kamida bitta non qo'shing"); return;
    }
    const savatWithNarx = qarzSavat.map(s => {
      const non = nonlar.find(n => n.nom===s.nonNomi);
      const narx = non?.narx||0;
      return { nonNomi:s.nonNomi, soni:s.soni, narx, totalNarx:narx*s.soni };
    });
    const jamiNarx = savatWithNarx.reduce((sum,s)=>sum+s.totalNarx, 0);
    const entry = {
      id: editQarzId || Date.now(),
      ism: qarzIsm.trim(),
      savat: savatWithNarx,
      nonNomi: qarzSavat[0]?.nonNomi || "",
      soni: qarzJamiDona,
      jamiNarx,
      sana: qarzSana,
      tolangan: false, tolanganVaqt: null
    };
    if (editQarzId) {
      setQarzlar(p => p.map(q => q.id===editQarzId ? {...q, ...entry} : q));
      notify("Qarz yangilandi", "success");
    } else {
      setQarzlar(p => [...p, entry]);
      notify("Qarz qo'shildi", "success");
    }
    resetQarzForm();
  };

  const tolaQarz = (id) => {
    setQarzlar(p => p.map(q => q.id===id ? { ...q, tolandan:true, tolangan:true, tolanganVaqt:Date.now() } : q));
    notify("Qarz to'landi deb belgilandi", "success");
  };

  // ── Optom savatcha ──
  const addToSavat = (nom) => {
    setOptomSavat(p => {
      const exist = p.find(s => s.nonNomi===nom);
      if (exist) return p.map(s => s.nonNomi===nom ? {...s, soni:s.soni+1} : s);
      return [...p, { nonNomi:nom, soni:1 }];
    });
  };
  const updateSavatSoni = (nom, val) => {
    const n = Math.max(0, parseInt(val)||0);
    if (n===0) setOptomSavat(p => p.filter(s => s.nonNomi!==nom));
    else setOptomSavat(p => p.map(s => s.nonNomi===nom ? {...s, soni:n} : s));
  };
  const removeFromSavat = (nom) => setOptomSavat(p => p.filter(s => s.nonNomi!==nom));

  const savatTotalNarx = optomSavat.reduce((sum, s) => {
    const non = nonlar.find(n => n.nom===s.nonNomi);
    return sum + ((non?.narx||0) * s.soni);
  }, 0);
  const savatJamiDona  = optomSavat.reduce((s, x) => s + x.soni, 0);
  const autoChegirama  = savatJamiDona * 1000;
  const chegirmaVal    = optomChegirma !== "" ? (parseInt(optomChegirma)||0) : autoChegirama;
  const yakuniyNarx    = Math.max(0, savatTotalNarx - chegirmaVal);

  const openEditOptom = (o) => {
    setOptomXaridor(o.ism);
    setOptomSavat(o.savat ? o.savat.map(s => ({ nonNomi:s.nonNomi, soni:s.soni })) : []);
    setOptomChegirma(String(o.chegirma));
    setEditOptomId(o.id);
    setShowOptomForm(true);
    setShowQarzForm(false);
  };
  const resetOptomForm = () => {
    setOptomXaridor(""); setOptomSavat([]); setOptomChegirma(""); setEditOptomId(null); setShowOptomForm(false);
  };

  const saveOptom = () => {
    if (!optomXaridor.trim()) {
      setOptomErr(true); setTimeout(() => setOptomErr(false), 600);
      notify("Xaridor ismini kiriting"); return;
    }
    if (optomSavat.length===0) {
      setOptomErr(true); setTimeout(() => setOptomErr(false), 600);
      notify("Kamida bitta non qo'shing"); return;
    }
    const savatWithNarx = optomSavat.map(s => {
      const non = nonlar.find(n => n.nom===s.nonNomi);
      const narx = non?.narx||0;
      return { nonNomi:s.nonNomi, soni:s.soni, narx, totalNarx:narx*s.soni };
    });
    const entry = {
      id: editOptomId || Date.now(),
      ism: optomXaridor.trim(),
      savat: savatWithNarx,
      totalNarx: savatTotalNarx,
      chegirma: chegirmaVal,
      chegirmaliNarx: yakuniyNarx,
      sana: new Date().toISOString().split("T")[0],
      vaqt: editOptomId ? (optomlar.find(o=>o.id===editOptomId)?.vaqt || Date.now()) : Date.now()
    };
    if (editOptomId) {
      setOptomlar(p => p.map(o => o.id===editOptomId ? entry : o));
      notify("Optom savdo yangilandi", "success");
    } else {
      setOptomlar(p => [...p, entry]);
      notify("Optom savdo qo'shildi", "success");
    }
    resetOptomForm();
  };

  return (
    <div style={{ padding:"0 2px" }}>
      {/* ═══════════════════════════════════════════════════════════
          HISOBOT MODAL — tasdiqlashdan keyin ochiladi
      ═══════════════════════════════════════════════════════════ */}
      {((qopTasdiqlandi && !hisobotYopildi) || tanlangonTarix) && (() => {
        // Modal rejim aniqlash: tarix yoki hozirgi
        const isTarix = !!tanlangonTarix;
        const M_nonlar = isTarix ? (tanlangonTarix.nonlarSnapshot||[]) : nonlar;
        const M_ishchilar = isTarix ? (tanlangonTarix.ishchilarSnapshot||[]) : ishchilar;
        const M_ozIshlab = isTarix ? (tanlangonTarix.ozIshlabQoplar||{}) : ozIshlabQoplar;
        const M_tashqari = isTarix ? (tanlangonTarix.tashqariSonlar||{}) : tashqariSonlar;
        const M_tannarx = isTarix ? (tanlangonTarix.tannarxMap||{}) : null;
        const M_daromad = isTarix ? tanlangonTarix.daromad : bugunDaromad;
        const M_xomashyo = isTarix ? tanlangonTarix.xomashyo : bugunXomashyo;
        const M_ishchiHaq = isTarix ? tanlangonTarix.ishchiHaq : bugunIshchiHaq;
        const M_sof = isTarix ? tanlangonTarix.sofFoyda : bugunSofFoyda;
        const M_sana = isTarix ? tanlangonTarix.sana : hisobotSanasi;
        const M_getTannarx = (n) => M_tannarx ? (M_tannarx[n.id]||0) : getQopTannarx(n);
        return (
        <div className="modal-overlay"
          style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(58,30,8,0.55)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"12px 10px" }}>
          <div className="modal-content"
            style={{ width:"100%",maxWidth:360,maxHeight:"calc(100vh - 24px)",background:C.surface,border:`2px solid ${C.accent}40`,borderRadius:16,boxShadow:"0 8px 32px rgba(58,30,8,0.4)",overflow:"hidden",display:"flex",flexDirection:"column" }}>
            {/* Sarlavha */}
            <div style={{ background:C.accent,padding:"10px 16px",borderBottom:`2px solid ${C.accent}` }}>
              <div style={{ fontSize:T.md,fontWeight:900,color:"#FFF3E8",fontFamily:"Georgia, serif",letterSpacing:0.5,textAlign:"center" }}>📋 Hisobot {isTarix && <span style={{ fontSize:9,fontWeight:500,opacity:0.85 }}>· tarixdan</span>}</div>
              <div style={{ fontSize:9,color:"#FFF3E8",opacity:0.9,textAlign:"center",marginTop:1 }}>📅 {M_sana}</div>
            </div>

            {/* Skroll qilinadigan mazmun */}
            <div style={{ overflowY:"auto",padding:"10px 12px",flex:1,minHeight:0 }}>

              {/* Mahsulot xarajatlari */}
              <div className="hisobot-row hr1" style={{ marginBottom:10 }}>
                <div style={{ fontSize:9,color:C.accent,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>🌾 Mahsulot xarajatlari</div>
                {M_nonlar.filter(n=>n.ozIshlab!==false && (parseInt(M_ozIshlab[n.id])||0)>0).map((n,idx)=>{
                  const qopSoni = parseInt(M_ozIshlab[n.id])||0;
                  const bittaQop = M_getTannarx(n);
                  const jami = qopSoni * bittaQop;
                  return (
                    <div key={n.id} className={`hisobot-row hr${Math.min(idx+2,11)}`} style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,color:C.text,marginBottom:5,padding:"5px 8px",background:C.card,borderRadius:7,border:`1px solid ${C.borderSoft}` }}>
                      <div>
                        <div style={{ fontWeight:700 }}>{n.nom}</div>
                        <div style={{ fontSize:9,color:C.muted,marginTop:1 }}>{qopSoni} qop × {Math.round(bittaQop).toLocaleString()} so'm</div>
                      </div>
                      <span style={{ fontWeight:800,color:C.red }}>{Math.round(jami).toLocaleString()} so'm</span>
                    </div>
                  );
                })}
                {M_nonlar.filter(n=>n.ozIshlab===false && (parseInt(M_tashqari[n.id])||0)>0).map((n,idx)=>{
                  const dona = parseInt(M_tashqari[n.id])||0;
                  const foyda = parseFloat(n.tashqariFoyda)||2000;
                  const tannarx = Math.max(0,(parseFloat(n.narx)||0)-foyda);
                  const jami = dona * tannarx;
                  return (
                    <div key={n.id} className={`hisobot-row hr${Math.min(idx+4,11)}`} style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,color:C.text,marginBottom:5,padding:"5px 8px",background:C.card,borderRadius:7,border:`1px solid ${C.borderSoft}` }}>
                      <div>
                        <div style={{ fontWeight:700 }}>{n.nom} <span style={{ fontSize:9,color:C.muted }}>(tashqaridan)</span></div>
                        <div style={{ fontSize:9,color:C.muted,marginTop:1 }}>{dona} dona × {tannarx.toLocaleString()} so'm</div>
                      </div>
                      <span style={{ fontWeight:800,color:C.red }}>{Math.round(jami).toLocaleString()} so'm</span>
                    </div>
                  );
                })}
              </div>

              {/* Ishchi haqlari */}
              <div className="hisobot-row hr6" style={{ marginBottom:10 }}>
                <div style={{ fontSize:9,color:C.blue,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>👷 Ishchilar haqi</div>
                {(M_ishchilar||[]).filter(w=>w.holat==="Aktiv" && w.haqTuri==="qop").map((w,idx)=>{
                  const turlar = (w.nonTurlari||[]);
                  let summa = 0;
                  const tafsilot = [];
                  turlar.forEach(nm=>{
                    const non = M_nonlar.find(nn=>nn.nom===nm);
                    if (!non) return;
                    const qopSoni = parseInt(M_ozIshlab[non.id])||0;
                    if (qopSoni<=0) return;
                    const narxQop = parseFloat((w.nonNarxlari||{})[nm])||parseFloat(w.miqdor)||0;
                    summa += qopSoni*narxQop;
                    tafsilot.push(`${qopSoni}×${narxQop.toLocaleString()} (${nm})`);
                  });
                  if (summa<=0) return null;
                  return (
                    <div key={w.id} className={`hisobot-row hr${Math.min(idx+7,11)}`} style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",fontSize:T.xs,color:C.text,marginBottom:5,padding:"6px 10px",background:C.card,borderRadius:8,border:`1px solid ${C.borderSoft}`,gap:8 }}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontWeight:700 }}>{w.ism}</div>
                        <div style={{ fontSize:9,color:C.muted,marginTop:1 }}>{tafsilot.join(" + ")}</div>
                      </div>
                      <span style={{ fontWeight:800,color:C.red,whiteSpace:"nowrap" }}>{summa.toLocaleString()} so'm</span>
                    </div>
                  );
                })}
                {(M_ishchilar||[]).filter(w=>w.holat==="Aktiv" && w.haqTuri==="kunlik").map((w,idx)=>(
                  <div key={w.id} className={`hisobot-row hr${Math.min(idx+9,11)}`} style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,color:C.text,marginBottom:5,padding:"5px 8px",background:C.card,borderRadius:7,border:`1px solid ${C.borderSoft}` }}>
                    <span><span style={{ fontWeight:700 }}>{w.ism}</span> <span style={{ fontSize:9,color:C.muted }}>(kunlik)</span></span>
                    <span style={{ fontWeight:800,color:C.red }}>{(parseFloat(w.miqdor)||0).toLocaleString()} so'm</span>
                  </div>
                ))}
              </div>

              {/* Yakuniy hisob */}
              <div className="hisobot-row hr11" style={{ background:`linear-gradient(135deg, ${C.green}15, ${C.blue}10)`,border:`1.5px solid ${C.green}40`,borderRadius:12,padding:"10px 12px",marginTop:4 }}>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,fontWeight:700,color:C.text,marginBottom:6 }}>
                  <span>📊 Umumiy savdo:</span>
                  <span style={{ color:C.green,fontWeight:900 }}>{Math.round(M_daromad).toLocaleString()} so'm</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,fontWeight:700,color:C.text,marginBottom:6 }}>
                  <span>💸 Jami xarajat:</span>
                  <span style={{ color:C.red,fontWeight:900 }}>{Math.round(M_xomashyo + M_ishchiHaq).toLocaleString()} so'm</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:T.md,fontWeight:900,color:C.text,paddingTop:8,marginTop:6,borderTop:`1.5px solid ${C.green}40` }}>
                  <span>✨ Kunlik sof foyda:</span>
                  <span style={{ color:M_sof>=0?C.green:C.red }}>{M_sof.toLocaleString()} so'm</span>
                </div>
              </div>

              {/* ── OPTOM & QARZ QO'SHIMCHA FOYDASI ── */}
              {(() => {
                // Assortimentdan bitta nondan sof foyda (ingredient asosida)
                const bittaNonFoyda = (nonNomi) => {
                  const n = (M_nonlar||[]).find(x => x.nom === nonNomi);
                  if (!n) return 0;
                  if (n.ozIshlab === false) return parseFloat(n.tashqariFoyda) || 2000;
                  const norma = parseFloat(n.nonSoni) || 0;
                  if (norma <= 0) return 0;
                  return (parseFloat(n.narx) || 0) - (M_getTannarx(n) / norma);
                };
                const sameDay = (ms) => !!ms && new Date(ms).toISOString().split("T")[0] === M_sana;

                // Optom — o'sha sanadagi savdolar (skidka ayriladi)
                const optomKun = (optomlar||[]).filter(o => o.sana === M_sana);
                const optomQatorlar = optomKun.map(o => {
                  let foyda = 0, dona = 0;
                  (o.savat||[]).forEach(s => { foyda += bittaNonFoyda(s.nonNomi) * (s.soni||0); dona += (s.soni||0); });
                  return { id:o.id, ism:o.ism, dona, foyda: foyda - (o.chegirma||0) };
                });
                const optomFoyda = optomQatorlar.reduce((s,x)=>s+x.foyda,0);
                const optomDona  = optomQatorlar.reduce((s,x)=>s+x.dona,0);

                // Qarz — o'sha sanada TO'LANGAN qarzlar (skidkasiz, faqat sof foyda)
                const qarzKun = (qarzlar||[]).filter(q => q.tolangan && sameDay(q.tolanganVaqt));
                const qarzQatorlar = qarzKun.map(q => {
                  const savat = q.savat || [{ nonNomi:q.nonNomi, soni:q.soni }];
                  let foyda = 0, dona = 0;
                  savat.forEach(s => { foyda += bittaNonFoyda(s.nonNomi) * (s.soni||0); dona += (s.soni||0); });
                  return { id:q.id, ism:q.ism, dona, foyda };
                });
                const qarzFoyda = qarzQatorlar.reduce((s,x)=>s+x.foyda,0);
                const qarzDona  = qarzQatorlar.reduce((s,x)=>s+x.dona,0);

                if (optomKun.length === 0 && qarzKun.length === 0) return null;
                const umumiy = M_sof + optomFoyda + qarzFoyda;

                return (
                  <>
                    {optomKun.length > 0 && (
                      <div className="hisobot-row" style={{ marginTop:10 }}>
                        <div style={{ fontSize:9,color:C.blue,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>🛒 Optom foydasi ({optomDona} dona)</div>
                        {optomQatorlar.map(o => (
                          <div key={o.id} style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,color:C.text,marginBottom:5,padding:"5px 8px",background:C.card,borderRadius:7,border:`1px solid ${C.borderSoft}` }}>
                            <div>
                              <div style={{ fontWeight:700 }}>{o.ism}</div>
                              <div style={{ fontSize:9,color:C.muted,marginTop:1 }}>{o.dona} dona · skidka ayrilgan</div>
                            </div>
                            <span style={{ fontWeight:800,color:o.foyda>=0?C.green:C.red }}>{o.foyda>=0?"+":""}{Math.round(o.foyda).toLocaleString()} so'm</span>
                          </div>
                        ))}
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,fontWeight:800,color:C.blue,padding:"3px 8px" }}>
                          <span>Optom jami:</span>
                          <span>+{Math.round(optomFoyda).toLocaleString()} so'm</span>
                        </div>
                      </div>
                    )}

                    {qarzKun.length > 0 && (
                      <div className="hisobot-row" style={{ marginTop:10 }}>
                        <div style={{ fontSize:9,color:C.accent,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>🤝 Qarz foydasi ({qarzDona} dona · to'langan)</div>
                        {qarzQatorlar.map(q => (
                          <div key={q.id} style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,color:C.text,marginBottom:5,padding:"5px 8px",background:C.card,borderRadius:7,border:`1px solid ${C.borderSoft}` }}>
                            <div>
                              <div style={{ fontWeight:700 }}>{q.ism}</div>
                              <div style={{ fontSize:9,color:C.muted,marginTop:1 }}>{q.dona} dona · sof foyda</div>
                            </div>
                            <span style={{ fontWeight:800,color:q.foyda>=0?C.green:C.red }}>{q.foyda>=0?"+":""}{Math.round(q.foyda).toLocaleString()} so'm</span>
                          </div>
                        ))}
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,fontWeight:800,color:C.accent,padding:"3px 8px" }}>
                          <span>Qarz jami:</span>
                          <span>+{Math.round(qarzFoyda).toLocaleString()} so'm</span>
                        </div>
                      </div>
                    )}

                    <div className="hisobot-row" style={{ background:`linear-gradient(135deg, ${C.green}20, ${C.accent}12)`,border:`1.5px solid ${C.green}50`,borderRadius:12,padding:"10px 12px",marginTop:8 }}>
                      <div style={{ fontSize:9,color:C.muted,marginBottom:5 }}>
                        Kunlik {Math.round(M_sof).toLocaleString()} + Optom {Math.round(optomFoyda).toLocaleString()} + Qarz {Math.round(qarzFoyda).toLocaleString()}
                      </div>
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:T.md,fontWeight:900,color:C.text }}>
                        <span>💰 Umumiy sof foyda:</span>
                        <span style={{ color:umumiy>=0?C.green:C.red }}>{Math.round(umumiy).toLocaleString()} so'm</span>
                      </div>
                    </div>
                  </>
                );
              })()}

            </div>

            {/* Yopish tugmasi */}
            <div style={{ padding:"8px 12px",borderTop:`1px solid ${C.borderSoft}`,background:C.card }}>
              <button onClick={()=>{
                  if (isTarix) {
                    // Tarix rejimi - faqat yopiladi
                    setTanlangonTarix(null);
                    return;
                  }
                  setHisobotYopildi(true);
                  // Yopilgach formani tozalaymiz — yangi kun uchun
                  setOzIshlabQoplar({});
                  setTashqariSonlar({});
                  setSotilmaganNon({});
                  setQopTasdiqlandi(false);
                  // Sanani bugungi kunga qaytaramiz
                  setHisobotSanasi(new Date().toISOString().split("T")[0]);
                }} className="btn"
                style={{ width:"100%",background:C.accent,border:"none",borderRadius:10,padding:"10px 8px",color:"#FFF3E8",fontSize:T.sm,fontWeight:800,cursor:"pointer" }}>
                {isTarix ? "← Yopish" : "✓ Yopish"}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      <div className="fade-in" style={{ marginBottom:22 }}>
        <div style={{ fontSize:T.xs,color:C.muted,marginBottom:4 }}>Nonvoyxona №1</div>
        <div style={{ fontSize:22,fontWeight:900,color:C.text,letterSpacing:-0.5,fontFamily:"Georgia, serif" }}>Bosh ko'rsatkichlar</div>
        <div style={{ fontSize:T.sm,color:C.sub,marginTop:2 }}>Bugungi ish ko'rsatkichlari barqaror 📈</div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:20 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>


      <SLabel>Muhim ogohlantirishlar</SLabel>
      {(() => {
        const omborPending = (hisobotlarTarixi||[]).filter(h => !tasdiqlanganKunlar.includes(h.id));
        const qopOk      = qopTasdiqlandi;
        const needsOmbor = hisobotlarTarixi.length > 0;
        const omborOk    = needsOmbor && omborPending.length === 0;
        const allDone    = qopOk && (!needsOmbor || omborOk);
        const nothingYet = !qopOk && !needsOmbor;

        if (nothingYet) return (
          <div className="slide-up" style={{ animationDelay:".25s",background:C.card,border:`1px solid ${C.blue}30`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:T.md }}>📋</span>
            <span style={{ fontSize:T.sm,color:C.muted }}>Bugungi ma'lumotlar hali kiritilmagan</span>
          </div>
        );

        if (allDone) return (
          <div className="slide-up" style={{ animationDelay:".25s",background:C.card,borderLeft:`4px solid ${C.green}`,border:`1px solid ${C.green}20`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:T.md }}>✅</span>
            <span style={{ fontSize:T.sm,fontWeight:700,color:C.green }}>Barcha kunlik vazifalar bajarildi!</span>
          </div>
        );

        return (
          <div style={{ marginBottom:8 }}>
            {/* Vazifa 1: Kunlik qop hisobi */}
            <div className="slide-up" style={{ animationDelay:".25s",background:C.card,borderLeft:`4px solid ${qopOk?C.green:C.accent}`,border:`1px solid ${qopOk?C.green+"30":C.accent+"40"}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontSize:T.md,minWidth:22 }}>{qopOk?"✅":"📦"}</span>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:T.sm,fontWeight:700,color:qopOk?C.green:C.text }}>
                  {qopOk?"✓ Kunlik qop kiritildi":"Kunlik qop hisobini kiritish"}
                </div>
                <div style={{ fontSize:9,color:C.muted,marginTop:2 }}>
                  {qopOk
                    ? `${ozJamiQop} qop · ${(ozJamiDona+tashqariJamiDona).toLocaleString()} dona non`
                    : "Bugungi ishlab chiqarish ma'lumotlari kutilmoqda"}
                </div>
              </div>
              {!qopOk && (
                <button onClick={()=>setShowKunlikQop(true)} className="btn"
                  style={{ background:C.accent,border:"none",borderRadius:8,padding:"6px 10px",color:"#FFF3E8",fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap" }}>
                  Kiritish →
                </button>
              )}
            </div>

            {/* Vazifa 2: Ombor tasdiqlash */}
            {needsOmbor && (
              <div className="slide-up" style={{ animationDelay:".3s",background:C.card,borderLeft:`4px solid ${omborOk?C.green:C.blue}`,border:`1px solid ${omborOk?C.green+"30":C.blue+"30"}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontSize:T.md,minWidth:22 }}>{omborOk?"✅":"🗄️"}</span>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:T.sm,fontWeight:700,color:omborOk?C.green:C.text }}>
                    {omborOk?"✓ Ombor tasdiqlandi":"Ombor o'zgarishlarini tasdiqlash"}
                  </div>
                  <div style={{ fontSize:9,color:C.muted,marginTop:2 }}>
                    {omborOk
                      ? "Barcha kunlik sarflar ombordan ayirildi"
                      : `${omborPending.length} ta kunlik hisobot tasdiqlanmagan`}
                  </div>
                </div>
                {!omborOk && onNav && (
                  <button onClick={()=>onNav("ombor")} className="btn"
                    style={{ background:C.blue,border:"none",borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap" }}>
                    O'tish →
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })()}

      <div style={{ marginTop:28 }}>
        {/* ── KUNLIK QOP VA SOTILGAN NON ── */}
        <div style={{ background:C.card,border:`1px solid ${C.accent}40`,borderRadius:16,padding:16,marginBottom:16 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showKunlikQop?14:0 }}>
            <div style={{ display:"flex",flexDirection:"column" }}>
              <div style={{ fontSize:T.sm,fontWeight:800,color:C.accent }}>📦 Kunlik qop hisobi</div>
              {qopTasdiqlandi && !showKunlikQop && (
                <div style={{ fontSize:10,color:C.muted,marginTop:3 }}>
                  ✓ {ozJamiQop} qop · {(ozJamiDona+tashqariJamiDona).toLocaleString()} dona non
                </div>
              )}
            </div>
            <button onClick={()=>setShowKunlikQop(v=>!v)} className="btn"
              style={{ border:`1px solid ${C.accent}50`,background:showKunlikQop?C.accent+"20":"transparent",borderRadius:8,padding:"5px 10px",color:C.accent,fontSize:T.xs,fontWeight:800,cursor:"pointer" }}>
              {showKunlikQop?"✕ Yopish":qopTasdiqlandi?"✎ Tahrirlash":"+ Ma'lumot qo'shish"}
            </button>
          </div>

          {showKunlikQop && (
            <div className="pop-in">
              {/* SANA — qo'lda kiritiladi */}
              <div style={{ marginBottom:14,padding:"10px 12px",background:C.surface,border:`1px solid ${C.accent}40`,borderRadius:10 }}>
                <div style={{ fontSize:9,color:C.muted,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>📅 Hisobot sanasi</div>
                <input type="date" value={hisobotSanasi}
                  onChange={e=>setHisobotSanasi(e.target.value)}
                  style={{ width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:T.sm,fontWeight:700 }} />
              </div>
              {nonlar.filter(n=>n.ozIshlab!==false).length > 0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:9,color:C.muted,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>🏭 O'zimizda pishiriladigan (qop kiriting)</div>
                  {nonlar.filter(n=>n.ozIshlab!==false).map(n => {
                    const norma = getQopNorma(n);
                    const qopSoni = parseInt(ozIshlabQoplar[n.id])||0;
                    const dona = qopSoni * norma;
                    return (
                      <div key={n.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                          <div style={{ fontSize:T.sm,fontWeight:700,color:C.text }}>🍞 {n.nom}</div>
                          <div style={{ fontSize:9,color:C.muted }}>1 qop = {norma} dona</div>
                        </div>
                        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                          <input type="number" min="0" value={ozIshlabQoplar[n.id]||""}
                            onChange={e=>setOzIshlabQoplar(p=>({...p,[n.id]:e.target.value}))}
                            placeholder="Qop soni"
                            style={{ flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:T.sm,fontWeight:700 }} />
                          <div style={{ fontSize:T.sm,fontWeight:800,color:C.blue,minWidth:70,textAlign:"right" }}>
                            = {dona} dona
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:10,marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontSize:T.xs,color:C.muted,textTransform:"uppercase" }}>Jami (o'zimizniki)</span>
                    <span style={{ fontSize:T.md,fontWeight:900,color:C.accent }}>
                      {ozJamiQop} qop · {ozJamiDona} dona
                    </span>
                  </div>
                </div>
              )}

              {nonlar.filter(n=>n.ozIshlab===false).length > 0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:9,color:C.muted,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>🚚 Tashqaridan keladigan (dona)</div>
                  {nonlar.filter(n=>n.ozIshlab===false).map(n => (
                    <div key={n.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                        <div style={{ fontSize:T.sm,fontWeight:700,color:C.text }}>🍞 {n.nom}</div>
                        <div style={{ fontSize:9,color:C.green,fontWeight:700 }}>+{(parseFloat(n.tashqariFoyda)||2000).toLocaleString()} so'm/dona</div>
                      </div>
                      <TashqariNonInput nonId={n.id} tashqariSonlar={tashqariSonlar} setTashqariSonlar={setTashqariSonlar} />
                    </div>
                  ))}
                </div>
              )}

              {nonlar.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:9,color:C.sub,marginBottom:8,fontWeight:700,textTransform:"uppercase",letterSpacing:1 }}>➖ Sotilmagan non (har turi bo'yicha)</div>
                  {nonlar.map(n => {
                    const norma = parseFloat(n.nonSoni)||0;
                    const jamiNon = n.ozIshlab===false
                      ? (parseInt(tashqariSonlar[n.id])||0)
                      : (parseInt(ozIshlabQoplar[n.id])||0) * norma;
                    if (jamiNon === 0) return null;
                    return (
                      <div key={n.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:T.xs,fontWeight:700,color:C.text }}>🍞 {n.nom}</div>
                          <div style={{ fontSize:9,color:C.muted }}>jami: {jamiNon} dona</div>
                        </div>
                        <input type="number" min="0" max={jamiNon}
                          value={sotilmaganNon[n.id]||""}
                          onChange={e=>setSotilmaganNon(p=>({...p,[n.id]:e.target.value}))}
                          placeholder="0"
                          style={{ width:80,background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 8px",color:C.text,fontSize:T.sm,fontWeight:700,textAlign:"center" }} />
                      </div>
                    );
                  })}
                </div>
              )}

              {Object.values(sotilmaganNon).some(v => parseInt(v) > 0) && (
                <div style={{ background:C.green+"12",border:`1px solid ${C.green}35`,borderRadius:10,padding:"10px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ fontSize:T.sm,color:C.muted }}>✅ Sotilgan non</span>
                  <span style={{ fontSize:T.xl,fontWeight:900,color:C.green }}>
                    {Math.max(0, (ozJamiDona + tashqariJamiDona) - Object.values(sotilmaganNon).reduce((s,v)=>s+(parseInt(v)||0),0))} dona
                  </span>
                </div>
              )}

<button onClick={tasdiqlashQop} className="btn"
                style={{ width:"100%",background:C.blue,border:"none",borderRadius:10,padding:"11px 8px",color:C.surface,fontWeight:800,cursor:"pointer",fontSize:T.sm }}>
                ✅ Tasdiqlash va saqlash
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            HISOBOTLAR TARIXI — 30 kunlik arxiv
        ═══════════════════════════════════════════════════════════ */}
        {(hisobotlarTarixi||[]).length > 0 && (
          <div style={{ background:C.card,border:`1px solid ${C.blue}30`,borderRadius:16,padding:16,marginBottom:16 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showTarix?14:0 }}>
              <div>
                <div style={{ fontSize:T.sm,fontWeight:800,color:C.blue }}>📚 Hisobotlar tarixi</div>
                <div style={{ fontSize:10,color:C.muted,marginTop:3 }}>{(hisobotlarTarixi||[]).length} ta yozuv · 30 kunlik arxiv</div>
              </div>
              <button onClick={()=>setShowTarix(v=>!v)} className="btn"
                style={{ border:`1px solid ${C.blue}50`,background:showTarix?C.blue+"20":"transparent",borderRadius:8,padding:"5px 10px",color:C.blue,fontSize:T.xs,fontWeight:800,cursor:"pointer" }}>
                {showTarix?"✕ Yopish":"📂 Ko'rish"}
              </button>
            </div>
            {showTarix && (
              <div className="pop-in" style={{ marginTop:10,display:"flex",flexDirection:"column",gap:8 }}>
                {(hisobotlarTarixi||[]).map((h,i)=>{
                  const sanaFmt = new Date(h.sana).toLocaleDateString("uz-UZ",{year:"numeric",month:"short",day:"numeric"});
                  const foydaCol = (h.sofFoyda||0)>=0 ? C.green : C.red;
                  return (
                    <div key={h.id} className={`fade-in s${Math.min(i+1,5)}`}
                      style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8 }}>
                      <div onClick={()=>ochTarix(h)} role="button"
                        style={{ flex:1,cursor:"pointer",minWidth:0 }}>
                        <div style={{ fontSize:T.sm,fontWeight:800,color:C.text }}>📅 {sanaFmt}</div>
                        <div style={{ fontSize:9,color:C.muted,marginTop:2 }}>
                          {h.jamiQop||0} qop · {(h.sotilganNon||0).toLocaleString()} dona sotilgan
                        </div>
                        <div style={{ fontSize:T.xs,fontWeight:800,color:foydaCol,marginTop:3 }}>
                          {(h.sofFoyda||0)>=0?"+":""}{(h.sofFoyda||0).toLocaleString()} so'm
                        </div>
                      </div>
                      <button onClick={(e)=>{
                        e.stopPropagation();
                        if(window.confirm("Bu hisobot tarixdan o'chiriladi. Davom etaylikmi?")) {
                          ochTarixOchir(h.id);
                        }
                      }} className="btn"
                        style={{ background:"none",border:`1px solid ${C.red}40`,borderRadius:7,padding:"4px 8px",color:C.red,fontSize:T.xs,fontWeight:700,cursor:"pointer",flexShrink:0 }}>
                        🗑
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <SLabel>Qarz / Optom ko'rsatkichlari</SLabel>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
          <div className="slide-up" style={{ background:C.card,border:`1px solid ${C.red}50`,borderRadius:20,padding:18,minHeight:170,display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:9,color:C.red,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>💳 Qarz</div>
              <div style={{ fontSize:38,fontWeight:900,color:C.red,letterSpacing:-2,lineHeight:1 }}>{activeQarzlar.length}</div>
              <div style={{ fontSize:T.xs,color:C.muted,marginTop:3 }}>ta faol qarz</div>
              {activeQarzlar.length>0 && (
                <div style={{ fontSize:9,color:C.sub,marginTop:4 }}>
                  {activeQarzlar.slice(0,2).map(q=>q.ism).join(", ")}{activeQarzlar.length>2?` +${activeQarzlar.length-2} ta`:""}
                </div>
              )}
            </div>
            <button onClick={() => { setShowQarzForm(v=>!v); setShowOptomForm(false); if(showQarzForm) resetQarzForm(); }} className="btn"
              style={{ width:"100%",border:"none",background:C.red,borderRadius:10,padding:"9px 8px",color:"#fff",fontSize:T.xs,fontWeight:800,cursor:"pointer",marginTop:10 }}>
              + Qarz qo'shish
            </button>
          </div>

          <div className="slide-up" style={{ background:C.card,border:`1px solid ${C.blue}50`,borderRadius:20,padding:18,minHeight:170,display:"flex",flexDirection:"column",justifyContent:"space-between",animationDelay:".06s" }}>
            <div>
              <div style={{ fontSize:9,color:C.blue,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>📦 Optom</div>
              <div style={{ fontSize:38,fontWeight:900,color:C.blue,letterSpacing:-2,lineHeight:1 }}>{recentOptomlar.length}</div>
              <div style={{ fontSize:T.xs,color:C.muted,marginTop:3 }}>ta (7 kun)</div>
              {recentOptomlar.length>0 && (
                <div style={{ fontSize:9,color:C.sub,marginTop:4 }}>
                  {recentOptomlar.slice(0,2).map(o=>o.ism).join(", ")}
                </div>
              )}
            </div>
            <button onClick={() => { setShowOptomForm(v=>!v); setShowQarzForm(false); if(showOptomForm) resetOptomForm(); }} className="btn"
              style={{ width:"100%",border:"none",background:C.blue,borderRadius:10,padding:"9px 8px",color:"#fff",fontSize:T.xs,fontWeight:800,cursor:"pointer",marginTop:10 }}>
              + Xarid qo'shish
            </button>
          </div>
        </div>

        {showQarzForm && (
          <div className="pop-in" style={{ background:C.card,border:`1px solid ${C.red}40`,borderRadius:16,padding:16,marginBottom:14 }}>
            <div style={{ fontSize:T.sm,fontWeight:800,color:C.red,marginBottom:14 }}>
              💳 {editQarzId ? "Qarzni tahrirlash" : "Yangi qarz kiritish"}
            </div>

            <div style={{ marginBottom:10 }}>
              <div style={labelStyle}>Qarz oluvchi ismi *</div>
              <input type="text" value={qarzIsm}
                onChange={e=>setQarzIsm(e.target.value)}
                placeholder="Ismi yoki do'kon nomi"
                className={qarzErr&&!qarzIsm?"shake":""}
                style={inpStyle(qarzErr&&!qarzIsm)} />
            </div>

            {nonlar.length>0 ? (
              <div style={{ marginBottom:12 }}>
                <div style={labelStyle}>Non turini savatga qo'shing *</div>
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  {nonlar.map(n => {
                    const item = qarzSavat.find(s => s.nonNomi===n.nom);
                    return (
                      <div key={n.id}
                        style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:item?C.red+"10":C.surface,border:`1px solid ${item?C.red+"50":C.border}`,borderRadius:10,padding:"10px 12px",transition:"all 0.2s" }}>
                        <div>
                          <div style={{ fontSize:T.sm,fontWeight:700,color:C.text }}>🍞 {n.nom}</div>
                          <div style={{ fontSize:9,color:C.muted }}>{(n.narx||0).toLocaleString()} so'm/dona</div>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                          {item ? (
                            <>
                              <button onClick={()=>updateQarzSoni(n.nom, item.soni-1)}
                                style={{ width:28,height:28,border:`1px solid ${C.border}`,background:C.surface,borderRadius:7,color:C.text,fontSize:16,cursor:"pointer",fontWeight:700 }}>−</button>
                              <input type="number"
                                value={item.soni}
                                onChange={e=>updateQarzSoni(n.nom, e.target.value)}
                                style={{ width:52,background:C.surface,border:`1px solid ${C.red}`,borderRadius:7,padding:"4px 6px",color:C.text,fontSize:T.sm,fontWeight:800,textAlign:"center" }} />
                              <button onClick={()=>updateQarzSoni(n.nom, item.soni+1)}
                                style={{ width:28,height:28,border:"none",background:C.red,borderRadius:7,color:"#fff",fontSize:16,cursor:"pointer",fontWeight:700 }}>+</button>
                            </>
                          ) : (
                            <button onClick={()=>addToQarzSavat(n.nom)}
                              style={{ border:"none",background:C.red,borderRadius:8,padding:"6px 14px",color:"#fff",fontSize:T.sm,fontWeight:800,cursor:"pointer" }}>
                              + Qo'sh
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ background:C.surface,border:`1px dashed ${C.border}`,borderRadius:10,padding:"14px 12px",marginBottom:12,textAlign:"center",fontSize:T.xs,color:C.muted }}>
                ⚠️ Assortiment bo'limida avval non turlarini kiriting
              </div>
            )}

            {qarzSavat.length>0 && (
              <div style={{ background:C.red+"08",border:`1px solid ${C.red}25`,borderRadius:12,padding:12,marginBottom:12 }}>
                <div style={{ fontSize:9,color:C.red,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>🛒 Savat ({qarzSavat.length} xil mahsulot)</div>
                {qarzSavat.map(s => {
                  const non = nonlar.find(n=>n.nom===s.nonNomi);
                  const narx = non?.narx||0;
                  return (
                    <div key={s.nonNomi} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                      <div>
                        <span style={{ fontSize:T.sm,color:C.text,fontWeight:600 }}>{s.nonNomi}</span>
                        <span style={{ fontSize:9,color:C.muted,marginLeft:6 }}>{s.soni} × {narx.toLocaleString()}</span>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <span style={{ fontSize:T.sm,fontWeight:800,color:C.red }}>{(narx*s.soni).toLocaleString()} so'm</span>
                        <button onClick={()=>setQarzSavat(p=>p.filter(x=>x.nonNomi!==s.nonNomi))}
                          style={{ background:"none",border:"none",color:C.red,fontSize:12,cursor:"pointer" }}>✕</button>
                      </div>
                    </div>
                  );
                })}
                <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:6 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                    <span style={{ fontSize:T.xs,color:C.muted }}>Jami dona</span>
                    <span style={{ fontSize:T.sm,fontWeight:900,color:C.text }}>{qarzJamiDona} dona</span>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}>
                    <span style={{ fontSize:T.xs,color:C.muted }}>Jami narx</span>
                    <span style={{ fontSize:T.md,fontWeight:900,color:C.red }}>
                      {qarzSavat.reduce((sum,s)=>{
                        const non = nonlar.find(n=>n.nom===s.nonNomi);
                        return sum + ((non?.narx||0)*s.soni);
                      },0).toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom:14 }}>
              <div style={labelStyle}>Sana *</div>
              <input type="date" value={qarzSana}
                onChange={e=>setQarzSana(e.target.value)}
                style={{ ...inpStyle(false), colorScheme:"dark" }} />
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              <button onClick={resetQarzForm}
                style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:10,padding:"11px 8px",color:C.sub,cursor:"pointer",fontSize:T.sm }}>
                Bekor
              </button>
              <button onClick={saveQarz}
                style={{ border:"none",background:qarzSavat.length===0?C.border:C.red,borderRadius:10,padding:"11px 8px",color:"#fff",fontWeight:800,cursor:qarzSavat.length===0?"default":"pointer",fontSize:T.sm }}>
                ✓ Saqlash
              </button>
            </div>
          </div>
        )}

        {activeQarzlar.length>0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:T.xs,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:1,fontWeight:700 }}>📋 Faol qarzlar</div>
            {activeQarzlar.map((q,i)=>(
              <div key={q.id} className={`fade-in s${Math.min(i+1,5)}`}
                style={{ background:C.card,border:`1px solid ${C.red}30`,borderRadius:14,padding:"12px 14px",marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:T.sm,fontWeight:700,color:C.text }}>{q.ism}</div>
                    {q.savat ? (
                      <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:4 }}>
                        {q.savat.map((s,idx)=>(
                          <span key={idx} style={{ fontSize:9,background:C.red+"15",border:`1px solid ${C.red}25`,borderRadius:5,padding:"2px 7px",color:C.red }}>
                            🍞 {s.nonNomi} × {s.soni}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize:T.xs,color:C.sub,marginTop:2 }}>🍞 {q.nonNomi} · {q.soni} ta</div>
                    )}
                    <div style={{ fontSize:9,color:C.muted,marginTop:2 }}>📅 {q.sana}</div>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end" }}>
                    <button onClick={()=>tolaQarz(q.id)} className="btn"
                      style={{ border:"none",background:C.green,borderRadius:9,padding:"7px 12px",color:"#fff",fontSize:T.xs,fontWeight:800,cursor:"pointer" }}>
                      ✓ To'landi
                    </button>
                    <div style={{ display:"flex",gap:4 }}>
                      <button onClick={()=>openEditQarz(q)}
                        style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:7,padding:"5px 10px",color:C.sub,fontSize:T.xs,cursor:"pointer" }}>
                        ✏️
                      </button>
                      <button onClick={()=>setDelQarzId(q.id)}
                        style={{ border:`1px solid ${C.red}40`,background:"transparent",borderRadius:7,padding:"5px 10px",color:C.red,fontSize:T.xs,cursor:"pointer" }}>
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
                {delQarzId===q.id && (
                  <div className="pop-in" style={{ background:C.redDim,border:`1px solid ${C.red}40`,borderRadius:10,padding:10,marginTop:4 }}>
                    <div style={{ fontSize:T.xs,color:C.text,fontWeight:700,marginBottom:8,textAlign:"center" }}>O'chirib yubormoqchimisiz?</div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                      <button onClick={()=>setDelQarzId(null)}
                        style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:8,padding:"8px",color:C.sub,cursor:"pointer",fontSize:T.xs }}>Bekor</button>
                      <button onClick={()=>{ setQarzlar(p=>p.filter(x=>x.id!==q.id)); setDelQarzId(null); notify("Qarz o'chirildi", "success"); }}
                        style={{ border:"none",background:C.red,borderRadius:8,padding:"8px",color:"#fff",fontWeight:800,cursor:"pointer",fontSize:T.xs }}>Ha, o'chirish</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tarihQarzlar.length>0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
              <div style={{ fontSize:T.xs,color:C.muted,textTransform:"uppercase",letterSpacing:1,fontWeight:700 }}>🕘 To'langan (7 kunlik tarix)</div>
            </div>
            {tarihQarzlar.map((q,i)=>{
              const daysAgo = Math.floor((nowMs-q.tolanganVaqt)/(24*60*60*1000));
              return (
                <div key={q.id} className={`fade-in s${Math.min(i+1,5)}`}
                  style={{ background:C.surface,border:`1px solid ${C.green}25`,borderRadius:12,padding:"10px 12px",marginBottom:6,opacity:0.8 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontSize:T.sm,fontWeight:600,color:C.text }}>{q.ism}</div>
                      {q.savat ? (
                        <div style={{ display:"flex",flexWrap:"wrap",gap:3,marginTop:3 }}>
                          {q.savat.map((s,idx)=>(
                            <span key={idx} style={{ fontSize:9,color:C.sub }}>🍞 {s.nonNomi}×{s.soni}</span>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize:T.xs,color:C.sub,marginTop:1 }}>🍞 {q.nonNomi} · {q.soni} ta</div>
                      )}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <Badge color={C.green}>✓ To'langan</Badge>
                      <div style={{ fontSize:9,color:C.muted,marginTop:3 }}>{daysAgo===0?"Bugun":`${daysAgo} kun oldin`}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showOptomForm && (
          <div className="pop-in" style={{ background:C.card,border:`1px solid ${C.blue}40`,borderRadius:16,padding:16,marginBottom:14 }}>
            <div style={{ fontSize:T.sm,fontWeight:800,color:C.blue,marginBottom:14 }}>
              📦 {editOptomId ? "Optom xaridni tahrirlash" : "Optom xarid — Savatcha"}
            </div>

            <div style={{ marginBottom:12 }}>
              <div style={labelStyle}>Xaridor ismi *</div>
              <input type="text" value={optomXaridor}
                onChange={e=>setOptomXaridor(e.target.value)}
                placeholder="Ismi yoki do'kon nomi"
                className={optomErr&&!optomXaridor?"shake":""}
                style={inpStyle(optomErr&&!optomXaridor)} />
            </div>

            {nonlar.length>0 ? (
              <div style={{ marginBottom:12 }}>
                <div style={labelStyle}>Non turini savatga qo'shing *</div>
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  {nonlar.map(n => {
                    const savatItem = optomSavat.find(s => s.nonNomi===n.nom);
                    return (
                      <div key={n.id}
                        style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:savatItem?C.blue+"10":C.surface,border:`1px solid ${savatItem?C.blue+"50":C.border}`,borderRadius:10,padding:"10px 12px",transition:"all 0.2s" }}>
                        <div>
                          <div style={{ fontSize:T.sm,fontWeight:700,color:C.text }}>🍞 {n.nom}</div>
                          <div style={{ fontSize:9,color:C.muted }}>{(n.narx||0).toLocaleString()} so'm/dona</div>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                          {savatItem ? (
                            <>
                              <button onClick={()=>updateSavatSoni(n.nom, savatItem.soni-1)}
                                style={{ width:28,height:28,border:`1px solid ${C.border}`,background:C.surface,borderRadius:7,color:C.text,fontSize:16,cursor:"pointer",fontWeight:700 }}>−</button>
                              <input type="number"
                                value={savatItem.soni}
                                onChange={e=>updateSavatSoni(n.nom, e.target.value)}
                                style={{ width:52,background:C.surface,border:`1px solid ${C.blue}`,borderRadius:7,padding:"4px 6px",color:C.text,fontSize:T.sm,fontWeight:800,textAlign:"center" }} />
                              <button onClick={()=>updateSavatSoni(n.nom, savatItem.soni+1)}
                                style={{ width:28,height:28,border:"none",background:C.blue,borderRadius:7,color:"#fff",fontSize:16,cursor:"pointer",fontWeight:700 }}>+</button>
                            </>
                          ) : (
                            <button onClick={()=>addToSavat(n.nom)}
                              style={{ border:"none",background:C.blue,borderRadius:8,padding:"6px 14px",color:"#fff",fontSize:T.sm,fontWeight:800,cursor:"pointer" }}>
                              + Qo'sh
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ background:C.surface,border:`1px dashed ${C.border}`,borderRadius:10,padding:"14px 12px",marginBottom:12,textAlign:"center",fontSize:T.xs,color:C.muted }}>
                ⚠️ Assortiment bo'limida avval non turlarini kiriting
              </div>
            )}

            {optomSavat.length>0 && (
              <div style={{ background:C.blue+"08",border:`1px solid ${C.blue}25`,borderRadius:12,padding:12,marginBottom:12 }}>
                <div style={{ fontSize:9,color:C.blue,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>🛒 Savat ({optomSavat.length} xil mahsulot)</div>
                {optomSavat.map(s => {
                  const non = nonlar.find(n=>n.nom===s.nonNomi);
                  const narx = non?.narx||0;
                  return (
                    <div key={s.nonNomi} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                      <div>
                        <span style={{ fontSize:T.sm,color:C.text,fontWeight:600 }}>{s.nonNomi}</span>
                        <span style={{ fontSize:9,color:C.muted,marginLeft:6 }}>{s.soni} × {narx.toLocaleString()}</span>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <span style={{ fontSize:T.sm,fontWeight:800,color:C.blue }}>{(narx*s.soni).toLocaleString()} so'm</span>
                        <button onClick={()=>removeFromSavat(s.nonNomi)}
                          style={{ background:"none",border:"none",color:C.red,fontSize:12,cursor:"pointer" }}>✕</button>
                      </div>
                    </div>
                  );
                })}
                <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:6,display:"flex",justifyContent:"space-between" }}>
                  <span style={{ fontSize:T.xs,color:C.muted }}>Jami (chegirmasiz)</span>
                  <span style={{ fontSize:T.md,fontWeight:900,color:C.text }}>{savatTotalNarx.toLocaleString()} so'm</span>
                </div>
              </div>
            )}

            {optomSavat.length>0 && (
              <div style={{ marginBottom:12 }}>
                <div style={labelStyle}>Chegirma (so'm)</div>
                <input type="number" value={optomChegirma}
                  onChange={e=>setOptomChegirma(e.target.value)}
                  placeholder={`Avtomatik: ${autoChegirama.toLocaleString()} so'm (${savatJamiDona} dona × 1000)`}
                  style={inpStyle(false)} />
                {savatTotalNarx>0 && (
                  <div style={{ marginTop:8,background:C.blue+"10",border:`1px solid ${C.blue}25`,borderRadius:9,padding:"8px 12px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,color:C.sub,marginBottom:4 }}>
                      <span>Asl narx</span>
                      <span style={{ color:C.text,fontWeight:700 }}>{savatTotalNarx.toLocaleString()} so'm</span>
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:T.xs,color:C.sub,marginBottom:4 }}>
                      <span>Chegirma ({savatJamiDona} dona × 1000)</span>
                      <span style={{ color:C.red,fontWeight:700 }}>−{chegirmaVal.toLocaleString()} so'm</span>
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:T.sm,borderTop:`1px solid ${C.border}`,paddingTop:6 }}>
                      <span style={{ color:C.text,fontWeight:700 }}>Yakuniy narx</span>
                      <span style={{ color:C.blue,fontWeight:900 }}>{yakuniyNarx.toLocaleString()} so'm</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              <button onClick={resetOptomForm}
                style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:10,padding:"11px 8px",color:C.sub,cursor:"pointer",fontSize:T.sm }}>
                Bekor
              </button>
              <button onClick={saveOptom}
                style={{ border:"none",background:optomSavat.length===0?C.border:C.blue,borderRadius:10,padding:"11px 8px",color:"#fff",fontWeight:800,cursor:optomSavat.length===0?"default":"pointer",fontSize:T.sm }}>
                ✓ Saqlash
              </button>
            </div>
          </div>
        )}

        {recentOptomlar.length>0 && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
              <div style={{ fontSize:T.xs,color:C.muted,textTransform:"uppercase",letterSpacing:1,fontWeight:700 }}>📦 Optom tarixi (so'nggi 7 kun)</div>
            </div>
            {recentOptomlar.map((o,i)=>{
              const daysAgo = Math.floor((nowMs-o.vaqt)/(24*60*60*1000));
              const savatItems = o.savat || [];
              return (
                <div key={o.id} className={`fade-in s${Math.min(i+1,5)}`}
                  style={{ background:C.card,border:`1px solid ${C.blue}30`,borderRadius:14,padding:"12px 14px",marginBottom:8 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                    <div>
                      <div style={{ fontSize:T.sm,fontWeight:700,color:C.text }}>{o.ism}</div>
                      <div style={{ fontSize:9,color:C.muted,marginTop:2 }}>
                        📅 {o.sana} · {daysAgo===0?"Bugun":`${daysAgo} kun oldin`}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:T.sm,fontWeight:900,color:C.blue }}>{o.chegirmaliNarx.toLocaleString()} so'm</div>
                      <div style={{ fontSize:9,color:C.red,marginTop:2 }}>−{o.chegirma.toLocaleString()} chegirma</div>
                    </div>
                  </div>
                  {savatItems.length>0 && (
                    <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:8 }}>
                      {savatItems.map((s,idx)=>(
                        <span key={idx} style={{ fontSize:9,background:C.blue+"15",border:`1px solid ${C.blue}25`,borderRadius:5,padding:"2px 7px",color:C.blue }}>
                          🍞 {s.nonNomi} × {s.soni}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex",gap:6,borderTop:`1px solid ${C.borderSoft}`,paddingTop:8 }}>
                    <button onClick={()=>openEditOptom(o)}
                      style={{ flex:1,border:`1px solid ${C.border}`,background:"transparent",borderRadius:8,padding:"7px",color:C.sub,fontSize:T.xs,cursor:"pointer" }}>
                      ✏️ Tahrirlash
                    </button>
                    <button onClick={()=>setDelOptomId(o.id)}
                      style={{ flex:1,border:`1px solid ${C.red}40`,background:"transparent",borderRadius:8,padding:"7px",color:C.red,fontSize:T.xs,cursor:"pointer" }}>
                      🗑 O'chirish
                    </button>
                  </div>
                  {delOptomId===o.id && (
                    <div className="pop-in" style={{ background:C.redDim,border:`1px solid ${C.red}40`,borderRadius:10,padding:10,marginTop:8 }}>
                      <div style={{ fontSize:T.xs,color:C.text,fontWeight:700,marginBottom:8,textAlign:"center" }}>O'chirib yubormoqchimisiz?</div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                        <button onClick={()=>setDelOptomId(null)}
                          style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:8,padding:"8px",color:C.sub,cursor:"pointer",fontSize:T.xs }}>Bekor</button>
                        <button onClick={()=>{ setOptomlar(p=>p.filter(x=>x.id!==o.id)); setDelOptomId(null); notify("Optom savdo o'chirildi", "success"); }}
                          style={{ border:"none",background:C.red,borderRadius:8,padding:"8px",color:"#fff",fontWeight:800,cursor:"pointer",fontSize:T.xs }}>Ha, o'chirish</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// ─── PRODUCTION ──────────────────────────────────────────────────
const MAHSULOTLAR_KATALOG = [
  { id:"oqUn",     nom:"Oq un",             birlik:"g",  emoji:"🌾" },
  { id:"sariqUn",  nom:"Sariq un",          birlik:"g",  emoji:"🌾" },
  { id:"qoraUn",   nom:"Qora un",           birlik:"g",  emoji:"🌾" },
  { id:"sut",      nom:"Sut",               birlik:"ml", emoji:"🥛" },
  { id:"yog",      nom:"Yog'",              birlik:"ml", emoji:"🫗" },
  { id:"jir",      nom:"Jir (hayvon yog')", birlik:"g",  emoji:"🥓" },
  { id:"quruqSut", nom:"Quruq sut",         birlik:"g",  emoji:"🥄" },
  { id:"achitqi",  nom:"Achitqi (Droja)",   birlik:"g",  emoji:"🍞" },
  { id:"shakar",   nom:"Shakar va Tuz",     birlik:"g",  emoji:"🍬" },
];

const EMPTY_NON = { nom:"", narx:"", nonSoni:"", ozIshlab:true, tashqariFoyda:"", mahsulotlar:[] };

function Production({ ishchilar=[], mahsulotNarxlari, setMahsulotNarxlari, customMahsulotlar, setCustomMahsulotlar, nonlar, setNonlar }) {
  const [tab, setTab]                     = useState("assortiment");
  const [qop, setQop]                     = useState("5");
  const [aView, setAView]                 = useState("list");
  const [aSelId, setASelId]               = useState(null);
  const [aForm, setAForm]                 = useState(EMPTY_NON);
  const [showAddProd, setShowAddProd]     = useState(false);
  const [aFormErr, setAFormErr]           = useState(false);
  const [confirmDelNon, setConfirmDelNon] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customForm, setCustomForm]       = useState({ nom:"", birlik:"g" });
  // ── Kunlik normalar ──
  const [kunlikNormalar, setKunlikNormalar] = useState([
    { id:"issiqNon",     nom:"Issiq non",      norma:13 },
    { id:"patir",        nom:"Patir",          norma:2  },
    { id:"kattaQoraNon", nom:"Katta qora non", norma:2  },
  ]);
  const [normaTahrir, setNormaTahrir] = useState(false);
  const [normaForm, setNormaForm]     = useState({});

  const allMahsulotlar = [...MAHSULOTLAR_KATALOG, ...customMahsulotlar];

  const getEffectiveNarx = (m) => {
    const p = mahsulotNarxlari[m.id];
    if (p && p.miqdor && p.narx && m.miqdor) {
      return Math.round((parseFloat(m.miqdor)/parseFloat(p.miqdor))*parseFloat(p.narx));
    }
    return parseFloat(m.narx)||0;
  };

  const jamiIngredientNarx = aForm.mahsulotlar.reduce((s,m)=>s+getEffectiveNarx(m),0);
  const nonSoniVal          = parseFloat(aForm.nonSoni)||0;
  const sotuvNarxVal        = parseFloat(aForm.narx)||0;
  const jamiDaromad         = sotuvNarxVal*nonSoniVal;
  const jamiXarajat         = jamiIngredientNarx;
  const jamiFoyda           = jamiDaromad-jamiXarajat;
  const bittaFoyda          = nonSoniVal>0 ? jamiFoyda/nonSoniVal : 0;

  const qoshilmagan = allMahsulotlar.filter(mk=>!aForm.mahsulotlar.some(am=>am.id===mk.id));

  const saveCustomMahsulot = () => {
    if (!customForm.nom.trim()) return;
    const id = "custom_"+Date.now();
    setCustomMahsulotlar(p=>[...p,{ id,nom:customForm.nom.trim(),birlik:customForm.birlik,emoji:"📦" }]);
    setCustomForm({ nom:"",birlik:"g" }); setShowAddCustom(false);
  };

  const newNonForm  = () => { setAForm(EMPTY_NON); setASelId(null); setShowAddProd(false); setConfirmDelNon(false); setAView("form"); };
  const editNonForm = (n) => {
    setAForm({ nom:n.nom, narx:String(n.narx||""), nonSoni:String(n.nonSoni||""), ozIshlab:n.ozIshlab!==false,
      tashqariFoyda:String(n.tashqariFoyda||""),
      mahsulotlar:(n.mahsulotlar||[]).map(m=>({...m,miqdor:String(m.miqdor||""),narx:String(m.narx||"")})) });
    setASelId(n.id); setShowAddProd(false); setConfirmDelNon(false); setAView("form");
  };

  const saveNon = () => {
    // Tashqaridan kelgan nonlar uchun nonSoni majburiy emas
    if (!aForm.nom.trim()||!aForm.narx||(aForm.ozIshlab && !aForm.nonSoni)) {
      setAFormErr(true); setTimeout(()=>setAFormErr(false),600);
      notify("Majburiy maydonlarni to'ldiring"); return;
    }
    // Duplikat non nomi taqiqlanadi
    const nomDup = (nonlar||[]).some(n => n.nom.trim().toLowerCase() === aForm.nom.trim().toLowerCase() && n.id !== aSelId);
    if (nomDup) {
      setAFormErr(true); setTimeout(()=>setAFormErr(false),600);
      notify("Bu nomli non allaqachon mavjud"); return;
    }
    const clean = aForm.ozIshlab
      ? aForm.mahsulotlar.filter(m=>parseFloat(m.miqdor)>0).map(m=>({ id:m.id,nom:m.nom,birlik:m.birlik,emoji:m.emoji,miqdor:parseFloat(m.miqdor)||0,narx:getEffectiveNarx(m) }))
      : [];
    const yangi = { id:aSelId||Date.now(),nom:aForm.nom.trim(),narx:parseFloat(aForm.narx)||0,nonSoni:parseFloat(aForm.nonSoni)||0,ozIshlab:aForm.ozIshlab,tashqariFoyda:parseFloat(aForm.tashqariFoyda)||0,mahsulotlar:clean };
    if (aSelId) { setNonlar(p=>p.map(n=>n.id===aSelId?yangi:n)); notify("Non yangilandi", "success"); }
    else        { setNonlar(p=>[...p,yangi]); notify("Non qo'shildi", "success"); }
    setAForm(EMPTY_NON); setASelId(null); setAView("list");
  };

  const deleteNon = () => { setNonlar(p=>p.filter(n=>n.id!==aSelId)); setAForm(EMPTY_NON); setASelId(null); setConfirmDelNon(false); setAView("list"); notify("Non o'chirildi", "success"); };
  const addMahsulot    = (mk) => { setAForm(p=>({...p,mahsulotlar:[...p.mahsulotlar,{id:mk.id,nom:mk.nom,birlik:mk.birlik,emoji:mk.emoji,miqdor:"",narx:""}]})); setShowAddProd(false); };
  const updateMahsulot = (id,field,val) => setAForm(p=>({...p,mahsulotlar:p.mahsulotlar.map(m=>m.id===id?{...m,[field]:val}:m)}));
  const removeMahsulot = (id) => setAForm(p=>({...p,mahsulotlar:p.mahsulotlar.filter(m=>m.id!==id)}));

  const statBox = (label,val,color) => (
    <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px" }}>
      <div style={{ fontSize:9,color:C.muted,marginBottom:3,textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:T.md,fontWeight:900,color }}>{val}</div>
    </div>
  );

  return (
    <div>
      {/* TABS */}
      <div style={{ display:"flex",gap:4,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:4,marginBottom:18 }}>
        {["assortiment","narxlar"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} className="btn"
            style={{ flex:1,border:"none",borderRadius:9,background:tab===t?C.accent:"transparent",color:tab===t?"#FFF3E8":C.sub,fontWeight:tab===t?800:500,fontSize:T.sm,padding:"8px 4px",cursor:"pointer",transition:"all 0.2s" }}>
            {t==="assortiment"?"Assortiment":"Mahsulot narxi"}
          </button>
        ))}
      </div>

      {/* ─── ASSORTIMENT ─── */}
      {tab==="assortiment" && (
        <div className="slide-up">
          {aView==="list" && (
            <div className="slide-up">
              <button onClick={newNonForm} className="btn"
                style={{ width:"100%",background:C.accent,border:"none",borderRadius:12,padding:"13px 16px",color:"#FFF3E8",fontSize:T.md,fontWeight:800,cursor:"pointer",marginBottom:16 }}>
                + Yangi non turi kiritish
              </button>

              {nonlar.length===0 && (
                <div style={{ textAlign:"center",padding:"48px 20px",color:C.muted }}>
                  <div style={{ fontSize:44,marginBottom:12,opacity:0.4 }}>🍞</div>
                  <div style={{ fontSize:T.md,fontWeight:600,color:C.sub,marginBottom:6 }}>Non turlari hali kiritilmagan</div>
                  <div style={{ fontSize:T.xs }}>Yuqoridagi tugmani bosib birinchi non turini qo'shing</div>
                </div>
              )}

              {nonlar.map((n,i)=>{
                const ns = n.nonSoni||0;
                const ingNarx = (n.mahsulotlar||[]).reduce((s,m)=>s+(parseFloat(m.narx)||0),0);
                const fyd = ns>0 ? ((n.narx*ns)-ingNarx)/ns : 0;
                const showOzFyd  = n.ozIshlab&&(n.mahsulotlar||[]).length>0&&ns>0;
                const tashqariFyd = parseFloat(n.tashqariFoyda)||0;
                const showTashqariFyd = (n.ozIshlab===false) && tashqariFyd>0;
                return (
                  <button key={n.id} onClick={()=>editNonForm(n)} className={`btn fade-in s${Math.min(i+1,5)}`}
                    style={{ width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,marginBottom:10,cursor:"pointer",textAlign:"left" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:40,height:40,borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>🍞</div>
                        <div>
                          <div style={{ fontSize:T.md,fontWeight:700,color:C.text }}>{n.nom}</div>
                          <div style={{ fontSize:T.xs,color:C.sub,marginTop:1 }}>
                            {n.ozIshlab===false ? "Tashqaridan keltiriladi" : `${ns} ta non / qop`}
                          </div>
                        </div>
                      </div>
                      <Badge color={C.accent}>{(n.narx||0).toLocaleString()} so'm</Badge>
                    </div>
                    {showOzFyd && (
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${C.borderSoft}`,paddingTop:8,marginTop:4 }}>
                        <span style={{ fontSize:T.xs,color:C.muted }}>Bitta non foydasi (ingredient)</span>
                        <span style={{ fontSize:T.sm,fontWeight:800,color:fyd>=0?C.green:C.red }}>
                          {fyd>=0?"+":""}{Math.round(fyd).toLocaleString()} so'm
                        </span>
                      </div>
                    )}
                    {showTashqariFyd && (
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${C.borderSoft}`,paddingTop:8,marginTop:4 }}>
                        <span style={{ fontSize:T.xs,color:C.muted }}>Bitta non foydasi (tashqaridan)</span>
                        <span style={{ fontSize:T.sm,fontWeight:800,color:C.green }}>
                          +{tashqariFyd.toLocaleString()} so'm
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {aView==="form" && (
            <div className="slide-up">
              <button onClick={()=>{ setAView("list"); setASelId(null); setConfirmDelNon(false); setShowAddProd(false); }}
                style={{ background:"none",border:"none",color:C.accent,fontSize:T.sm,cursor:"pointer",padding:"0 0 14px",fontWeight:700 }}>
                ← Orqaga qaytish
              </button>
              <div style={{ fontSize:18,fontWeight:900,color:C.text,marginBottom:18,fontFamily:"Georgia, serif" }}>
                {aSelId?"Tahrirlash":"Yangi non turi kiritish"}
              </div>

              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:T.xs,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:1 }}>Non nomi *</div>
                <input type="text" value={aForm.nom} onChange={e=>setAForm(p=>({...p,nom:e.target.value}))}
                  placeholder="Masalan: Issiq non" className={aFormErr&&!aForm.nom?"shake":""}
                  style={{ width:"100%",background:C.surface,border:`1px solid ${aFormErr&&!aForm.nom?C.red:C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:T.md }} />
              </div>

              {aForm.ozIshlab ? (
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:T.xs,color:C.muted,marginBottom:6,textTransform:"uppercase" }}>Bitta non narxi (so'm) *</div>
                    <input type="number" value={aForm.narx} onChange={e=>setAForm(p=>({...p,narx:e.target.value}))}
                      placeholder="8000" className={aFormErr&&!aForm.narx?"shake":""}
                      style={{ width:"100%",background:C.surface,border:`1px solid ${aFormErr&&!aForm.narx?C.red:C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:T.md }} />
                  </div>
                  <div>
                    <div style={{ fontSize:T.xs,color:C.muted,marginBottom:6,textTransform:"uppercase" }}>Qopdan chiqadigan non *</div>
                    <input type="number" value={aForm.nonSoni} onChange={e=>setAForm(p=>({...p,nonSoni:e.target.value}))}
                      placeholder="103" className={aFormErr&&!aForm.nonSoni?"shake":""}
                      style={{ width:"100%",background:C.surface,border:`1px solid ${aFormErr&&!aForm.nonSoni?C.red:C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:T.md }} />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:T.xs,color:C.muted,marginBottom:6,textTransform:"uppercase" }}>Bitta non narxi (so'm) *</div>
                  <input type="number" value={aForm.narx} onChange={e=>setAForm(p=>({...p,narx:e.target.value}))}
                    placeholder="8000" className={aFormErr&&!aForm.narx?"shake":""}
                    style={{ width:"100%",background:C.surface,border:`1px solid ${aFormErr&&!aForm.narx?C.red:C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:T.md }} />
                </div>
              )}

              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:T.xs,color:C.muted,marginBottom:10,textTransform:"uppercase" }}>Ishlab chiqarish usuli</div>
                <div style={{ display:"flex",gap:8 }}>
                  {[["🏭 O'zimizda pishiriladi",true],["🚚 Tashqaridan keltiriladi",false]].map(([l,v])=>(
                    <button key={String(v)} onClick={()=>setAForm(p=>({...p,ozIshlab:v}))}
                      style={{ flex:1,border:`1px solid ${aForm.ozIshlab===v?C.accent:C.border}`,background:aForm.ozIshlab===v?C.accent+"15":"transparent",borderRadius:10,padding:"10px 8px",fontSize:T.xs,color:aForm.ozIshlab===v?C.accent:C.sub,fontWeight:aForm.ozIshlab===v?800:400,cursor:"pointer" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {!aForm.ozIshlab && (
                <div className="fade-in" style={{ background:C.card,border:`1px solid ${C.green}40`,borderRadius:14,padding:14,marginBottom:14 }}>
                  <div style={{ fontSize:T.xs,color:C.green,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:10 }}>
                    💰 Non donasidan foyda
                  </div>
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase" }}>
                      Bitta nondan aniq foyda (so'm)
                    </div>
                    <input type="number"
                      value={aForm.tashqariFoyda||""}
                      onChange={e=>setAForm(p=>({...p,tashqariFoyda:e.target.value}))}
                      placeholder="Avtomatik: 2,000 so'm"
                      style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 12px",color:C.text,fontSize:T.sm,fontWeight:700 }} />
                  </div>
                  <div style={{ background:C.green+"10",border:`1px solid ${C.green}25`,borderRadius:9,padding:"8px 12px",fontSize:T.xs,color:C.muted }}>
                    💡 Bitta nondan foyda:{" "}
                    <span style={{ color:C.green,fontWeight:900 }}>
                      {(parseFloat(aForm.tashqariFoyda)||2000).toLocaleString()} so'm
                    </span>
                    {!aForm.tashqariFoyda && " (standart)"}
                  </div>
                </div>
              )}

              {aForm.ozIshlab && (
                <div className="fade-in">
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                    <div style={{ fontSize:T.xs,color:C.muted,textTransform:"uppercase",letterSpacing:1 }}>Bitta xamir (qop) ingredientlari</div>
                    {qoshilmagan.length>0 && !showAddProd && (
                      <button onClick={()=>setShowAddProd(true)}
                        style={{ background:C.accent+"20",border:`1px solid ${C.accent}40`,borderRadius:8,padding:"4px 10px",fontSize:T.xs,color:C.accent,fontWeight:700,cursor:"pointer" }}>
                        + Ingredient qo'shish
                      </button>
                    )}
                  </div>

                  {showAddProd && qoshilmagan.length>0 && (
                    <Card style={{ marginBottom:12 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                        <div style={{ fontSize:T.xs,color:C.muted,textTransform:"uppercase" }}>Ingredient tanlang</div>
                        <button onClick={()=>setShowAddProd(false)} style={{ background:"none",border:"none",color:C.muted,fontSize:T.md,cursor:"pointer" }}>✕</button>
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                        {qoshilmagan.map(mk=>(
                          <button key={mk.id} onClick={()=>addMahsulot(mk)}
                            style={{ display:"flex",alignItems:"center",gap:6,border:`1px solid ${C.border}`,background:C.surface,borderRadius:9,padding:"8px 10px",fontSize:T.sm,color:C.text,cursor:"pointer",textAlign:"left" }}>
                            <span>{mk.emoji}</span><span>{mk.nom}</span>
                          </button>
                        ))}
                      </div>
                    </Card>
                  )}

                  {aForm.mahsulotlar.length===0 && !showAddProd && (
                    <div style={{ textAlign:"center",padding:"20px 12px",color:C.muted,fontSize:T.xs,background:C.surface,border:`1px dashed ${C.border}`,borderRadius:10,marginBottom:14 }}>
                      Hozircha ingredientlar belgilanmagan. Yuqoridan qo'shing.
                    </div>
                  )}

                  {aForm.mahsulotlar.map(m=>{
                    const priceInfo  = mahsulotNarxlari[m.id];
                    const hasAutoPrice = priceInfo&&priceInfo.miqdor&&priceInfo.narx;
                    const autoNarxVal  = (hasAutoPrice&&m.miqdor)
                      ? Math.round((parseFloat(m.miqdor)/parseFloat(priceInfo.miqdor))*parseFloat(priceInfo.narx))
                      : null;
                    return (
                      <Card key={m.id} style={{ marginBottom:8,padding:12 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                            <span>{m.emoji}</span>
                            <span style={{ fontSize:T.sm,fontWeight:700,color:C.text }}>{m.nom}</span>
                          </div>
                          <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                            {hasAutoPrice&&(<span style={{ fontSize:9,color:C.green,background:C.green+"18",border:`1px solid ${C.green}30`,borderRadius:4,padding:"2px 6px",fontWeight:800 }}>●AUTO</span>)}
                            <button onClick={()=>removeMahsulot(m.id)} style={{ background:"none",border:"none",color:C.red,fontSize:T.md,cursor:"pointer" }}>🗑️</button>
                          </div>
                        </div>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                          <div>
                            <div style={{ fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase" }}>Miqdor ({m.birlik}) — 1 qopga</div>
                            <input type="number" value={m.miqdor} onChange={e=>updateMahsulot(m.id,"miqdor",e.target.value)} placeholder="0"
                              style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:T.sm,fontWeight:700 }} />
                          </div>
                          <div>
                            <div style={{ fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase" }}>
                              Narxi (so'm){autoNarxVal!==null?" — ✓ hisoblandi":" — 1 qopga"}
                            </div>
                            {autoNarxVal!==null ? (
                              <div style={{ background:C.green+"12",border:`1px solid ${C.green}35`,borderRadius:8,padding:"8px 10px",fontSize:T.sm,fontWeight:900,color:C.green,lineHeight:"20px" }}>
                                {autoNarxVal.toLocaleString()} so'm
                              </div>
                            ) : (
                              <input type="number" value={m.narx} onChange={e=>updateMahsulot(m.id,"narx",e.target.value)} placeholder="0"
                                style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:T.sm,fontWeight:700 }} />
                            )}
                          </div>
                        </div>
                        {hasAutoPrice&&priceInfo.miqdor&&priceInfo.narx&&(
                          <div style={{ marginTop:6,fontSize:9,color:C.muted }}>
                            💡 1{m.birlik} = {(parseFloat(priceInfo.narx)/parseFloat(priceInfo.miqdor)).toFixed(2)} so'm · "Mahsulot narxi" dan hisoblandi
                          </div>
                        )}
                      </Card>
                    );
                  })}

                  {aForm.mahsulotlar.length>0&&nonSoniVal>0&&sotuvNarxVal>0&&(
                    <Card accent style={{ marginTop:14,marginBottom:14 }}>
                      <div style={{ fontSize:T.xs,color:C.accent,fontWeight:700,marginBottom:14,textTransform:"uppercase" }}>📊 Avtomatik hisob-kitob</div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8 }}>
                        {statBox("Jami daromad / qop",`${jamiDaromad.toLocaleString()} so'm`,C.green)}
                        {statBox("Ingredient xarajati",`${jamiIngredientNarx.toLocaleString()} so'm`,C.text)}
                      </div>
                      <div style={{ background:jamiFoyda>=0?C.green+"12":C.red+"12",border:`1px solid ${jamiFoyda>=0?C.green:C.red}35`,borderRadius:12,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div>
                          <div style={{ fontSize:9,color:C.muted,textTransform:"uppercase",marginBottom:3 }}>Bitta xamirdan foyda</div>
                          <div style={{ fontSize:T.xl,fontWeight:900,color:jamiFoyda>=0?C.green:C.red }}>{jamiFoyda>=0?"+":""}{Math.round(jamiFoyda).toLocaleString()} so'm</div>
                        </div>
                        <div style={{ fontSize:26,opacity:0.5 }}>🌾</div>
                      </div>
                      <div style={{ background:bittaFoyda>=0?C.green+"15":C.red+"15",border:`1px solid ${bittaFoyda>=0?C.green:C.red}40`,borderRadius:12,padding:"14px 16px",textAlign:"center" }}>
                        <div style={{ fontSize:T.xs,color:C.muted,textTransform:"uppercase",marginBottom:4 }}>Bitta nondan sof foyda</div>
                        <div style={{ fontSize:32,fontWeight:900,color:bittaFoyda>=0?C.green:C.red }}>{bittaFoyda>=0?"+":""}{Math.round(bittaFoyda).toLocaleString()}</div>
                        <div style={{ fontSize:T.xs,color:C.muted,marginTop:2 }}>so'm</div>
                        <div style={{ marginTop:10,background:C.border,borderRadius:8,padding:"6px 10px",display:"inline-block",fontSize:9,color:C.muted }}>
                          ⚠️ Ishchilar haqi kiritilmagan — bu faqat ingredient xarajati
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              <div style={{ marginTop:20 }}><Btn onClick={saveNon}>✅ Ma'lumotlarni saqlash</Btn></div>

              {aSelId && (
                <div style={{ marginTop:12 }}>
                  {!confirmDelNon ? (
                    <button onClick={()=>setConfirmDelNon(true)}
                      style={{ width:"100%",background:"transparent",border:`1px solid ${C.red}50`,borderRadius:12,padding:"12px 16px",color:C.red,fontSize:T.sm,fontWeight:700,cursor:"pointer",marginTop:4 }}>
                      🗑️ Bu non turini o'chirish
                    </button>
                  ) : (
                    <div className="pop-in" style={{ background:C.redDim,border:`1px solid ${C.red}40`,borderRadius:14,padding:14,marginTop:4 }}>
                      <div style={{ fontSize:T.sm,color:C.text,fontWeight:700,marginBottom:10,textAlign:"center" }}>O'chirib yubormoqchimisiz?</div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                        <button onClick={()=>setConfirmDelNon(false)} style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:10,padding:10,color:C.sub,cursor:"pointer" }}>Bekor qilish</button>
                        <button onClick={deleteNon} style={{ border:"none",background:C.red,borderRadius:10,padding:10,color:"#fff",fontWeight:800,cursor:"pointer" }}>Ha, o'chirish</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── MAHSULOT NARXI ─── */}
      {tab==="narxlar" && (
        <div className="slide-up">
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:T.xs,color:C.sub,lineHeight:1.8 }}>
            💡 Har bir xomashyo uchun <span style={{ color:C.text,fontWeight:700 }}>qancha miqdori = qancha so'm</span> ekanini kiriting.
            Assortiment bo'limida gramm kiritganingizda narx <span style={{ color:C.green,fontWeight:700 }}>avtomatik</span> hisoblanadi.
          </div>

          {allMahsulotlar.map(mk => {
            const p = mahsulotNarxlari[mk.id]||{ miqdor:"",narx:"" };
            const gramNarx = (p.miqdor&&p.narx) ? parseFloat(p.narx)/parseFloat(p.miqdor) : null;
            const isSet = gramNarx!==null&&!isNaN(gramNarx);
            return (
              <div key={mk.id} style={{ background:C.card,border:`1px solid ${isSet?C.accent+"50":C.border}`,borderRadius:14,padding:14,marginBottom:10,transition:"border-color 0.3s" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                  <div style={{ width:36,height:36,borderRadius:9,background:isSet?C.accent+"18":C.surface,border:`1px solid ${isSet?C.accent+"40":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all 0.3s" }}>
                    {mk.emoji}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:T.sm,fontWeight:700,color:C.text }}>{mk.nom}</div>
                    <div style={{ fontSize:9,color:C.muted,marginTop:1 }}>{mk.birlik} bilan o'lchanadi</div>
                  </div>
                  {isSet ? (
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:T.xs,fontWeight:900,color:C.green }}>1{mk.birlik} = {gramNarx.toFixed(2)} so'm</div>
                      <div style={{ fontSize:9,color:C.muted,marginTop:1 }}>✓ Narx kiritilgan</div>
                    </div>
                  ) : (
                    <span style={{ fontSize:9,color:C.muted,background:C.border,borderRadius:4,padding:"3px 7px" }}>Kiritilmagan</span>
                  )}
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  <div>
                    <div style={{ fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase" }}>Miqdori ({mk.birlik})</div>
                    <input type="number" value={p.miqdor}
                      onChange={e=>setMahsulotNarxlari(prev=>({...prev,[mk.id]:{...(prev[mk.id]||{}),miqdor:e.target.value}}))}
                      placeholder={mk.birlik==="g"?"50000 (50 kg)":mk.birlik==="ml"?"10000 (10 L)":"1000"}
                      style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:T.sm,fontWeight:700 }} />
                  </div>
                  <div>
                    <div style={{ fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase" }}>Narxi (so'm)</div>
                    <input type="number" value={p.narx}
                      onChange={e=>setMahsulotNarxlari(prev=>({...prev,[mk.id]:{...(prev[mk.id]||{}),narx:e.target.value}}))}
                      placeholder="350000"
                      style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:T.sm,fontWeight:700 }} />
                  </div>
                </div>
                {isSet&&(
                  <div className="fade-in" style={{ marginTop:10,background:C.green+"10",border:`1px solid ${C.green}25`,borderRadius:8,padding:"7px 10px",fontSize:9,color:C.muted }}>
                    💡 Misol: 1000{mk.birlik} → <span style={{ color:C.green,fontWeight:800 }}>{(gramNarx*1000).toLocaleString(undefined,{maximumFractionDigits:0})} so'm</span>
                  </div>
                )}
              </div>
            );
          })}

          {showAddCustom ? (
            <div className="pop-in" style={{ background:C.card,border:`1px solid ${C.accent}40`,borderRadius:14,padding:16,marginTop:4 }}>
              <div style={{ fontSize:T.sm,fontWeight:800,color:C.accent,marginBottom:14 }}>📦 Yangi mahsulot qo'shish</div>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase" }}>Mahsulot nomi *</div>
                <input type="text" value={customForm.nom} onChange={e=>setCustomForm(p=>({...p,nom:e.target.value}))}
                  placeholder="Masalan: Zig'ir urug'i, Vanillin..."
                  style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 12px",color:C.text,fontSize:T.sm }} />
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:9,color:C.muted,marginBottom:8,textTransform:"uppercase" }}>O'lchov birligi</div>
                <div style={{ display:"flex",gap:6 }}>
                  {[["g","Gramm"],["ml","Millilitr"],["dona","Dona"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setCustomForm(p=>({...p,birlik:v}))}
                      style={{ flex:1,border:`1px solid ${customForm.birlik===v?C.accent:C.border}`,background:customForm.birlik===v?C.accent+"18":"transparent",borderRadius:9,padding:"9px 4px",fontSize:T.xs,color:customForm.birlik===v?C.accent:C.sub,cursor:"pointer",fontWeight:customForm.birlik===v?800:400 }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <button onClick={()=>{ setCustomForm({nom:"",birlik:"g"}); setShowAddCustom(false); }}
                  style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:10,padding:"11px 8px",color:C.sub,cursor:"pointer",fontSize:T.sm }}>Bekor qilish</button>
                <button onClick={saveCustomMahsulot}
                  style={{ border:"none",background:C.accent,borderRadius:10,padding:"11px 8px",color:"#FFF3E8",fontWeight:800,cursor:"pointer",fontSize:T.sm }}>✓ Saqlash</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setShowAddCustom(true)} className="btn"
              style={{ width:"100%",border:`1px dashed ${C.border}`,background:"transparent",borderRadius:12,padding:"13px 16px",color:C.muted,fontSize:T.sm,cursor:"pointer",marginTop:4 }}>
              + Yangi mahsulot qo'shish
            </button>
          )}

          {(() => {
            const count = allMahsulotlar.filter(mk=>{ const p=mahsulotNarxlari[mk.id]; return p&&p.miqdor&&p.narx; }).length;
            return count>0 ? (
              <div className="fade-in" style={{ marginTop:14,background:C.green+"10",border:`1px solid ${C.green}25`,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:T.xs,color:C.muted }}>Narxi kiritilgan mahsulotlar</span>
                <span style={{ fontSize:T.sm,fontWeight:900,color:C.green }}>{count} / {allMahsulotlar.length}</span>
              </div>
            ) : null;
          })()}
        </div>
      )}


    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── ISHCHILAR ──────────────────────────────────────────────────
// Bosqich 1 → "Ishdan ketgan" o'chirildi
// Bosqich 2 → tatilQaytishSana, qolgan kunlar hisoblagichi
// Bosqich 4 → tahrirSoni: 2 ta tahrirdan so'ng bloklash
// ═══════════════════════════════════════════════════════════════════
function Ishchilar({ ishchilar, setIshchilar, nonlar=[] }) {
  const [view, setView]           = useState("list");
  const [selId, setSelId]         = useState(null);
  // Bosqich 1: "Ishdan ketgan" filtrdan o'chirildi
  const [filter, setFilter]       = useState("Hammasi");
  const [form, setForm]           = useState(EMPTY_WORKER_FORM);
  const [calcVal, setCalcVal]     = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const [formErr, setFormErr]     = useState(false);
  // Bosqich 2: ta'til holat o'zgartirish uchun lokal sana input
  const [tatilSanaMode, setTatilSanaMode] = useState(false);
  const [tatilSanaInput, setTatilSanaInput] = useState("");

  const sel = ishchilar.find(w => w.id===selId);

  // Bosqich 1: "Ishdan ketgan" filterdan chiqarildi
  const filtered = filter==="Hammasi"
    ? ishchilar
    : ishchilar.filter(i => i.holat===filter);

  // Bosqich 1: hCol dan "Ishdan ketgan" o'chirildi
  const hCol = { Aktiv:C.green, "Ta'tilda":C.accent };

  const oylikTaxmin = (w) => {
    if (!w) return 0;
    const m = Number(w.miqdor)||0;
    if (w.haqTuri==="qop")    return m*500;
    if (w.haqTuri==="kunlik") return m*26;
    return 0;
  };

  // Bosqich 4: Yangi xodim saqlash — tahrirSoni: 0 dan boshlanadi
  // Bosqich 4: Mavjud xodim tahrirlash — tahrirSoni + 1
  const saveWorker = () => {
    const isQop = form.haqTuri === "qop";
    const turlari = form.nonTurlari || [];
    const narxlari = form.nonNarxlari || {};
    // Qop turi: kamida bitta non turi tanlangan va har birining narxi kiritilgan bo'lishi shart
    const qopValid = isQop
      ? turlari.length > 0 && turlari.every(nm => parseFloat(narxlari[nm]) > 0)
      : !!form.miqdor;
    if (!form.ism.trim() || !qopValid || (form.lavozimId==="boshqasi" && !form.lavozimCustom.trim())) {
      setFormErr(true); setTimeout(()=>setFormErr(false),600);
      if (!form.ism.trim()) notify("Xodim ismini kiriting");
      else if (form.lavozimId==="boshqasi" && !form.lavozimCustom.trim()) notify("Lavozim nomini kiriting");
      else notify(isQop ? "Non turi va narxini kiriting" : "Ish haqi miqdorini kiriting");
      return;
    }
    // Duplikat xodim ismi taqiqlanadi
    const ismDup = (ishchilar||[]).some(w => (w.ism||"").trim().toLowerCase() === form.ism.trim().toLowerCase() && w.id !== selId);
    if (ismDup) {
      setFormErr(true); setTimeout(()=>setFormErr(false),600);
      notify("Bu ismli xodim allaqachon mavjud"); return;
    }
    // Qopchilar uchun miqdor sifatida birinchi non narxini olamiz (fallback)
    const finalMiqdor = isQop
      ? (parseInt(narxlari[turlari[0]]) || 0)
      : (parseInt(form.miqdor) || 0);
    if (selId) {
      // Mavjud xodimni tahrirlash (Bosqich 4)
      setIshchilar(p => p.map(w => w.id===selId ? {
        ...w, ...form,
        miqdor: finalMiqdor,
      } : w));
      notify("Xodim yangilandi", "success");
    } else {
      // Yangi xodim qo'shish
      setIshchilar(p => [...p, {
        ...form,
        id: Date.now(),
        miqdor: finalMiqdor,
      }]);
      notify("Xodim qo'shildi", "success");
    }
    setForm(EMPTY_WORKER_FORM); setSelId(null); setView("list");
  };

  const deleteWorker = () => {
    setIshchilar(p => p.filter(w => w.id!==selId));
    setSelId(null); setView("list"); setConfirmDel(false);
    notify("Xodim o'chirildi", "success");
  };

  // ── FORM ──
  if (view==="form") {
    const isEdit = !!selId;
    return (
      <div className="slide-up">
        <button onClick={()=>{ setView("list"); setSelId(null); }}
          style={{ background:"none",border:"none",color:C.accent,fontSize:T.sm,cursor:"pointer",padding:"0 0 16px",fontWeight:700 }}>
          ← Orqaga qaytish
        </button>
        <div style={{ fontSize:18,fontWeight:900,color:C.text,marginBottom:18,fontFamily:"Georgia, serif" }}>
          {isEdit ? "✏️ Xodimni tahrirlash" : "Yangi ishchi kiritish"}
        </div>

        {/* F.I.SH */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:T.xs,color:C.muted,marginBottom:6,textTransform:"uppercase" }}>F.I.SH *</div>
          <input type="text" value={form.ism} onChange={e=>setForm(p=>({...p,ism:e.target.value}))}
            placeholder="Xodim ismini kiriting" className={formErr&&!form.ism?"shake":""}
            style={{ width:"100%",background:C.surface,border:`1px solid ${formErr&&!form.ism?C.red:C.border}`,borderRadius:10,padding:"11px 14px",color:C.text }} />
        </div>

        {/* Lavozim */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:T.xs,color:C.muted,marginBottom:10,textTransform:"uppercase" }}>Lavozimi *</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            {LAVOZIMLAR.map(lav=>(
              <button key={lav.id} onClick={()=>setForm(p=>({...p,lavozimId:lav.id,lavozimCustom:""}))}
                style={{ border:`1px solid ${form.lavozimId===lav.id?C.accent:C.border}`,background:form.lavozimId===lav.id?C.accent+"18":"transparent",borderRadius:10,padding:"10px 8px",fontSize:T.sm,color:form.lavozimId===lav.id?C.accent:C.sub,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                <span style={{ fontSize:20 }}>{lav.emoji}</span>
                <span>{lav.label}</span>
              </button>
            ))}
          </div>
          {form.lavozimId==="boshqasi" && (
            <input type="text" value={form.lavozimCustom} onChange={e=>setForm(p=>({...p,lavozimCustom:e.target.value}))}
              placeholder="Maxsus lavozim nomini kiriting..."
              style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,marginTop:10 }} />
          )}
        </div>

        {/* Ish haqi */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:T.xs,color:C.muted,marginBottom:10,textTransform:"uppercase" }}>Ish haqi turi *</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            {[["qop","🌾 Qop boshiga"],["kunlik","📅 Kunlik fix"]].map(([v,l])=>(
              <button key={v} onClick={()=>setForm(p=>({...p,haqTuri:v}))}
                style={{ border:`1px solid ${form.haqTuri===v?C.accent:C.border}`,background:form.haqTuri===v?C.accent+"18":"transparent",borderRadius:10,padding:"12px 8px",fontSize:T.sm,color:form.haqTuri===v?C.accent:C.sub,cursor:"pointer" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {form.haqTuri==="kunlik" && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:T.xs,color:C.muted,marginBottom:6,textTransform:"uppercase" }}>Kunlik stavkasi (so'm) *</div>
            <input type="number" value={form.miqdor} onChange={e=>setForm(p=>({...p,miqdor:e.target.value}))}
              placeholder="Masalan: 80000"
              className={formErr&&!form.miqdor?"shake":""}
              style={{ width:"100%",background:C.surface,border:`1px solid ${formErr&&!form.miqdor?C.red:C.border}`,borderRadius:10,padding:"11px 14px",color:C.text }} />
          </div>
        )}

        {form.haqTuri==="qop" && nonlar.filter(n=>n.ozIshlab!==false).length>0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:T.xs,color:C.muted,marginBottom:10,textTransform:"uppercase" }}>Qaysi non qopidan haq oladi? (har biri uchun narx kiriting) *</div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {nonlar.filter(n=>n.ozIshlab!==false).map(n=>{
                const tanlangan = (form.nonTurlari||[]).includes(n.nom);
                return (
                  <div key={n.id} style={{ border:`1px solid ${tanlangan?C.accent:C.border}`,background:tanlangan?C.accent+"08":"transparent",borderRadius:10,padding:"10px 12px" }}>
                    <button onClick={()=>setForm(p=>{
                      const arr = p.nonTurlari||[];
                      const yangiArr = tanlangan ? arr.filter(x=>x!==n.nom) : [...arr, n.nom];
                      const yangiNarxlari = {...(p.nonNarxlari||{})};
                      if (tanlangan) delete yangiNarxlari[n.nom];
                      return {...p, nonTurlari: yangiArr, nonNarxlari: yangiNarxlari};
                    })}
                      style={{ width:"100%",background:"none",border:"none",fontSize:T.sm,color:tanlangan?C.accent:C.sub,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",padding:0,marginBottom:tanlangan?8:0 }}>
                      <span>🍞 {n.nom}</span>
                      {tanlangan && <span style={{ color:C.accent,fontSize:14 }}>✓</span>}
                    </button>
                    {tanlangan && (
                      <div>
                        <div style={{ fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase" }}>Bu nondan oladigan haq (so'm/qop)</div>
                        <input
                          type="number"
                          value={((form.nonNarxlari||{})[n.nom])||""}
                          onChange={e=>setForm(p=>({...p, nonNarxlari:{...(p.nonNarxlari||{}),[n.nom]:e.target.value}}))}
                          placeholder="Masalan: 35000"
                          style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:T.sm,fontWeight:700 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {(form.nonTurlari||[]).length>0 && (
              <div style={{ marginTop:8,fontSize:T.xs,color:C.muted }}>
                ℹ️ <span style={{ color:C.accent,fontWeight:700 }}>{(form.nonTurlari||[]).join(", ")}</span> qoplaridan haq hisoblanadi
              </div>
            )}
          </div>
        )}

        {/* Telefon */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:T.xs,color:C.muted,marginBottom:6,textTransform:"uppercase" }}>Telefon raqami</div>
          <input type="tel" value={form.tel} onChange={e=>setForm(p=>({...p,tel:e.target.value}))}
            placeholder="+998 90 000-00-00"
            style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text }} />
        </div>

        {/* Holat — Bosqich 1: "Ishdan ketgan" o'chirildi */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:T.xs,color:C.muted,marginBottom:10,textTransform:"uppercase" }}>Holati</div>
          <div style={{ display:"flex",gap:8 }}>
            {[["Aktiv",C.green],["Ta'tilda",C.accent]].map(([h,c])=>(
              <button key={h} onClick={()=>setForm(p=>({...p,holat:h}))}
                style={{ flex:1,border:`1px solid ${form.holat===h?c:C.border}`,background:form.holat===h?c+"15":"transparent",borderRadius:10,padding:"10px 8px",fontSize:T.sm,color:form.holat===h?c:C.sub,cursor:"pointer" }}>
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            BOSQICH 2: "Ta'tilda" tanlanganda qaytish sanasi
        ═══════════════════════════════════════════════════════ */}
        {form.holat==="Ta'tilda" && (
          <div className="pop-in" style={{ background:C.accent+"08",border:`1px solid ${C.accent}30`,borderRadius:12,padding:14,marginBottom:16 }}>
            <div style={{ fontSize:T.xs,color:C.accent,fontWeight:700,marginBottom:8 }}>
              🏖️ Ta'tildan qaytish sanasi
            </div>
            <input type="date" value={form.tatilQaytishSana}
              onChange={e=>setForm(p=>({...p,tatilQaytishSana:e.target.value}))}
              style={{ width:"100%",background:C.surface,border:`1px solid ${C.accent}40`,borderRadius:9,padding:"10px 12px",color:C.text,fontSize:T.sm,colorScheme:"dark" }} />
            {form.tatilQaytishSana && (() => {
              const kun = qolganKunlarHisob(form.tatilQaytishSana);
              if (kun===null) return null;
              return (
                <div style={{ marginTop:8,fontSize:T.xs,color:kun<0?C.red:kun===0?C.green:C.accent,fontWeight:700 }}>
                  {kun<0 ? `⚠️ Qaytish sanasi ${Math.abs(kun)} kun o'tib ketdi!`
                         : kun===0 ? "✅ Bugun qaytishi kerak"
                         : `⏳ ${kun} kun qoldi`}
                </div>
              );
            })()}
          </div>
        )}

        <Btn onClick={saveWorker}>✅ Ishchini saqlash</Btn>
      </div>
    );
  }

  // ── DETAIL ──
  if (view==="detail" && sel) {
    const miqdor = Number(sel.miqdor)||0;
    const maosh  = (Number(calcVal)||0)*miqdor;
    // Bosqich 4: tahrirlash bloki
    const tahrirSoni  = sel.tahrirSoni||0;
    const tahrirMumkin = tahrirSoni < 2;
    // Bosqich 2: ta'til ma'lumotlari
    const qolganKun = sel.holat==="Ta'tilda" ? qolganKunlarHisob(sel.tatilQaytishSana) : null;

    return (
      <div className="slide-up">
        <button onClick={()=>{ setView("list"); setSelId(null); setTatilSanaMode(false); }}
          style={{ background:"none",border:"none",color:C.accent,fontSize:T.sm,cursor:"pointer",padding:"0 0 14px",fontWeight:700 }}>
          ← Orqaga qaytish
        </button>

        {/* Asosiy karta */}
        <Card style={{ marginBottom:12 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:52,height:52,borderRadius:14,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,overflow:"hidden",border:`1px solid ${C.borderSoft}` }}>
                {getLavozimEmoji(sel)}
              </div>
              <div>
                <div style={{ fontSize:22,fontWeight:900,color:C.text,fontFamily:"Georgia, serif" }}>{sel.ism}</div>
                <div style={{ fontSize:T.sm,color:C.sub }}>{getLavozimLabel(sel)}</div>
              </div>
            </div>
            <Badge color={hCol[sel.holat]||C.muted}>{sel.holat}</Badge>
          </div>

          {[
            ["Telefon", sel.tel||"Kiritilmagan"],
            ["Tarif stavkasi", sel.haqTuri==="qop"
              ? (sel.nonTurlari||[]).length>0
                ? (sel.nonTurlari||[]).map(nom=>`${nom}: ${((sel.nonNarxlari||{})[nom]||sel.miqdor||0).toLocaleString()} so'm/qop`).join(" · ")
                : `${miqdor.toLocaleString()} so'm / qop`
              : `${miqdor.toLocaleString()} so'm / kun`],
            ["Taxminiy oylik", `${oylikTaxmin(sel).toLocaleString()} so'm`],
          ].map(([l,v])=>(
            <div key={l} style={{ display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.borderSoft}` }}>
              <span style={{ fontSize:T.sm,color:C.sub }}>{l}</span>
              <span style={{ fontSize:T.sm,fontWeight:600,color:C.text }}>{v}</span>
            </div>
          ))}

          {/* ═══════════════════════════════════════════════════════
              BOSQICH 2: Ta'til ma'lumotlari — qolgan kunlar
          ═══════════════════════════════════════════════════════ */}
          {sel.holat==="Ta'tilda" && (
            <div className="pop-in" style={{ marginTop:12,background:C.accent+"10",border:`1px solid ${C.accent}30`,borderRadius:10,padding:12 }}>
              <div style={{ fontSize:9,color:C.accent,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>
                🏖️ Ta'til ma'lumotlari
              </div>
              {sel.tatilQaytishSana ? (
                <>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                    <span style={{ fontSize:T.xs,color:C.sub }}>Qaytish sanasi</span>
                    <span style={{ fontSize:T.xs,fontWeight:700,color:C.text }}>{sel.tatilQaytishSana}</span>
                  </div>
                  {qolganKun !== null && (
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6,padding:"8px 10px",background:qolganKun<0?C.red+"15":qolganKun===0?C.green+"15":C.accent+"15",borderRadius:8 }}>
                      <span style={{ fontSize:T.xs,color:C.sub }}>
                        {qolganKun<0 ? "Qaytish kechikdi" : qolganKun===0 ? "Bugun qaytishi kerak" : "Qaytishga qoldi"}
                      </span>
                      <span style={{ fontSize:T.lg,fontWeight:900,color:qolganKun<0?C.red:qolganKun===0?C.green:C.accent }}>
                        {qolganKun<0 ? `${Math.abs(qolganKun)} kun` : qolganKun===0 ? "Bugun!" : `${qolganKun} kun`}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize:T.xs,color:C.muted }}>⚠️ Qaytish sanasi belgilanmagan</div>
              )}
            </div>
          )}
        </Card>



        {/* ═══════════════════════════════════════════════════════
            BOSQICH 1 + 2: Holat o'zgartirish — "Ishdan ketgan" yo'q
                           Ta'tilda bosilganda sana kiritish paydo bo'ladi
        ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:T.xs,color:C.muted,marginBottom:8,textTransform:"uppercase" }}>Holatni o'zgartirish</div>
          <div style={{ display:"flex",gap:8,marginBottom: tatilSanaMode?10:0 }}>
            {/* Bosqich 1: faqat Aktiv va Ta'tilda */}
            {[["Aktiv",C.green],["Ta'tilda",C.accent]].map(([h,c])=>(
              <button key={h} onClick={()=>{
                if (h==="Ta'tilda") {
                  setTatilSanaMode(true);
                  setTatilSanaInput(sel.tatilQaytishSana||"");
                } else {
                  setTatilSanaMode(false);
                  setIshchilar(p=>p.map(w=>w.id===sel.id?{...w,holat:h,tatilQaytishSana:""}:w));
                }
              }}
                style={{ flex:1,border:`1px solid ${sel.holat===h?c:C.border}`,background:sel.holat===h?c+"15":"transparent",borderRadius:10,padding:"9px 4px",fontSize:10,color:sel.holat===h?c:C.sub,cursor:"pointer" }}>
                {h}
              </button>
            ))}
          </div>

          {/* Bosqich 2: Ta'tilda sana kiritish */}
          {tatilSanaMode && (
            <div className="pop-in" style={{ background:C.accent+"08",border:`1px solid ${C.accent}30`,borderRadius:10,padding:12 }}>
              <div style={{ fontSize:9,color:C.accent,fontWeight:800,marginBottom:8 }}>📅 Qaytish sanasini belgilang</div>
              <input type="date" value={tatilSanaInput}
                onChange={e=>setTatilSanaInput(e.target.value)}
                style={{ width:"100%",background:C.surface,border:`1px solid ${C.accent}40`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:T.sm,colorScheme:"dark",marginBottom:8 }} />
              {tatilSanaInput && (() => {
                const kun = qolganKunlarHisob(tatilSanaInput);
                if (kun===null) return null;
                return (
                  <div style={{ fontSize:T.xs,color:kun<0?C.red:C.accent,fontWeight:700,marginBottom:8 }}>
                    {kun<0?`⚠️ ${Math.abs(kun)} kun o'tib ketdi`:kun===0?"Bugun qaytishi kerak":`${kun} kun qoldi`}
                  </div>
                );
              })()}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <button onClick={()=>setTatilSanaMode(false)}
                  style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:8,padding:"8px",color:C.sub,cursor:"pointer",fontSize:T.xs }}>
                  Bekor
                </button>
                <button onClick={()=>{
                  setIshchilar(p=>p.map(w=>w.id===sel.id?{...w,holat:"Ta'tilda",tatilQaytishSana:tatilSanaInput}:w));
                  setTatilSanaMode(false);
                }}
                  style={{ border:"none",background:C.accent,borderRadius:8,padding:"8px",color:"#FFF3E8",fontWeight:800,cursor:"pointer",fontSize:T.xs }}>
                  ✓ Saqlash
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            BOSQICH 4: Tahrirlash tugmasi — 2 ta limit
        ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom:12 }}>
          <button onClick={()=>{
            setForm({
              ism: sel.ism,
              lavozimId: sel.lavozimId,
              lavozimCustom: sel.lavozimCustom||"",
              haqTuri: sel.haqTuri,
              miqdor: String(sel.miqdor||""),
              tel: sel.tel||"",
              holat: sel.holat,
              tatilQaytishSana: sel.tatilQaytishSana||"",
              nonTurlari: sel.nonTurlari||[],
              nonNarxlari: sel.nonNarxlari||{},
            });
            setView("form");
          }} className="btn"
            style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 16px",color:C.text,fontSize:T.sm,fontWeight:700,cursor:"pointer",marginBottom:8 }}>
            ✏️ Ma'lumotlarni tahrirlash
          </button>
        </div>

        {/* O'chirish */}
        {!confirmDel ? (
          <button onClick={()=>setConfirmDel(true)}
            style={{ width:"100%",background:"transparent",border:`1px solid ${C.red}50`,borderRadius:12,padding:"12px 16px",color:C.red,fontSize:T.sm,fontWeight:700,cursor:"pointer",marginTop:4 }}>
            🗑️ Ishchini o'chirish
          </button>
        ) : (
          <div className="pop-in" style={{ background:C.redDim,border:`1px solid ${C.red}40`,borderRadius:14,padding:14,marginTop:4 }}>
            <div style={{ fontSize:T.sm,color:C.text,fontWeight:700,marginBottom:4,textAlign:"center" }}>Ishchini o'chirib yubormoqchimisiz?</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10 }}>
              <button onClick={()=>setConfirmDel(false)} style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:10,padding:10,color:C.sub,cursor:"pointer" }}>Bekor qilish</button>
              <button onClick={deleteWorker} style={{ border:"none",background:C.red,borderRadius:10,padding:10,color:"#fff",fontWeight:800,cursor:"pointer" }}>Ha, o'chirish</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── LIST ──
  return (
    <div className="slide-up">
      {/* Statistika */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14 }}>
          <div style={{ fontSize:T.xs,color:C.muted,marginBottom:4 }}>Aktiv xodimlar</div>
          <div style={{ fontSize:T.xxl,fontWeight:900,color:C.accent }}>{ishchilar.filter(i=>i.holat==="Aktiv").length}</div>
          <div style={{ fontSize:T.xs,color:C.muted }}>nafar</div>
        </div>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14 }}>
          <div style={{ fontSize:T.xs,color:C.muted,marginBottom:4 }}>Oylik fond (taxm.)</div>
          <div style={{ fontSize:T.lg,fontWeight:900,color:C.green,marginTop:4 }}>
            {ishchilar.filter(i=>i.holat==="Aktiv").reduce((s,i)=>{
              const m = Number(i.miqdor)||0;
              if (i.haqTuri==="qop")    return s+m*500;
              if (i.haqTuri==="kunlik") return s+m*26;
              return s;
            },0).toLocaleString()}
          </div>
          <div style={{ fontSize:T.xs,color:C.muted,marginTop:2 }}>so'm / oy</div>
        </div>
      </div>

      <button onClick={()=>{ setForm(EMPTY_WORKER_FORM); setSelId(null); setView("form"); }} className="btn"
        style={{ width:"100%",background:C.accent,border:"none",borderRadius:12,padding:"13px 16px",color:"#FFF3E8",fontSize:T.md,fontWeight:800,cursor:"pointer",marginBottom:16 }}>
        + Yangi ishchi kiritish
      </button>

      {/* Bosqich 1: "Ishdan ketgan" filtrdan o'chirildi */}
      <div style={{ display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2 }}>
        {["Hammasi","Aktiv","Ta'tilda"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{ flexShrink:0,border:`1px solid ${filter===f?C.accent:C.border}`,background:filter===f?C.accent+"20":"transparent",borderRadius:20,padding:"6px 14px",fontSize:T.xs,color:filter===f?C.accent:C.muted,fontWeight:filter===f?700:400,cursor:"pointer" }}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length===0 && (
        <div style={{ textAlign:"center",padding:"48px 20px",color:C.muted }}>
          <div style={{ fontSize:44,marginBottom:12,opacity:0.4 }}>👥</div>
          <div style={{ fontSize:T.md,fontWeight:600,color:C.sub,marginBottom:6 }}>Xodimlar hali kiritilmagan</div>
          <div style={{ fontSize:T.xs }}>Yuqoridagi tugmani bosib birinchi xodimni qo'shing</div>
        </div>
      )}

      {filtered.map((w,i)=>{
        // Bosqich 2: Ta'tilda bo'lsa qolgan kunlarni ko'rsat
        const qKun = w.holat==="Ta'tilda" ? qolganKunlarHisob(w.tatilQaytishSana) : null;
        return (
          <button key={w.id}
            onClick={()=>{ setSelId(w.id); setView("detail"); setCalcVal(""); setConfirmDel(false); setTatilSanaMode(false); }}
            className={`btn fade-in s${Math.min(i+1,5)}`}
            style={{ width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,marginBottom:10,cursor:"pointer",textAlign:"left" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:40,height:40,borderRadius:10,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,overflow:"hidden",border:`1px solid ${C.borderSoft}` }}>
                  {getLavozimEmoji(w)}
                </div>
                <div>
                  <div style={{ fontSize:T.md,fontWeight:700,color:C.text }}>{w.ism}</div>
                  <div style={{ fontSize:T.xs,color:C.sub,marginTop:1 }}>{getLavozimLabel(w)}</div>
                </div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4 }}>
                <Badge color={hCol[w.holat]||C.muted}>{w.holat}</Badge>
                {/* Bosqich 2: Ta'tilda bo'lsa qolgan kunlar */}
                {qKun !== null && (
                  <span style={{ fontSize:9,color:qKun<0?C.red:qKun===0?C.green:C.accent,fontWeight:700,background:qKun<0?C.red+"15":qKun===0?C.green+"15":C.accent+"12",borderRadius:4,padding:"2px 6px" }}>
                    {qKun<0?`${Math.abs(qKun)} kun kechikdi`:qKun===0?"Bugun qaytadi":`${qKun} kun qoldi`}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10 }}>
              <div style={{ fontSize:T.xs,color:C.muted }}>📞 {w.tel||"—"}</div>
              <div style={{ fontSize:T.xs,fontWeight:700,color:C.accent }}>
                {w.haqTuri==="qop"?`${(Number(w.miqdor)||0).toLocaleString()} so'm/qop`:`${(Number(w.miqdor)||0).toLocaleString()} so'm/kun`}
              </div>
            </div>

          </button>
        );
      })}
    </div>
  );
}

// ─── OMBOR ───────────────────────────────────────────────────────
const OMBOR_MAYDONLAR = [
  { id:"oqUn",     nom:"Oq un",              birlik:"kg",     emoji:"🌾" },
  { id:"sariqUn",  nom:"Sariq un",           birlik:"kg",     emoji:"🌾" },
  { id:"qoraUn",   nom:"Qora un",            birlik:"kg",     emoji:"🌾" },
  { id:"sut",      nom:"Sut",                birlik:"litr",   emoji:"🥛" },
  { id:"yog",      nom:"Yog'",               birlik:"litr",   emoji:"🫗" },
  { id:"jir",      nom:"Jir (hayvon yog')",  birlik:"kg",     emoji:"🥓" },
  { id:"quruqSut", nom:"Quruq sut",          birlik:"kg",     emoji:"🥄" },
  { id:"achitqi",  nom:"Achitqi (Droja)",    birlik:"kg",     emoji:"🍞" },
  { id:"shakar",   nom:"Shakar",             birlik:"kg",     emoji:"🍬" },
  { id:"tuz",      nom:"Tuz",                birlik:"kg",     emoji:"🧂" },
];

// Hisobot ko'rinishi uchun birlik konvertatsiyasi: "un" → qop (50 kg = 1 qop),
// "yog'" → plastik quti (5 litr = 1 quti). Saqlangan qiymatlar kg/litr da qoladi.
const HISOBOT_UN_IDLAR = ["oqUn", "sariqUn", "qoraUn"];
function hisobotBirlik(id, qiymat, aslBirlik) {
  if (HISOBOT_UN_IDLAR.includes(id)) return { qiymat: qiymat / 50, birlik: "qop" };
  if (id === "yog")                  return { qiymat: qiymat / 5,  birlik: "plastik quti" };
  return { qiymat, birlik: aslBirlik };
}

const EMPTY_OMBOR_FORM = () => ({
  sana: new Date().toISOString().split("T")[0],
  ...Object.fromEntries(OMBOR_MAYDONLAR.map(m => [m.id, ""]))
});

const SET_MAHSULOTLAR = [
  { id:"oqUn",    nom:"Oq un",             birlik:"kg",     emoji:"🌾" },
  { id:"sariqUn", nom:"Sariq un",           birlik:"kg",     emoji:"🌾" },
  { id:"qoraUn",  nom:"Qora un",            birlik:"kg",     emoji:"🌾" },
  { id:"sut",     nom:"Sut",               birlik:"litr",   emoji:"🥛" },
  { id:"yog",     nom:"Yog'",              birlik:"litr",   emoji:"🫗" },
  { id:"jir",     nom:"Jir (hayvon yog')", birlik:"kg",     emoji:"🥓" },
  { id:"quruqSut",nom:"Quruq sut",         birlik:"kg",     emoji:"🥄" },
  { id:"achitqi", nom:"Achitqi (Droja)",   birlik:"kg",     emoji:"🍞" },
  { id:"shakar",  nom:"Shakar",            birlik:"kg",     emoji:"🍬" },
  { id:"tuz",     nom:"Tuz",               birlik:"kg",     emoji:"🧂" },
];

const EMPTY_SET_FORM = () => Object.fromEntries(SET_MAHSULOTLAR.map(m=>[m.id,""]));

function YangiSetForma({ omborlar, setOmborlar, onClose }) {
  const [sf, setSf] = useState(EMPTY_SET_FORM());
  const [editId, setEditId] = useState(null);
  const [delConfirmId, setDelConfirmId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const jami = SET_MAHSULOTLAR.reduce((s,m)=>s+(parseFloat(sf[m.id])||0),0);

  const openNew = () => { setSf(EMPTY_SET_FORM()); setEditId(null); setShowForm(true); };
  const openEdit = (h) => {
    const f = {};
    SET_MAHSULOTLAR.forEach(m=>{ f[m.id] = h.maydonlar.find(x=>x.id===m.id)?.qiymat||""; });
    setSf(f); setEditId(h.id); setShowForm(true);
  };
  const closeForm = () => { setSf(EMPTY_SET_FORM()); setEditId(null); setShowForm(false); };

  const saveSet = () => {
    const filled = SET_MAHSULOTLAR.some(m=>parseFloat(sf[m.id])>0);
    if (!filled) return;
    const entry = {
      id: editId || Date.now(),
      sana: new Date().toISOString().split("T")[0],
      vaqt: editId ? (omborlar.find(x=>x.id===editId)?.vaqt || Date.now()) : Date.now(),
      turi: "yangiset",
      maydonlar: SET_MAHSULOTLAR.map(m => ({ ...m, qiymat: parseFloat(sf[m.id]) || 0 }))
    };
    if (editId) { setOmborlar(p=>p.map(x=>x.id===editId?entry:x)); }
    else        { setOmborlar(p=>[entry,...p]); }
    closeForm();
  };

  return (
    <div>
      {!showForm && (
        <button onClick={openNew} className="btn"
          style={{ width:"100%",background:C.blue,border:"none",borderRadius:12,padding:"13px 10px",color:"#fff",fontSize:T.sm,fontWeight:800,cursor:"pointer",marginBottom:16 }}>
          + Yangi set kiritish
        </button>
      )}

      {showForm && (
        <div className="pop-in" style={{ background:C.card,border:`1px solid ${C.blue}40`,borderRadius:16,padding:16,marginBottom:16 }}>
          <div style={{ fontSize:T.sm,fontWeight:800,color:C.blue,marginBottom:14 }}>
            📦 {editId?"Setni tahrirlash":"Yangi keltirilgan mahsulotlar seti"}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>
            {SET_MAHSULOTLAR.map(m=>{
              const isUn = m.id==="oqUn" || m.id==="sariqUn" || m.id==="qoraUn";
              const qty = parseFloat(sf[m.id])||0;
              return (
                <div key={m.id}>
                  <div style={{ fontSize:9,color:C.sub,marginBottom:4,fontWeight:700 }}>{m.emoji} {m.nom} ({m.birlik})</div>
                  <input type="number" value={sf[m.id]}
                    onChange={e=>setSf(p=>({...p,[m.id]:e.target.value}))}
                    placeholder={isUn?"50 kg = 1 qop":"0"}
                    style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 11px",color:C.text,fontSize:T.sm,fontWeight:600 }} />
                  {isUn && qty>0 && (
                    <div style={{ fontSize:9,color:C.muted,marginTop:3 }}>≈ {(qty/50).toFixed(1)} qop</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ background:C.blue+"10",border:`1px solid ${C.blue}25`,borderRadius:10,padding:"10px 14px",marginBottom:10 }}>
            <div style={{ fontSize:T.xs,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:1 }}>Keltirilgan mahsulotlar</div>
            {SET_MAHSULOTLAR.filter(m=>parseFloat(sf[m.id])>0).length===0 ? (
              <div style={{ fontSize:T.xs,color:C.muted }}>Hali kiritilmagan</div>
            ) : (
              SET_MAHSULOTLAR.filter(m=>parseFloat(sf[m.id])>0).map(m=>(
                <div key={m.id} style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                  <span style={{ fontSize:T.xs,color:C.sub }}>{m.emoji} {m.nom}</span>
                  <span style={{ fontSize:T.xs,fontWeight:800,color:C.blue }}>{parseFloat(sf[m.id])||0} {m.birlik}</span>
                </div>
              ))
            )}
            <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:6,display:"flex",justifyContent:"space-between" }}>
              <span style={{ fontSize:T.xs,color:C.muted }}>Umumiy pozitsiyalar</span>
              <span style={{ fontSize:T.sm,fontWeight:900,color:C.blue }}>{SET_MAHSULOTLAR.filter(m=>parseFloat(sf[m.id])>0).length} xil · {jami.toFixed(1)} umumiy</span>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            <button onClick={closeForm}
              style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:10,padding:"11px 8px",color:C.sub,cursor:"pointer",fontSize:T.sm }}>
              Bekor
            </button>
            <button onClick={saveSet}
              style={{ border:"none",background:C.blue,borderRadius:10,padding:"11px 8px",color:"#fff",fontWeight:800,cursor:"pointer",fontSize:T.sm }}>
              ✓ Saqlash
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function Ombor({ omborlar, setOmborlar, hisobotlarTarixi=[], setHisobotlarTarixi, nonlar=[], mahsulotNarxlari={}, tasdiqlanganKunlar=[], setTasdiqlanganKunlar }) {
  const [showForm, setShowForm]         = useState(false);
  const [hisobotTuri, setHisobotTuri]   = useState(null); // null | "yangiset" | "ayirish"
  const [form, setForm]                 = useState(EMPTY_OMBOR_FORM());
  const [err, setErr]                   = useState(false);
  const [editId, setEditId]             = useState(null);
  const [delConfirmId, setDelConfirmId] = useState(null);
  const inpStyle = (e) => ({
    width:"100%", background:C.surface, border:`1px solid ${e?C.red:C.border}`,
    borderRadius:9, padding:"9px 11px", color:C.text, fontSize:T.sm, fontWeight:600
  });

  const openEdit = (h) => {
    const f = { sana: h.sana };
    OMBOR_MAYDONLAR.forEach(m => { f[m.id] = h.maydonlar.find(x=>x.id===m.id)?.qiymat||""; });
    setForm(f);
    setEditId(h.id);
    setHisobotTuri("oddiy");
    setShowForm(true);
  };

  const saveHisobot = () => {
    const filled = OMBOR_MAYDONLAR.some(m => form[m.id] !== "");
    if (!form.sana || !filled) {
      setErr(true); setTimeout(() => setErr(false), 600); return;
    }
    // Bir sanada faqat bitta hisobot bo'lishi kerak
    const takror = omborlar.some(h => h.turi!=="yangiset" && h.sana===form.sana && h.id!==editId);
    if (takror) {
      setErr(true); setTimeout(() => setErr(false), 600); return;
    }
    const entry = {
      id: editId || Date.now(),
      sana: form.sana,
      vaqt: editId ? (omborlar.find(x=>x.id===editId)?.vaqt || Date.now()) : Date.now(),
      maydonlar: OMBOR_MAYDONLAR.map(m => ({ ...m, qiymat: parseFloat(form[m.id]) || 0 }))
    };
    if (editId) {
      setOmborlar(p => p.map(x => x.id===editId ? entry : x));
    } else {
      setOmborlar(p => [entry, ...p]);
    }
    setForm(EMPTY_OMBOR_FORM());
    setEditId(null);
    setShowForm(false);
    setHisobotTuri(null);
  };

  const closeAll = () => {
    setShowForm(false); setHisobotTuri(null);
    setEditId(null); setForm(EMPTY_OMBOR_FORM());
  };

  // Tanlangan sana uchun allaqachon hisobot bormi? (tahrirlanayotgandan tashqari)
  const dupSana = !!form.sana && omborlar.some(h => h.turi!=="yangiset" && h.sana===form.sana && h.id!==editId);

  return (
    <div>
      {/* Sarlavha */}
      <div className="fade-in" style={{ marginBottom:20 }}>
        <div style={{ fontSize:22,fontWeight:900,color:C.text,letterSpacing:-0.5,fontFamily:"Georgia, serif",marginBottom:4 }}>🗄️ Ombor hisoboti</div>
        <div style={{ fontSize:T.sm,color:C.sub }}>Kunlik mahsulot miqdorini kiring</div>
      </div>

      {/* MAVJUD ZAXIRA — doimo ko'rinadi (read-only) */}
      {(() => {
        // Set kirimlarini va ayirish chiqimlarini yig'ib balans hisoblaymiz
        const balans = {};
        OMBOR_MAYDONLAR.forEach(m => { balans[m.id] = { ...m, qiymat: 0 }; });
        (omborlar||[]).forEach(h => {
          (h.maydonlar||[]).forEach(m => {
            if (balans[m.id]) {
              balans[m.id].qiymat += parseFloat(m.qiymat) || 0;
            }
          });
        });
        const balansArr = Object.values(balans);
        const hasAny = balansArr.some(b => b.qiymat !== 0);
        return (
          <div style={{ background:C.card,border:`1px solid ${C.accent}40`,borderRadius:14,padding:"12px 14px",marginBottom:12 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:hasAny?10:0 }}>
              <div>
                <div style={{ fontSize:T.sm,fontWeight:800,color:C.accent }}>📦 Mavjud zaxira</div>
                <div style={{ fontSize:9,color:C.muted,marginTop:2 }}>Set kirimlari − tasdiqlangan xarajat</div>
              </div>
              <div style={{ fontSize:9,color:C.muted,fontStyle:"italic" }}>faqat ko'rish</div>
            </div>
            {hasAny ? (
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                {balansArr.map(b => {
                  const k = hisobotBirlik(b.id, b.qiymat, b.birlik);
                  const qiy = k.qiymat;
                  const formatted = Math.abs(qiy) >= 100
                    ? Math.round(qiy).toLocaleString()
                    : Math.abs(qiy) >= 1
                      ? qiy.toFixed(1).replace(/\.0$/, "")
                      : qiy.toFixed(2).replace(/0$/, "");
                  const color = qiy > 0 ? C.green : qiy < 0 ? C.red : C.muted;
                  return (
                    <div key={b.id} style={{ background:C.surface,border:`1px solid ${C.borderSoft}`,borderRadius:8,padding:"6px 9px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:4 }}>
                      <span style={{ fontSize:9,color:C.sub,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{b.emoji} {b.nom}</span>
                      <span style={{ fontSize:T.xs,fontWeight:800,color,whiteSpace:"nowrap" }}>{formatted} {k.birlik}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize:9,color:C.muted,fontStyle:"italic",textAlign:"center",padding:"4px 0" }}>
                Hali zaxira kiritilmagan
              </div>
            )}
          </div>
        );
      })()}

      {/* Tasdiqlanmagan kunlar soni — Dashboard tarixidan */}
      {(() => {
        const kutyapti = (hisobotlarTarixi||[]).filter(h => !tasdiqlanganKunlar.includes(h.id));
        if (kutyapti.length === 0) return null;
        return (
          <div className="pop-in" style={{ background:`linear-gradient(135deg, ${C.blue}15, ${C.accent}10)`,border:`1px solid ${C.blue}50`,borderRadius:14,padding:"12px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10 }}>
            <div>
              <div style={{ fontSize:T.sm,fontWeight:800,color:C.text }}>⏳ Tasdiq kutilmoqda</div>
              <div style={{ fontSize:10,color:C.muted,marginTop:2 }}>{kutyapti.length} ta kunlik qop hisoboti ombordan ayirish uchun</div>
            </div>
            <button onClick={()=>setHisobotTuri("ayirish")} className="btn"
              style={{ background:C.blue,border:"none",borderRadius:10,padding:"9px 12px",color:"#fff",fontSize:T.xs,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap" }}>
              📋 Tekshirish
            </button>
          </div>
        );
      })()}

      {/* Yangi set tugmasi (asosiy) */}
      {!showForm && hisobotTuri!=="yangiset" && hisobotTuri!=="ayirish" && (
        <button onClick={() => setHisobotTuri("yangiset")} className="btn"
          style={{ width:"100%",background:C.accent,border:"none",borderRadius:12,padding:"13px 10px",color:"#FFF3E8",fontSize:T.md,fontWeight:800,cursor:"pointer",marginBottom:12 }}>
          📦 + Yangi set kiritish
        </button>
      )}

      {/* Yopish tugmasi (oddiy forma ochiq bo'lganda) */}
      {showForm && (
        <button onClick={closeAll} className="btn"
          style={{ width:"100%",background:C.border,border:"none",borderRadius:12,padding:"11px 10px",color:C.sub,fontSize:T.sm,fontWeight:800,cursor:"pointer",marginBottom:16 }}>
          ✕ Yopish
        </button>
      )}

      {/* YANGI SET */}
      {hisobotTuri==="yangiset" && (
        <div>
          <button onClick={closeAll} className="btn"
            style={{ width:"100%",background:C.border,border:"none",borderRadius:12,padding:"11px 10px",color:C.sub,fontSize:T.sm,fontWeight:800,cursor:"pointer",marginBottom:16 }}>
            ← Orqaga
          </button>
          <YangiSetForma omborlar={omborlar} setOmborlar={setOmborlar} onClose={()=>{
            closeAll();
            // Yangi set saqlangandan keyin tasdiqlash paneliga o'tamiz (kutilayotgan kunlar bo'lsa)
            const kut = (hisobotlarTarixi||[]).filter(h => !tasdiqlanganKunlar.includes(h.id));
            if (kut.length > 0) setHisobotTuri("ayirish");
          }} />
        </div>
      )}

      {/* TASDIQLASH PANELI — kunlik qop hisobi → ombordan ayirish */}
      {hisobotTuri==="ayirish" && (
        <div>
          <button onClick={closeAll} className="btn"
            style={{ width:"100%",background:C.border,border:"none",borderRadius:12,padding:"11px 10px",color:C.sub,fontSize:T.sm,fontWeight:800,cursor:"pointer",marginBottom:14 }}>
            ← Orqaga
          </button>

          <div style={{ background:C.card,border:`1px solid ${C.accent}40`,borderRadius:14,padding:"12px 14px",marginBottom:14 }}>
            <div style={{ fontSize:T.sm,fontWeight:800,color:C.accent,marginBottom:4 }}>📋 Kunlik xarajat tasdig'i</div>
            <div style={{ fontSize:10,color:C.muted }}>Har bir kunlik qop hisobida sarflangan mahsulotlar ko'rsatilgan. Tasdiqlash bilan birga ular ombordan ayriladi.</div>
          </div>

          {(() => {
            const kut = (hisobotlarTarixi||[]).filter(h => !tasdiqlanganKunlar.includes(h.id))
              .sort((a,b) => new Date(b.sana) - new Date(a.sana));
            if (kut.length === 0) {
              return (
                <div style={{ background:C.card,border:`1px solid ${C.green}40`,borderRadius:12,padding:"14px",textAlign:"center" }}>
                  <div style={{ fontSize:T.md,marginBottom:4 }}>✅</div>
                  <div style={{ fontSize:T.sm,fontWeight:800,color:C.text }}>Hammasi tasdiqlangan!</div>
                  <div style={{ fontSize:10,color:C.muted,marginTop:4 }}>Tasdiq kutayotgan kun yo'q</div>
                </div>
              );
            }
            return kut.map((h, idx) => {
              // Shu kunda qaysi mahsulot qancha sarflangan?
              const ozNonlar = (h.nonlarSnapshot||[]).filter(n => n.ozIshlab !== false);
              // Har bir ingredient bo'yicha umumiy sarf hisobi (atomik birlikda)
              const sarflar = {};
              ozNonlar.forEach(n => {
                const qopSoni = parseInt((h.ozIshlabQoplar||{})[n.id]) || 0;
                if (qopSoni <= 0) return;
                (n.mahsulotlar||[]).forEach(m => {
                  const id = m.id;
                  if (!sarflar[id]) sarflar[id] = { id, nom:m.nom, kichikBirlik:m.birlik, emoji:m.emoji, jami:0 };
                  sarflar[id].jami += qopSoni * (parseFloat(m.miqdor) || 0);
                });
              });
              // Birlik konvertatsiyasi: g → kg, ml → litr (1000 ga bo'lish)
              const konvert = (jami, birlik) => {
                if (birlik === "g")  return { jami: jami/1000, birlik: "kg" };
                if (birlik === "ml") return { jami: jami/1000, birlik: "litr" };
                return { jami, birlik };  // kg, litr, dona, pachka — o'zgarmasdan
              };
              const sarfArr = Object.values(sarflar).filter(x => x.jami > 0).map(s => {
                const k = konvert(s.jami, s.kichikBirlik);
                return { ...s, korsatJami: k.jami, korsatBirlik: k.birlik };
              });
              const sanaFmt = new Date(h.sana).toLocaleDateString("uz-UZ",{year:"numeric",month:"long",day:"numeric"});

              return (
                <div key={h.id} className={`fade-in s${Math.min(idx+1,5)}`}
                  style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,marginBottom:12 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:8 }}>
                    <div>
                      <div style={{ fontSize:T.sm,fontWeight:800,color:C.text }}>📅 {sanaFmt}</div>
                      <div style={{ fontSize:10,color:C.muted,marginTop:2 }}>{h.jamiQop||0} qop · {(h.sotilganNon||0).toLocaleString()} dona sotilgan</div>
                    </div>
                  </div>

                  {sarfArr.length === 0 ? (
                    <div style={{ fontSize:T.xs,color:C.muted,fontStyle:"italic",padding:"8px 0" }}>Bu kunda mahsulot sarfi yo'q</div>
                  ) : (
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>🌾 Ombordan ayiriladigan mahsulotlar</div>
                      {sarfArr.map(s => {
                        const korsat = s.korsatJami;
                        const birlik = s.korsatBirlik;
                        // 100+ butun, 1-100 1ta kasr, <1 ikkita kasr
                        const formatted = korsat >= 100
                          ? Math.round(korsat).toLocaleString()
                          : korsat >= 1
                            ? korsat.toFixed(1).replace(/\.0$/, "")
                            : korsat.toFixed(2).replace(/0$/, "");
                        return (
                          <div key={s.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:T.xs,padding:"5px 8px",background:C.surface,borderRadius:7,border:`1px solid ${C.borderSoft}`,marginBottom:4 }}>
                            <span style={{ color:C.text }}>{s.emoji||"🍞"} {s.nom}</span>
                            <span style={{ fontWeight:800,color:C.red }}>−{formatted} {birlik}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display:"flex",gap:6 }}>
                    <button onClick={()=>{
                      // Tasdiqlash — ombordan ayirish (omborlar ga "minus" yozuv qo'shamiz)
                      if (sarfArr.length > 0) {
                        const ayirishYozuv = {
                          id: Date.now() + Math.random(),
                          sana: h.sana,
                          vaqt: Date.now(),
                          turi: "ayirish",
                          asosi: `Kunlik qop · ${sanaFmt}`,
                          maydonlar: sarfArr.map(s => {
                            const korsat = s.korsatJami;
                            const birlik = s.korsatBirlik;
                            // 2 ta kasr saqlaymiz, balansda aniq hisob uchun
                            return { id:s.id, nom:s.nom, birlik:birlik, emoji:s.emoji, qiymat: -Number(korsat.toFixed(2)) };
                          })
                        };
                        setOmborlar(p => [ayirishYozuv, ...p]);
                      }
                      setTasdiqlanganKunlar(p => [...p, h.id]);
                    }} className="btn"
                      style={{ flex:1,background:C.green,border:"none",borderRadius:9,padding:"9px 10px",color:"#fff",fontSize:T.sm,fontWeight:800,cursor:"pointer" }}>
                      ✓ To'g'ri — tasdiqlash
                    </button>
                    <button onClick={()=>{
                      if (window.confirm(`${sanaFmt} kuni tasdiqlanmasdan o'tkazib yuborilsinmi?\n\n(Bu hisobot keyinchalik qayta ko'rsatilmaydi, lekin ombordan ham hech narsa ayirilmaydi.)`)) {
                        setTasdiqlanganKunlar(p => [...p, h.id]);
                      }
                    }} className="btn"
                      style={{ background:"transparent",border:`1px solid ${C.red}50`,borderRadius:9,padding:"9px 10px",color:C.red,fontSize:T.xs,fontWeight:700,cursor:"pointer" }}>
                      ✕
                    </button>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* ODDIY HISOBOT FORMA */}
      {showForm && (
        <div className="pop-in" style={{ background:C.card,border:`1px solid ${C.accent}40`,borderRadius:16,padding:16,marginBottom:16 }}>
          <div style={{ fontSize:T.sm,fontWeight:800,color:C.accent,marginBottom:14 }}>
            📋 {editId ? "Hisobotni tahrirlash" : "Yangi hisobot kiritish"}
          </div>

          {/* Sana */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:9,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:0.8 }}>Sana *</div>
            <input type="date" value={form.sana}
              onChange={e => setForm(p => ({ ...p, sana:e.target.value }))}
              style={{ ...inpStyle((err&&!form.sana)||dupSana), colorScheme:"dark" }} />
            {dupSana && (
              <div className="pop-in" style={{ marginTop:8,background:C.redDim,border:`1px solid ${C.red}40`,borderRadius:8,padding:"8px 11px",fontSize:T.xs,color:C.red,fontWeight:700 }}>
                ⚠️ Bu sana uchun hisobot allaqachon mavjud! Bir kunda faqat bitta hisobot bo'lishi mumkin.
              </div>
            )}
          </div>

          {/* Mahsulotlar */}
          <div style={{ fontSize:9,color:C.muted,marginBottom:10,textTransform:"uppercase",letterSpacing:0.8 }}>Mahsulotlar miqdori</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>
            {OMBOR_MAYDONLAR.map(m => (
              <div key={m.id}>
                <div style={{ fontSize:9,color:C.sub,marginBottom:4,fontWeight:700 }}>{m.emoji} {m.nom} ({m.birlik})</div>
                <input type="number" value={form[m.id]}
                  onChange={e => setForm(p => ({ ...p, [m.id]:e.target.value }))}
                  placeholder="0"
                  style={inpStyle(false)} />
              </div>
            ))}
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            <button onClick={closeAll}
              style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:10,padding:"11px 8px",color:C.sub,cursor:"pointer",fontSize:T.sm }}>
              Bekor
            </button>
            <button onClick={saveHisobot} disabled={dupSana}
              style={{ border:"none",background:dupSana?C.border:C.accent,borderRadius:10,padding:"11px 8px",color:dupSana?C.muted:"#FFF3E8",fontWeight:800,cursor:dupSana?"not-allowed":"pointer",fontSize:T.sm }}>
              ✓ Saqlash
            </button>
          </div>
        </div>
      )}

      {/* Hisobotlar ro'yxati */}
      {omborlar.filter(h=>h.turi!=="yangiset").length === 0 ? (
        <div style={{ textAlign:"center",padding:"48px 20px",color:C.muted }}>
          <div style={{ fontSize:44,marginBottom:12,opacity:0.4 }}>🗄️</div>
          <div style={{ fontSize:T.md,fontWeight:600,color:C.sub,marginBottom:6 }}>Hisobotlar hali yo'q</div>
          <div style={{ fontSize:T.xs }}>Yuqoridagi tugmani bosib birinchi hisobotni kiriting</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize:T.xs,color:C.muted,marginBottom:10,textTransform:"uppercase",letterSpacing:1,fontWeight:700 }}>
            📋 Saqlangan hisobotlar ({omborlar.filter(h=>h.turi!=="yangiset").length} ta)
          </div>
          {(() => {
            const sanoq = {};
            omborlar.filter(h=>h.turi!=="yangiset").forEach(h => { sanoq[h.sana] = (sanoq[h.sana]||0)+1; });
            const takror = Object.keys(sanoq).filter(s => sanoq[s] > 1);
            if (takror.length === 0) return null;
            return (
              <div className="pop-in" style={{ background:C.redDim,border:`1px solid ${C.red}50`,borderRadius:12,padding:"11px 14px",marginBottom:12 }}>
                <div style={{ fontSize:T.sm,fontWeight:800,color:C.red,marginBottom:3 }}>⚠️ Takror sana aniqlandi</div>
                <div style={{ fontSize:10,color:C.muted }}>
                  Quyidagi sana(lar) bir necha marta kiritilgan: {takror.join(", ")}. Bir kunda faqat bitta hisobot bo'lishi kerak — ortiqchasini o'chiring.
                </div>
              </div>
            );
          })()}
          {omborlar.filter(h=>h.turi!=="yangiset").map((h, i) => {
            const isDup = omborlar.filter(x=>x.turi!=="yangiset"&&x.sana===h.sana).length > 1;
            const daysAgo = Math.floor((Date.now() - h.vaqt) / (24*60*60*1000));
            const bor = h.maydonlar.filter(m => m.qiymat > 0);
            return (
              <div key={h.id} className={`fade-in s${Math.min(i+1,5)}`}
                style={{ background:C.card,border:`1px solid ${isDup?C.red+"70":C.border}`,borderRadius:14,padding:"12px 14px",marginBottom:10 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:T.sm,fontWeight:800,color:C.text }}>📅 {h.sana} {isDup && <span style={{ fontSize:9,color:C.red,fontWeight:800 }}>⚠️ takror</span>}</div>
                    <div style={{ fontSize:9,color:C.muted,marginTop:2 }}>{daysAgo===0?"Bugun":daysAgo===1?"Kecha":`${daysAgo} kun oldin`} · {bor.length} xil mahsulot</div>
                  </div>
                  <div style={{ display:"flex",gap:6 }}>
                    <button onClick={() => openEdit(h)}
                      style={{ background:"none",border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 10px",color:C.sub,fontSize:T.xs,cursor:"pointer" }}>✏️</button>
                    <button onClick={() => setDelConfirmId(h.id)}
                      style={{ background:"none",border:"none",color:C.red,fontSize:16,cursor:"pointer",padding:4 }}>🗑</button>
                  </div>
                </div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                  {bor.map(m => {
                    const k = hisobotBirlik(m.id, m.qiymat, m.birlik);
                    const v = +k.qiymat.toFixed(2);
                    return (
                    <div key={m.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 9px",fontSize:9,color:C.sub,fontWeight:700 }}>
                      {m.emoji} {m.nom}: <span style={{ color:C.accent }}>{v} {k.birlik}</span>
                    </div>
                    );
                  })}
                </div>
                {delConfirmId === h.id && (
                  <div className="pop-in" style={{ background:C.redDim,border:`1px solid ${C.red}40`,borderRadius:10,padding:10,marginTop:10 }}>
                    <div style={{ fontSize:T.xs,color:C.text,fontWeight:700,marginBottom:8,textAlign:"center" }}>O'chirib yubormoqchimisiz?</div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                      <button onClick={() => setDelConfirmId(null)}
                        style={{ border:`1px solid ${C.border}`,background:"transparent",borderRadius:8,padding:"8px",color:C.sub,cursor:"pointer",fontSize:T.xs }}>Bekor</button>
                      <button onClick={() => { setOmborlar(p=>p.filter(x=>x.id!==h.id)); setDelConfirmId(null); }}
                        style={{ border:"none",background:C.red,borderRadius:8,padding:"8px",color:"#fff",fontWeight:800,cursor:"pointer",fontSize:T.xs }}>Ha, o'chirish</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────
const MODULES_CONFIG = [
  { id:"dashboard",  label:"Markaz",          icon:"📊", iconSrc: ICON_DASHBOARD },
  { id:"production", label:"Ishlab chiqarish", icon:"🏭", iconSrc: ICON_PRODUCTION },
  { id:"ishchilar",  label:"Xodimlar",         icon:"👥", iconSrc: ICON_ISHCHILAR },
  { id:"ombor",      label:"Ombor",            icon:"🗄️", iconSrc: ICON_OMBOR },
];

export default function App() {
  const [splash, setSplash]                             = useState(true);
  const [active, setActive]                             = useState("dashboard");
  const [key, setKey]                                   = useState(0);
  const [ishchilar, setIshchilar]                       = useState([
    { id:1, ism:"Feruz aka",   lavozimId:"nonYopuvchi", lavozimCustom:"", haqTuri:"qop",    miqdor:30000,  tel:"", holat:"Aktiv", tatilQaytishSana:"", tahrirSoni:0, nonTurlari:["Issiq non"], nonNarxlari:{ "Issiq non":30000 } },
    { id:2, ism:"Otabek va Vahob aka",  lavozimId:"nonYopuvchi", lavozimCustom:"", haqTuri:"qop",    miqdor:60000,  tel:"", holat:"Aktiv", tatilQaytishSana:"", tahrirSoni:0, nonTurlari:["Issiq non"], nonNarxlari:{ "Issiq non":60000 } },
    { id:3, ism:"Dilshod aka", lavozimId:"nonYopuvchi", lavozimCustom:"", haqTuri:"qop",    miqdor:25000,  tel:"", holat:"Aktiv", tatilQaytishSana:"", tahrirSoni:0, nonTurlari:["Issiq non"], nonNarxlari:{ "Issiq non":25000 } },
    { id:4, ism:"Nigora opa",  lavozimId:"nonYopuvchi", lavozimCustom:"", haqTuri:"qop",    miqdor:25000,  tel:"", holat:"Aktiv", tatilQaytishSana:"", tahrirSoni:0, nonTurlari:["Issiq non"], nonNarxlari:{ "Issiq non":25000 } },
    { id:5, ism:"Dilsora opa", lavozimId:"checha",      lavozimCustom:"", haqTuri:"kunlik", miqdor:200000, tel:"", holat:"Aktiv", tatilQaytishSana:"", tahrirSoni:0, nonTurlari:[], nonNarxlari:{} },
    { id:6, ism:"Surayyo opa", lavozimId:"checha",      lavozimCustom:"", haqTuri:"kunlik", miqdor:120000, tel:"", holat:"Aktiv", tatilQaytishSana:"", tahrirSoni:0, nonTurlari:[], nonNarxlari:{} },
    { id:7, ism:"Diyor aka",   lavozimId:"nonYopuvchi", lavozimCustom:"Patirchi/Qora non", haqTuri:"qop", miqdor:75000, tel:"", holat:"Aktiv", tatilQaytishSana:"", tahrirSoni:0, nonTurlari:["Patir","Katta qora non"], nonNarxlari:{ "Patir":75000, "Katta qora non":100000 } },
    { id:8, ism:"Sardor aka", lavozimId:"nonYopuvchi", lavozimCustom:"Patirchi/Qora non", haqTuri:"qop", miqdor:75000, tel:"", holat:"Aktiv", tatilQaytishSana:"", tahrirSoni:0, nonTurlari:["Patir","Katta qora non"], nonNarxlari:{ "Patir":75000, "Katta qora non":100000 } },
  ]);
  const [nonlar, setNonlar]                             = useState([
    {
      id: 1,
      nom: "Issiq non",
      narx: 8000,
      nonSoni: 105,
      ozIshlab: true,
      mahsulotlar: [
        { id:"oqUn",     nom:"Oq un",           birlik:"g",  emoji:"🌾", miqdor:25000, narx:0 },
        { id:"sariqUn",  nom:"Sariq un",         birlik:"g",  emoji:"🌾", miqdor:25000, narx:0 },
        { id:"suv",      nom:"Suv",              birlik:"ml", emoji:"💧", miqdor:24800, narx:0 },
        { id:"yog",      nom:"Yog'",             birlik:"ml", emoji:"🫗", miqdor:3800,  narx:0 },
        { id:"tuz",      nom:"Tuz",              birlik:"g",  emoji:"🧂", miqdor:1000,  narx:0 },
        { id:"shakar",   nom:"Shakar",           birlik:"g",  emoji:"🍬", miqdor:300,   narx:0 },
        { id:"quruqSut", nom:"Quruq sut",        birlik:"g",  emoji:"🥄", miqdor:350,   narx:0 },
        { id:"achitqi",  nom:"Achitqi (Droja)",  birlik:"g",  emoji:"🍞", miqdor:50,    narx:0 },
      ]
    },
    {
      id: 2,
      nom: "Patir",
      narx: 15000,
      nonSoni: 90,
      ozIshlab: true,
      mahsulotlar: [
        { id:"oqUn",    nom:"Oq un",             birlik:"g",  emoji:"🌾", miqdor:25000, narx:0 },
        { id:"sariqUn", nom:"Sariq un",           birlik:"g",  emoji:"🌾", miqdor:25000, narx:0 },
        { id:"suv",     nom:"Suv",               birlik:"ml", emoji:"💧", miqdor:24300, narx:0 },
        { id:"yog",     nom:"Yog'",              birlik:"ml", emoji:"🫗", miqdor:1700,  narx:0 },
        { id:"jir",     nom:"Jir (hayvon yog')", birlik:"g",  emoji:"🥓", miqdor:3800,  narx:0 },
        { id:"tuz",     nom:"Tuz",               birlik:"g",  emoji:"🧂", miqdor:1000,  narx:0 },
        { id:"shakar",  nom:"Shakar",            birlik:"g",  emoji:"🍬", miqdor:300,   narx:0 },
        { id:"achitqi", nom:"Achitqi (Droja)",   birlik:"g",  emoji:"🍞", miqdor:50,    narx:0 },
      ]
    },
    {
      id: 3,
      nom: "Katta qora non",
      narx: 15000,
      nonSoni: 68,
      ozIshlab: true,
      mahsulotlar: [
        { id:"qoraUn",  nom:"Qora un",           birlik:"g",  emoji:"🌾", miqdor:25000, narx:0 },
        { id:"oqUn",    nom:"Oq un",             birlik:"g",  emoji:"🌾", miqdor:12500, narx:0 },
        { id:"sariqUn", nom:"Sariq un",           birlik:"g",  emoji:"🌾", miqdor:12500, narx:0 },
        { id:"suv",     nom:"Suv",               birlik:"ml", emoji:"💧", miqdor:18000, narx:0 },
        { id:"sut",     nom:"Sut",               birlik:"ml", emoji:"🥛", miqdor:10000, narx:0 },
        { id:"shakar",  nom:"Shakar",            birlik:"g",  emoji:"🍬", miqdor:300,   narx:0 },
        { id:"tuz",     nom:"Tuz",               birlik:"g",  emoji:"🧂", miqdor:1000,  narx:0 },
        { id:"yog",     nom:"Yog'",              birlik:"ml", emoji:"🫗", miqdor:4000,  narx:0 },
        { id:"achitqi", nom:"Achitqi (Droja)",   birlik:"g",  emoji:"🍞", miqdor:50,    narx:0 },
      ]
    },
    {
      id: 4,
      nom: "Kichik garmqoqi",
      narx: 10000,
      nonSoni: 0,
      ozIshlab: false,
      mahsulotlar: []
    },
    {
      id: 5,
      nom: "Katta garmqoqi",
      narx: 10000,
      nonSoni: 0,
      ozIshlab: false,
      mahsulotlar: []
    },
    {
      id: 6,
      nom: "Katta qora garmqoqi",
      narx: 15000,
      nonSoni: 0,
      ozIshlab: false,
      mahsulotlar: []
    },
    {
      id: 7,
      nom: "Kulcha (Samarqand non)",
      narx: 15000,
      nonSoni: 0,
      ozIshlab: false,
      mahsulotlar: []
    },
  ]);
  const [mahsulotNarxlari, setMahsulotNarxlari]         = useState({
    oqUn:     { miqdor:"50000", narx:"288000" },
    sariqUn:  { miqdor:"50000", narx:"230000" },
    qoraUn:   { miqdor:"50000", narx:"230000" },
    sut:      { miqdor:"1000",  narx:"7000"   },
    yog:      { miqdor:"15000", narx:"285000" },
    jir:      { miqdor:"1000",  narx:"25000"  },
    achitqi:  { miqdor:"500",   narx:"44000"  },
    quruqSut: { miqdor:"1000",  narx:"30000"  },
    shakar:   { miqdor:"1000",  narx:"15700"  },
  });
  const [customMahsulotlar, setCustomMahsulotlar]       = useState([]);
  const [qarzlar, setQarzlar]                           = useState([]);
  const [optomlar, setOptomlar]                         = useState([]);
  const [omborlar, setOmborlar]                         = useState([]);
  const [gazNarx, setGazNarx]                           = useState("350000");
  const [elektroNarx, setElektroNarx]                   = useState("0");
  const [kunlikQopSoni, setKunlikQopSoni]               = useState("");
  const [sotilmaganNon, setSotilmaganNon]               = useState({});
  const [qopTasdiqlandi, setQopTasdiqlandi]             = useState(false);
  const [hisobotYopildi, setHisobotYopildi]             = useState(false);
  const [hisobotlarTarixi, setHisobotlarTarixi]         = useState([]);
  const [tasdiqlanganKunlar, setTasdiqlanganKunlar]     = useState([]);
  const [tashqariSonlar, setTashqariSonlar]             = useState({});
  const [kunlikQoplar, setKunlikQoplar]                 = useState([]);
  const [braklar, setBraklar]                           = useState([]);
  const [ozIshlabQoplar, setOzIshlabQoplar]             = useState({});

  const nav = (id) => { setActive(id); };

  const renderModule = () => {
    switch (active) {
      case "dashboard":  return <Dashboard nonlar={nonlar} qarzlar={qarzlar} setQarzlar={setQarzlar} optomlar={optomlar} setOptomlar={setOptomlar}
        ishchilar={ishchilar}
        mahsulotNarxlari={mahsulotNarxlari}
        kunlikQopSoni={kunlikQopSoni} setKunlikQopSoni={setKunlikQopSoni}
        sotilmaganNon={sotilmaganNon} setSotilmaganNon={setSotilmaganNon}
        qopTasdiqlandi={qopTasdiqlandi} setQopTasdiqlandi={setQopTasdiqlandi}
        hisobotYopildi={hisobotYopildi} setHisobotYopildi={setHisobotYopildi}
        hisobotlarTarixi={hisobotlarTarixi} setHisobotlarTarixi={setHisobotlarTarixi}
        tashqariSonlar={tashqariSonlar} setTashqariSonlar={setTashqariSonlar}
        ozIshlabQoplar={ozIshlabQoplar} setOzIshlabQoplar={setOzIshlabQoplar}
        tasdiqlanganKunlar={tasdiqlanganKunlar} onNav={nav}
      />;
      case "production": return (
        <Production
          ishchilar={ishchilar}
          mahsulotNarxlari={mahsulotNarxlari}   setMahsulotNarxlari={setMahsulotNarxlari}
          customMahsulotlar={customMahsulotlar}  setCustomMahsulotlar={setCustomMahsulotlar}
          nonlar={nonlar}                         setNonlar={setNonlar}
        />
      );
      case "ishchilar": return <Ishchilar ishchilar={ishchilar} setIshchilar={setIshchilar} nonlar={nonlar} />;
      case "ombor":     return <Ombor omborlar={omborlar} setOmborlar={setOmborlar} hisobotlarTarixi={hisobotlarTarixi} setHisobotlarTarixi={setHisobotlarTarixi} nonlar={nonlar} mahsulotNarxlari={mahsulotNarxlari} tasdiqlanganKunlar={tasdiqlanganKunlar} setTasdiqlanganKunlar={setTasdiqlanganKunlar} />;
      default:          return <Dashboard />;
    }
  };

  const cur = MODULES_CONFIG.find(m=>m.id===active);

  return (
    <>
      <style>{STYLES}</style>
      <ToastHost />
      {splash && <Splash onDone={()=>setSplash(false)} />}
      <div style={{ background:C.bg,minHeight:"100vh",fontFamily:"'Segoe UI', Roboto, sans-serif",color:C.text,maxWidth:420,margin:"0 auto",position:"relative",paddingBottom:84,opacity:splash?0:1,transition:"opacity 0.4s ease" }}>

        {/* ═══════════════════════════════════════════════════════════
            BOSQICH 1: HEADER — logotip (<img>) o'chirildi
                       Faqat "Nur-Non" matni qoldi
        ═══════════════════════════════════════════════════════════ */}
        <div style={{ background:"#A06020",padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 12px #A0602030" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <img src={LOGO_SRC} alt="logo" style={{ width:36,height:36,objectFit:"contain",borderRadius:8,background:"#fff",padding:3 }} />
            <div>
              <div style={{ fontSize:T.md,fontWeight:900,color:"#FFFFFF",fontFamily:"Georgia, serif",letterSpacing:0.5 }}>Nur‑Non</div>
              <div style={{ fontSize:10,color:"#FFF3E8",opacity:0.85 }}>Boshqaruv tizimi</div>
            </div>
          </div>

        </div>

        {/* SAHIFA NOMI */}
        <div style={{ padding:"14px 20px 10px",borderBottom:`1px solid ${C.borderSoft}`,background:C.surface }}>
          <div style={{ fontSize:18,fontWeight:900,color:C.text,letterSpacing:-0.5,fontFamily:"Georgia,serif",display:"flex",alignItems:"center",gap:10 }}>
            {cur?.iconSrc && <img src={cur.iconSrc} alt="" style={{ width:28,height:28,objectFit:"contain",borderRadius:6,border:"2px solid #6B3A10",padding:2,background:"#F9F0E4" }} />}
            {cur?.label}
          </div>
        </div>

        {/* ASOSIY KONTENT */}
        <div style={{ padding:"16px 16px" }}>{renderModule()}</div>

        {/* QUYI NAVIGATSIYA */}
        <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,background:"#FDFAF6",borderTop:`1px solid #E8D9C5`,display:"flex",padding:"8px 2px 16px",zIndex:10,boxShadow:"0 -2px 12px #A0602012" }}>
          {MODULES_CONFIG.map(m=>{
            const a = active===m.id;
            return (
              <button key={m.id} onClick={()=>nav(m.id)} className="btn"
                style={{ flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
                <div style={{ width:40,height:32,borderRadius:10,border:a?"2px solid #6B3A10":"2px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",padding:2 }}>
                  <img src={m.iconSrc} alt={m.label} style={{ width:22,height:22,objectFit:"contain" }} />
                </div>
                <span style={{ fontSize:10,fontWeight:a?700:400,color:a?"#6B3A10":"#C8A478" }}>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
