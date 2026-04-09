import { readBody } from 'h3'
import { z } from 'zod'
import { startups } from '../../database/schema'
import { useDb } from '../../utils/db'
import { nowIso } from '../../utils/timestamps'
import { searchGithubOrgs } from '../../utils/fetch-startups/github'
import {
  deriveNameFromTitle,
  deriveWebsite,
  searchHnStories,
} from '../../utils/fetch-startups/hn-stories'

const bodySchema = z.object({
  type: z.enum(['github', 'hn']),
  q: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(50).optional(),
})

export default defineEventHandler(async (event) => {
  const raw = await readBody(event)
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten() })
  }
  const { type, q, limit } = parsed.data
  const lim = limit ?? 20
  const db = useDb()
  const ts = nowIso()
  const created: { id: number; name: string }[] = []

  if (type === 'github') {
    const token = process.env.GITHUB_TOKEN
    const hits = await searchGithubOrgs(q, lim, token)
    for (const h of hits) {
      const website = h.blog || h.html_url
      const row = {
        name: h.login,
        website,
        description: h.description,
        fundingStage: null,
        fundingInfo: null,
        employeeRange: null,
        growthSignals: 'Imported from GitHub org search',
        ceoName: null,
        ceoLinkedin: null,
        ctoName: null,
        ctoLinkedin: null,
        improvementIdea: null,
        coldEmail: null,
        notes: `GitHub org: ${h.html_url}`,
        techStack: null,
        fitReason: null,
        priorityRank: null,
        contactEmail: null,
        emailSubject: null,
        lastOutreachAt: null,
        lastOutreachError: null,
        status: 'researched' as const,
        createdAt: ts,
        updatedAt: ts,
      }
      const ins = db.insert(startups).values(row).returning({ id: startups.id, name: startups.name }).all()
      const first = ins[0]
      if (first) created.push(first)
    }
  }
  else {
    const hits = await searchHnStories(q, lim)
    for (const h of hits) {
      const website = deriveWebsite(h)
      const row = {
        name: deriveNameFromTitle(h.title),
        website,
        description: h.storyText ? h.storyText.slice(0, 2000) : null,
        fundingStage: null,
        fundingInfo: null,
        employeeRange: null,
        growthSignals: 'Imported from HN Algolia story search',
        ceoName: null,
        ceoLinkedin: null,
        ctoName: null,
        ctoLinkedin: null,
        improvementIdea: null,
        coldEmail: null,
        notes: `HN story: ${h.objectID}`,
        techStack: null,
        fitReason: null,
        priorityRank: null,
        contactEmail: null,
        emailSubject: null,
        lastOutreachAt: null,
        lastOutreachError: null,
        status: 'researched' as const,
        createdAt: ts,
        updatedAt: ts,
      }
      const ins = db.insert(startups).values(row).returning({ id: startups.id, name: startups.name }).all()
      const first = ins[0]
      if (first) created.push(first)
    }
  }

  return { count: created.length, created }
})
