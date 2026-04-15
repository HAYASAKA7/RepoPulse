export interface RepoData {
  name: string
  fullName: string
  description: string
  stars: number
  forks: number
  watchers: number
  latestRelease: string | null
  owner: string
  repo: string
}

export interface CommitData {
  month: string
  commits: number
}

export type TimePeriod = 'yearly' | 'monthly' | 'weekly'

export interface PeriodConfig {
  type: TimePeriod
  count: number
}

export interface StarHistory {
  month: string
  stars: number
}

export interface Contributor {
  login: string
  avatarUrl: string
  contributions: number
  profileUrl: string
}

export interface LanguageData {
  name: string
  bytes: number
  percentage: number
  color: string
}
