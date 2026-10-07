import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "app.zenith.mastery",
  appName: "Zenith",
  webDir: "dist",
  android: {
    // Keeps the WebView strict: no mixed content, no remote debugging in release.
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    // Draw under the status bar / camera cut-out; the CSS pads with safe-area insets.
    SystemBars: {
      insetsHandling: "css",
      style: "DARK",
    },
    LocalNotifications: {
      iconColor: "#8A6CFF",
    },
  },
}

export default config
