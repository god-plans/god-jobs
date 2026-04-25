export function companyInitials(name: string | null | undefined): string {
  const n = (name ?? '').trim()
  if (!n)
    return '?'
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const a = parts[0]![0]
    const b = parts[1]![0]
    if (a && b)
      return (a + b).toUpperCase()
  }
  return n.slice(0, 2).toUpperCase() || '?'
}

/** Deterministic HSL background for placeholder “logo” circles. */
export function companyAvatarStyle(name: string | null | undefined): { background: string, color: string } {
  const s = name ?? ''
  let h = 0
  for (let i = 0; i < s.length; i++)
    h = (h + s.charCodeAt(i) * (i + 1)) % 360
  return {
    background: `hsl(${h} 38% 40%)`,
    color: '#f8fafc',
  }
}
