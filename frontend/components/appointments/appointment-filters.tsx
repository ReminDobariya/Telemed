"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FilterState = {
  status: "all" | "upcoming" | "completed" | "cancelled"
}

export function AppointmentFilters({
  value,
  onChange,
  onClear,
}: {
  value: FilterState
  onChange: (next: FilterState) => void
  onClear: () => void
}) {
  const options = useMemo(() => ["all", "upcoming", "completed", "cancelled"] as const, [])
  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor="status" className="text-sm text-muted-foreground">
          Status
        </label>
        <Select value={value.status} onValueChange={(v) => onChange({ status: v as FilterState["status"] })}>
          <SelectTrigger id="status" className="w-36 sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o} value={o}>
                {o[0].toUpperCase() + o.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
        Clear filters
      </Button>
    </div>
  )
}
