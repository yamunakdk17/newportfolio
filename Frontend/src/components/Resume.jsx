import { useId } from "react";
import { useCfg } from "../context.js";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

function Timeline({ list }) {
  return (
    <ol className="tl">
      {list.map((i, k) => (
        <li key={k}>
          <div className="when">{i.when}</div>
          <h4>{i.title}</h4>
          <div className="org">{i.org}</div>
          <p>{i.note}</p>
        </li>
      ))}
    </ol>
  );
}

/* Animated circular skill meter. */
function Ring({ item }) {
  const id = "rg" + useId().replace(/:/g, "");
  const lv = Math.max(0, Math.min(100, Number(item.level || 0)));
  const off = (213.6 * (1 - lv / 100)).toFixed(1);
  return (
    <div className="ringc">
      <div className="rw">
        <svg viewBox="0 0 84 84" aria-hidden="true">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "var(--g1)" }} />
              <stop offset="1" style={{ stopColor: "var(--g2)" }} />
            </linearGradient>
          </defs>
          <circle className="tr" cx="42" cy="42" r="34" />
          <circle
            className="pg"
            cx="42"
            cy="42"
            r="34"
            stroke={"url(#" + id + ")"}
            style={{ "--off": off }}
          />
        </svg>
        <span className="pct">{lv}%</span>
      </div>
      <span className="nm">{item.name}</span>
    </div>
  );
}

export default function Resume({ sec }) {
  const cfg = useCfg();
  return (
    <section className="section" id={sec.id}>
      <SectionHead sec={sec} />
      <Reveal className="resume">
        <div className="rcard glass">
          <h3>Experience</h3>
          <Timeline list={cfg.experience} />
        </div>
        <div className="rcard glass">
          <h3>Education</h3>
          <Timeline list={cfg.education} />
        </div>
      </Reveal>
      {cfg.features.skillBars && cfg.skills.length ? (
        <Reveal className="skills glass">
          <h3>Technical proficiency</h3>
          {cfg.skills.map((g) => (
            <div key={g.group}>
              <h4>{g.group}</h4>
              <div className="rings">
                {g.items.map((i) => (
                  <Ring key={i.name} item={i} />
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      ) : null}
    </section>
  );
}
