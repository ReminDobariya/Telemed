"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  icon: ReactNode
  label: string
  value: string | number
  delta?: string
  className?: string
}

export function KpiCard({ icon, label, value, delta, className }: Props) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground p-3 sm:p-4 md:p-5 flex items-start gap-2 sm:gap-3 min-w-0", className)}>
      <div className="size-10 sm:size-12 md:size-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <div className="scale-125 sm:scale-150">{icon}</div>
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
        <div className="flex items-baseline gap-1 sm:gap-2 min-w-0">
          <p className="text-base sm:text-lg md:text-2xl font-semibold truncate">{value}</p>
          {delta ? <span className="text-xs text-muted-foreground shrink-0">{delta}</span> : null}
        </div>
      </div>
    </div>
  )
}
