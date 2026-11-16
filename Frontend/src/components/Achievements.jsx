import { useEffect, useState } from "react";
import { useCfg } from "../context.js";
import { url } from "../lib/utils.js";
import { apiUrl } from "../lib/api.js";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

export default function Achievements({ sec }) {
  const cfg = useCfg();
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    const close = (event) => { if (event.key === "Escape") setPreview(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
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
            {a.image ? <img className="certificate-thumb" src={apiUrl(a.image)} alt={`${a.title} certificate`} loading="lazy" /> : null}
            <ul className="tags">
              {(a.tags || []).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p>{a.desc}</p>
            {a.image ? <button className="link" type="button" onClick={() => setPreview(a)}>View Certificate</button> : a.link ? (
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
      {preview ? <div className="certificate-modal" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setPreview(null); }}><section role="dialog" aria-modal="true" aria-label={`${preview.title} certificate`}><button className="btn btn-out" type="button" onClick={() => setPreview(null)}>Close</button><img src={apiUrl(preview.image)} alt={`${preview.title} certificate`} /></section></div> : null}
    </section>
  );
}
