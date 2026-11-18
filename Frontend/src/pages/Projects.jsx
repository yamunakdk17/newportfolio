import useProjects from '../hooks/useProjects.js';
import SectionHead from '../components/SectionHead.jsx';
import ProjectGrid from '../components/projects/ProjectGrid.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/RequestState.jsx';

export default function Projects() {
  const { projects, status, error, reload } = useProjects();

  return (
    <section className="section public-projects">
      <SectionHead
        heading="h1"
        sec={{
          kicker: 'Portfolio',
          title: "Projects I've {built}.",
          lead: 'Published projects from my portfolio.',
        }}
      />
      {status === 'loading' ? <LoadingState label="Loading published projects..." /> : null}
      {status === 'error' ? <ErrorState message={error} onRetry={reload} /> : null}
      {status === 'ready' && !projects.length ? (
        <EmptyState>No projects have been published yet.</EmptyState>
      ) : null}
      {status === 'ready' && projects.length ? (
        <ProjectGrid projects={projects} />
      ) : null}
    </section>
  );
}
