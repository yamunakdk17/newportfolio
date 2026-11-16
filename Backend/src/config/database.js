import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  charset: 'utf8mb4',
  connectionLimit: 10,
  waitForConnections: true,
};

let pool = null;
let usingFallback = false;

export function isMysqlEnabled() {
  return Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER);
}

export async function initDatabase() {
  if (!isMysqlEnabled()) {
    const hasPartialConfiguration = [
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
    ].some((key) => process.env[key] !== undefined && process.env[key] !== '');

    if (
      hasPartialConfiguration ||
      process.env.NODE_ENV !== 'development' ||
      process.env.ALLOW_JSON_FALLBACK !== 'true'
    ) {
      throw new Error(
        'Complete MySQL configuration is required. Set DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD.',
      );
    }

    usingFallback = true;

    console.warn('MySQL is not configured. Using the development-only JSON store.');

    return false;
  }

  try {
    pool = mysql.createPool(config);

    await pool.query('SELECT 1');

    await ensureSchema();

    usingFallback = false;

    console.log('Connected to MySQL database.');

    return true;
  } catch (error) {
    await pool?.end();

    pool = null;
    usingFallback = false;

    throw new Error(`Could not connect to configured MySQL database: ${error.message}`);
  }
}

export function useFallbackStore() {
  return usingFallback;
}

export function getPool() {
  return pool;
}

async function ensureSchema() {
  const schema = [
    `CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS projects (
      id CHAR(36) NOT NULL,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(220) NOT NULL,
      description TEXT NOT NULL,
      image VARCHAR(255) DEFAULT '',
      technologies JSON NOT NULL,
      project_url VARCHAR(255) DEFAULT '',
      github_url VARCHAR(255) DEFAULT '',
      is_published TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_projects_slug (slug),
      KEY idx_projects_published_created (is_published, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS about (
      id CHAR(36) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      additional_description TEXT,
      highlights JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS services (
      id CHAR(36) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      published TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS stack (
      id CHAR(36) NOT NULL,
      name VARCHAR(120) NOT NULL,
      side VARCHAR(20) NOT NULL,
      items JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS experience (
      id CHAR(36) NOT NULL,
      when_text VARCHAR(120) NOT NULL,
      title VARCHAR(200) NOT NULL,
      org_name VARCHAR(200) NOT NULL,
      note TEXT,
      published TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS education (
      id CHAR(36) NOT NULL,
      when_text VARCHAR(120) NOT NULL,
      title VARCHAR(200) NOT NULL,
      org_name VARCHAR(200) NOT NULL,
      note TEXT,
      published TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS certifications (
      id CHAR(36) NOT NULL,
      title VARCHAR(200) NOT NULL,
      issuer VARCHAR(200) DEFAULT '',
      earned_date VARCHAR(80) DEFAULT '',
      description TEXT,
      published TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS contact_messages (
      id CHAR(36) NOT NULL,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL,
      subject VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (setting_key)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  ];

  for (const sql of schema) {
    await pool.query(sql);
  }

  await ensureProjectSchema();
}

async function ensureProjectSchema() {
  let [columns] = await pool.query('SHOW COLUMNS FROM projects');

  const originalFields = new Set(columns.map((column) => column.Field));

  const fields = new Set(originalFields);

  const additions = {
    title: "VARCHAR(200) NOT NULL DEFAULT ''",
    slug: 'VARCHAR(220) NULL',
    description: 'TEXT NULL',
    image: "VARCHAR(255) NOT NULL DEFAULT ''",
    technologies: 'JSON NULL',
    project_url: "VARCHAR(255) NOT NULL DEFAULT ''",
    github_url: "VARCHAR(255) NOT NULL DEFAULT ''",
    is_published: 'TINYINT(1) NOT NULL DEFAULT 0',
    created_at: 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  };

  for (const [field, definition] of Object.entries(additions)) {
    if (!fields.has(field)) {
      await pool.query(`ALTER TABLE projects ADD COLUMN ${field} ${definition}`);
    }
  }

  [columns] = await pool.query('SHOW COLUMNS FROM projects');

  const idColumn = columns.find((column) => column.Field === 'id');

  if (idColumn && !/^(char|varchar)\b/i.test(idColumn.Type)) {
    await pool.query('ALTER TABLE projects MODIFY id CHAR(36) NOT NULL');
  }

  const [rows] = await pool.query('SELECT * FROM projects');

  const usedSlugs = new Set();

  for (const row of rows) {
    const id = String(row.id);

    const title = String(row.title || '').trim();

    const baseSlug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'project';

    let slug = row.slug || `${baseSlug}-${id.slice(-8)}`;

    if (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${id.slice(-8)}`;
    }

    while (usedSlugs.has(slug)) {
      slug = `${slug}-${usedSlugs.size + 1}`;
    }

    usedSlugs.add(slug);

    const description = String(row.description || row.desc || '');

    const technologies = row.technologies ?? row.tags ?? [];

    let techList = technologies;

    if (typeof techList === 'string') {
      try {
        techList = JSON.parse(techList);
      } catch {
        techList = techList
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(techList)) {
      techList = [];
    }

    await pool.query(
      `UPDATE projects
       SET
         slug = ?,
         description = ?,
         image = ?,
         technologies = ?,
         project_url = ?,
         github_url = ?,
         is_published = ?
       WHERE id = ?`,
      [
        slug,
        description,
        row.image || '',
        JSON.stringify(techList),
        row.project_url || row.demo || '',
        row.github_url || row.code || '',
        originalFields.has('published') && !originalFields.has('is_published')
          ? (row.published ?? 0)
          : (row.is_published ?? 0),
        row.id,
      ],
    );
  }

  await pool.query('ALTER TABLE projects MODIFY slug VARCHAR(220) NOT NULL');

  const [indexes] = await pool.query('SHOW INDEX FROM projects');

  if (!indexes.some((index) => index.Key_name === 'uq_projects_slug')) {
    await pool.query('ALTER TABLE projects ADD UNIQUE KEY uq_projects_slug (slug)');
  }

  if (!indexes.some((index) => index.Key_name === 'idx_projects_published_created')) {
    await pool.query(
      'ALTER TABLE projects ADD KEY idx_projects_published_created (is_published, created_at)',
    );
  }
}

export async function readDatabaseSnapshot() {
  if (!pool) {
    return readPortfolioStore();
  }

  return {
    projects: await queryRows('SELECT * FROM projects ORDER BY created_at DESC'),

    about: await querySingle('SELECT * FROM about ORDER BY created_at DESC LIMIT 1'),

    services: await queryRows('SELECT * FROM services ORDER BY created_at DESC'),

    stack: await queryRows('SELECT * FROM stack ORDER BY created_at DESC'),

    experience: await queryRows('SELECT * FROM experience ORDER BY created_at DESC'),

    education: await queryRows('SELECT * FROM education ORDER BY created_at DESC'),

    achievements: await queryRows(
      'SELECT * FROM certifications ORDER BY created_at DESC',
    ),

    messages: await queryRows('SELECT * FROM contact_messages ORDER BY created_at DESC'),
  };
}

async function queryRows(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function querySingle(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}
