import { useEffect, useRef } from 'react'
import rough from 'roughjs'
import { cn } from '@/lib/utils'

interface SketchCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function SketchCard({ children, className, delay = 0 }: SketchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const rc = rough.canvas(canvas)

    const updateCanvas = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, rect.width, rect.height)

      rc.rectangle(2, 2, rect.width - 4, rect.height - 4, {
        stroke: 'oklch(0.35 0.01 270)',
        strokeWidth: 2,
        roughness: 1.2,
        bowing: 0.5,
        fill: 'oklch(0.99 0 0)',
        fillStyle: 'solid',
      })
    }

    updateCanvas()
    
    const resizeObserver = new ResizeObserver(() => {
      updateCanvas()
    })
    
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="relative p-6" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
