import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function StatsCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  tone?: "default" | "primary" | "secondary" | "accent"
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "secondary"
        ? "text-secondary"
        : tone === "accent"
          ? "text-accent"
          : "text-foreground"
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
          <div className={cn("mt-2 text-3xl font-semibold", toneClass)}>{value}</div>
        </div>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
    </article>
  )
}
