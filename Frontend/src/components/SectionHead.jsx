import Reveal from "./Reveal.jsx";
import { SparkIcon } from "./Icons.jsx";

/* "Projects I've {built}" -> the part in braces becomes a gradient <em>. */
export function renderTitle(t) {
  return String(t || "")
    .split(/\{([^}]+)\}/)
    .map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));
}

export default function SectionHead({ sec }) {
  return (
    <Reveal className="sec-head">
      <span className="chip">
        <SparkIcon />
        {sec.kicker}
      </span>
      <h2 className="h2">{renderTitle(sec.title)}</h2>
      {sec.lead && sec.id !== "contact" ? (
        <p className="lead">{sec.lead}</p>
      ) : null}
    </Reveal>
  );
}
