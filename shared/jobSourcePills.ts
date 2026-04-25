/** Source badge colors: split by God Kit theme — Tailwind `dark:` follows OS, not `data-gk-theme`. */
export const JOB_SOURCE_PILL: Record<string, { light: string, dark: string }> = {
  remotive: {
    light: 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200/80',
    dark: 'bg-violet-500/20 text-violet-200 ring-1 ring-inset ring-violet-500/40',
  },
  arbeitnow: {
    light: 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200/90',
    dark: 'bg-amber-500/20 text-amber-200 ring-1 ring-inset ring-amber-500/35',
  },
  hn: {
    light: 'bg-orange-100 text-orange-900 ring-1 ring-inset ring-orange-200/80',
    dark: 'bg-orange-500/20 text-orange-200 ring-1 ring-inset ring-orange-500/35',
  },
  remoteok: {
    light: 'bg-sky-100 text-sky-900 ring-1 ring-inset ring-sky-200/80',
    dark: 'bg-sky-500/20 text-sky-200 ring-1 ring-inset ring-sky-500/35',
  },
  rss: {
    light: 'bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-200/80',
    dark: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-inset ring-emerald-500/35',
  },
  jobicy: {
    light: 'bg-fuchsia-100 text-fuchsia-900 ring-1 ring-inset ring-fuchsia-200/80',
    dark: 'bg-fuchsia-500/20 text-fuchsia-200 ring-1 ring-inset ring-fuchsia-500/35',
  },
  greenhouse: {
    light: 'bg-lime-100 text-lime-900 ring-1 ring-inset ring-lime-200/80',
    dark: 'bg-lime-500/15 text-lime-200 ring-1 ring-inset ring-lime-500/35',
  },
}

export const JOB_SOURCE_PILL_DEFAULT = {
  light: 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200',
  dark: 'bg-slate-500/20 text-slate-200 ring-1 ring-inset ring-slate-500/30',
} as const
