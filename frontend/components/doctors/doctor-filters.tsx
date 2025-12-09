"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type DoctorFilter = {
  q: string
  specialty: "all" | string
  mode: "all" | "in-person" | "virtual"
}

export function DoctorFilters({
  value,
  specialties,
  onChange,
}: {
  value: DoctorFilter
  specialties: string[]
  onChange: (next: DoctorFilter) => void
}) {
  const specOptions = useMemo(() => ["all", ...specialties], [specialties])
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="grid gap-2">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          placeholder="Search by name or specialty"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="spec">Specialty</Label>
        <Select
          value={value.specialty}
          onValueChange={(v) => onChange({ ...value, specialty: v as DoctorFilter["specialty"] })}
        >
          <SelectTrigger id="spec">
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            {specOptions.map((o) => (
              <SelectItem key={o} value={o}>
                {o[0].toUpperCase() + o.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mode">Mode</Label>
        <Select value={value.mode} onValueChange={(v) => onChange({ ...value, mode: v as DoctorFilter["mode"] })}>
          <SelectTrigger id="mode">
            <SelectValue placeholder="All modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="in-person">In-person</SelectItem>
            <SelectItem value="virtual">Virtual</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
