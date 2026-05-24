import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `viteSingleFile` barcha JS/CSS'ni bitta `dist/index.html` ichiga joylaydi.
// Bu fayl Expo WebView qobig'i ichida oflayn ishlatiladi (webBundle.js orqali).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  server: { port: 5173, host: true },
  build: { assetsInlineLimit: 100000000, chunkSizeWarningLimit: 100000 },
});
