import { useEffect, useRef, useState } from 'react'
import rough from 'roughjs'
import type { CommitData } from '@/lib/types'

interface SketchChartProps {
  data: CommitData[]
  title: string
}

export function SketchChart({ data, title }: SketchChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setAnimationProgress(0)
    
    const startTime = Date.now()
    const duration = 1200
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      
      setAnimationProgress(easeProgress)
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [data])

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const canvas = canvasRef.current
    const rc = rough.canvas(canvas)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = 800
    const height = 400
    
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const padding = { top: 40, right: 40, bottom: 60, left: 60 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    const maxValue = Math.max(...data.map(d => d.commits), 10)
    const step = chartWidth / (data.length - 1 || 1)

    const points: [number, number][] = data.map((d, i) => {
      const x = padding.left + i * step
      const y = padding.top + chartHeight - (d.commits / maxValue) * chartHeight
      return [x, y]
    })

    rc.rectangle(padding.left, padding.top, chartWidth, chartHeight, {
      stroke: 'oklch(0.35 0.01 270)',
      strokeWidth: 2,
      roughness: 1.5,
      fill: 'oklch(0.99 0 0)',
      fillStyle: 'solid',
    })

    const visiblePoints = Math.ceil(points.length * animationProgress)

    if (points.length > 1 && visiblePoints > 1) {
      const animatedPoints = points.slice(0, visiblePoints)
      const pathD = generateHandDrawnPath(animatedPoints)
      rc.path(pathD, {
        stroke: 'oklch(0.25 0.08 250)',
        strokeWidth: 3,
        roughness: 1.8,
        bowing: 2,
      })
    }

    points.forEach((point, i) => {
      if (i < visiblePoints) {
        const pointProgress = Math.min((animationProgress * points.length - i) / 0.3, 1)
        const scale = pointProgress < 0.5
          ? 2 * pointProgress * pointProgress
          : 1 - Math.pow(-2 * pointProgress + 2, 2) / 2
        
        if (scale > 0) {
          rc.circle(point[0], point[1], 8 * scale, {
            fill: 'oklch(0.65 0.15 55)',
            fillStyle: 'solid',
            stroke: 'oklch(0.25 0.08 250)',
            strokeWidth: 2,
            roughness: 1.2,
          })

          ctx.globalAlpha = scale
          ctx.font = '12px JetBrains Mono'
          ctx.fillStyle = 'oklch(0.35 0.01 270)'
          ctx.textAlign = 'center'
          ctx.fillText(data[i].month, point[0], height - padding.bottom + 20)
          ctx.globalAlpha = 1
        }
      }
    })

    const yAxisSteps = 5
    for (let i = 0; i <= yAxisSteps; i++) {
      const y = padding.top + (chartHeight / yAxisSteps) * i
      const value = Math.round(maxValue * (1 - i / yAxisSteps))
      
      ctx.font = '12px JetBrains Mono'
      ctx.fillStyle = 'oklch(0.35 0.01 270)'
      ctx.textAlign = 'right'
      ctx.fillText(value.toString(), padding.left - 10, y + 4)
    }

    ctx.font = 'bold 18px Indie Flower'
    ctx.fillStyle = 'oklch(0.25 0.08 250)'
    ctx.textAlign = 'center'
    ctx.fillText(title, width / 2, 25)
  }, [data, title, animationProgress])

  return (
    <div className="flex items-center justify-center w-full overflow-x-auto">
      <canvas ref={canvasRef} className="max-w-full" />
    </div>
  )
}

function generateHandDrawnPath(points: [number, number][]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`
  
  let path = `M ${points[0][0]} ${points[0][1]}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    
    const controlPointOffset = (p1[0] - p0[0]) * 0.5
    const cp1x = p0[0] + controlPointOffset
    const cp1y = p0[1]
    const cp2x = p1[0] - controlPointOffset
    const cp2y = p1[1]
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1[0]} ${p1[1]}`
  }
  
  return path
}
