import usePublishedProject from '../hooks/usePublishedProject.js';
import { imageUrl } from '../services/api.js';
import { url } from '../lib/utils.js';
import { ErrorState, LoadingState } from '../components/RequestState.jsx';

export default function ProjectDetails({ slug }) {
  const { project, status, error, reload } = usePublishedProject(slug);

  return (
    <section className="section public-project-detail">
      <a className="btn btn-text back-projects" href="/projects">← Back to projects</a>
      {status === 'loading' ? <LoadingState label="Loading project..." /> : null}
      {status === 'error' ? <ErrorState message={error} onRetry={reload} /> : null}
      {status === 'ready' && project ? (
        <article className="project-detail-card rcard glass">
          {project.image ? (
            <img
              className="project-detail-image"
              src={imageUrl(project.image)}
              alt={`${project.title} project`}
            />
          ) : null}
          <div className="project-detail-content">
            <span className="chip">Project</span>
            <h1 className="grad">{project.title}</h1>
            <p>{project.description || project.desc}</p>
            {project.tags?.length ? (
              <ul className="ptags project-detail-tags">
                {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            ) : null}
            <div className="project-detail-links">
              {project.demo || project.project_url ? (
                <a className="btn btn-grad" href={url(project.demo || project.project_url)} target="_blank" rel="noopener noreferrer">
                  Live project
                </a>
              ) : null}
              {project.code || project.github_url ? (
                <a className="btn btn-out" href={url(project.code || project.github_url)} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              ) : null}
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}
