import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ConfigContext } from './context.js';
import { DEFAULTS } from './data/defaults.js';
import { EDIT, STORE, clone, loadConfig, lum, saveConfig } from './lib/utils.js';
import useSpotlight from './hooks/useSpotlight.js';

import Background from './components/Background.jsx';
import Cursor from './components/Cursor.jsx';
import Intro from './components/Intro.jsx';
import ScrollUI from './components/ScrollUI.jsx';
import PublicLayout from './components/layout/PublicLayout.jsx';
import Editor from './components/Editor.jsx';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminHome from './pages/admin/AdminHome.jsx';
import AdminProjects from './pages/admin/AdminProjects.jsx';
import AdminProjectCreate from './pages/admin/AdminProjectCreate.jsx';
import AdminProjectEdit from './pages/admin/AdminProjectEdit.jsx';
import AdminAbout from './pages/admin/AdminAbout.jsx';

import AdminTools from './pages/admin/AdminTools.jsx';
import AdminExperience from './pages/admin/AdminExperience.jsx';
import AdminEducation from './pages/admin/AdminEducation.jsx';
import AdminAchievements from './pages/admin/AdminAchievements.jsx';
import AdminMessages from './pages/admin/AdminMessages.jsx';
import AdminCv from './pages/admin/AdminCv.jsx';
import { getPortfolio } from './services/portfolioService.js';
import { getPublishedProjects } from './services/projectService.js';

const decodeSegment = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export default function App() {
  const [cfg, setCfg] = useState(() => ({
    ...loadConfig(DEFAULTS),
    projects: [],
  }));

  const [projectStatus, setProjectStatus] = useState('loading');
  const [projectError, setProjectError] = useState('');

  const commit = useCallback(
    (updater) =>
      setCfg((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
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

  const [stored, setStored] = useState(() => {
    try {
      return localStorage.getItem('theme');
    } catch {
      return null;
    }
  });

  const theme =
    stored === 'light' || stored === 'dark'
      ? stored
      : cfg.look.theme === 'light'
        ? 'light'
        : 'dark';

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';

    setStored(next);

    try {
      localStorage.setItem('theme', next);
    } catch {
      /* ignore */
    }
  };

  const clearStoredTheme = () => {
    try {
      localStorage.removeItem('theme');
    } catch {
      /* ignore */
    }

    setStored(null);
  };

  useLayoutEffect(() => {
    const root = document.documentElement;
    const L = cfg.look;
    const D = DEFAULTS.look;

    ['--g1', '--g2', '--on-grad'].forEach((property) => {
      root.style.removeProperty(property);
    });

    const c1 = String(L.g1).toLowerCase() !== D.g1;
    const c2 = String(L.g2).toLowerCase() !== D.g2;

    if (c1) {
      root.style.setProperty('--g1', L.g1);
    }

    if (c2) {
      root.style.setProperty('--g2', L.g2);
    }

    if (c1 || c2) {
      root.style.setProperty(
        '--on-grad',
        (lum(L.g1) + lum(L.g2)) / 2 > 0.55 ? '#17131c' : '#ffffff',
      );
    }

    root.setAttribute('data-theme', theme);
  }, [cfg.look, theme]);

  useEffect(() => {
    document.title = `${cfg.site.name} | ${cfg.site.role}`;
  }, [cfg.site.name, cfg.site.role]);

  useEffect(() => {
    getPortfolio()
      .then((content) => {
        setCfg((previous) => ({
          ...previous,

          site: {
            ...previous.site,
            ...(content.site || {}),
          },

          about: content.about || previous.about,

          services: content.services || [],

          stack: content.stack || [],

          experience: content.experience || [],

          education: content.education || [],

          achievements: content.achievements || [],
        }));
      })
      .catch(() => {});
  }, []);

  const loadProjects = useCallback(async () => {
    setProjectStatus('loading');
    setProjectError('');

    try {
      const projects = await getPublishedProjects();

      setCfg((previous) => ({
        ...previous,

        projects: projects.map((project) => ({
          ...project,
          title: project.title || 'Untitled project',
          desc: project.desc || project.description || '',
          description: project.description || project.desc || '',
          tags: Array.isArray(project.tags) ? project.tags : [],
          demo: project.demo || project.project_url || '',
          code: project.code || project.github_url || '',
          image: project.image || '',
          slug: project.slug || '',
          published: project.published === true,
        })),
      }));

      setProjectStatus('ready');
    } catch (error) {
      setProjectError(error.message || 'Could not load published projects.');

      setProjectStatus('error');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadProjects]);

  useSpotlight();

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash !== '#edit') {
      const target = document.getElementById(hash.slice(1));

      if (target) {
        setTimeout(() => {
          target.scrollIntoView();
        }, 50);
      }
    }
  }, []);

  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setToast('');
    }, 2400);

    return () => clearTimeout(timer);
  }, [toast]);

  const [editorReady, setEditorReady] = useState(EDIT);
  const [editorOpen, setEditorOpen] = useState(EDIT);

  const openEditor = useCallback(() => {
    setEditorReady(true);
    setEditorOpen(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        (event.key === 'E' || event.key === 'e')
      ) {
        event.preventDefault();
        openEditor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openEditor]);

  const pathname = window.location.pathname.replace(/\/$/, '') || '/';

  if (pathname === '/admin/login') {
    return <AdminLogin />;
  }

  if (pathname === '/admin/projects') {
    return <AdminProjects />;
  }

  if (pathname === '/admin/projects/create' || pathname === '/admin/projects/new') {
    return <AdminProjectCreate />;
  }

  const adminProjectEditMatch = /^\/admin\/projects\/([^/]+)$/.exec(pathname);

  if (adminProjectEditMatch) {
    return <AdminProjectEdit id={decodeSegment(adminProjectEditMatch[1])} />;
  }

  if (pathname === '/admin/about') return <AdminAbout />;

  if (pathname === '/admin/tools') return <AdminTools />;
  if (pathname === '/admin/experience') return <AdminExperience />;
  if (pathname === '/admin/education') return <AdminEducation />;
  if (pathname === '/admin/achievements') return <AdminAchievements />;
  if (pathname === '/admin/messages') return <AdminMessages />;
  if (pathname === '/admin/cv') return <AdminCv />;

  if (pathname.startsWith('/admin')) {
    return <AdminHome />;
  }

  const projectMatch = /^\/projects\/([^/]+)$/.exec(pathname);

  const isProjectPage = pathname === '/projects' || Boolean(projectMatch);
  const publicSections = cfg.sections.filter((section) => section.on);

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

      <PublicLayout
        sections={publicSections}
        onToggleTheme={toggleTheme}
        onSecret={openEditor}
        projectPage={isProjectPage}>
        {pathname === '/projects' ? (
          <Projects />
        ) : projectMatch ? (
          <ProjectDetails slug={decodeSegment(projectMatch[1])} />
        ) : (
          <Home
            cfg={cfg}
            projectStatus={projectStatus}
            projectError={projectError}
            onRetryProjects={loadProjects}
            onToast={setToast}
          />
        )}
      </PublicLayout>

      <div id="toast" className={toast ? 'show' : ''} role="status" aria-live="polite">
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
