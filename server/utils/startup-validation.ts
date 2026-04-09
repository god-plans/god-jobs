import { z } from 'zod'

function emptyToNull(val: unknown) {
  if (val === '' || val === undefined) return null
  return val
}

const textOpt = z.preprocess(emptyToNull, z.string().max(50000).nullable().optional())
const shortTextOpt = z.preprocess(emptyToNull, z.string().max(2000).nullable().optional())

export const insertStartupSchema = z.object({
  name: z.string().min(1).max(500),
  website: shortTextOpt,
  description: textOpt,
  fundingStage: shortTextOpt,
  fundingInfo: textOpt,
  employeeRange: shortTextOpt,
  growthSignals: textOpt,
  ceoName: shortTextOpt,
  ceoLinkedin: shortTextOpt,
  ctoName: shortTextOpt,
  ctoLinkedin: shortTextOpt,
  improvementIdea: textOpt,
  coldEmail: textOpt,
  notes: textOpt,
  techStack: textOpt,
  fitReason: textOpt,
  priorityRank: z
    .union([z.number().int().min(1).max(3), z.null()])
    .optional(),
  status: z.enum(['researched', 'contacted', 'replied', 'archived']).optional(),
})

export const updateStartupSchema = insertStartupSchema.partial().extend({
  name: z.string().min(1).max(500).optional(),
})

export type InsertStartupInput = z.infer<typeof insertStartupSchema>
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>
