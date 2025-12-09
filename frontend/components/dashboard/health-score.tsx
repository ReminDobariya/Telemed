"use client"

import { useMemo } from "react"

export function HealthScore({ score }: { score: number }) {
  const radius = 36
  const stroke = 8
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const strokeDashoffset = useMemo(() => circumference - (score / 100) * circumference, [circumference, score])

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* ensure the ring never clips by keeping svg overflow visible and container flexible */}
      <svg
        height={radius * 2}
        width={radius * 2}
        role="img"
        aria-label={`Health score ${score}%`}
        className="shrink-0 overflow-visible"
      >
        <circle
          stroke="var(--muted)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="var(--secondary)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 700ms ease" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="14"
          fill="currentColor"
          className="text-foreground"
        >
          {score}%
        </text>
      </svg>
      <div>
        <p className="text-sm sm:text-base font-medium text-foreground">Health Score</p>
        <p className="text-xs sm:text-sm text-muted-foreground">Calculated from recent activity</p>
      </div>
    </div>
  )
}
