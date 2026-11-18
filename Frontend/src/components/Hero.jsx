import { useCfg, secOn } from '../context.js';
import Profile from './Profile.jsx';
import { ArrowDownIcon, DownloadIcon, GridIcon, SparkIcon } from './Icons.jsx';
import { imageUrl } from '../lib/api.js';

export default function Hero({ next }) {
  const cfg = useCfg();
  const s = cfg.site;
  const role = 'Full Stack Developer';

  const cvUrl = s.cvUrl ? imageUrl(s.cvUrl) : '';

  const handleDownloadCv = async () => {
    if (!cvUrl) return;

    try {
      const response = await fetch(cvUrl);

      if (!response.ok) {
        throw new Error('CV download failed.');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Yamuna-Khadka-CV.pdf';

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error('CV download failed:', error);
    }
  };

  return (
    <section className="hero" id="home">
      <Profile />

      <div className="hero-main">
        <span className="chip hero-in" style={{ '--i': 1 }}>
          <SparkIcon />
          {s.chip || "Let's meet!"}
        </span>

        <h1
          className="h1 grad hero-in"
          style={{ '--i': 2 }}
          aria-label={`I'm ${s.name}, ${role}`}>
          <span>I'm {s.name}</span>

          <span className="role-line">
            <span>{role}</span>
          </span>
        </h1>

        {s.intro ? (
          <p className="hero-p hero-in" style={{ '--i': 3 }}>
            {s.intro}
          </p>
        ) : null}

        <div className="cta hero-in" style={{ '--i': 4 }}>
          {secOn(cfg, 'work') ? (
            <a className="btn btn-out" href="#work">
              My Works <GridIcon />
            </a>
          ) : null}

          <button
            type="button"
            className="btn btn-grad"
            onClick={handleDownloadCv}
            disabled={!cvUrl}>
            Download CV <DownloadIcon />
          </button>
        </div>
      </div>

      {next ? (
        <a
          className="scrollbadge hero-in"
          style={{ '--i': 6 }}
          href={'#' + next}
          aria-label="Scroll for more">
          <ArrowDownIcon />
        </a>
      ) : null}
    </section>
  );
}
