import { useCfg, secOn } from "../context.js";
import { imgOk, initials, url } from "../lib/utils.js";
import { GithubIcon, InstagramIcon, LinkedinIcon, MailIcon } from "./Icons.jsx";

/* The profile card on the left of the hero. It scrolls away with the hero. */
export default function Profile() {
  const cfg = useCfg();
  const s = cfg.site;
  const soc = [
    [s.github, <GithubIcon />, "GitHub"],
    [s.linkedin, <LinkedinIcon />, "LinkedIn"],
    [s.instagram, <InstagramIcon />, "Instagram"],
    [s.email ? "mailto:" + s.email : "", <MailIcon />, "Email"],
  ].filter((x) => x[0]);

  return (
    <aside
      className="profile glass hero-in"
      style={{ "--i": 0 }}
      aria-label="Profile"
    >
      <div className="pbrand">
        <span className="logo grad">{initials(s.name)}</span>
        <span className="pname">{s.name}</span>
      </div>
      <div className="pphoto">
        <div className="circle">
          {imgOk(s.photo) ? (
            <img src={s.photo} alt={s.name} />
          ) : (
            <span className="ini grad">{initials(s.name)}</span>
          )}
        </div>
      </div>
      <div className="pinfo">
        {s.specialization ? (
          <>
            <small>Specialization:</small>
            <b>{s.specialization}</b>
          </>
        ) : null}
        {s.location ? (
          <>
            <small>Based in:</small>
            <b>{s.location}</b>
          </>
        ) : null}
      </div>
      {soc.length ? (
        <div className="psoc">
          {soc.map(([href, icon, label]) => {
            const mail = href.indexOf("mailto:") === 0;
            return (
              <a
                key={label}
                href={url(href)}
                aria-label={label}
                {...(mail ? {} : { target: "_blank", rel: "noopener" })}
              >
                {icon}
              </a>
            );
          })}
        </div>
      ) : null}
      {s.available ? (
        <div className="avail">
          <i />
          {s.available}
        </div>
      ) : null}
      {secOn(cfg, "contact") ? (
        <a className="btn btn-grad wide" href="#contact">
          Let's Work Together!
        </a>
      ) : null}
    </aside>
  );
}
