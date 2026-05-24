import React from "react";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import WEB_HTML from "./webBundle";

// Nur-Non veb-ilovasi (Vite single-file build) Expo qobig'i ichida
// oflayn ko'rsatiladi. Internet talab qilmaydi.
export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#A06020" />
      <WebView
        originWhitelist={["*"]}
        source={{ html: WEB_HTML, baseUrl: "" }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        overScrollMode="never"
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#A06020" />
          </View>
        )}
        // WebKit'da localStorage va kichik optimizatsiyalar
        androidLayerType={Platform.OS === "android" ? "hardware" : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#A06020" },
  webview: { flex: 1, backgroundColor: "#F2E6D5" },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2E6D5",
  },
});
