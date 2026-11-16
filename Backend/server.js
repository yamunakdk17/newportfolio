import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect as tlsConnect } from 'node:tls';

const root = fileURLToPath(new URL('.', import.meta.url));
try {
  const envText = await readFile(join(root, '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* optional; deployment environment variables also work */ }
const dataDir = join(root, 'data');
const uploadDir = join(root, 'uploads');
const dbPath = join(dataDir, 'portfolio.json');
const port = Number(process.env.PORT || 4000);
const allowedImages = new Map([['image/jpeg', '.jpg'], ['image/png', '.png'], ['image/webp', '.webp']]);
const sessions = new Set();
const initial = { projects: [], about: { title: 'About me', description: 'I’m a Full Stack Developer and fresher interested in frontend, backend, and MERN stack development. I build practical projects and keep improving my technical skills.', additionalDescription: 'I enjoy creating responsive interfaces, working with APIs, and learning how complete applications fit together.', highlights: [] }, services: [{ title: 'Frontend Development', description: 'Responsive interfaces built with React, JavaScript, HTML, and CSS.', published: true }, { title: 'Backend Development', description: 'Backend services and REST APIs using Node.js, Express, and Python.', published: true }, { title: 'Database Development', description: 'Working with MongoDB and MySQL for application data.', published: true }], stack: [{ name: 'Frontend', side: 'front', items: ['React', 'JavaScript', 'HTML', 'CSS'] }, { name: 'Backend', side: 'back', items: ['Node.js', 'Express.js', 'Python', 'REST API'] }, { name: 'Database', side: 'back', items: ['MongoDB', 'MySQL'] }, { name: 'Tools', side: 'back', items: ['Git', 'GitHub', 'Docker'] }], experience: [{ id: 'smart-gk-internship', when: '2026 — Present', title: 'Internship / Intern', org: 'Smart GK', note: '', published: true }], education: [{ id: 'bsc-csit-kfa', when: '2026 — Present', title: 'BSc CSIT', org: 'KFA College', note: 'Currently running; expected duration through 2029.', published: true }], achievements: [], messages: [] };

await mkdir(dataDir, { recursive: true });
await mkdir(uploadDir, { recursive: true });
try { await readFile(dbPath); } catch {
  let seed = initial;
  try { seed = JSON.parse(await readFile(join(root, 'portfolio.seed.json'), 'utf8')); } catch { /* use the built-in blank schema */ }
  await writeFile(dbPath, JSON.stringify(seed, null, 2));
}
const readDb = async () => JSON.parse(await readFile(dbPath, 'utf8'));
const saveDb = async (db) => writeFile(dbPath, JSON.stringify(db, null, 2));
const send = (res, status, body, headers = {}) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers }); res.end(JSON.stringify(body)); };
const readBody = (req, limit = 12 * 1024 * 1024) => new Promise((resolve, reject) => {
  const chunks = []; let size = 0;
  req.on('data', (chunk) => { size += chunk.length; if (size > limit) { reject(Object.assign(new Error('Request body too large'), { status: 413 })); req.destroy(); } else chunks.push(chunk); });
  req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); } });
  req.on('error', reject);
});
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const safeEqual = (a, b) => { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
const authorized = (req) => sessions.has(req.headers.authorization?.replace(/^Bearer\s+/i, ''));
async function deliverMail({ name, email, subject, message, createdAt }) {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 465);
  const user = process.env.MAIL_USER;
  const password = process.env.MAIL_PASSWORD;
  const from = process.env.MAIL_FROM || user;
  const to = process.env.CONTACT_RECEIVER_EMAIL || 'yamunakdk7@gmail.com';
  if (!host || !user || !password || !from) return false;
  if (port !== 465) throw new Error('Configure SMTP over implicit TLS on port 465.');
  const socket = tlsConnect({ host, port, servername: host });
  socket.setEncoding('utf8');
  let buffer = '';
  const waiting = [];
  let current;
  socket.on('data', (chunk) => {
    buffer += chunk;
    if (current && /(?:^|\r?\n)\d{3} /.test(buffer)) { const result = buffer; buffer = ''; current.resolve(result); current = null; }
  });
  socket.on('error', (error) => { if (current) current.reject(error); while (waiting.length) waiting.shift().reject(error); });
  const reply = () => new Promise((resolve, reject) => { current = { resolve, reject }; if (/(?:^|\r?\n)\d{3} /.test(buffer)) { const result = buffer; buffer = ''; current = null; resolve(result); } });
  const command = async (line, expected) => { const response = reply(); socket.write(line + '\r\n'); const result = await response; if (!result.includes(String(expected))) throw new Error('SMTP rejected a mail command.'); return result; };
  try {
    await new Promise((resolve, reject) => { socket.once('secureConnect', resolve); socket.once('error', reject); });
    const greeting = await reply(); if (!greeting.startsWith('220')) throw new Error('SMTP server unavailable.');
    await command('EHLO portfolio.local', '250');
    await command('AUTH LOGIN', '334'); await command(Buffer.from(user).toString('base64'), '334'); await command(Buffer.from(password).toString('base64'), '235');
    await command(`MAIL FROM:<${from}>`, '250'); await command(`RCPT TO:<${to}>`, '250'); await command('DATA', '354');
    const encodedSubject = Buffer.from(subject).toString('base64');
    const body = [`Name: ${name}`, `Email: ${email}`, `Subject: ${subject}`, `Submitted: ${createdAt}`, '', message].join('\r\n');
    const encodedBody = Buffer.from(body).toString('base64').match(/.{1,76}/g).join('\r\n');
    socket.write(`From: ${from}\r\nTo: ${to}\r\nReply-To: ${email}\r\nSubject: =?UTF-8?B?${encodedSubject}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${encodedBody}\r\n.\r\n`);
    const sent = await reply(); if (!sent.startsWith('250')) throw new Error('SMTP could not deliver the message.');
    await command('QUIT', '221'); return true;
  } finally { socket.destroy(); }
}
const cors = (req, res) => {
  const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  if (req.headers.origin === origin) res.setHeader('access-control-allow-origin', origin);
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('access-control-allow-headers', 'Content-Type,Authorization');
};
const server = createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true });
    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const { email, password } = await readBody(req, 16_384);
      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return send(res, 503, { error: 'Set ADMIN_EMAIL and ADMIN_PASSWORD in Backend/.env.' });
      if (!safeEqual(email, process.env.ADMIN_EMAIL) || !safeEqual(password, process.env.ADMIN_PASSWORD)) return send(res, 401, { error: 'Invalid credentials.' });
      const token = randomBytes(32).toString('hex'); sessions.add(token); return send(res, 200, { token });
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/logout') { sessions.delete(req.headers.authorization?.replace(/^Bearer\s+/i, '')); return send(res, 200, { ok: true }); }
    if (req.method === 'GET' && url.pathname.startsWith('/uploads/')) {
      const name = url.pathname.slice('/uploads/'.length);
      if (!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(name)) return send(res, 404, { error: 'Not found.' });
      const file = await readFile(join(uploadDir, name));
      res.writeHead(200, { 'content-type': name.endsWith('.png') ? 'image/png' : name.endsWith('.webp') ? 'image/webp' : 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable' }); return res.end(file);
    }
    if (req.method === 'GET' && ['/api/portfolio', '/api/projects', '/api/about', '/api/capabilities', '/api/experience', '/api/education', '/api/certifications'].includes(url.pathname)) {
      const db = await readDb();
      const content = { projects: db.projects.filter((p) => p.published), about: db.about, services: db.services.filter((item) => item.published !== false), capabilities: db.services.filter((item) => item.published !== false), stack: db.stack, experience: db.experience.filter((item) => item.published !== false), education: db.education.filter((item) => item.published !== false), achievements: db.achievements.filter((a) => a.published) };
      const routeKey = { '/api/projects': 'projects', '/api/about': 'about', '/api/capabilities': 'capabilities', '/api/experience': 'experience', '/api/education': 'education', '/api/certifications': 'achievements' }[url.pathname];
      return send(res, 200, routeKey ? content[routeKey] : content);
    }
    if (req.method === 'POST' && url.pathname === '/api/contact') {
      const body = await readBody(req, 32_000); const name = String(body.name || '').trim(); const email = String(body.email || '').trim(); const subject = String(body.subject || '').trim(); const message = String(body.message || '').trim();
      if (name.length < 2 || name.length > 120 || !validEmail(email) || subject.length < 2 || subject.length > 180 || message.length < 5 || message.length > 5000) return send(res, 400, { error: 'Enter a valid name, email, subject, and message.' });
      const createdAt = new Date().toISOString(); const entry = { id: randomBytes(12).toString('hex'), name, email, subject, message, createdAt, is_read: false };
      const db = await readDb(); db.messages.push(entry); await saveDb(db);
      try {
        const sent = await deliverMail({ ...entry });
        if (!sent) return send(res, 503, { error: 'Message saved, but email delivery is not configured yet.' });
      } catch { return send(res, 502, { error: 'Message saved, but email delivery failed. Please try again later.' }); }
      return send(res, 201, { ok: true, message: 'Thanks for reaching out. Your message has been sent successfully.' });
    }
    if (url.pathname.startsWith('/api/admin/')) {
      if (!authorized(req)) return send(res, 401, { error: 'Please sign in again.' });
      if (req.method === 'POST' && url.pathname === '/api/admin/uploads') {
        const body = await readBody(req); const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(body.data || '');
        if (!match || !allowedImages.has(match[1])) return send(res, 400, { error: 'Upload JPG, PNG, or WEBP images only.' });
        const bytes = Buffer.from(match[2], 'base64'); if (!bytes.length || bytes.length > 8 * 1024 * 1024) return send(res, 413, { error: 'Image must be smaller than 8 MB.' });
        const signatureValid = match[1] === 'image/jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff : match[1] === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
        if (!signatureValid) return send(res, 400, { error: 'The file contents do not match a supported image format.' });
        const id = randomBytes(16).toString('hex'); const filename = `${id}${allowedImages.get(match[1])}`; await writeFile(join(uploadDir, filename), bytes, { flag: 'wx' });
        return send(res, 201, { url: `/uploads/${filename}` });
      }
      const [key, recordId] = url.pathname.slice('/api/admin/'.length).split('/');
      if (!['projects', 'about', 'services', 'stack', 'experience', 'education', 'achievements', 'messages'].includes(key)) return send(res, 404, { error: 'Unknown content type.' });
      const db = await readDb();
      if (req.method === 'GET' && key === 'messages') return send(res, 200, db.messages);
      if (req.method === 'GET') return send(res, 200, db[key]);
      if (req.method === 'PUT' && url.pathname === `/api/admin/${key}`) {
        const body = await readBody(req);
        if (!(key === 'about' ? body[key] && typeof body[key] === 'object' && !Array.isArray(body[key]) : Array.isArray(body[key]))) return send(res, 400, { error: `${key} has an invalid format.` });
        db[key] = body[key]; await saveDb(db); return send(res, 200, { [key]: db[key] });
      }
      else if (req.method === 'POST') {
        const item = await readBody(req); if (!item.title && key !== 'messages') return send(res, 400, { error: 'A title is required.' });
        const saved = { ...item, id: item.id || randomBytes(12).toString('hex') }; db[key].push(saved); await saveDb(db); return send(res, 201, saved);
      } else if (req.method === 'PUT') {
        const id = recordId; const item = await readBody(req); const index = db[key].findIndex((entry) => entry.id === id);
        if (index < 0) return send(res, 404, { error: 'Record not found.' }); db[key][index] = { ...db[key][index], ...item, id }; await saveDb(db); return send(res, 200, db[key][index]);
      } else if (req.method === 'DELETE') {
        const id = recordId; const before = db[key].length; db[key] = db[key].filter((entry) => entry.id !== id); if (db[key].length === before) return send(res, 404, { error: 'Record not found.' }); await saveDb(db); return send(res, 200, { ok: true });
      } else return send(res, 405, { error: 'Method not allowed.' });
      await saveDb(db); return send(res, 200, { [key]: db[key] });
    }
    return send(res, 404, { error: 'Not found.' });
  } catch (error) { return send(res, error.status || 500, { error: error.status ? error.message : 'Server error.' }); }
});
server.listen(port, () => console.log(`Portfolio API listening on http://localhost:${port}`));
