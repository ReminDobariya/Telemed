"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DoctorCard } from "@/components/doctors/doctor-card"
import { DoctorFilters, type DoctorFilter } from "@/components/doctors/doctor-filters"
import { DoctorsAPI } from "@/lib/api"

export default function DoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await DoctorsAPI.list()
        if (!ignore) {
          setDoctors(res.doctors.map((d: any) => ({
            id: d._id,
            name: d.name,
            specialty: d.specialization,
            photo: d.photo,
            experience: d.experience,
            experienceYears: d.experience || 0, // For DoctorCard component
            fees: d.fees,
            rating: 4.5, // Default rating since backend doesn't have it yet
            modes: d.mode === 'both' ? ['virtual', 'in-person'] : (d.mode ? [d.mode] : ['virtual']),
            languages: d.languages && Array.isArray(d.languages) ? d.languages : ['English'],
            bio: d.bio,
            qualifications: d.qualifications || [],
          })))
        }
      } catch (error) {
        console.error('Failed to load doctors:', error)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const specialties = useMemo(() => {
    const set = new Set<string>()
    doctors.forEach(d => {
      if (d.specialty) set.add(d.specialty)
    })
    return Array.from(set).sort()
  }, [doctors])

  const [filter, setFilter] = useState<DoctorFilter>({ q: "", specialty: "all", mode: "all" })

  const filtered = useMemo(() => {
    const q = filter.q.trim().toLowerCase()
    return doctors.filter((d) => {
      const byQuery =
        !q || d.name.toLowerCase().includes(q) || (d.specialty ? d.specialty.toLowerCase().includes(q) : false)
      const bySpec = filter.specialty === "all" || (d.specialty && d.specialty === filter.specialty)
      const byMode = filter.mode === "all" || d.modes.includes(filter.mode)
      return byQuery && bySpec && byMode
    })
  }, [doctors, filter])

  const totalLabel = `${filtered.length} ${filtered.length === 1 ? "doctor" : "doctors"}`

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading doctors...</div>
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-pretty text-xl font-semibold">Find Doctors</h1>
          <p className="text-sm text-muted-foreground">{totalLabel}</p>
        </div>
      </div>

      <div className="card p-4">
        <DoctorFilters value={filter} specialties={specialties} onChange={setFilter} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((doc) => (
          <DoctorCard key={doc.id} doctor={doc} onBook={(id) => router.push(`/doctors/${id}`)} />
        ))}
        {filtered.length === 0 ? (
          <p className="col-span-full text-sm text-muted-foreground">No doctors match your filters.</p>
        ) : null}
      </div>
    </section>
  )
}
