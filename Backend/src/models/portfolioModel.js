import { randomUUID } from 'node:crypto';
import { getPool, isMysqlEnabled, readDatabaseSnapshot, useFallbackStore } from '../config/database.js';
import { readPortfolioStore, writePortfolioStore } from '../utils/jsonStore.js';

const slugify = (value = '') => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
const makeSlug = (title, id) => `${slugify(title)}-${id.slice(0, 8)}`;
const missingProject = () => Object.assign(new Error('Project not found.'), { statusCode: 404 });

const parseJson = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

const asProjectRow = (project) => ({
  id: project.id || randomUUID(),
  title: String(project.title || '').trim(),
  slug: project.slug || slugify(project.title || ''),
  description: String(project.desc || project.description || '').trim(),
  image: String(project.image || '').trim(),
  technologies: JSON.stringify(Array.isArray(project.tags) ? project.tags : String(project.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)),
  project_url: String(project.demo || project.project_url || '').trim(),
  github_url: String(project.code || project.github_url || '').trim(),
  is_published: !!project.published,
});

const asAboutRow = (about) => ({
  id: about.id || randomUUID(),
  title: String(about.title || 'About me').trim(),
  description: String(about.description || '').trim(),
  additional_description: String(about.additionalDescription || about.additional_description || '').trim(),
  highlights: JSON.stringify(Array.isArray(about.highlights) ? about.highlights : []),
});

const asServiceRow = (item) => ({
  id: item.id || randomUUID(),
  title: String(item.title || '').trim(),
  description: String(item.description || '').trim(),
  published: !!item.published,
});

const asStackRow = (item) => ({
  id: item.id || randomUUID(),
  name: String(item.name || '').trim(),
  side: String(item.side || 'back').trim() || 'back',
  items: JSON.stringify(Array.isArray(item.items) ? item.items : []),
});

const asExperienceRow = (item) => ({
  id: item.id || randomUUID(),
  when_text: String(item.when || '').trim(),
  title: String(item.title || '').trim(),
  org_name: String(item.org || '').trim(),
  note: String(item.note || '').trim(),
  published: item.published !== false,
});

const asEducationRow = (item) => ({
  id: item.id || randomUUID(),
  when_text: String(item.when || '').trim(),
  title: String(item.title || '').trim(),
  org_name: String(item.org || '').trim(),
  note: String(item.note || '').trim(),
  published: item.published !== false,
});

const asAchievementRow = (item) => ({
  id: item.id || randomUUID(),
  title: String(item.title || '').trim(),
  issuer: String(item.issuer || '').trim(),
  earned_date: String(item.when || item.earnedDate || item.date || '').trim(),
  description: String(item.description || '').trim(),
  published: item.published !== false,
});

const toProjectOutput = (row) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  desc: row.description,
  description: row.description,
  image: row.image || '',
  tags: parseJson(row.technologies, []),
  demo: row.project_url || '',
  code: row.github_url || '',
  project_url: row.project_url || '',
  github_url: row.github_url || '',
  published: !!row.is_published,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toAboutOutput = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  additionalDescription: row.additional_description,
  highlights: parseJson(row.highlights, []),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toServiceOutput = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  published: !!row.published,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toStackOutput = (row) => ({
  id: row.id,
  name: row.name,
  side: row.side,
  items: parseJson(row.items, []),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toExperienceOutput = (row) => ({
  id: row.id,
  when: row.when_text,
  title: row.title,
  org: row.org_name,
  note: row.note,
  published: !!row.published,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toEducationOutput = (row) => ({
  id: row.id,
  when: row.when_text,
  title: row.title,
  org: row.org_name,
  note: row.note,
  published: !!row.published,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toAchievementOutput = (row) => ({
  id: row.id,
  title: row.title,
  issuer: row.issuer,
  when: row.earned_date,
  description: row.description,
  published: !!row.published,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toMessageOutput = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  subject: row.subject,
  message: row.message,
  is_read: !!row.is_read,
  createdAt: row.created_at,
});

async function getPublicDataFromDb() {
  const snapshot = await readDatabaseSnapshot();
  return {
    projects: (snapshot.projects || []).map(toProjectOutput).filter((item) => item.published),
    about: toAboutOutput(snapshot.about || { title: 'About me', description: '', additional_description: '', highlights: '[]' }),
    services: (snapshot.services || []).map(toServiceOutput).filter((item) => item.published !== false),
    capabilities: (snapshot.services || []).map(toServiceOutput).filter((item) => item.published !== false),
    stack: (snapshot.stack || []).map(toStackOutput),
    experience: (snapshot.experience || []).map(toExperienceOutput).filter((item) => item.published !== false),
    education: (snapshot.education || []).map(toEducationOutput).filter((item) => item.published !== false),
    achievements: (snapshot.achievements || []).map(toAchievementOutput).filter((item) => item.published !== false),
    messages: (snapshot.messages || []).map(toMessageOutput),
  };
}

export async function getPublicPortfolio() {
  if (isMysqlEnabled() && !useFallbackStore()) {
    return getPublicDataFromDb();
  }
  const snapshot = await readPortfolioStore();
  return {
    ...snapshot,
    projects: (snapshot.projects || [])
      .filter((project) => project.published === true)
      .map((project) => ({
        ...project,
        slug: project.slug || slugify(project.title || ''),
        desc: project.desc || project.description || '',
        description: project.description || project.desc || '',
        tags: Array.isArray(project.tags) ? project.tags : [],
        demo: project.demo || project.project_url || '',
        code: project.code || project.github_url || '',
      })),
  };
}

export async function getAdminCollections() {
  if (isMysqlEnabled() && !useFallbackStore()) {
    const snapshot = await readDatabaseSnapshot();
    return {
      projects: (snapshot.projects || []).map(toProjectOutput),
      about: snapshot.about ? toAboutOutput(snapshot.about) : { title: 'About me', description: '', additionalDescription: '', highlights: [] },
      services: (snapshot.services || []).map(toServiceOutput),
      stack: (snapshot.stack || []).map(toStackOutput),
      experience: (snapshot.experience || []).map(toExperienceOutput),
      education: (snapshot.education || []).map(toEducationOutput),
      achievements: (snapshot.achievements || []).map(toAchievementOutput),
      messages: (snapshot.messages || []).map(toMessageOutput),
    };
  }

  const snapshot = await readPortfolioStore();
  return {
    projects: snapshot.projects || [],
    about: snapshot.about && typeof snapshot.about === 'object' && !Array.isArray(snapshot.about) ? snapshot.about : { title: 'About me', description: '', additionalDescription: '', highlights: [] },
    services: snapshot.services || [],
    stack: snapshot.stack || [],
    experience: snapshot.experience || [],
    education: snapshot.education || [],
    achievements: snapshot.achievements || [],
    messages: snapshot.messages || [],
  };
}

export async function listProjects() {
  const { projects } = await getAdminCollections();
  return projects;
}

export async function getProjectById(id) {
  const projects = await listProjects();
  return projects.find((project) => project.id === id) || null;
}

export async function getPublishedProjectBySlug(slug) {
  if (isMysqlEnabled() && !useFallbackStore()) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM projects WHERE slug = ? AND is_published = 1 LIMIT 1', [slug]);
    return rows.length ? toProjectOutput(rows[0]) : null;
  }

  const { projects } = await getAdminCollections();
  const item = projects.find((project) => {
    const projectSlug = project.slug || slugify(project.title || '');
    return projectSlug === slug && project.published === true;
  });
  return item ? { ...item, slug: item.slug || slug, tags: item.tags || [] } : null;
}

export async function addProject(payload) {
  const id = randomUUID();
  const project = {
    id,
    title: String(payload.title || '').trim(),
    slug: makeSlug(payload.title || '', id),
    desc: String(payload.description || payload.desc || '').trim(),
    description: String(payload.description || payload.desc || '').trim(),
    tags: Array.isArray(payload.technologies || payload.tags) ? (payload.technologies || payload.tags) : [],
    image: String(payload.image || '').trim(),
    demo: String(payload.project_url || payload.demo || '').trim(),
    code: String(payload.github_url || payload.code || '').trim(),
    published: payload.published === true,
    createdAt: new Date().toISOString(),
  };

  if (isMysqlEnabled() && !useFallbackStore()) {
    const row = asProjectRow(project);
    const pool = getPool();
    await pool.query(
      'INSERT INTO projects (id, title, slug, description, image, technologies, project_url, github_url, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [row.id, row.title, row.slug, row.description, row.image, row.technologies, row.project_url, row.github_url, row.is_published ? 1 : 0],
    );
    return project;
  }

  const snapshot = await readPortfolioStore();
  snapshot.projects = snapshot.projects || [];
  snapshot.projects.push(project);
  await writePortfolioStore(snapshot);
  return project;
}

export async function updateProject(id, payload) {
  const project = {
    id,
    title: String(payload.title || '').trim(),
    slug: makeSlug(payload.title || '', id),
    desc: String(payload.description || payload.desc || '').trim(),
    description: String(payload.description || payload.desc || '').trim(),
    tags: Array.isArray(payload.technologies || payload.tags) ? (payload.technologies || payload.tags) : [],
    image: String(payload.image || '').trim(),
    demo: String(payload.project_url || payload.demo || '').trim(),
    code: String(payload.github_url || payload.code || '').trim(),
    published: payload.published === true,
  };

  if (isMysqlEnabled() && !useFallbackStore()) {
    const pool = getPool();
    const [found] = await pool.query('SELECT id FROM projects WHERE id = ? LIMIT 1', [id]);
    if (!found.length) throw missingProject();
    const row = asProjectRow(project);
    await pool.query(
      'UPDATE projects SET title = ?, slug = ?, description = ?, image = ?, technologies = ?, project_url = ?, github_url = ?, is_published = ? WHERE id = ?',
      [row.title, row.slug, row.description, row.image, row.technologies, row.project_url, row.github_url, row.is_published ? 1 : 0, id],
    );
    return project;
  }

  const snapshot = await readPortfolioStore();
  snapshot.projects = snapshot.projects || [];
  const index = snapshot.projects.findIndex((item) => item.id === id);
  if (index < 0) throw missingProject();
  snapshot.projects[index] = { ...snapshot.projects[index], ...project };
  await writePortfolioStore(snapshot);
  return snapshot.projects[index];
}

export async function deleteProject(id) {
  if (isMysqlEnabled() && !useFallbackStore()) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    if (!result.affectedRows) throw missingProject();
    return true;
  }

  const snapshot = await readPortfolioStore();
  const before = (snapshot.projects || []).length;
  snapshot.projects = (snapshot.projects || []).filter((item) => item.id !== id);
  if (snapshot.projects.length === before) throw missingProject();
  await writePortfolioStore(snapshot);
  return true;
}

export async function setProjectPublished(id, published) {
  if (isMysqlEnabled() && !useFallbackStore()) {
    const pool = getPool();
    const [result] = await pool.query('UPDATE projects SET is_published = ? WHERE id = ?', [published ? 1 : 0, id]);
    if (!result.affectedRows) {
      const [found] = await pool.query('SELECT id FROM projects WHERE id = ? LIMIT 1', [id]);
      if (!found.length) throw missingProject();
    }
    return getProjectById(id);
  }

  const snapshot = await readPortfolioStore();
  const project = (snapshot.projects || []).find((item) => item.id === id);
  if (!project) throw missingProject();
  project.published = published;
  await writePortfolioStore(snapshot);
  return project;
}

export async function saveAbout(content) {
  const payload = { id: content.id || randomUUID(), title: content.title || 'About me', description: content.description || '', additionalDescription: content.additionalDescription || '', highlights: Array.isArray(content.highlights) ? content.highlights : [] };

  if (isMysqlEnabled() && !useFallbackStore()) {
    const pool = getPool();
    const row = asAboutRow(payload);
    const [existing] = await pool.query('SELECT id FROM about LIMIT 1');
    if (existing.length === 0) {
      await pool.query('INSERT INTO about (id, title, description, additional_description, highlights) VALUES (?, ?, ?, ?, ?)', [row.id, row.title, row.description, row.additional_description, row.highlights]);
    } else {
      await pool.query('UPDATE about SET title = ?, description = ?, additional_description = ?, highlights = ? WHERE id = ?', [row.title, row.description, row.additional_description, row.highlights, existing[0].id]);
    }
    return payload;
  }

  const snapshot = await readPortfolioStore();
  snapshot.about = payload;
  await writePortfolioStore(snapshot);
  return payload;
}

export async function saveCollection(name, items) {
  if (isMysqlEnabled() && !useFallbackStore()) {
    const pool = getPool();
    if (name === 'about') return saveAbout(items);
    if (name === 'services') {
      await pool.query('DELETE FROM services');
      for (const item of items) {
        const row = asServiceRow(item);
        await pool.query('INSERT INTO services (id, title, description, published) VALUES (?, ?, ?, ?)', [row.id, row.title, row.description, row.published ? 1 : 0]);
      }
      return items;
    }
    if (name === 'stack') {
      await pool.query('DELETE FROM stack');
      for (const item of items) {
        const row = asStackRow(item);
        await pool.query('INSERT INTO stack (id, name, side, items) VALUES (?, ?, ?, ?)', [row.id, row.name, row.side, row.items]);
      }
      return items;
    }
    if (name === 'experience') {
      await pool.query('DELETE FROM experience');
      for (const item of items) {
        const row = asExperienceRow(item);
        await pool.query('INSERT INTO experience (id, when_text, title, org_name, note, published) VALUES (?, ?, ?, ?, ?, ?)', [row.id, row.when_text, row.title, row.org_name, row.note, row.published ? 1 : 0]);
      }
      return items;
    }
    if (name === 'education') {
      await pool.query('DELETE FROM education');
      for (const item of items) {
        const row = asEducationRow(item);
        await pool.query('INSERT INTO education (id, when_text, title, org_name, note, published) VALUES (?, ?, ?, ?, ?, ?)', [row.id, row.when_text, row.title, row.org_name, row.note, row.published ? 1 : 0]);
      }
      return items;
    }
    if (name === 'achievements') {
      await pool.query('DELETE FROM certifications');
      for (const item of items) {
        const row = asAchievementRow(item);
        await pool.query('INSERT INTO certifications (id, title, issuer, earned_date, description, published) VALUES (?, ?, ?, ?, ?, ?)', [row.id, row.title, row.issuer, row.earned_date, row.description, row.published ? 1 : 0]);
      }
      return items;
    }
  }

  const snapshot = await readPortfolioStore();
  snapshot[name] = items;
  await writePortfolioStore(snapshot);
  return items;
}

export async function getMessages() {
  if (isMysqlEnabled() && !useFallbackStore()) {
    return (await readDatabaseSnapshot()).messages.map(toMessageOutput);
  }
  const snapshot = await readPortfolioStore();
  return snapshot.messages || [];
}

export async function addMessage(payload) {
  const message = {
    id: payload.id || randomUUID(),
    name: String(payload.name || '').trim(),
    email: String(payload.email || '').trim(),
    subject: String(payload.subject || '').trim(),
    message: String(payload.message || '').trim(),
    is_read: !!payload.is_read,
    createdAt: payload.createdAt || new Date().toISOString(),
  };

  if (isMysqlEnabled() && !useFallbackStore()) {
    const pool = getPool();
    await pool.query(
      `INSERT INTO contact_messages (id, name, email, subject, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [message.id, message.name, message.email, message.subject, message.message, message.is_read ? 1 : 0, message.createdAt],
    );
    return message;
  }

  const snapshot = await readPortfolioStore();
  snapshot.messages = snapshot.messages || [];
  snapshot.messages.push(message);
  await writePortfolioStore(snapshot);
  return message;
}

export async function updateMessage(id, payload) {
  if (isMysqlEnabled() && !useFallbackStore()) {
    const pool = getPool();
    await pool.query('UPDATE contact_messages SET is_read = ? WHERE id = ?', [payload.is_read ? 1 : 0, id]);
    return { ...payload, id };
  }

  const snapshot = await readPortfolioStore();
  snapshot.messages = snapshot.messages || [];
  const index = snapshot.messages.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('Message not found.');
  snapshot.messages[index] = { ...snapshot.messages[index], ...payload, is_read: !!payload.is_read };
  await writePortfolioStore(snapshot);
  return snapshot.messages[index];
}

export async function deleteMessage(id) {
  if (isMysqlEnabled() && !useFallbackStore()) {
    const pool = getPool();
    await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    return true;
  }

  const snapshot = await readPortfolioStore();
  const before = snapshot.messages.length;
  snapshot.messages = (snapshot.messages || []).filter((item) => item.id !== id);
  if (snapshot.messages.length === before) throw new Error('Message not found.');
  await writePortfolioStore(snapshot);
  return true;
}
