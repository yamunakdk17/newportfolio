import { useEffect, useState } from "react";
import { useCfg } from "../context.js";
import { TOOLS } from "../data/defaults.js";
import { getPublicTools } from "../services/toolsService.js";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

function ToolItem({ name, hidden, plain }) {
  const t = TOOLS[name] || [String(name).slice(0, 2), "#a99cba"];
  return (
    <li
      className={plain ? undefined : "kit-item"}
      aria-hidden={hidden ? "true" : undefined}
    >
      <span className="tool-chip" style={{ "--c": t[1] }}>
        {t[0]}
      </span>
      <span>{name}</span>
    </li>
  );
}

/* A list repeated until it is tall enough, then doubled so the scroll loop is seamless. */
function Track({ list }) {
  if (!list.length) return <ul className="kit-track" />;
  const reps = Math.max(1, Math.ceil(8 / list.length));
  let block = [];
  for (let i = 0; i < reps; i++) block = block.concat(list);
  return (
    <ul className="kit-track">
      {block.map((n, i) => (
        <ToolItem key={"a" + i} name={n} />
      ))}
      {block.map((n, i) => (
        <ToolItem key={"b" + i} name={n} hidden />
      ))}
    </ul>
  );
}

export default function Stack({ sec }) {
  const cfg = useCfg();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPublicTools()
      .then((data) => {
        if (active) setTools(Array.isArray(data) ? data.filter((tool) => tool.published !== false) : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Could not load tools.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const orderedTools = tools
    .slice()
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  const splitIndex = Math.ceil(orderedTools.length / 2);
  const leftTools = orderedTools.slice(0, splitIndex);
  const rightTools = orderedTools.slice(splitIndex);
  const leftNames = leftTools.map((tool) => tool.name);
  const rightNames = rightTools.map((tool) => tool.name);
  const leftCategories = [...new Set(leftTools.map((tool) => tool.category).filter(Boolean))];
  const rightCategories = [...new Set(rightTools.map((tool) => tool.category).filter(Boolean))];
  const L = cfg.stackLabels || [];

  return (
    <section className="section" id={sec.id}>
      <SectionHead sec={sec} />
      {loading ? (
        <Reveal className="stack"><p>Loading tools...</p></Reveal>
      ) : error ? (
        <Reveal className="error-state"><p role="alert">{error}</p></Reveal>
      ) : !orderedTools.length ? (
        <Reveal className="stack"><p>No tools have been added yet.</p></Reveal>
      ) : cfg.features.scrollToolkit ? (
        <>
          <Reveal className="kit-labels">
            <span>{L[0] || ""}</span>
            <span />
            <span>{L[1] || ""}</span>
          </Reveal>
          <Reveal className="kit">
            <div className="kit-win kit-left">
              <Track list={leftNames} />
            </div>
            <div className="spine" aria-hidden="true">
              <span className="ticks t1" />
              <span className="ticks t2" />
              <i className="orn top" />
              <i className="orn mid" />
              <i className="orn bot" />
            </div>
            <div className="kit-win kit-right">
              <Track list={rightNames} />
            </div>
          </Reveal>
        </>
      ) : (
        <Reveal className="stack stack-sides">
          {[{ side: "left", categories: leftCategories, sideTools: leftTools },
            { side: "right", categories: rightCategories, sideTools: rightTools }]
            .map((column) => (
              <div className="stack-side" key={column.side}>
                {column.categories.map((category) => (
                  <div className="glass stack-category" key={category}>
                    <h3>{category}</h3>
                    <ul>
                      {column.sideTools.filter((tool) => tool.category === category).map((tool) => (
                        <ToolItem key={tool.id} name={tool.name} plain />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
        </Reveal>
      )}
    </section>
  );
}
