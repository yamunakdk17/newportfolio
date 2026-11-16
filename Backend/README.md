# Portfolio API

The backend is an Express MVC API. MySQL is the production data store; the JSON store is available only when development mode explicitly enables it.

## Setup

Use Node.js 20 or newer. Copy `.env.example` to `.env`, then set:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` to private credentials
- `FRONTEND_ORIGIN` to the exact deployed frontend origin
- `PORT` if the hosting platform does not provide it

Create the database before starting the API, for example:

```sql
CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Install and start:

```powershell
npm install
npm start
```

Tables are created on startup when absent. Existing project tables receive missing project fields and indexes without deleting their records. In production, set `NODE_ENV=production`; the backend refuses to start unless MySQL is configured and reachable.

For local development without MySQL only, clear all `DB_*` values in `.env`, keep `NODE_ENV=development`, and set `ALLOW_JSON_FALLBACK=true`. This stores development content in `data/portfolio.json`. When any MySQL configuration is present, connection errors stop startup rather than switching data stores.

## Project API

- `GET /api/admin/` — redirects browser visits to the frontend admin sign-in page
- `GET /api/projects` — published projects
- `GET /api/projects/:slug` — one published project
- `GET /api/admin/projects` — all projects (admin token required)
- `POST /api/admin/projects` — create (admin token required)
- `PUT /api/admin/projects/:id` — edit (admin token required)
- `PATCH /api/admin/projects/:id/publish` — publish/draft status (admin token required)
- `DELETE /api/admin/projects/:id` — delete (admin token required)
- `POST /api/admin/uploads` — authenticated JPG/JPEG, PNG, or WEBP upload (8 MB maximum)

Uploaded images are served under `/uploads/` from the backend's `uploads/` directory. Project records store these backend-relative URLs.
