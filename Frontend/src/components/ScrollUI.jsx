import { useEffect, useRef, useState } from "react";
import { reduce } from "../lib/utils.js";
import { UpIcon } from "./Icons.jsx";

/* Top progress bar and the back-to-top button. */
export default function ScrollUI({ progress, toTop }) {
  const bar = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let tick = false;
    const run = () => {
      tick = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current)
        bar.current.style.width =
          (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + "%";
      setShow(window.scrollY > 700);
    };
    const on = () => {
      if (!tick) {
        tick = true;
        requestAnimationFrame(run);
      }
    };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    run();
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  return (
    <>
      {progress ? <div id="progress" ref={bar} aria-hidden="true" /> : null}
      {toTop ? (
        <button
          id="totop"
          className={show ? "show" : ""}
          type="button"
          aria-label="Back to top"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: reduce() ? "auto" : "smooth" })
          }
        >
          <UpIcon />
        </button>
      ) : null}
    </>
  );
}
