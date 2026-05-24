// `dist/index.html` (Vite single-file build) ni JS modulga aylantiradi.
// Natija `webBundle.js` Expo WebView qobig'iga oflayn HTML sifatida import qilinadi.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const src = path.join(root, "dist", "index.html");
const out = path.join(root, "webBundle.js");

if (!fs.existsSync(src)) {
  console.error("XATO: dist/index.html topilmadi. Avval `npm run web:build` ni bajaring.");
  process.exit(1);
}

const html = fs.readFileSync(src, "utf8");
// JSON.stringify barcha maxsus belgilarni (backtick, \\, satr boshi) xavfsiz ekranlaydi.
const content = "// AVTOMATIK YARATILGAN — qo'lda tahrirlamang. `npm run bundle` orqali yangilanadi.\n"
  + "export default " + JSON.stringify(html) + ";\n";

fs.writeFileSync(out, content, "utf8");
console.log(`webBundle.js yaratildi (${(content.length / 1024).toFixed(0)} KB).`);
