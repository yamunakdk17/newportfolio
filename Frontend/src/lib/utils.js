export const STORE = "portfolio-config";
export const EDIT =
  typeof window !== "undefined" &&
  (/[?&]edit\b/.test(window.location.search) ||
    window.location.hash === "#edit");

export const url = (u) =>
  /^(https?:|mailto:|tel:|#|\/|\.)/i.test(String(u || "")) ? u : "#";
export const imgOk = (u) => /^(data:image\/|https?:)/i.test(String(u || ""));
export const initials = (n) =>
  String(n || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

export const reduce = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const clone = (o) => JSON.parse(JSON.stringify(o));
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
export const merge = (base, over) => {
  for (const k in over) {
    if (isObj(over[k]) && isObj(base[k])) merge(base[k], over[k]);
    else base[k] = over[k];
  }
  return base;
};

export const hexRgb = (h) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(h).trim());
  if (!m) return [150, 110, 230];
  const n = parseInt(m[1], 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
export const lum = (h) => {
  const [r, g, b] = hexRgb(h);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

export const getP = (o, p) =>
  p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
export const setP = (o, p, v) => {
  const ks = p.split(".");
  const last = ks.pop();
  ks.reduce((a, k) => a[k], o)[last] = v;
};

export function loadConfig(defaults) {
  const cfg = clone(defaults);
  try {
    const s = localStorage.getItem(STORE);
    if (s) merge(cfg, JSON.parse(s));
  } catch (e) {
    /* ignore */
  }
  return cfg;
}
export function saveConfig(cfg) {
  try {
    localStorage.setItem(STORE, JSON.stringify(cfg));
  } catch (e) {
    /* ignore */
  }
}

export function readImage(file, max, done) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const sc = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * sc);
      cv.height = Math.round(img.height * sc);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      done(cv.toDataURL("image/jpeg", 0.86));
    };
    img.src = r.result;
  };
  r.readAsDataURL(file);
}
