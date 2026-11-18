import Hero from '../components/Hero.jsx';
import Marquee from '../components/Marquee.jsx';
import Work from '../components/Work.jsx';
import About from '../components/About.jsx';
import Stack from '../components/Stack.jsx';
import Resume from '../components/Resume.jsx';
import Achievements from '../components/Achievements.jsx';
import Contact from '../components/Contact.jsx';

const SECTIONS = {
  work: Work,
  about: About,
  stack: Stack,
  resume: Resume,
  achievements: Achievements,
  contact: Contact,
};

export default function Home({
  cfg,
  projectStatus,
  projectError,
  onRetryProjects,
  onToast,
}) {
  const secs = cfg.sections.filter((section) => section.on && SECTIONS[section.id]);

  return (
    <>
      <Hero next={secs.length ? secs[0].id : ''} />

      {cfg.features.marquee && cfg.marquee.length ? (
        <Marquee items={cfg.marquee} />
      ) : null}

      {secs.map((sectionConfig) => {
        const Section = SECTIONS[sectionConfig.id];
        if (sectionConfig.id === 'work') {
          return (
            <Section
              key={sectionConfig.id}
              sec={sectionConfig}
              projectStatus={projectStatus}
              projectError={projectError}
              onRetry={onRetryProjects}
              onToast={onToast}
            />
          );
        }
        return (
          <Section
            key={sectionConfig.id}
            sec={sectionConfig}
            onToast={onToast}
          />
        );
      })}
    </>
  );
}
