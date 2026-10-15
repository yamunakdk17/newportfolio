import { useEffect } from "react";

/* Soft glow that follows the pointer over any ".glass" card. */
export default function useSpotlight() {
  useEffect(() => {
    const h = (e) => {
      const g = e.target.closest && e.target.closest(".glass");
      if (!g) return;
      const r = g.getBoundingClientRect();
      g.style.setProperty("--mx", e.clientX - r.left + "px");
      g.style.setProperty("--my", e.clientY - r.top + "px");
    };
    document.addEventListener("pointermove", h, { passive: true });
    return () => document.removeEventListener("pointermove", h);
  }, []);
}
