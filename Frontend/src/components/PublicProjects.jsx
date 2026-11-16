import { useCallback, useEffect, useState } from "react";
import { api, imageUrl } from "../lib/api.js";
import { url } from "../lib/utils.js";
import { ProjectCard } from "./Work.jsx";
import SectionHead from "./SectionHead.jsx";
import { EmptyState, ErrorState, LoadingState } from "./RequestState.jsx";

export default function PublicProjects({ slug }) {
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      if (slug) {
        const result = await api(`/api/projects/${encodeURIComponent(slug)}`);
        setProject(result);
      } else {
        const result = await api("/api/projects");
        setProjects(Array.isArray(result) ? result : []);
      }
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.status === 404 ? "This project is not available." : requestError.message || "Could not load projects.");
      setStatus("error");
    }
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  if (slug) {
    return (
      <section className="section public-project-detail">
        <a className="btn btn-text back-projects" href="/projects">← Back to projects</a>
        {status === "loading" ? <LoadingState label="Loading project..." /> : null}
        {status === "error" ? <ErrorState message={error} onRetry={load} /> : null}
        {status === "ready" && project ? (
          <article className="project-detail-card rcard glass">
            {project.image ? <img className="project-detail-image" src={imageUrl(project.image)} alt={`${project.title} project`} /> : null}
            <div className="project-detail-content">
              <span className="chip">Project</span>
              <h1 className="grad">{project.title}</h1>
              <p>{project.description || project.desc}</p>
              {project.tags?.length ? (
                <ul className="ptags project-detail-tags">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              ) : null}
              <div className="project-detail-links">
                {project.demo || project.project_url ? <a className="btn btn-grad" href={url(project.demo || project.project_url)} target="_blank" rel="noopener noreferrer">Live project</a> : null}
                {project.code || project.github_url ? <a className="btn btn-out" href={url(project.code || project.github_url)} target="_blank" rel="noopener noreferrer">GitHub</a> : null}
              </div>
            </div>
          </article>
        ) : null}
      </section>
    );
  }

  return (
    <section className="section public-projects">
      <SectionHead heading="h1" sec={{ kicker: "Portfolio", title: "Projects I've {built}.", lead: "Published projects from my portfolio." }} />
      {status === "loading" ? <LoadingState label="Loading published projects..." /> : null}
      {status === "error" ? <ErrorState message={error} onRetry={load} /> : null}
      {status === "ready" && !projects.length ? <EmptyState>No projects have been published yet.</EmptyState> : null}
      {status === "ready" && projects.length ? (
        <div className="pgrid">
          {projects.map((item, index) => <ProjectCard key={item.id || item.slug} p={item} i={index} className="public-project-card" />)}
        </div>
      ) : null}
    </section>
  );
}
