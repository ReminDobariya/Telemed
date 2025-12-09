"use client"

type Props = {
  score: number // 0-100
}

export function HealthScoreRing({ score }: Props) {
  const radius = 56
  const stroke = 10
  const norm = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const dash = (clamped / 100) * norm

  return (
    <div className="relative w-full max-w-[280px] mx-auto aspect-square overflow-visible">
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full overflow-visible"
        role="img"
        aria-label={`Health score ${clamped} out of 100`}
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          className="opacity-60"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${norm - dash}`}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-3xl font-semibold">{clamped}</p>
          <p className="text-xs text-muted-foreground">Health score</p>
        </div>
      </div>
    </div>
  )
}
