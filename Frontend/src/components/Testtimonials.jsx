import { useState } from "react";
import { useCfg } from "../context.js";
import { initials, url } from "../lib/utils.js";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons.jsx";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

export default function Testimonials({ sec }) {
  const cfg = useCfg();
  const t = cfg.testimonials;
  const [i, setI] = useState(0);
  const cur = t.length ? ((i % t.length) + t.length) % t.length : 0;
  const go = (n) => setI(((n % t.length) + t.length) % t.length);

  return (
    <section className="section" id={sec.id}>
      <SectionHead sec={sec} />
      <Reveal className="tcar glass" id="tcar">
        <span className="qmark grad" aria-hidden="true">
          {"\u201C"}
        </span>
        <div>
          {t.map((x, k) => (
            <figure className="tslide" key={k} hidden={k !== cur}>
              <blockquote>{x.quote}</blockquote>
              <figcaption>
                <span className="tav grad">{initials(x.name)}</span>
                <span>
                  <b>
                    {x.link ? (
                      <a
                        href={url(x.link)}
                        target="_blank"
                        rel="noopener"
                        style={{ textDecoration: "none" }}
                      >
                        {x.name}
                      </a>
                    ) : (
                      x.name
                    )}
                  </b>
                  <small>{x.role}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        {t.length > 1 ? (
          <div className="tctl">
            <button
              className="icon-btn"
              type="button"
              aria-label="Previous testimonial"
              onClick={() => go(cur - 1)}
            >
              <ChevronLeftIcon />
            </button>
            <div className="dots">
              {t.map((x, k) => (
                <button
                  key={k}
                  type="button"
                  aria-label={"Show testimonial " + (k + 1)}
                  aria-current={k === cur}
                  onClick={() => go(k)}
                />
              ))}
            </div>
            <button
              className="icon-btn"
              type="button"
              aria-label="Next testimonial"
              onClick={() => go(cur + 1)}
            >
              <ChevronRightIcon />
            </button>
          </div>
        ) : null}
      </Reveal>
    </section>
  );
}
