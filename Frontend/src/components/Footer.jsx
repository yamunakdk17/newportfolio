import { useCfg } from "../context.js";
import { url } from "../lib/utils.js";

/* Double-click the copyright line to open the Customize panel. */
export default function Footer({ onSecret }) {
  const cfg = useCfg();
  const s = cfg.site;
  const soc = [
    ["GitHub", s.github],
    ["LinkedIn", s.linkedin],
    ["Instagram", s.instagram],
  ].filter((x) => x[1]);

  return (
    <footer className="foot" id="foot">
      <p className="foot-name" aria-hidden="true">
        {s.name}
      </p>
      <div className="in">
        <span onDoubleClick={onSecret}>
          &copy; {new Date().getFullYear()} {s.name}
        </span>
        {soc.length ? (
          <div className="socials">
            {soc.map(([label, href]) => (
              <a key={label} href={url(href)} target="_blank" rel="noopener">
                {label}
              </a>
            ))}
          </div>
        ) : null}
        <span>Designed and built by hand.</span>
      </div>
    </footer>
  );
}
