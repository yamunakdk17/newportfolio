import { useRef, useState } from "react";
import { useCfg } from "../context.js";
import { PASTELS } from "../data/defaults.js";
import { finePointer, imgOk, reduce, url } from "../lib/utils.js";
import Art from "./Art.jsx";
import { ArrowIcon } from "./Icons.jsx";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

function ProjectCard({ p, i, hidden }) {
  const ref = useRef(null);
  const color = /^#[0-9a-f]{6}$/i.test(p.color || "")
    ? p.color
    : PASTELS[i % PASTELS.length];
  const href = p.demo || p.code || "#";
  const img = imgOk(p.image);

  /* gentle 3D tilt under a mouse pointer */
  const onMove = (e) => {
    if (!finePointer() || reduce()) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      "perspective(1000px) rotateX(" +
      (-y * 5).toFixed(2) +
      "deg) rotateY(" +
      (x * 6).toFixed(2) +
      "deg) translateY(-4px)";
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Reveal
      as="article"
      ref={ref}
      className={
        "pcard " + (p.tone === "dark" ? "dark" : "") + (img ? " has-img" : "")
      }
      data-cat={p.cat || ""}
      style={{ "--c1": color }}
      hidden={hidden}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <a
        className="pc-cover"
        href={url(href)}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className="art">
        {img ? <img src={p.image} alt="" /> : <Art name={p.art || p.thumb} />}
      </div>
      <span className="pc-num" aria-hidden="true">
        {String(i + 1).padStart(2, "0")}
      </span>
      <div className="pc-top">
        <h3>{p.title}</h3>
        <span>{p.kind}</span>
      </div>
      <div className="pc-bot">
        {p.desc ? <p className="pc-desc">{p.desc}</p> : null}
        {p.tags && p.tags.length ? (
          <ul className="ptags">
            {p.tags.slice(0, 4).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
        <div className="pc-row">
          <a className="pc-link" href={url(href)}>
            View Project
          </a>
          {p.code && p.demo ? (
            <a className="pc-code" href={url(p.code)}>
              Code
            </a>
          ) : null}
          <span className="pc-go">
            <ArrowIcon />
          </span>
        </div>
      </div>
    </Reveal>
  );
}

export default function Work({ sec }) {
  const cfg = useCfg();
  const [cat, setCat] = useState("");
  const cats = [...new Set(cfg.projects.map((p) => p.cat).filter(Boolean))];
  const showFilters = cfg.features.projectFilter && cats.length > 1;

  return (
    <section className="section" id={sec.id}>
      <SectionHead sec={sec} />
      {showFilters ? (
        <Reveal
          className="filters"
          id="filters"
          role="group"
          aria-label="Filter projects"
        >
          <button
            className="fchip"
            type="button"
            aria-pressed={cat === ""}
            onClick={() => setCat("")}
          >
            All
          </button>
          {cats.map((c) => (
            <button
              key={c}
              className="fchip"
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </Reveal>
      ) : null}
      {cfg.projects.length ? (
        <div className="pgrid" id="projects">
          {cfg.projects.map((p, i) => (
            <ProjectCard
              key={p.title + i}
              p={p}
              i={i}
              hidden={!!cat && p.cat !== cat}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
