/**
 * HN Algolia returns stories matching keywords — many are Ask HN / discussions / news.
 * Keep rows that look like an actual hiring post (company or thread recruiting).
 */
export function hnTitleLooksLikeJobPost(title: string): boolean {
  const t = title.trim()
  if (!t) return false

  if (/^Ask HN:/i.test(t)) return false
  if (/^Tell HN:/i.test(t)) return false
  if (/^Poll:/i.test(t)) return false

  if (/^Show HN:/i.test(t)) {
    return (
      /\b(is hiring|we(?:'|’| a)re hiring|now hiring|we(?:'|’)?re recruiting)\b/i.test(t)
      || /\bhiring\s+(?:remote\s+)?(?:developers?|engineers?|designers?|interns?)\b/i.test(t)
      || /\bhiring:\s/i.test(t)
      || /\bcompanies\s+hiring\b/i.test(t)
    )
  }

  if (/\?\s*$/.test(t)) {
    if (/^(We(?:'|’| a)re hiring|Hiring:|Now hiring)/i.test(t)) return true
    return false
  }

  if (
    /\b(is hiring|we(?:'|’| a)re hiring|now hiring|we(?:'|’)?re recruiting)\b/i.test(t)
    || /\b\w[\w\s,.&'’-]{0,80}\s+is\s+hiring\b/i.test(t)
  ) {
    return true
  }

  if (
    /\bhiring\s+(?:remote\s+)?(?:senior\s+)?(?:full[\s-]?stack\s+)?(?:developers?|engineers?|designers?)\b/i.test(t)
    || /\bhiring\s+(?:a|an|the)\s+(?:remote\s+)?(?:senior\s+)?(?:react|golang|rust|python|rails|ios|android|vue|node\.?js)\s+(?:developer|engineer)\b/i.test(t)
    || /\b(?:seeks?|looking for)\s+(?:a|an|the|senior)?\s*(?:remote\s+)?(?:developers?|engineers?)\b/i.test(t)
  ) {
    return true
  }

  if (
    /\b(?:engineering|software)\s+(?:intern|internship)\b/i.test(t)
    || /\binterns?\s+(?:and|\/)\s*(?:developers?|engineers?)\b/i.test(t)
  ) {
    return true
  }

  return false
}
