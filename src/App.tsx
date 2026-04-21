import { useState, useEffect } from 'react'
import { Star, GitFork, Eye, Tag, MagnifyingGlass, WarningCircle, ArrowClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SketchCard } from '@/components/SketchCard'
import { StatCard } from '@/components/StatCard'
import { SketchChart } from '@/components/SketchChart'
import { LanguageChart } from '@/components/LanguageChart'
import { SketchingLoader } from '@/components/SketchingLoader'
import { ContributorLeaderboard } from '@/components/ContributorLeaderboard'
import { parseRepoInput, fetchRepoData, fetchCommitActivity, fetchContributors, fetchLanguages } from '@/lib/github'
import { toast } from 'sonner'
import type { RepoData, CommitData, Contributor, LanguageData, TimePeriod, PeriodConfig } from '@/lib/types'

function App() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [commitData, setCommitData] = useState<CommitData[]>([])
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [languages, setLanguages] = useState<LanguageData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [periodType, setPeriodType] = useState<TimePeriod>('monthly')
  const [periodCount, setPeriodCount] = useState(12)
  const [isChangingPeriod, setIsChangingPeriod] = useState(false)
  const [isEmbedMode, setIsEmbedMode] = useState(false)

  const periodConfig: PeriodConfig = { type: periodType, count: periodCount }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const repoParam = params.get('repo')
    const modeParam = params.get('mode')
    const periodParam = params.get('period') as TimePeriod | null
    const countParam = params.get('count')

    if (modeParam === 'embed') {
      setIsEmbedMode(true)
    }

    let initialPeriodConfig = periodConfig

    if (periodParam && ['weekly', 'monthly', 'yearly'].includes(periodParam)) {
      setPeriodType(periodParam)
      initialPeriodConfig.type = periodParam
    }

    if (countParam) {
      const parsedCount = parseInt(countParam, 10)
      if (!isNaN(parsedCount) && parsedCount > 0) {
        setPeriodCount(parsedCount)
        initialPeriodConfig.count = parsedCount
      }
    }

    if (repoParam) {
      setInput(repoParam)
      // Small timeout to ensure state is set before search
      setTimeout(() => executeSearch(repoParam, initialPeriodConfig), 0)
    }
  }, [])

  const executeSearch = async (searchQuery: string, pConfig = periodConfig) => {
    const parsed = parseRepoInput(searchQuery)
    if (!parsed) {
      toast.error('Invalid format. Try: owner/repo or GitHub URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setRepoData(null)
    setCommitData([])
    setContributors([])
    setLanguages([])

    try {
      const [repo, commits, contribs, langs] = await Promise.all([
        fetchRepoData(parsed.owner, parsed.repo),
        fetchCommitActivity(parsed.owner, parsed.repo, pConfig),
        fetchContributors(parsed.owner, parsed.repo),
        fetchLanguages(parsed.owner, parsed.repo),
      ])

      setRepoData(repo)
      setCommitData(commits)
      setContributors(contribs)
      setLanguages(langs)
      if (!isEmbedMode) toast.success('Repository data loaded!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repository'
      setError(errorMessage)
      if (!isEmbedMode) toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (!input.trim()) {
      toast.error('Please enter a repository')
      return
    }
    executeSearch(input)
  }

  const handlePeriodTypeChange = async (newType: TimePeriod) => {
    if (!repoData || newType === periodType) return
    
    setPeriodType(newType)
    
    const defaultCounts = { weekly: 12, monthly: 12, yearly: 2 }
    const newCount = defaultCounts[newType]
    setPeriodCount(newCount)
    
    setIsChangingPeriod(true)
    
    try {
      const commits = await fetchCommitActivity(repoData.owner, repoData.repo, { type: newType, count: newCount })
      setCommitData(commits)
    } catch (err) {
      toast.error('Failed to fetch commit data')
    } finally {
      setIsChangingPeriod(false)
    }
  }

  const handleCountChange = async (newCount: number) => {
    if (!repoData || newCount === periodCount || newCount < 1) return
    
    setPeriodCount(newCount)
    setIsChangingPeriod(true)
    
    try {
      const commits = await fetchCommitActivity(repoData.owner, repoData.repo, { type: periodType, count: newCount })
      setCommitData(commits)
    } catch (err) {
      toast.error('Failed to fetch commit data')
    } finally {
      setIsChangingPeriod(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getChartTitle = () => {
    const unitLabel = periodType === 'yearly' ? 'Years' : periodType === 'weekly' ? 'Weeks' : 'Months'
    return `Commit Activity (Last ${periodCount} ${unitLabel})`
  }

  return (
    <div className={`min-h-screen paper-texture ${isEmbedMode ? 'py-4' : ''}`}>
      <div className={`container mx-auto px-4 sm:px-8 ${isEmbedMode ? 'py-0' : 'py-8'}`} id="repo-content">
        {!isEmbedMode && (
          <header className="mb-8 text-center">
            <h1 className="text-5xl font-bold font-handwritten text-primary mb-2" style={{ transform: 'rotate(-1deg)' }}>
              RepoPulse Sketch
            </h1>
            <p className="text-lg font-handwritten text-muted-foreground">
              Visualize GitHub repository stats in hand-drawn style
            </p>
          </header>
        )}

        {!isEmbedMode && (
          <div className="max-w-2xl mx-auto mb-12">
          <SketchCard>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="repo-search"
                type="text"
                placeholder="owner/repo or GitHub URL..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 font-mono border-2 border-secondary focus:border-accent transition-colors"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-handwritten text-lg px-6 transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <MagnifyingGlass size={20} weight="bold" className="mr-2" />
                Search
              </Button>
            </div>
              <p className="text-xs font-handwritten text-muted-foreground mt-3 text-center">
                Try: facebook/react or https://github.com/vercel/next.js
              </p>
            </SketchCard>
          </div>
        )}

        {isLoading && <SketchingLoader />}

        {error && !isLoading && (
          <div className="max-w-2xl mx-auto">
            <SketchCard className="animate-shake">
              <div className="flex items-center gap-4 text-destructive">
                <WarningCircle size={32} weight="bold" />
                <div>
                  <h3 className="font-handwritten text-xl font-bold mb-1">Oops!</h3>
                  <p className="font-handwritten">{error}</p>
                </div>
                <Button
                  onClick={handleSearch}
                  variant="outline"
                  className="ml-auto font-handwritten"
                >
                  <ArrowClockwise size={16} weight="bold" className="mr-2" />
                  Retry
                </Button>
              </div>
            </SketchCard>
          </div>
        )}

        {repoData && !isLoading && (
          <div className="space-y-8">
            <SketchCard className="animate-wobble-in">
              <div>
                <h2 className="text-3xl font-bold font-mono text-primary mb-2">
                  {repoData.fullName}
                </h2>
                <p className="font-handwritten text-lg text-muted-foreground">
                  {repoData.description}
                </p>
              </div>
            </SketchCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Star size={32} weight="fill" />}
                label="Stars"
                value={repoData.stars}
                delay={0}
              />
              <StatCard
                icon={<GitFork size={32} weight="bold" />}
                label="Forks"
                value={repoData.forks}
                delay={100}
              />
              <StatCard
                icon={<Eye size={32} weight="bold" />}
                label="Watchers"
                value={repoData.watchers}
                delay={200}
              />
              <StatCard
                icon={<Tag size={32} weight="bold" />}
                label="Latest Release"
                value={repoData.latestRelease || 'None'}
                delay={300}
              />
            </div>

            {commitData.length > 0 && (
              <SketchCard className="animate-wobble-in" delay={400}>
                {!isEmbedMode && (
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <h3 className="text-xl font-bold font-handwritten text-primary">
                        Time Period
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePeriodTypeChange('weekly')}
                          disabled={isChangingPeriod}
                          variant={periodType === 'weekly' ? 'default' : 'outline'}
                          className="font-handwritten"
                        >
                          Weekly
                        </Button>
                        <Button
                          onClick={() => handlePeriodTypeChange('monthly')}
                          disabled={isChangingPeriod}
                          variant={periodType === 'monthly' ? 'default' : 'outline'}
                          className="font-handwritten"
                        >
                          Monthly
                        </Button>
                        <Button
                          onClick={() => handlePeriodTypeChange('yearly')}
                          disabled={isChangingPeriod}
                          variant={periodType === 'yearly' ? 'default' : 'outline'}
                          className="font-handwritten"
                        >
                          Yearly
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-sm font-handwritten font-bold text-muted-foreground">
                        Number of {periodType === 'yearly' ? 'Years' : periodType === 'weekly' ? 'Weeks' : 'Months'}:
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="period-count"
                          type="number"
                          min="1"
                          max={periodType === 'yearly' ? '10' : periodType === 'weekly' ? '52' : '24'}
                          value={periodCount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value)
                            if (!isNaN(val) && val > 0) {
                              handleCountChange(val)
                            }
                          }}
                          disabled={isChangingPeriod}
                          className="w-20 font-mono border-2 border-secondary focus:border-accent transition-colors"
                        />
                        <span className="text-xs font-handwritten text-muted-foreground">
                          (1-{periodType === 'yearly' ? '10' : periodType === 'weekly' ? '52' : '24'})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <SketchChart
                  data={commitData}
                  title={getChartTitle()}
                />
              </SketchCard>
            )}

            {commitData.length === 0 && (
              <SketchCard className="animate-wobble-in" delay={400}>
                <p className="text-center font-handwritten text-lg text-muted-foreground py-8">
                  No commit history available for the selected period
                </p>
              </SketchCard>
            )}

            {languages.length > 0 && (
              <SketchCard className="animate-wobble-in" delay={500}>
                <LanguageChart
                  data={languages}
                  title="Language Breakdown"
                />
              </SketchCard>
            )}

            {contributors.length > 0 && (
              <ContributorLeaderboard contributors={isEmbedMode ? contributors.slice(0, 3) : contributors} />
            )}
          </div>
        )}

        {!repoData && !isLoading && !error && !isEmbedMode && (
          <div className="text-center py-16">
            <p className="text-2xl font-handwritten text-muted-foreground" style={{ transform: 'rotate(-0.5deg)' }}>
              Enter a repository to begin sketching...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App