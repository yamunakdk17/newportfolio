import { useLayoutEffect, useState } from "react";
import { EDIT, reduce } from "../lib/utils.js";

/* Decided once per tab session, so React StrictMode's double render cannot use it up. */
let decided = null;
function shouldPlay(enabled) {
  if (decided !== null) return decided;
  if (!enabled || EDIT || reduce()) {
    decided = false;
    return decided;
  }
  try {
    if (sessionStorage.getItem("intro-seen")) {
      decided = false;
      return decided;
    }
    sessionStorage.setItem("intro-seen", "1");
  } catch (e) {
    /* ignore */
  }
  decided = true;
  return decided;
}

/* Handwritten "hello" on a black screen, once per visit. Click to skip. */
export default function Intro({ enabled, word }) {
  const [on, setOn] = useState(() => shouldPlay(enabled));

  useLayoutEffect(() => {
    if (!on) return undefined;
    const root = document.documentElement;
    root.classList.add("intro-on");
    const t = setTimeout(() => {
      setOn(false);
      root.classList.remove("intro-on", "intro-skip-now");
    }, 5300);
    return () => clearTimeout(t);
  }, [on]);

  const skip = () => {
    const root = document.documentElement;
    root.classList.add("intro-skip-now");
    setOn(false);
    setTimeout(() => root.classList.remove("intro-on", "intro-skip-now"), 1300);
  };

  return (
    <div
      id="intro"
      className={on ? "on" : ""}
      aria-hidden="true"
      onClick={on ? skip : undefined}
    >
      {on ? (
        <>
          <span className="intro-word">{word || "hello"}</span>
          <span className="intro-skip">Tap anywhere to skip</span>
        </>
      ) : null}
    </div>
  );
}
