import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '../database/schema'
import { resolveMigrationsFolder } from './migration-folder'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
 * Netlify Functions, AWS Lambda, Vercel, etc. only allow writing under /tmp (or equivalent).
 * Creating `.data/` under `process.cwd()` fails with EACCES → 500 on `/api/*`.
 */
function isServerlessWritableTmp() {
  return Boolean(
    process.env.NETLIFY
    || process.env.AWS_LAMBDA_FUNCTION_NAME
    || process.env.AWS_EXECUTION_ENV
    || process.env.VERCEL
  )
}

function runtimePathOverrides(): { dataDir: string; sqlitePath: string } {
  try {
    const c = useRuntimeConfig()
    return {
      dataDir: String(c.godJobsDataDir ?? '').trim(),
      sqlitePath: String(c.godJobsSqlitePath ?? '').trim(),
    }
  }
  catch {
    return { dataDir: '', sqlitePath: '' }
  }
}

function getDataDir() {
  const rc = runtimePathOverrides()
  const override = rc.dataDir || process.env.GOD_JOBS_DATA_DIR?.trim()
  if (override)
    return override
  if (isServerlessWritableTmp())
    return join(tmpdir(), 'god-jobs-data')
  return join(process.cwd(), '.data')
}

function getDbPath() {
  const rc = runtimePathOverrides()
  const override = rc.sqlitePath || process.env.GOD_JOBS_SQLITE_PATH?.trim()
  if (override)
    return override
  return join(getDataDir(), 'god-jobs.sqlite')
}

export function useDb() {
  if (_db) return _db
  const dir = getDataDir()
  if (!existsSync(dir))
    mkdirSync(dir, { recursive: true })
  const sqlite = new Database(getDbPath())
  try {
    sqlite.pragma('journal_mode = WAL')
  }
  catch {
    sqlite.pragma('journal_mode = DELETE')
  }
  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: resolveMigrationsFolder() })
  _db = db
  return db
}
