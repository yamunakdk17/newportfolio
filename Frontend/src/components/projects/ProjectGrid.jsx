import { ProjectCard } from '../Work.jsx';

export default function ProjectGrid({ projects }) {
  return (
    <div className="pgrid">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id || project.slug || `${project.title}-${index}`}
          p={project}
          i={index}
          className="public-project-card"
        />
      ))}
    </div>
  );
}
