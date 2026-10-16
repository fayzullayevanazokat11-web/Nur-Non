const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// ── Lotin/Kirill: barcha UI matni avtomatik o'giriladi ──
// app/ va src/ ichidagi `react-native` importi src/i18n/rn.js ga yo'naltiriladi
// (Text, TextInput, Alert tilga moslashgan o'ramlar bilan almashtiriladi).
// Web'da Babel importlarni "react-native-web/dist/exports/<Nom>" ga aylantiradi —
// ular ham ushlanadi. src/i18n/ o'zi asl react-native'ni ishlatadi.
const ILOVA = [path.join(__dirname, "app") + path.sep, path.join(__dirname, "src") + path.sep];
const I18N = path.join(__dirname, "src", "i18n") + path.sep;
const SHIM = path.join(__dirname, "src", "i18n", "rn.js");
const WEB = {
  Text: path.join(__dirname, "src", "i18n", "web", "Text.js"),
  TextInput: path.join(__dirname, "src", "i18n", "web", "TextInput.js"),
  Alert: path.join(__dirname, "src", "i18n", "web", "Alert.js"),
};
const WEB_RE = /^react-native-web\/dist\/(?:cjs\/)?exports\/(Text|TextInput|Alert)(?:\/index(?:\.js)?)?$/;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = context.originModulePath || "";
  if (ILOVA.some((d) => origin.startsWith(d)) && !origin.startsWith(I18N)) {
    if (moduleName === "react-native") return { type: "sourceFile", filePath: SHIM };
    const m = moduleName.match(WEB_RE);
    if (m) return { type: "sourceFile", filePath: WEB[m[1]] };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
