import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '../database/schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

function getDbPath() {
  return join(process.cwd(), '.data', 'god-jobs.sqlite')
}

export function useDb() {
  if (_db) return _db
  const dir = join(process.cwd(), '.data')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const sqlite = new Database(getDbPath())
  sqlite.pragma('journal_mode = WAL')
  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: join(process.cwd(), 'server/database/migrations') })
  _db = db
  return db
}
