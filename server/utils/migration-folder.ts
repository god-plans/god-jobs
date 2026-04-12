import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import journal from '../database/migrations/meta/_journal.json'
import { BUNDLED_SQL } from './bundled-migration-sql'

/**
 * Drizzle's `migrate()` reads a real directory. Serverless bundles omit `server/database/migrations`,
 * so we materialize the same files under /tmp from {@link BUNDLED_SQL}.
 */
export function resolveMigrationsFolder(): string {
  const local = join(process.cwd(), 'server/database/migrations')
  if (existsSync(join(local, 'meta', '_journal.json')))
    return local

  const dir = join(tmpdir(), 'god-jobs-drizzle-migrations')
  const journalPath = join(dir, 'meta', '_journal.json')
  if (!existsSync(journalPath)) {
    mkdirSync(join(dir, 'meta'), { recursive: true })
    writeFileSync(journalPath, JSON.stringify(journal))
    for (const entry of journal.entries) {
      const sql = BUNDLED_SQL[entry.tag]
      if (!sql)
        throw new Error(`[god-jobs] Add bundled SQL for migration tag "${entry.tag}" in server/utils/bundled-migration-sql.ts`)
      writeFileSync(join(dir, `${entry.tag}.sql`), sql)
    }
  }
  return dir
}
