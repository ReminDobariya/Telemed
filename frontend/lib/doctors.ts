import { dummyAppointments } from "@/lib/dummy-data"

export type Doctor = {
  id: string
  name: string
  specialty?: string
  rating: number // 1..5
  experienceYears: number
  modes: Array<"in-person" | "virtual">
  languages: string[]
  location?: string
}

function slugId(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function getDoctors(): Doctor[] {
  const map = new Map<string, Doctor>()
  for (const a of dummyAppointments) {
    const id = slugId(a.doctorName)
    const existing = map.get(id)
    const mode = a.type === "online" ? "virtual" : "in-person"
    if (!existing) {
      map.set(id, {
        id,
        name: a.doctorName,
        specialty: a.specialty,
        rating: 4.7, // demo value
        experienceYears: 8, // demo value
        modes: [mode],
        languages: ["English"],
        location: mode === "in-person" ? "City Clinic" : undefined,
      })
    } else {
      if (!existing.modes.includes(mode)) existing.modes.push(mode)
      if (!existing.specialty && a.specialty) existing.specialty = a.specialty
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function getSpecialties(doctors: Doctor[]) {
  return Array.from(new Set(doctors.map((d) => d.specialty).filter(Boolean))) as string[]
}
