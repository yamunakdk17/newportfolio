import { useEffect, useRef } from "react";
import { finePointer } from "../lib/utils.js";

/* Optional ring cursor (desktop only). */
export default function Cursor({ enabled }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!enabled || !finePointer()) {
      root.classList.remove("has-cursor");
      return undefined;
    }
    root.classList.add("has-cursor");
    const c = ref.current;
    let x = window.innerWidth / 2,
      y = 90,
      tx = x,
      ty = y,
      raf = 0;
    const move = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const over = (e) =>
      c.classList.toggle(
        "big",
        !!(
          e.target.closest &&
          e.target.closest(
            "a, button, .kit-item, .pcard, input, textarea, select, summary",
          )
        ),
      );
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      c.style.transform = "translate(" + x + "px," + y + "px)";
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      root.classList.remove("has-cursor");
    };
  }, [enabled]);

  return <div id="cursor" ref={ref} aria-hidden="true" />;
}
