import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Game } from "./src/components/Game";
import { GAME_TITLE } from "./src/constants/game";

const faviconAsset = require("./assets/favicon.png");
const iconAsset = require("./assets/icon.png");

function assetUrl(mod) {
  if (!mod) return "/favicon.png";
  if (typeof mod === "string") return mod;
  if (typeof mod.uri === "string") return mod.uri;
  if (typeof mod.default === "string") return mod.default;
  return "/favicon.png";
}

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.title = GAME_TITLE;
    const favicon = assetUrl(faviconAsset);
    const icon = assetUrl(iconAsset);
    const ensure = (rel, href) => {
      let link = document.head.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.type = "image/png";
      link.href = href;
    };
    ensure("icon", favicon);
    ensure("shortcut icon", favicon);
    ensure("apple-touch-icon", icon);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Game />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
