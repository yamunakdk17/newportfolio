import { useEffect, useState } from "react";
import { reduce } from "../lib/utils.js";

/* Types and erases each role in turn. With one role (or reduced motion) it just shows the first. */
export default function useTypewriter(roles) {
  const [text, setText] = useState(roles[0] || "");
  const key = roles.join("|");

  useEffect(() => {
    if (reduce() || roles.length < 2) {
      setText(roles[0] || "");
      return undefined;
    }
    let i = 0,
      j = 0,
      del = false,
      timer;
    const tick = () => {
      const w = roles[i];
      setText(w.slice(0, j));
      let d;
      if (!del && j === w.length) {
        del = true;
        d = 1700;
      } else if (del && j === 0) {
        del = false;
        i = (i + 1) % roles.length;
        d = 350;
      } else {
        j += del ? -1 : 1;
        d = del ? 36 : 78;
      }
      timer = setTimeout(tick, d);
    };
    tick();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return text;
}
