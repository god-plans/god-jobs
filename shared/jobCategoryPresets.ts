/** Keyword OR-groups for GET /api/jobs?category=… and jobs page chips. */
export type JobCategoryPreset = {
  id: string
  label: string
  keywords: string[]
}

export const JOB_CATEGORY_PRESETS: JobCategoryPreset[] = [
  { id: 'frontend', label: 'Frontend', keywords: ['frontend', 'react', 'vue', 'angular', 'typescript', 'javascript', 'next.js', 'svelte'] },
  { id: 'backend', label: 'Backend', keywords: ['backend', 'golang', 'go engineer', 'node', 'python', 'java', 'ruby', 'rust', 'scala', 'api engineer'] },
  { id: 'fullstack', label: 'Full-stack', keywords: ['full stack', 'fullstack', 'full-stack'] },
  { id: 'devops', label: 'DevOps', keywords: ['devops', 'sre', 'site reliability', 'kubernetes', 'terraform', 'aws engineer', 'cloud engineer'] },
  { id: 'data', label: 'Data / ML', keywords: ['data engineer', 'data scientist', 'machine learning', 'ml engineer', 'analytics engineer', 'nlp'] },
  { id: 'mobile', label: 'Mobile', keywords: ['ios', 'android', 'mobile engineer', 'swift', 'kotlin', 'flutter', 'react native'] },
  { id: 'qa', label: 'QA', keywords: ['qa', 'quality assurance', 'test engineer', 'sdet', 'automation engineer'] },
  { id: 'security', label: 'Security', keywords: ['security', 'infosec', 'appsec', 'penetration'] },
  { id: 'product', label: 'Product', keywords: ['product manager', 'product owner', 'head of product'] },
  { id: 'design', label: 'Design', keywords: ['designer', 'ux', 'ui/', 'figma'] },
]

export function getCategoryPreset(id: string): JobCategoryPreset | undefined {
  return JOB_CATEGORY_PRESETS.find((p) => p.id === id)
}
