import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { FULLSCREEN_KEY } from "../constants/game";

export function isWeb() {
  return Platform.OS === "web" && typeof document !== "undefined";
}

export function prefersFullscreenByDefault() {
  if (!isWeb()) return false;
  try {
    return (
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900
    );
  } catch {
    return window.innerWidth < 900;
  }
}

export function fullscreenSupported() {
  if (!isWeb()) return false;
  const el = document.documentElement;
  return !!(
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen
  );
}

export function isFullscreen() {
  if (!isWeb()) return false;
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

export async function loadFullscreenPref() {
  try {
    const raw = await AsyncStorage.getItem(FULLSCREEN_KEY);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
  }
  return prefersFullscreenByDefault();
}

export async function saveFullscreenPref(on) {
  try {
    await AsyncStorage.setItem(FULLSCREEN_KEY, on ? "1" : "0");
  } catch {
  }
}

export function enterFullscreen() {
  if (!isWeb()) return Promise.resolve(false);
  try {
    window.scrollTo(0, 1);
  } catch {
  }
  const el = document.documentElement;
  const req =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  if (!req) return Promise.resolve(false);
  try {
    const out = req.call(el, { navigationUI: "hide" });
    if (out && typeof out.then === "function") {
      return out.then(() => true).catch(() => false);
    }
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}

export function exitFullscreen() {
  if (!isWeb() || !isFullscreen()) return Promise.resolve();
  const exit =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen;
  if (!exit) return Promise.resolve();
  try {
    const out = exit.call(document);
    if (out && typeof out.then === "function") return out.catch(() => {});
  } catch {
  }
  return Promise.resolve();
}

export function applyWebViewport() {
  if (!isWeb()) return;
  document.documentElement.style.height = "100%";
  document.body.style.height = "100%";
  document.body.style.overflow = "hidden";
  document.body.style.overscrollBehavior = "none";
  document.body.style.touchAction = "manipulation";
  document.body.style.background = "#030712";
  const root = document.getElementById("root");
  if (root) {
    root.style.minHeight = "100dvh";
    root.style.height = "100%";
  }
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "viewport";
    document.head.appendChild(meta);
  }
  meta.content =
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  const ensure = (name, content) => {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = name;
      document.head.appendChild(tag);
    }
    tag.content = content;
  };
  ensure("mobile-web-app-capable", "yes");
  ensure("apple-mobile-web-app-capable", "yes");
  ensure("apple-mobile-web-app-status-bar-style", "black-translucent");
  ensure("theme-color", "#030712");
}
