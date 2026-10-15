import { useCfg, secOn } from "../context.js";
import { url } from "../lib/utils.js";
import useTypewriter from "../hooks/useTypewriter.js";
import Profile from "./Profile.jsx";
import { ArrowDownIcon, DownloadIcon, GridIcon, SparkIcon } from "./Icons.jsx";

export default function Hero({ next }) {
  const cfg = useCfg();
  const s = cfg.site;
  const roles = (s.roles && s.roles.length ? s.roles : [s.role]).filter(
    Boolean,
  );
  const typed = useTypewriter(roles);

  return (
    <section className="hero" id="home">
      <Profile />
      <div className="hero-main">
        <span className="chip hero-in" style={{ "--i": 1 }}>
          <SparkIcon />
          {s.chip || "Let's meet!"}
        </span>
        <h1
          className="h1 grad hero-in"
          style={{ "--i": 2 }}
          aria-label={"I'm " + s.name + ", " + (roles[0] || "")}
        >
          <span>I'm {s.name}</span>
          <span className="role-line">
            <span id="typed">{typed}</span>
            {roles.length > 1 ? (
              <i className="caret" aria-hidden="true" />
            ) : null}
          </span>
        </h1>
        {s.intro ? (
          <p className="hero-p hero-in" style={{ "--i": 3 }}>
            {s.intro}
          </p>
        ) : null}
        <div className="cta hero-in" style={{ "--i": 4 }}>
          {secOn(cfg, "work") ? (
            <a className="btn btn-out" href="#work">
              My Works <GridIcon />
            </a>
          ) : null}
          {s.cvUrl ? (
            <a
              className="btn btn-text"
              href={url(s.cvUrl)}
              target="_blank"
              rel="noopener"
            >
              Download CV <DownloadIcon />
            </a>
          ) : null}
        </div>
        {s.building ? (
          <div className="now hero-in" style={{ "--i": 5 }}>
            <i />
            <small>Currently building</small>
            <span>{s.building}</span>
          </div>
        ) : null}
      </div>
      {next ? (
        <a
          className="scrollbadge hero-in"
          style={{ "--i": 6 }}
          href={"#" + next}
          aria-label="Scroll for more"
        >
          <svg className="ring-t" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path
                id="circ"
                d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
              />
            </defs>
            <text>
              <textPath href="#circ" textLength="272" lengthAdjust="spacing">
                SCROLL FOR MORE {"\u2022"} SCROLL FOR MORE {"\u2022"}
              </textPath>
            </text>
          </svg>
          <ArrowDownIcon />
        </a>
      ) : null}
    </section>
  );
}
