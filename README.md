# God Jobs

**Open-source job board and feed aggregator** — search **remote jobs**, **on-site roles**, and startup-friendly listings pulled from public APIs and RSS. Built with [**Nuxt 4**](https://nuxt.com/), [**Vue 3**](https://vuejs.org/), and **SQLite** ([Drizzle ORM](https://orm.drizzle.team/)). Self-host in minutes; every listing links to the **original employer or board** so candidates apply at the source.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)

---

## Why God Jobs?

- **One search** across multiple providers (no single vendor lock-in).
- **Filters** by keyword, company, location, remote vs on-site, category, date, and source.
- **Exports** (JSON/CSV) and a simple **REST API** for your own tools.
- **Privacy-friendly**: run it on your own infra; data stays in your SQLite file unless you sync outbound.

Use it as a **personal job tracker**, a **team hiring hub**, or a **starting point** for a larger recruiting product.

---

## Features

| Area | Details |
|------|---------|
| **Job sources** | Remotive, Remote OK, Arbeitnow, Jobicy, Hacker News (Algolia), optional **Greenhouse** boards, **RSS/Atom** (e.g. We Work Remotely, custom feeds, [RSSHub](https://github.com/DIYgod/RSSHub) where allowed). |
| **Board UI** | Responsive job board with categories, sticky filters on desktop, mobile search sheet, pagination. |
| **Data** | SQLite + Drizzle; upsert by `(source, external_id)` so re-syncs update rows in place. |
| **Ops** | `POST /api/jobs/sync` to pull feeds; runtime env for RSS URLs and Greenhouse tokens. |
| **SEO** (deployed site) | Per-page meta, Open Graph/Twitter cards, canonical URLs, `robots.txt`, `sitemap.xml` when `NUXT_PUBLIC_SITE_URL` is set. |

> **Note:** Large sites (e.g. LinkedIn) do not offer a stable public job API for open aggregation. This project uses **documented public endpoints** and **RSS** you are allowed to use.

---

## Tech stack

- **Framework:** Nuxt 4, Vue 3, TypeScript  
- **Styling:** Tailwind CSS  
- **Database:** better-sqlite3 + Drizzle  
- **Validation:** Zod  

---

## Quick start

```bash
git clone https://github.com/god-plans/god-jobs.git
cd god-jobs
npm install
npm run dev
```

The dev server defaults to **port 3039** (see `nuxt.config.ts`). Open the URL shown in the terminal.

### Production build

```bash
npm run build
node .output/server/index.mjs
```

Set **`NUXT_PUBLIC_SITE_URL`** to your public origin (no trailing slash) so canonical URLs, Open Graph links, and the sitemap resolve correctly.

---

## Configuration

| Variable | Purpose |
|----------|---------|
| `NUXT_PUBLIC_SITE_URL` | Public site origin (`https://jobs.example.com`). Enables canonical/OG URLs and sitemap base. |
| `NUXT_JOBS_RSS_FEEDS` | Comma- or newline-separated RSS/Atom URLs merged into the `rss` sync source. |
| `NUXT_JOBS_GREENHOUSE_BOARDS` | Greenhouse board tokens (`boards.greenhouse.io/{token}`), or keyword `curated` for a built-in pack. |
| `NUXT_JOBS_GREENHOUSE_BOARD_LIST_URL` | URL to a plain-text list of extra board tokens (one per line). |
| `NUXT_JOBS_FETCH_USER_AGENT` | Optional full User-Agent string for outbound job syncs. Some hosts (e.g. certain VPS ranges) get **HTTP 403** from Remote OK with the default; set a normal browser UA here if sync logs show `Remote OK HTTP 403`. |
| `JOBS_GREENHOUSE_BOARDS` | Fallback if the `NUXT_`-prefixed key is not set (server). |
| `JOBS_FETCH_USER_AGENT` | Non-`NUXT_` fallback for the same User-Agent override (server). |

**Why fewer jobs on the server than locally?** One sync only upserts what each API returns right now (e.g. Jobicy caps at 100; HN is filtered hiring titles). **Remote OK** often accounts for ~100 rows; if it errors with 403 on your server, you lose that chunk. Your local SQLite may also contain **months of history** from earlier syncs. After deploy, run **Sync** again and check the per-source line in the snackbar; set `NUXT_JOBS_FETCH_USER_AGENT` or add `NUXT_JOBS_RSS_FEEDS` / Greenhouse if you need more volume.

See the in-app **Jobs → About sources** section for full behavior and export links.

---

## API highlights

- `GET /api/jobs` — List/filter jobs (query params for search, source, workplace, pagination).  
- `POST /api/jobs/sync` — Trigger ingestion (optional `sources`, `rssFeedUrls`, etc.).  
- `GET /api/export/jobs` — JSON or `?format=csv` export.  

---

## Repository layout (overview)

- `app/pages/jobs` — Job board UI  
- `server/utils/jobs` — Connectors (Remotive, Jobicy, Greenhouse, RSS, …)  
- `server/database` — Drizzle schema & migrations  
- `shared/` — Types and presets shared by app and server  

---

## Contributing

Issues and PRs are welcome: new **connectors** (public API or RSS), UX improvements, docs, and tests. Please keep changes focused and match existing patterns in `server/utils/jobs/connectors.ts`.

---

## License

[MIT](https://opensource.org/licenses/MIT) — see the [`package.json`](./package.json) `license` field.

---

### Suggested GitHub repository topics

`job-board` · `jobs` · `remote-jobs` · `job-aggregator` · `nuxt` · `nuxt4` · `vue` · `typescript` · `sqlite` · `drizzle-orm` · `open-source` · `rss` · `greenhouse` · `remotive` · `hackernews`
