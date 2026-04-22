import { useEffect, useRef, useState } from 'react'
import rough from 'roughjs'
import type { LanguageData } from '@/lib/types'

interface LanguageChartProps {
  data: LanguageData[]
  title: string
}

export function LanguageChart({ data, title }: LanguageChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setAnimationProgress(0)
    
    const startTime = Date.now()
    const duration = 1500
    
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

    const centerX = 280
    const centerY = height / 2
    const outerRadius = 110
    const innerRadius = 55

    let startAngle = -Math.PI / 2
    const topLanguages = data.slice(0, 5)
    let cumulativePercentage = 0

    topLanguages.forEach((lang, langIndex) => {
      const langProgress = Math.min(Math.max((animationProgress * topLanguages.length - langIndex) / 0.8, 0), 1)
      
      if (langProgress <= 0) {
        cumulativePercentage += lang.percentage
        return
      }

      const angle = (lang.percentage / 100) * 2 * Math.PI * langProgress
      const endAngle = startAngle + angle

      const numSegments = 20
      const visibleSegments = Math.ceil(numSegments * langProgress)
      
      for (let i = 0; i < visibleSegments; i++) {
        const segStart = startAngle + (i / numSegments) * angle
        const segEnd = startAngle + ((i + 1) / numSegments) * angle

        const x1 = centerX + Math.cos(segStart) * innerRadius
        const y1 = centerY + Math.sin(segStart) * innerRadius
        const x2 = centerX + Math.cos(segEnd) * innerRadius
        const y2 = centerY + Math.sin(segEnd) * innerRadius
        const x3 = centerX + Math.cos(segEnd) * outerRadius
        const y3 = centerY + Math.sin(segEnd) * outerRadius
        const x4 = centerX + Math.cos(segStart) * outerRadius
        const y4 = centerY + Math.sin(segStart) * outerRadius

        rc.polygon(
          [
            [x1, y1],
            [x2, y2],
            [x3, y3],
            [x4, y4],
          ],
          {
            fill: lang.color,
            fillStyle: 'hachure',
            fillWeight: 1.5,
            hachureAngle: 60 + i * 10,
            hachureGap: 4,
            stroke: 'none',
            roughness: 1.2,
          }
        )
      }

      const innerStartX = centerX + Math.cos(startAngle) * innerRadius
      const innerStartY = centerY + Math.sin(startAngle) * innerRadius
      const outerStartX = centerX + Math.cos(startAngle) * outerRadius
      const outerStartY = centerY + Math.sin(startAngle) * outerRadius

      if (langProgress > 0.5) {
        rc.line(innerStartX, innerStartY, outerStartX, outerStartY, {
          stroke: 'oklch(0.35 0.01 270)',
          strokeWidth: 2,
          roughness: 1.2,
        })
      }

      if (langProgress > 0.7) {
        const midAngle = startAngle + (angle / langProgress) / 2
        const labelRadius = outerRadius + 40
        const labelX = centerX + Math.cos(midAngle) * labelRadius
        const labelY = centerY + Math.sin(midAngle) * labelRadius

        ctx.globalAlpha = Math.min((langProgress - 0.7) / 0.3, 1)
        ctx.font = '14px Indie Flower'
        ctx.fillStyle = 'oklch(0.25 0.08 250)'
        ctx.textAlign = labelX > centerX ? 'left' : 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${(lang.percentage * langProgress).toFixed(1)}%`, labelX, labelY)
        ctx.globalAlpha = 1
      }

      startAngle = endAngle
      cumulativePercentage += lang.percentage
    })

    if (animationProgress > 0.8) {
      const finalInnerX = centerX + Math.cos(startAngle) * innerRadius
      const finalInnerY = centerY + Math.sin(startAngle) * innerRadius
      const finalOuterX = centerX + Math.cos(startAngle) * outerRadius
      const finalOuterY = centerY + Math.sin(startAngle) * outerRadius

      rc.line(finalInnerX, finalInnerY, finalOuterX, finalOuterY, {
        stroke: 'oklch(0.35 0.01 270)',
        strokeWidth: 2,
        roughness: 1.2,
      })
    }

    const legendX = 500
    let legendY = 100

    ctx.font = 'bold 18px Indie Flower'
    ctx.fillStyle = 'oklch(0.25 0.08 250)'
    ctx.textAlign = 'left'
    ctx.fillText(title, width / 2, 25)

    if (animationProgress > 0.3) {
      ctx.globalAlpha = Math.min((animationProgress - 0.3) / 0.3, 1)
      ctx.font = 'bold 16px Indie Flower'
      ctx.fillText('Languages', legendX, legendY)
      ctx.globalAlpha = 1
      legendY += 30

      topLanguages.forEach((lang, i) => {
        const itemProgress = Math.min(Math.max((animationProgress - 0.4 - i * 0.1) / 0.2, 0), 1)
        
        if (itemProgress > 0) {
          ctx.globalAlpha = itemProgress
          
          rc.rectangle(legendX, legendY - 12, 20, 16, {
            fill: lang.color,
            fillStyle: 'hachure',
            fillWeight: 1.5,
            hachureGap: 4,
            stroke: 'oklch(0.35 0.01 270)',
            strokeWidth: 1.5,
            roughness: 0.8,
          })

          ctx.font = '14px Indie Flower'
          ctx.fillStyle = 'oklch(0.25 0.08 250)'
          ctx.textAlign = 'left'
          ctx.fillText(lang.name, legendX + 30, legendY)

          ctx.font = '12px Indie Flower'
          ctx.fillStyle = 'oklch(0.45 0.02 260)'
          ctx.fillText(`${lang.percentage.toFixed(1)}%`, legendX + 180, legendY)
          
          ctx.globalAlpha = 1
          legendY += 28
        }
      })

      if (data.length > 5 && animationProgress > 0.9) {
        const othersPercentage = data
          .slice(5)
          .reduce((sum, lang) => sum + lang.percentage, 0)
        
        ctx.globalAlpha = (animationProgress - 0.9) / 0.1
        ctx.font = '14px Indie Flower'
        ctx.fillStyle = 'oklch(0.45 0.02 260)'
        ctx.fillText(`+ ${data.length - 5} more`, legendX, legendY)
        
        ctx.font = '12px Indie Flower'
        ctx.fillText(`${othersPercentage.toFixed(1)}%`, legendX + 180, legendY)
        ctx.globalAlpha = 1
      }
    }
  }, [data, title, animationProgress])

  return (
    <div className="flex items-center justify-center w-full overflow-x-auto">
      <canvas ref={canvasRef} className="max-w-full" />
    </div>
  )
}
