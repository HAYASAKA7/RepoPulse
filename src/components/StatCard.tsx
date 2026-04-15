import { SketchCard } from './SketchCard'
import { formatNumber } from '@/lib/github'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  delay?: number
}

export function StatCard({ icon, label, value, delay = 0 }: StatCardProps) {
  const formattedValue = typeof value === 'number' ? formatNumber(value) : value

  return (
    <SketchCard className="animate-wobble-in" delay={delay}>
      <div className="flex flex-col items-center gap-3">
        <div className="text-accent">
          {icon}
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold font-mono text-secondary mb-1">
            {formattedValue}
          </p>
          <p className="text-sm font-handwritten text-muted-foreground">
            {label}
          </p>
        </div>
      </div>
    </SketchCard>
  )
}
