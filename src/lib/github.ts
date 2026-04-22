import type { RepoData, CommitData, Contributor, LanguageData, PeriodConfig } from './types'

const GITHUB_API = 'https://api.github.com'
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json'
  }

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`
  }

  return headers
}

export function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim()
  
  const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/
  const urlMatch = trimmed.match(urlPattern)
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') }
  }
  
  const directPattern = /^([^\/\s]+)\/([^\/\s]+)$/
  const directMatch = trimmed.match(directPattern)
  if (directMatch) {
    return { owner: directMatch[1], repo: directMatch[2] }
  }
  
  return null
}

export async function fetchRepoData(owner: string, repo: string): Promise<RepoData> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: getHeaders()
  })
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found. Double-check the name?')
    }
    if (response.status === 403) {
      throw new Error('GitHub API limit reached. Try again in a bit!')
    }
    throw new Error('Failed to fetch repository data')
  }
  
  const data = await response.json()
  
  let latestRelease: string | null = null
  try {
    const releaseResponse = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/releases/latest`, {
      headers: getHeaders()
    })
    if (releaseResponse.ok) {
      const releaseData = await releaseResponse.json()
      latestRelease = releaseData.tag_name
    }
  } catch {
    latestRelease = null
  }
  
  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description || 'No description available',
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.subscribers_count,
    latestRelease,
    owner,
    repo,
  }
}

export async function fetchCommitActivity(owner: string, repo: string, periodConfig: PeriodConfig = { type: 'monthly', count: 12 }): Promise<CommitData[]> {
  const now = new Date()
  let startDate: Date
  let dataPoints: number
  let labelFormat: (date: Date) => string
  
  const { type: period, count } = periodConfig
  
  if (period === 'yearly') {
    startDate = new Date(now.getFullYear() - count, now.getMonth(), 1)
    dataPoints = count * 12
    labelFormat = (date) => date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  } else if (period === 'weekly') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - (count * 7))
    dataPoints = count
    labelFormat = (date) => {
      const weekNum = Math.ceil((date.getDate()) / 7)
      return `W${weekNum} ${date.toLocaleDateString('en-US', { month: 'short' })}`
    }
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth() - count, 1)
    dataPoints = count
    labelFormat = (date) => date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }
  
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/commits?since=${startDate.toISOString()}&per_page=100`,
    { headers: getHeaders() }
  )
  
  if (!response.ok) {
    return []
  }
  
  const commits = await response.json()
  
  const periodMap: { [key: string]: number } = {}
  
  commits.forEach((commit: { commit: { author: { date: string } } }) => {
    const date = new Date(commit.commit.author.date)
    let periodKey: string
    
    if (period === 'yearly') {
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    } else if (period === 'weekly') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      periodKey = weekStart.toISOString().split('T')[0]
    } else {
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }
    
    periodMap[periodKey] = (periodMap[periodKey] || 0) + 1
  })
  
  const periods: CommitData[] = []
  
  if (period === 'weekly') {
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - (i * 7))
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const periodKey = weekStart.toISOString().split('T')[0]
      const label = labelFormat(date)
      
      periods.push({
        month: label,
        commits: periodMap[periodKey] || 0,
      })
    }
  } else {
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(now.getMonth() - i)
      const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = labelFormat(date)
      
      periods.push({
        month: label,
        commits: periodMap[periodKey] || 0,
      })
    }
  }
  
  return periods
}

export async function fetchContributors(owner: string, repo: string): Promise<Contributor[]> {
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=100`,
    { headers: getHeaders() }
  )
  
  if (!response.ok) {
    return []
  }
  
  const contributors = await response.json()
  
  return contributors.map((contributor: {
    login: string
    avatar_url: string
    contributions: number
    html_url: string
  }) => ({
    login: contributor.login,
    avatarUrl: contributor.avatar_url,
    contributions: contributor.contributions,
    profileUrl: contributor.html_url,
  }))
}

export async function fetchLanguages(owner: string, repo: string): Promise<LanguageData[]> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
    headers: getHeaders()
  })
  
  if (!response.ok) {
    return []
  }
  
  const languages = await response.json()
  
  const languageColors: { [key: string]: string } = {
    'JavaScript': 'oklch(0.75 0.15 85)',
    'TypeScript': 'oklch(0.55 0.15 250)',
    'Python': 'oklch(0.55 0.18 230)',
    'Java': 'oklch(0.65 0.18 35)',
    'C++': 'oklch(0.60 0.12 320)',
    'C': 'oklch(0.50 0.10 240)',
    'C#': 'oklch(0.55 0.15 140)',
    'Go': 'oklch(0.65 0.12 200)',
    'Rust': 'oklch(0.45 0.15 25)',
    'Ruby': 'oklch(0.55 0.20 5)',
    'PHP': 'oklch(0.55 0.15 270)',
    'Swift': 'oklch(0.65 0.18 30)',
    'Kotlin': 'oklch(0.60 0.15 280)',
    'HTML': 'oklch(0.65 0.20 25)',
    'CSS': 'oklch(0.55 0.15 270)',
    'Shell': 'oklch(0.50 0.10 140)',
    'Dart': 'oklch(0.55 0.15 200)',
    'Scala': 'oklch(0.55 0.18 5)',
    'R': 'oklch(0.55 0.15 230)',
    'Objective-C': 'oklch(0.55 0.12 220)',
  }
  
  const totalBytes = Object.values(languages).reduce((sum: number, bytes) => sum + (bytes as number), 0)
  
  return Object.entries(languages)
    .map(([name, bytes]) => ({
      name,
      bytes: bytes as number,
      percentage: ((bytes as number) / totalBytes) * 100,
      color: languageColors[name] || `oklch(${0.5 + Math.random() * 0.3} 0.15 ${Math.random() * 360})`,
    }))
    .sort((a, b) => b.bytes - a.bytes)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}
