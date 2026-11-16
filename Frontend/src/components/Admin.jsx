import { useEffect, useState } from "react";
import { api, apiUrl } from "../lib/api.js";
import { ArrowIcon } from "./Icons.jsx";

const empty = { title: "", desc: "", tags: [], demo: "", code: "", image: "", published: false };
const managed = ["about", "services", "stack", "experience", "education", "achievements"];

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin-token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [content, setContent] = useState({});
  const [messages, setMessages] = useState([]);

  const refresh = async (auth = token) => {
    const [projectList, ...records] = await Promise.all([api("/api/admin/projects", {}, auth), ...managed.map((key) => api(`/api/admin/${key}`, {}, auth)), api("/api/admin/messages", {}, auth)]);
    setProjects(projectList); setContent(Object.fromEntries(managed.map((key, index) => [key, JSON.stringify(records[index], null, 2)]))); setMessages(records.at(-1));
  };
  useEffect(() => {
    if (!token) return undefined;
    const timer = setTimeout(() => refresh().catch((error) => { setNotice(error.message); setToken(""); sessionStorage.removeItem("admin-token"); }), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  const field = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  const login = async (event) => {
    event.preventDefault(); setBusy(true); setNotice("");
    try { const result = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); sessionStorage.setItem("admin-token", result.token); setToken(result.token); setPassword(""); }
    catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };
  const logout = async () => { await api("/api/auth/logout", { method: "POST" }, token).catch(() => {}); sessionStorage.removeItem("admin-token"); setToken(""); };
  const image = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8 * 1024 * 1024) { setNotice("Choose a JPG, PNG, or WEBP image under 8 MB."); return; }
    setBusy(true);
    try {
      const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      const result = await api("/api/admin/uploads", { method: "POST", body: JSON.stringify({ data }) }, token);
      setForm((value) => ({ ...value, image: result.url })); setNotice("Image uploaded.");
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); event.target.value = ""; }
  };
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setNotice("");
    const payload = { ...form, tags: String(form.tags).split(",").map((tag) => tag.trim()).filter(Boolean) };
    try {
      await api(editId ? `/api/admin/projects/${editId}` : "/api/admin/projects", { method: editId ? "PUT" : "POST", body: JSON.stringify(payload) }, token);
      setForm(empty); setEditId(""); await refresh(); setNotice("Project saved.");
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };
  const edit = (project) => { setEditId(project.id); setForm({ ...empty, ...project, tags: (project.tags || []).join(", ") }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async (id) => { if (!window.confirm("Delete this project?")) return; try { await api(`/api/admin/projects/${id}`, { method: "DELETE" }, token); await refresh(); } catch (error) { setNotice(error.message); } };
  const saveContent = async (key) => {
    try { const data = JSON.parse(content[key]); if (key === "about" ? !data || Array.isArray(data) || typeof data !== "object" : !Array.isArray(data)) throw new Error(key === "about" ? "Use a JSON object." : "Use a JSON array."); await api(`/api/admin/${key}`, { method: "PUT", body: JSON.stringify({ [key]: data }) }, token); setContent((prev) => ({ ...prev, [key]: JSON.stringify(data, null, 2) })); setNotice(`${key} updated.`); }
    catch (error) { setNotice(error.message); }
  };
  const messageAction = async (message, removeMessage = false) => {
    try { await api(`/api/admin/messages/${message.id}`, removeMessage ? { method: "DELETE" } : { method: "PUT", body: JSON.stringify({ ...message, is_read: !message.is_read }) }, token); await refresh(); }
    catch (error) { setNotice(error.message); }
  };

  return <main className="admin-page">
    <a className="btn btn-text" href="/">← Back to portfolio</a>
    <h1 className="grad">Portfolio admin</h1>
    {token ? <>
      <button className="btn btn-out" onClick={logout}>Sign out</button>
      <section className="rcard glass admin-metrics"><h2>Dashboard</h2><p>{projects.length} projects · {projects.filter((item) => item.published).length} published · {JSON.parse(content.achievements || "[]").length} certifications · {messages.length} messages · {messages.filter((item) => !item.is_read).length} unread</p></section>
      <section className="rcard glass admin-form"><h2>{editId ? "Edit project" : "Add a project"}</h2>
        <form onSubmit={save}>
          <label>Title<input required value={form.title} onChange={field("title")} /></label>
          <label>Description<textarea required value={form.desc} onChange={field("desc")} /></label>
          <label>Technologies (comma separated)<input value={form.tags} onChange={field("tags")} /></label>
          <label>Project URL<input type="url" value={form.demo} onChange={field("demo")} /></label>
          <label>GitHub URL<input type="url" value={form.code} onChange={field("code")} /></label>
          <label>Project image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={image} /></label>
          {form.image ? <div className="admin-preview"><img src={apiUrl(form.image)} alt="Project preview" /><button type="button" className="btn btn-text" onClick={() => setForm((value) => ({ ...value, image: "" }))}>Remove image</button></div> : null}
          <label className="tgl"><input type="checkbox" checked={!!form.published} onChange={(event) => setForm((value) => ({ ...value, published: event.target.checked }))} /> Published</label>
          <button className="btn btn-grad" disabled={busy}>{busy ? "Saving…" : editId ? "Save changes" : "Add project"} <ArrowIcon /></button>
          {editId ? <button type="button" className="btn btn-out" onClick={() => { setForm(empty); setEditId(""); }}>Cancel</button> : null}
        </form>
      </section>
      <section className="rcard glass"><h2>Projects</h2>{projects.length ? projects.map((project) => <article className="admin-project" key={project.id}><div><b>{project.title}</b><small>{project.published ? "Published" : "Draft"}</small></div><button className="btn btn-out mini" onClick={() => edit(project)}>Edit</button><button className="btn btn-out mini" onClick={() => remove(project.id)}>Delete</button></article>) : <p>No projects yet.</p>}</section>
      {managed.map((key) => <section className="rcard glass admin-content" key={key}><details><summary><h2>{key === "achievements" ? "Certifications" : key[0].toUpperCase() + key.slice(1)}</h2></summary><p>{key === "about" ? 'Edit title, description, additionalDescription, and highlights.' : 'Edit the saved content as JSON. Set published to false to keep an item private.'}</p><textarea aria-label={`${key} data as JSON`} spellCheck={false} value={content[key] || (key === "about" ? "{}" : "[]")} onChange={(event) => setContent((prev) => ({ ...prev, [key]: event.target.value }))} /><button className="btn btn-grad" onClick={() => saveContent(key)}>Save {key}</button></details></section>)}
      <section className="rcard glass"><h2>Messages</h2>{messages.length ? messages.map((message) => <article className="admin-message" key={message.id}><b>{message.subject}</b><p>{message.name} · <a href={`mailto:${message.email}`}>{message.email}</a></p><p>{message.message}</p><small>{new Date(message.createdAt).toLocaleString()}</small><div className="secrow"><button className="btn btn-out mini" onClick={() => messageAction(message)}>{message.is_read ? "Mark unread" : "Mark read"}</button><button className="btn btn-out mini" onClick={() => messageAction(message, true)}>Delete</button></div></article>) : <p>No messages yet.</p>}</section>
    </> : <form className="rcard glass admin-form" onSubmit={login}><h2>Sign in</h2><label>Admin email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="btn btn-grad" disabled={busy}>Sign in</button></form>}
    <p role="status" aria-live="polite">{notice}</p>
  </main>;
}
