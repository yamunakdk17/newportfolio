import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCfg, secOn } from "../context.js";
import { ChatIcon, MoonIcon, SunIcon } from "./Icons.jsx";

/* Floating pill menu with a sliding highlight that follows the section in view. */
export default function Nav({ sections, onToggleTheme }) {
  const cfg = useCfg();
  const links = [
    { id: "home", label: "Home" },
    ...sections.filter((x) => x.nav !== false),
  ];
  const idKey = links.map((l) => l.id).join("|");
  const boxRef = useRef(null);
  const [active, setActive] = useState("home");
  const [ind, setInd] = useState({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
    opacity: 0,
  });

  /* which section is in view */
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [idKey]);

  /* move the highlight under the active link */
  useLayoutEffect(() => {
    const box = boxRef.current;
    const place = (scroll) => {
      const a = box && box.querySelector('a[href="#' + active + '"]');
      if (!a) return;
      setInd({
        left: a.offsetLeft,
        width: a.offsetWidth,
        top: a.offsetTop,
        height: a.offsetHeight,
        opacity: 1,
      });
      if (scroll && box.scrollTo)
        box.scrollTo({
          left: Math.max(0, a.offsetLeft - 24),
          behavior: "smooth",
        });
    };
    place(true);
    const re = () => place(false);
    window.addEventListener("resize", re);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(re);
    return () => window.removeEventListener("resize", re);
  }, [active, idKey]);

  return (
    <div className="pillnav-wrap">
      <nav className="pillnav glass" id="pillnav" aria-label="Main">
        <div className="plinks" id="plinks" ref={boxRef}>
          <span
            className="pind"
            id="pind"
            style={{
              left: ind.left,
              width: ind.width,
              top: ind.top,
              height: ind.height,
              opacity: ind.opacity,
            }}
          />
          {links.map((l) => (
            <a
              key={l.id}
              href={"#" + l.id}
              aria-current={active === l.id ? "true" : "false"}
            >
              {l.label}
            </a>
          ))}
        </div>
        {cfg.features.themeToggle ? (
          <button
            className="icon-btn"
            id="theme"
            type="button"
            aria-label="Switch between dark and light theme"
            onClick={onToggleTheme}
          >
            <MoonIcon />
            <SunIcon />
          </button>
        ) : null}
        {secOn(cfg, "contact") ? (
          <a className="btn btn-grad" href="#contact">
            Let's Talk <ChatIcon />
          </a>
        ) : null}
      </nav>
    </div>
  );
}
