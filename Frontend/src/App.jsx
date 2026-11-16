import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ConfigContext } from "./context.js";
import { DEFAULTS } from "./data/defaults.js";
import {
  EDIT,
  STORE,
  clone,
  loadConfig,
  lum,
  saveConfig,
} from "./lib/utils.js";
import useSpotlight from "./hooks/useSpotlight.js";

import Background from "./components/Background.jsx";
import Cursor from "./components/Cursor.jsx";
import Intro from "./components/Intro.jsx";
import ScrollUI from "./components/ScrollUI.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import Work from "./components/Work.jsx";
import About from "./components/About.jsx";
import Stack from "./components/Stack.jsx";
import Resume from "./components/Resume.jsx";
import Achievements from "./components/Achievements.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import Editor from "./components/Editor.jsx";
import Admin from "./components/Admin.jsx";
import AdminProjects from "./components/AdminProjects.jsx";
import PublicProjects from "./components/PublicProjects.jsx";
import { api } from "./lib/api.js";

/* id used in cfg.sections -> component */
const SECTIONS = {
  work: Work,
  about: About,
  stack: Stack,
  resume: Resume,
  achievements: Achievements,
  contact: Contact,
};

const decodeSegment = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export default function App() {
  /* ----- settings (defaults + anything saved from the Customize panel) ----- */
  const [cfg, setCfg] = useState(() => ({ ...loadConfig(DEFAULTS), projects: [] }));
  const [projectStatus, setProjectStatus] = useState("loading");
  const [projectError, setProjectError] = useState("");
  const commit = useCallback(
    (updater) =>
      setCfg((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        saveConfig(next);
        return next;
      }),
    [],
  );
  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(STORE);
    } catch {
      /* ignore */
    }
    setCfg(clone(DEFAULTS));
  }, []);

  /* ----- theme: a visitor's own choice wins over the default theme ----- */
  const [stored, setStored] = useState(() => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  });
  const theme =
    stored === "light" || stored === "dark"
      ? stored
      : cfg.look.theme === "light"
        ? "light"
        : "dark";
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setStored(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
  };
  const clearStoredTheme = () => {
    try {
      localStorage.removeItem("theme");
    } catch {
      /* ignore */
    }
    setStored(null);
  };

  /* custom gradient colours + theme attribute (layout effect so children read the right CSS variables) */
  useLayoutEffect(() => {
    const root = document.documentElement;
    const L = cfg.look,
      D = DEFAULTS.look;
    ["--g1", "--g2", "--on-grad"].forEach((p) => root.style.removeProperty(p));
    const c1 = String(L.g1).toLowerCase() !== D.g1;
    const c2 = String(L.g2).toLowerCase() !== D.g2;
    if (c1) root.style.setProperty("--g1", L.g1);
    if (c2) root.style.setProperty("--g2", L.g2);
    if (c1 || c2)
      root.style.setProperty(
        "--on-grad",
        (lum(L.g1) + lum(L.g2)) / 2 > 0.55 ? "#17131c" : "#ffffff",
      );
    root.setAttribute("data-theme", theme);
  }, [cfg.look, theme]);

  useEffect(() => {
    document.title = cfg.site.name + " | " + cfg.site.role;
  }, [cfg.site.name, cfg.site.role]);

  useEffect(() => {
    api("/api/portfolio").then((content) => setCfg((previous) => ({
      ...previous,
      about: content.about,
      services: content.services,
      stack: content.stack,
      experience: content.experience,
      education: content.education,
      achievements: content.achievements,
    }))).catch(() => {});
  }, []);

  const loadProjects = useCallback(async () => {
    setProjectStatus("loading");
    setProjectError("");
    try {
      const projects = await api("/api/projects");
      setCfg((previous) => ({
        ...previous,
        projects: (Array.isArray(projects) ? projects : []).map((project) => ({
          ...project,
          cat: project.cat || "Project",
          kind: project.kind || "",
          tags: Array.isArray(project.tags) ? project.tags : [],
          demo: project.demo || project.project_url || "",
          code: project.code || project.github_url || "",
        })),
      }));
      setProjectStatus("ready");
    } catch (error) {
      setProjectError(error.message || "Could not load published projects.");
      setProjectStatus("error");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadProjects(), 0);
    return () => clearTimeout(timer);
  }, [loadProjects]);

  useSpotlight();

  /* jump to #section if the address has one */
  useEffect(() => {
    const h = window.location.hash;
    if (h && h !== "#edit") {
      const t = document.getElementById(h.slice(1));
      if (t) setTimeout(() => t.scrollIntoView(), 50);
    }
  }, []);

  /* ----- toast ----- */
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  /* ----- customize panel: ?edit, Ctrl/Cmd + Shift + E, or double-click the footer copyright ----- */
  const [editorReady, setEditorReady] = useState(EDIT);
  const [editorOpen, setEditorOpen] = useState(EDIT);
  const openEditor = useCallback(() => {
    setEditorReady(true);
    setEditorOpen(true);
  }, []);
  useEffect(() => {
    const k = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "E" || e.key === "e")
      ) {
        e.preventDefault();
        openEditor();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [openEditor]);

  const secs = cfg.sections.filter((s) => s.on && SECTIONS[s.id]);

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  if (pathname === "/admin/login") return <Admin loginOnly />;
  if (pathname === "/admin/projects" || pathname.startsWith("/admin/projects/")) return <AdminProjects />;
  if (pathname.startsWith("/admin")) return <Admin />;
  const projectMatch = /^\/projects\/([^/]+)$/.exec(pathname);
  const isProjectPage = pathname === "/projects" || Boolean(projectMatch);

  return (
    <ConfigContext.Provider value={cfg}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Background
        particles={cfg.features.particles}
        aurora={cfg.features.aurora}
        theme={theme}
      />
      <Cursor enabled={cfg.features.cursor} />
      <Intro enabled={cfg.features.intro} word={cfg.site.introWord} />
      <ScrollUI progress={cfg.features.progress} toTop={cfg.features.toTop} />

      <div className="shell">
        <Nav sections={secs} onToggleTheme={toggleTheme} basePath={isProjectPage ? "/#" : ""} />
        <main id="main">
          {isProjectPage ? <PublicProjects slug={projectMatch ? decodeSegment(projectMatch[1]) : ""} /> : <>
            <Hero next={secs.length ? secs[0].id : ""} />
            {cfg.features.marquee && cfg.marquee.length ? (
              <Marquee items={cfg.marquee} />
            ) : null}
            {secs.map((s) => {
              const Section = SECTIONS[s.id];
              return s.id === "work"
                ? <Section key={s.id} sec={s} projectStatus={projectStatus} projectError={projectError} onRetry={loadProjects} onToast={setToast} />
                : <Section key={s.id} sec={s} onToast={setToast} />;
            })}
          </>}
        </main>
      </div>

      <Footer onSecret={openEditor} />
      <div
        id="toast"
        className={toast ? "show" : ""}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>

      {editorReady ? (
        <Editor
          cfg={cfg}
          commit={commit}
          open={editorOpen}
          setOpen={setEditorOpen}
          onReset={resetAll}
          clearStoredTheme={clearStoredTheme}
        />
      ) : null}
    </ConfigContext.Provider>
  );
}
