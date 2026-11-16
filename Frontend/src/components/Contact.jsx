import { useState } from "react";
import { useCfg } from "../context.js";
import { url } from "../lib/utils.js";
import { ArrowIcon, MailIcon } from "./Icons.jsx";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";
import { api } from "../lib/api.js";

const strip = (u) => String(u).replace(/^https?:\/\/(www\.)?/, "");

export default function Contact({ sec, onToast }) {
  const cfg = useCfg();
  const s = cfg.site;
  const [form, setForm] = useState({ name: "", email: "", subject: "", msg: "" });
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(s.email);
      onToast("Email copied to clipboard");
    } catch {
      onToast(s.email);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const name = form.name.trim(),
      email = form.email.trim(),
      subject = form.subject.trim(), msg = form.msg.trim();
    if (!name || !email || !subject || !msg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNote("Enter your name, a valid email, a subject, and a message.");
      return;
    }
    setSending(true); setNote("");
    try {
      const result = await api("/api/contact", { method: "POST", body: JSON.stringify({ name, email, subject, message: msg }) });
      setNote(result.message); setForm({ name: "", email: "", subject: "", msg: "" });
    } catch (error) { setNote(error.message || "We could not send your message. Please try again."); }
    finally { setSending(false); }
  };

  const hasForm = cfg.features.contactForm;

  return (
    <section className="section" id={sec.id}>
      <SectionHead sec={sec} />
      <Reveal className="cta-card glass">
        <h3 className="grad">Let's work together on your next idea.</h3>
        <a className="btn btn-grad" href={"mailto:" + s.email}>
          Email me <MailIcon />
        </a>
      </Reveal>
      <Reveal className={"contact" + (hasForm ? "" : " solo")}>
        <div className="cinfo glass">
          {sec.lead ? <p className="lead">{sec.lead}</p> : null}
          <ul className="details">
            <li>
              <span>Email</span>
              <span className="cp">
                <a href={"mailto:" + s.email}>{s.email}</a>
                <button className="copy" type="button" onClick={copy}>
                  Copy
                </button>
              </span>
            </li>
            {s.phone ? (
              <li>
                <span>Phone</span>
                <a href={"tel:" + s.phone.replace(/\s+/g, "")}>{s.phone}</a>
              </li>
            ) : null}
            {s.location ? (
              <li>
                <span>Location</span>
                <b style={{ fontWeight: 500 }}>{s.location}</b>
              </li>
            ) : null}
            {s.github ? (
              <li>
                <span>GitHub</span>
                <a href={url(s.github)} target="_blank" rel="noopener">
                  {strip(s.github)}
                </a>
              </li>
            ) : null}
            {s.linkedin ? (
              <li>
                <span>LinkedIn</span>
                <a href={url(s.linkedin)} target="_blank" rel="noopener">
                  {strip(s.linkedin)}
                </a>
              </li>
            ) : null}
            {s.instagram ? (
              <li>
                <span>Instagram</span>
                <a href={url(s.instagram)} target="_blank" rel="noopener">
                  {strip(s.instagram)}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        {hasForm ? (
          <form className="form glass" id="form" noValidate onSubmit={submit}>
            <div className="field">
              <label htmlFor="f-name">Your name</label>
              <input
                id="f-name"
                autoComplete="name"
                required
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div className="field">
              <label htmlFor="f-email">Your email</label>
              <input
                id="f-email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set("email")}
              />
            </div>
            <div className="field">
              <label htmlFor="f-subject">Subject</label>
              <input id="f-subject" value={form.subject} onChange={set("subject")} required />
            </div>
            <div className="field">
              <label htmlFor="f-msg">Message</label>
              <textarea id="f-msg" value={form.msg} onChange={set("msg")} required minLength={5} />
            </div>
            <button className="btn btn-grad" type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send message"} <ArrowIcon />
            </button>
            <p className="note" id="note" aria-live="polite">
              {note}
            </p>
          </form>
        ) : null}
      </Reveal>
    </section>
  );
}
