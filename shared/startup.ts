/** Mirrors API / DB shape for client-side typing */
export interface Startup {
  id: number
  name: string
  website: string | null
  description: string | null
  fundingStage: string | null
  fundingInfo: string | null
  employeeRange: string | null
  growthSignals: string | null
  ceoName: string | null
  ceoLinkedin: string | null
  ctoName: string | null
  ctoLinkedin: string | null
  improvementIdea: string | null
  coldEmail: string | null
  notes: string | null
  techStack: string | null
  fitReason: string | null
  priorityRank: number | null
  status: string
  contactEmail: string | null
  emailSubject: string | null
  lastOutreachAt: string | null
  lastOutreachError: string | null
  createdAt: string
  updatedAt: string
}

export type StartupPayload = Omit<Startup, 'id' | 'createdAt' | 'updatedAt'>
