import { JOB_SOURCE_PILL, JOB_SOURCE_PILL_DEFAULT } from '~~/shared/jobSourcePills'

export function useJobSourcePill() {
  const { isDark } = useGodJobsThemeIsDark()

  function sourcePillClass(src: string) {
    const key = isDark.value ? 'dark' : 'light'
    const entry = JOB_SOURCE_PILL[src]
    return (entry ? entry[key] : JOB_SOURCE_PILL_DEFAULT[key]) as string
  }

  return { sourcePillClass }
}
