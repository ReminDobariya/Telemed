"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Doctor } from "@/lib/doctors"

export function DoctorCard({
  doctor,
  onBook,
  className,
}: {
  doctor: Doctor
  onBook?: (doctorId: string) => void
  className?: string
}) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base">{doctor.name}</CardTitle>
          {doctor.specialty ? (
            <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
          ) : (
            <div className="text-sm text-muted-foreground">General</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {doctor.rating != null && (
            <Badge variant="secondary">{(doctor.rating || 0).toFixed(1)} ★</Badge>
          )}
          {doctor.experienceYears != null && (
            <span className="text-xs text-muted-foreground">{doctor.experienceYears}+ yrs</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {doctor.modes && doctor.modes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {doctor.modes.map((m) => (
              <Badge key={m} className="capitalize">
                {m}
              </Badge>
            ))}
            {doctor.location ? <Badge variant="outline">{doctor.location}</Badge> : null}
          </div>
        )}
        {doctor.languages && doctor.languages.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {doctor.languages.map((l) => (
              <Badge key={l} variant="outline">
                {l}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Link href={`/doctors/${doctor.id}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto bg-transparent px-3">
              View profile
            </Button>
          </Link>
          <Button className="w-full sm:w-auto px-3" onClick={() => onBook?.(doctor.id)}>
            Book
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
