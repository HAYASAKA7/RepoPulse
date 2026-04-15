import { SketchCard } from './SketchCard'
import { Trophy, Medal, Users } from '@phosphor-icons/react'
import type { Contributor } from '@/lib/types'
import { formatNumber } from '@/lib/github'

interface ContributorLeaderboardProps {
  contributors: Contributor[]
}

export function ContributorLeaderboard({ contributors }: ContributorLeaderboardProps) {
  const topContributors = contributors.slice(0, 10)
  const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0)

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} weight="fill" className="text-accent" />
      case 2:
        return <Medal size={24} weight="fill" className="text-accent opacity-80" />
      case 3:
        return <Medal size={24} weight="fill" className="text-accent opacity-60" />
      default:
        return <span className="font-mono font-bold text-muted-foreground">#{rank}</span>
    }
  }

  return (
    <SketchCard className="animate-wobble-in" delay={500}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Users size={32} weight="bold" className="text-accent" />
          <div>
            <h3 className="text-2xl font-bold font-handwritten text-primary">
              Top Contributors
            </h3>
            <p className="text-sm font-handwritten text-muted-foreground">
              {formatNumber(contributors.length)} total • {formatNumber(totalContributions)} contributions
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {topContributors.map((contributor, index) => {
            const rank = index + 1
            const percentage = ((contributor.contributions / totalContributions) * 100).toFixed(1)
            
            return (
              <div
                key={contributor.login}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition-colors group"
                style={{
                  animation: 'wobble-in 0.4s ease-out forwards',
                  animationDelay: `${550 + index * 50}ms`,
                  opacity: 0,
                }}
              >
                <div className="flex items-center justify-center w-10 h-10 shrink-0">
                  {getMedalIcon(rank)}
                </div>

                <a
                  href={contributor.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="relative">
                    <img
                      src={contributor.avatarUrl}
                      alt={contributor.login}
                      className="w-10 h-10 rounded-full border-2 border-secondary group-hover:border-accent transition-colors"
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-primary/10" 
                         style={{ transform: 'rotate(2deg)' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                      {contributor.login}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            animation: 'expand-bar 0.8s ease-out forwards',
                            animationDelay: `${600 + index * 50}ms`,
                            transformOrigin: 'left',
                          }}
                        />
                      </div>
                      <span className="text-xs font-handwritten text-muted-foreground whitespace-nowrap">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-mono font-bold text-secondary">
                      {formatNumber(contributor.contributions)}
                    </p>
                    <p className="text-xs font-handwritten text-muted-foreground">
                      commits
                    </p>
                  </div>
                </a>
              </div>
            )
          })}
        </div>

        {contributors.length > 10 && (
          <p className="text-center text-sm font-handwritten text-muted-foreground mt-4 pt-4 border-t-2 border-secondary/20">
            +{contributors.length - 10} more contributors
          </p>
        )}
      </div>
    </SketchCard>
  )
}
