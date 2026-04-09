import { jobListings } from '../../database/schema'
import { useDb } from '../db'
import { nowIso } from '../timestamps'
import type { NewJobListing } from './types'

export function upsertJobRows(rows: NewJobListing[]) {
  const db = useDb()
  const ts = nowIso()
  let count = 0
  for (const row of rows) {
    const insertRow = {
      ...row,
      createdAt: ts,
      updatedAt: ts,
    }
    db.insert(jobListings)
      .values(insertRow)
      .onConflictDoUpdate({
        target: [jobListings.source, jobListings.externalId],
        set: {
          title: row.title,
          company: row.company,
          url: row.url,
          location: row.location,
          remote: row.remote,
          postedAt: row.postedAt,
          snippet: row.snippet,
          rawJson: row.rawJson,
          updatedAt: ts,
        },
      })
      .run()
    count++
  }
  return count
}
