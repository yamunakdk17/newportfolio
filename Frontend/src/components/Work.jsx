import { useRef, useState } from 'react';
import { useCfg } from '../context.js';
import { PASTELS } from '../data/defaults.js';
import { finePointer, imgOk, reduce, url } from '../lib/utils.js';
import Art from './Art.jsx';
import { ArrowIcon } from './Icons.jsx';
import Reveal from './Reveal.jsx';
import SectionHead from './SectionHead.jsx';
import { imageUrl } from '../lib/api.js';
import { EmptyState, ErrorState, LoadingState } from './RequestState.jsx';

function normalizeProject(project = {}) {
  return {
    ...project,
    title: project.title || 'Untitled project',
    desc: project.desc || project.description || '',
    tags: Array.isArray(project.tags) ? project.tags : [],
    demo: project.demo || project.project_url || '',
    code: project.code || project.github_url || '',
    slug: project.slug || '',
    cat: project.cat || '',
    kind: project.kind || 'Project',
    image: project.image || '',
  };
}

export function ProjectCard({ p: rawProject, i, hidden, className = '' }) {
  const p = normalizeProject(rawProject);
  const ref = useRef(null);

  const color = /^#[0-9a-f]{6}$/i.test(p.color || '')
    ? p.color
    : PASTELS[i % PASTELS.length];

  const img = imgOk(p.image);

  const onMove = (e) => {
    if (!finePointer() || reduce()) return;

    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();

    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;

    el.style.transform =
      'perspective(1000px) rotateX(' +
      (-y * 5).toFixed(2) +
      'deg) rotateY(' +
      (x * 6).toFixed(2) +
      'deg) translateY(-4px)';
  };

  const onLeave = () => {
    if (ref.current) {
      ref.current.style.transform = '';
    }
  };

  const projectDetailsUrl = p.slug ? `/projects/${encodeURIComponent(p.slug)}` : '';

  return (
    <Reveal
      as="article"
      ref={ref}
      className={
        'pcard ' +
        className +
        ' ' +
        (p.tone === 'dark' ? 'dark' : '') +
        (img ? ' has-img' : '')
      }
      data-cat={p.cat}
      style={{ '--c1': color }}
      hidden={hidden}
      onPointerMove={onMove}
      onPointerLeave={onLeave}>
      <div className="art">
        {img ? (
          <img
            src={imageUrl(p.image)}
            alt={`${p.title} project preview`}
            loading="lazy"
          />
        ) : (
          <Art name={p.art || p.thumb} />
        )}
      </div>

      <span className="pc-num" aria-hidden="true">
        {String(i + 1).padStart(2, '0')}
      </span>

      <div className="pc-top">
        <h3>{p.title}</h3>
        <span>{p.kind}</span>
      </div>

      <div className="pc-bot">
        {p.desc ? <p className="pc-desc">{p.desc}</p> : null}

        {p.tags.length ? (
          <ul className="ptags">
            {p.tags.slice(0, 4).map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}

        <div className="pc-row">
          {projectDetailsUrl ? (
            <a className="pc-link" href={projectDetailsUrl}>
              Details
            </a>
          ) : null}

          {p.demo ? (
            <a
              className="pc-link"
              href={url(p.demo)}
              target="_blank"
              rel="noopener noreferrer">
              Live
            </a>
          ) : null}

          {p.code ? (
            <a
              className="pc-code"
              href={url(p.code)}
              target="_blank"
              rel="noopener noreferrer">
              GitHub
            </a>
          ) : null}

          {projectDetailsUrl ? (
            <a
              className="pc-go"
              href={projectDetailsUrl}
              aria-label={`View ${p.title} details`}>
              <ArrowIcon />
            </a>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}

export default function Work({
  sec,
  projectStatus = 'ready',
  projectError = '',
  onRetry,
}) {
  const cfg = useCfg();
  const [cat, setCat] = useState('');

  const projects = Array.isArray(cfg.projects) ? cfg.projects : [];

  const cats = [...new Set(projects.map((project) => project.cat).filter(Boolean))];

  const showFilters = cfg.features.projectFilter && cats.length > 1;

  return (
    <section className="section" id={sec.id}>
      <SectionHead sec={sec} />

      {showFilters ? (
        <Reveal
          className="filters"
          id="filters"
          role="group"
          aria-label="Filter projects">
          <button
            className="fchip"
            type="button"
            aria-pressed={cat === ''}
            onClick={() => setCat('')}>
            All
          </button>

          {cats.map((category) => (
            <button
              key={category}
              className="fchip"
              type="button"
              aria-pressed={cat === category}
              onClick={() => setCat(category)}>
              {category}
            </button>
          ))}
        </Reveal>
      ) : null}

      {projectStatus === 'loading' ? (
        <LoadingState label="Loading published projects..." />
      ) : null}

      {projectStatus === 'error' ? (
        <ErrorState message={projectError} onRetry={onRetry} />
      ) : null}

      {projectStatus === 'ready' && !projects.length ? (
        <EmptyState>Projects will appear here as they are published.</EmptyState>
      ) : null}

      {projectStatus === 'ready' && projects.length ? (
        <div className="pgrid" id="projects">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id || project.slug || `${project.title}-${index}`}
              p={project}
              i={index}
              hidden={Boolean(cat && project.cat !== cat)}
            />
          ))}
        </div>
      ) : null}

      {projectStatus === 'ready' && projects.length ? (
        <a className="btn btn-out projects-more" href="/projects">
          View all projects <ArrowIcon />
        </a>
      ) : null}
    </section>
  );
}
