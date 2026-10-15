import { useEffect, useState } from "react";
import { DEFAULTS } from "../data/defaults.js";
import { clone, getP, merge, readImage, setP } from "../lib/utils.js";
import { CloseIcon, GearIcon } from "./Icons.jsx";

const BASIC = [
  ["site.name", "Your name"],
  ["site.role", "Role (used for the page title)"],
  ["site.roles", "Rotating roles under your name (one per line)", "lines"],
  ["site.chip", "Small chip above the headline"],
  ["site.available", "Availability text (empty to hide)"],
  ["site.specialization", "Specialization (profile card)", "textarea"],
  ["site.location", "Based in"],
  ["site.intro", "Intro sentence under the headline", "textarea"],
  ["site.building", "Currently building (leave empty to hide)"],
  ["site.email", "Email"],
  ["site.phone", "Phone (optional)"],
  ["site.github", "GitHub link"],
  ["site.linkedin", "LinkedIn link"],
  ["site.instagram", "Instagram link (optional)"],
  ["site.cvUrl", "CV link, for the Download CV button (optional)"],
  ["site.introWord", "Word shown in the intro"],
];

const FEATURES = [
  ["intro", "Handwritten hello intro (first visit)"],
  ["particles", "Constellation background (dots and lines)"],
  ["aurora", "Soft colour glow at the top"],
  ["cursor", "Ring cursor (desktop)"],
  ["marquee", "Scrolling skills strip"],
  ["progress", "Scroll progress bar"],
  ["themeToggle", "Dark and light toggle"],
  ["toTop", "Back to top button"],
  ["projectFilter", "Project filter buttons"],
  ["scrollToolkit", "Scrolling toolkit (off shows a grouped grid)"],
  ["stats", "Stats cards in About"],
  ["skillBars", "Skill rings in Resume"],
  ["contactForm", "Contact form"],
];

const LISTS = [
  ["projects", "Projects"],
  ["about", "About paragraphs"],
  ["stats", "Stats"],
  ["services", "Services"],
  ["stack", "Tech stack groups"],
  ["stackLabels", "Toolkit column labels"],
  ["skills", "Skill rings"],
  ["experience", "Experience"],
  ["education", "Education"],
  ["achievements", "Achievements"],
  ["testimonials", "Testimonials"],
  ["marquee", "Skills strip words"],
];

/* ---------- small building blocks (kept outside Editor so inputs keep focus while typing) ---------- */
const Box = ({ title, open, children }) => (
  <details className="ed" open={open || undefined}>
    <summary>{title}</summary>
    <div className="in">{children}</div>
  </details>
);

const Btn = ({ children, onClick, cls }) => (
  <button
    type="button"
    className={"btn " + (cls || "btn-out") + " mini"}
    onClick={onClick}
  >
    {children}
  </button>
);

function TextField({ label, path, type, cfg, set }) {
  const cur = getP(cfg, path);
  const value = cur == null ? "" : cur;
  return (
    <label>
      {label}
      {type === "textarea" ? (
        <textarea value={value} onChange={(e) => set(path, e.target.value)} />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => set(path, e.target.value)}
        />
      )}
    </label>
  );
}

/* One item per line; keeps its own text so blank lines can be typed. */
function LinesField({ label, path, cfg, set }) {
  const [text, setText] = useState(() =>
    (Array.isArray(getP(cfg, path)) ? getP(cfg, path) : []).join("\n"),
  );
  return (
    <label>
      {label}
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          set(
            path,
            e.target.value
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean),
          );
        }}
      />
    </label>
  );
}

function Toggle({ label, path, cfg, set }) {
  const cur = getP(cfg, path);
  return (
    <label className="tgl">
      <input
        type="checkbox"
        checked={cur === undefined ? true : !!cur}
        onChange={(e) => set(path, e.target.checked)}
      />
      {label}
    </label>
  );
}

function ListEditor({ k, label, cfg, commit }) {
  const [text, setText] = useState(() =>
    JSON.stringify(
      cfg[k],
      (key, v) => (key === "image" && v ? "(image kept)" : v),
      2,
    ),
  );
  const [msg, setMsg] = useState("");
  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      commit((prev) => {
        const next = clone(prev);
        if (k === "projects" && Array.isArray(parsed)) {
          parsed.forEach((p, i) => {
            if (p && p.image === "(image kept)") {
              const old =
                prev.projects.find((x) => x.title === p.title) ||
                prev.projects[i];
              if (old && old.image) p.image = old.image;
              else delete p.image;
            }
          });
        }
        next[k] = parsed;
        return next;
      });
      setMsg("Applied.");
    } catch (e) {
      setMsg("Could not apply: " + e.message);
    }
  };
  return (
    <details className="sub">
      <summary>{label}</summary>
      <textarea
        className="json"
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Btn onClick={apply}>Apply</Btn>
      <p className="edmsg">{msg}</p>
    </details>
  );
}

function DataPanel({ cfg, commit, onReset, bump }) {
  const json = JSON.stringify(
    cfg,
    (k, v) => ((k === "photo" || k === "image") && v ? "(image omitted)" : v),
    2,
  );
  const [text, setText] = useState(json);
  const [msg, setMsg] = useState("");
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    setText(json);
  }, [json]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Copied.");
    } catch (e) {
      setMsg("Select the text and copy it.");
    }
  };
  const doImport = () => {
    try {
      const parsed = JSON.parse(text);
      commit((prev) => {
        if (parsed.site && parsed.site.photo === "(image omitted)")
          parsed.site.photo = prev.site.photo;
        if (Array.isArray(parsed.projects)) {
          parsed.projects.forEach((p) => {
            if (p.image === "(image omitted)") {
              const old = prev.projects.find((x) => x.title === p.title);
              if (old && old.image) p.image = old.image;
              else delete p.image;
            }
          });
        }
        return merge(clone(DEFAULTS), parsed);
      });
      bump();
      setMsg("Imported.");
    } catch (e) {
      setMsg("Could not import: " + e.message);
    }
  };
  const reset = () => {
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 3500);
      return;
    }
    onReset();
    bump();
    setArmed(false);
  };

  return (
    <>
      <label>
        Your settings (copy these, or paste settings here to import)
        <textarea
          className="json"
          spellCheck={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="secrow">
        <Btn cls="btn-grad" onClick={copy}>
          Copy
        </Btn>
        <Btn onClick={doImport}>Import</Btn>
        <Btn onClick={reset}>
          {armed ? "Click again to confirm" : "Reset everything"}
        </Btn>
      </div>
      <p className="edmsg">{msg}</p>
    </>
  );
}

/* ---------- the panel ---------- */
export default function Editor({
  cfg,
  commit,
  open,
  setOpen,
  onReset,
  clearStoredTheme,
}) {
  const [rev, setRev] = useState(0);
  const bump = () => setRev((r) => r + 1);
  const set = (path, value) =>
    commit((prev) => {
      const n = clone(prev);
      setP(n, path, value);
      return n;
    });

  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [setOpen]);

  const moveSection = (i, d) =>
    commit((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.sections.length) return prev;
      const n = clone(prev);
      [n.sections[i], n.sections[j]] = [n.sections[j], n.sections[i]];
      return n;
    });

  const setProjectImage = (i, data) =>
    commit((prev) => {
      const n = clone(prev);
      if (data) n.projects[i].image = data;
      else delete n.projects[i].image;
      return n;
    });

  return (
    <>
      <button id="gear" type="button" onClick={() => setOpen(!open)}>
        <GearIcon />
        Customize
      </button>
      <aside
        id="editor"
        className={open ? "open" : ""}
        role="dialog"
        aria-label="Customize portfolio"
      >
        <div className="ed-head">
          <h2>Customize</h2>
          <button
            className="icon-btn"
            type="button"
            aria-label="Close panel"
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="ed-body ed" key={rev}>
          <p className="ed-note">
            Changes show instantly and are saved in this browser only. To make
            them permanent for everyone, open Data at the bottom, copy the
            settings and paste them into src/data/defaults.js.
          </p>

          <Box title="Basics" open>
            {BASIC.map(([path, label, type]) =>
              type === "lines" ? (
                <LinesField
                  key={path}
                  label={label}
                  path={path}
                  cfg={cfg}
                  set={set}
                />
              ) : (
                <TextField
                  key={path}
                  label={label}
                  path={path}
                  type={type}
                  cfg={cfg}
                  set={set}
                />
              ),
            )}
          </Box>

          <Box title="Photo">
            <label>
              Upload a portrait (it is resized and kept in this browser)
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  readImage(e.target.files[0], 720, (data) =>
                    set("site.photo", data),
                  )
                }
              />
            </label>
            <Btn onClick={() => set("site.photo", "")}>Remove photo</Btn>
          </Box>

          <Box title="Project images">
            <p className="ed-note">
              Add a screenshot or cover image to any project card. Without one,
              the card shows a pastel illustration.
            </p>
            {cfg.projects.map((p, i) => (
              <div key={i}>
                <label>
                  {(p.title || "Project " + (i + 1)) +
                    (p.image ? " (image set)" : "")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      readImage(e.target.files[0], 900, (data) =>
                        setProjectImage(i, data),
                      )
                    }
                  />
                </label>
                {p.image ? (
                  <Btn onClick={() => setProjectImage(i, null)}>
                    Remove image
                  </Btn>
                ) : null}
              </div>
            ))}
          </Box>

          <Box title="Look">
            <div className="row2">
              <label>
                Gradient start
                <input
                  type="color"
                  value={cfg.look.g1}
                  onChange={(e) => set("look.g1", e.target.value)}
                />
              </label>
              <label>
                Gradient end
                <input
                  type="color"
                  value={cfg.look.g2}
                  onChange={(e) => set("look.g2", e.target.value)}
                />
              </label>
            </div>
            <label>
              Default theme
              <select
                value={cfg.look.theme === "light" ? "light" : "dark"}
                onChange={(e) => {
                  set("look.theme", e.target.value);
                  clearStoredTheme();
                }}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
            <Btn
              onClick={() =>
                commit((prev) => {
                  const n = clone(prev);
                  n.look.g1 = DEFAULTS.look.g1;
                  n.look.g2 = DEFAULTS.look.g2;
                  return n;
                })
              }
            >
              Reset colours
            </Btn>
          </Box>

          <Box title="Features">
            {FEATURES.map(([key, label]) => (
              <Toggle
                key={key}
                label={label}
                path={"features." + key}
                cfg={cfg}
                set={set}
              />
            ))}
          </Box>

          <Box title="Sections">
            <p className="ed-note">
              Turn sections on or off, show them in the menu or not, and change
              their order. Put a word in {"{braces}"} in a heading to highlight
              it.
            </p>
            {cfg.sections.map((s, i) => (
              <div key={s.id}>
                <div className="secrow">
                  <Toggle
                    label={s.label}
                    path={"sections." + i + ".on"}
                    cfg={cfg}
                    set={set}
                  />
                  <Btn onClick={() => moveSection(i, -1)}>Up</Btn>
                  <Btn onClick={() => moveSection(i, 1)}>Down</Btn>
                </div>
                <details className="sub">
                  <summary>Edit {s.label}</summary>
                  <Toggle
                    label="Show in the menu"
                    path={"sections." + i + ".nav"}
                    cfg={cfg}
                    set={set}
                  />
                  <TextField
                    label="Menu name"
                    path={"sections." + i + ".label"}
                    cfg={cfg}
                    set={set}
                  />
                  <TextField
                    label="Small chip text"
                    path={"sections." + i + ".kicker"}
                    cfg={cfg}
                    set={set}
                  />
                  <TextField
                    label="Heading"
                    path={"sections." + i + ".title"}
                    cfg={cfg}
                    set={set}
                  />
                  <TextField
                    label="Intro text"
                    path={"sections." + i + ".lead"}
                    type="textarea"
                    cfg={cfg}
                    set={set}
                  />
                </details>
              </div>
            ))}
          </Box>

          <Box title="Content lists">
            <p className="ed-note">
              Each list is plain JSON, so you can add, remove or reorder items.
              Press Apply after editing.
            </p>
            {LISTS.map(([k, label]) => (
              <ListEditor
                key={k}
                k={k}
                label={label}
                cfg={cfg}
                commit={commit}
              />
            ))}
          </Box>

          <Box title="Data">
            <DataPanel
              cfg={cfg}
              commit={commit}
              onReset={onReset}
              bump={bump}
            />
          </Box>
        </div>
      </aside>
    </>
  );
}
