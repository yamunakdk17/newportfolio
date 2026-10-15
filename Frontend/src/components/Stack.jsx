import { useCfg } from "../context.js";
import { TOOLS } from "../data/defaults.js";
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
  const front = cfg.stack
    .filter((g) => g.side !== "back")
    .flatMap((g) => g.items);
  const back = cfg.stack
    .filter((g) => g.side === "back")
    .flatMap((g) => g.items);
  const L = cfg.stackLabels || [];

  return (
    <section className="section" id={sec.id}>
      <SectionHead sec={sec} />
      {cfg.features.scrollToolkit ? (
        <>
          <Reveal className="kit-labels">
            <span>{L[0] || ""}</span>
            <span />
            <span>{L[1] || ""}</span>
          </Reveal>
          <Reveal className="kit">
            <div className="kit-win kit-left">
              <Track list={front} />
            </div>
            <div className="spine" aria-hidden="true">
              <span className="ticks t1" />
              <span className="ticks t2" />
              <i className="orn top" />
              <i className="orn mid" />
              <i className="orn bot" />
            </div>
            <div className="kit-win kit-right">
              <Track list={back} />
            </div>
          </Reveal>
        </>
      ) : (
        <Reveal className="stack">
          {cfg.stack.map((g) => (
            <div className="glass" key={g.name}>
              <h3>{g.name}</h3>
              <ul>
                {g.items.map((n) => (
                  <ToolItem key={n} name={n} plain />
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      )}
    </section>
  );
}
