export function SketchingLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="animate-pulse"
      >
        <path
          d="M 20 60 Q 40 20, 60 60 T 100 60"
          fill="none"
          stroke="oklch(0.25 0.08 250)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset="0"
          className="animate-sketch-draw"
        />
        <circle
          cx="20"
          cy="60"
          r="4"
          fill="oklch(0.65 0.15 55)"
          className="animate-pulse"
        />
        <circle
          cx="60"
          cy="60"
          r="4"
          fill="oklch(0.65 0.15 55)"
          className="animate-pulse"
          style={{ animationDelay: '0.3s' }}
        />
        <circle
          cx="100"
          cy="60"
          r="4"
          fill="oklch(0.65 0.15 55)"
          className="animate-pulse"
          style={{ animationDelay: '0.6s' }}
        />
      </svg>
      <p className="mt-4 text-lg font-handwritten text-primary">
        Sketching data...
      </p>
    </div>
  )
}
