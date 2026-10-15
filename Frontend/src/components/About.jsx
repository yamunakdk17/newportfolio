import { useEffect, useRef, useState } from "react";
import { useCfg } from "../context.js";
import { reduce, url } from "../lib/utils.js";
import { DownloadIcon } from "./Icons.jsx";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

/* Counts up from 0 the first time it is at least 60% visible. */
function Counter({ value }) {
  const ref = useRef(null);
  const to = Number(value || 0);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce() || !("IntersectionObserver" in window)) {
      setN(to);
      return undefined;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now(),
          dur = 1400;
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return <span ref={ref}>{n.toLocaleString()}</span>;
}

export default function About({ sec }) {
  const cfg = useCfg();
  const s = cfg.site;
  const rows = [
    ["Name", s.name],
    ["Role", s.role],
    ["Email", s.email],
  ];
  if (s.phone) rows.push(["Phone", s.phone]);
  if (s.location) rows.push(["Location", s.location]);

  return (
    <section className="section" id={sec.id}>
      <SectionHead sec={sec} />
      <Reveal className="bento">
        <div className="b-text glass">
          {cfg.about.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="b-info glass">
          <ul className="info">
            {rows.map((r) => (
              <li key={r[0]}>
                <span>{r[0]}</span>
                <b>{r[1]}</b>
              </li>
            ))}
          </ul>
          {s.cvUrl ? (
            <a
              className="btn btn-grad"
              href={url(s.cvUrl)}
              target="_blank"
              rel="noopener"
            >
              Download CV <DownloadIcon />
            </a>
          ) : null}
        </div>
      </Reveal>
      {cfg.features.stats && cfg.stats.length ? (
        <Reveal className="stats">
          {cfg.stats.map((x, i) => (
            <div className="stat glass" key={i}>
              <div className="num grad">
                <Counter value={x.value} />
                <em>{x.suffix || ""}</em>
              </div>
              <p>{x.label}</p>
            </div>
          ))}
        </Reveal>
      ) : null}
      {cfg.services.length ? (
        <Reveal className="services">
          {cfg.services.map((x, i) => (
            <div className="service glass" key={i}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <h3>{x.t}</h3>
              <p>{x.d}</p>
            </div>
          ))}
        </Reveal>
      ) : null}
    </section>
  );
}
