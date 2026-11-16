import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', '..', 'data');
const dbPath = join(dataDir, 'portfolio.json');
const seedPath = join(__dirname, '..', '..', 'portfolio.seed.json');

await mkdir(dataDir, { recursive: true });

const defaultData = {
  projects: [],
  about: { title: 'About me', description: 'I’m a Full Stack Developer and fresher interested in frontend, backend, and MERN stack development. I build practical projects and keep improving my technical skills.', additionalDescription: 'I enjoy creating responsive interfaces, working with APIs, and learning how complete applications fit together.', highlights: [] },
  services: [
    { title: 'Frontend Development', description: 'Responsive interfaces built with React, JavaScript, HTML, and CSS.', published: true },
    { title: 'Backend Development', description: 'Backend services and REST APIs using Node.js, Express, and Python.', published: true },
    { title: 'Database Development', description: 'Working with MongoDB and MySQL for application data.', published: true },
  ],
  stack: [
    { name: 'Frontend', side: 'front', items: ['React', 'JavaScript', 'HTML', 'CSS'] },
    { name: 'Backend', side: 'back', items: ['Node.js', 'Express.js', 'Python', 'REST API'] },
    { name: 'Database', side: 'back', items: ['MongoDB', 'MySQL'] },
    { name: 'Tools', side: 'back', items: ['Git', 'GitHub', 'Docker'] },
  ],
  experience: [{ id: 'smart-gk-internship', when: '2026 — Present', title: 'Internship / Intern', org: 'Smart GK', note: '', published: true }],
  education: [{ id: 'bsc-csit-kfa', when: '2026 — Present', title: 'BSc CSIT', org: 'KFA College', note: 'Currently running; expected duration through 2029.', published: true }],
  achievements: [],
  messages: [],
};

export async function readPortfolioStore() {
  try {
    const raw = await readFile(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    try {
      const seeded = await readFile(seedPath, 'utf8');
      const parsed = JSON.parse(seeded);
      await writeFile(dbPath, JSON.stringify(parsed, null, 2));
      return parsed;
    } catch {
      await writeFile(dbPath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
  }
}

export async function writePortfolioStore(data) {
  await writeFile(dbPath, JSON.stringify(data, null, 2));
  return data;
}
