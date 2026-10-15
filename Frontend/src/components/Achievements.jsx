import { useCfg } from "../context.js";
import { url } from "../lib/utils.js";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

export default function Achievements({ sec }) {
  const cfg = useCfg();
  return (
    <section className="section" id={sec.id}>
      <SectionHead sec={sec} />
      <div className="ach">
        {cfg.achievements.map((a, i) => (
          <Reveal as="article" className="acard glass" key={i}>
            <span className="badge grad">
              {(a.badge || a.title || "").slice(0, 3)}
            </span>
            <h3>{a.title}</h3>
            <ul className="tags">
              {(a.tags || []).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p>{a.desc}</p>
            {a.link ? (
              <div className="links">
                <a
                  className="link"
                  href={url(a.link)}
                  target="_blank"
                  rel="noopener"
                >
                  View credential
                </a>
              </div>
            ) : null}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
