"use client"

import { useState } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { MedicationsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type Med = { 
  id?: string
  _id?: string
  name: string
  dosage?: string
  schedule?: string
  frequency?: string
  takenDates?: string[]
}

export function MedicationReminders({ meds, onUpdate }: { meds?: Med[]; onUpdate?: () => void }) {
  const { toast } = useToast()
  const [updating, setUpdating] = useState<string | null>(null)
  
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  
  const isTakenToday = (med: Med) => {
    const takenDates = med.takenDates || []
    return takenDates.includes(today)
  }
  
  const handleToggleTaken = async (med: Med) => {
    const medId = med._id || med.id
    if (!medId) return
    
    const isTaken = isTakenToday(med)
    setUpdating(medId)
    
    try {
      if (isTaken) {
        await MedicationsAPI.markUntaken(medId)
        toast({
          title: "Medication unmarked",
          description: `${med.name} marked as not taken today`,
        })
      } else {
        await MedicationsAPI.markTaken(medId)
        toast({
          title: "Medication confirmed",
          description: `${med.name} marked as taken`,
        })
      }
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update medication status",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }
  
  if (!meds?.length) {
    return (
      <div className="rounded-xl border bg-card p-4 md:p-5">
        <h3 className="text-base md:text-lg font-medium">Medications</h3>
        <p className="mt-2 text-sm text-muted-foreground">No active reminders.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-4 md:p-5">
      <h3 className="text-base md:text-lg font-medium">Today&apos;s medications</h3>
      <ul className="mt-3 space-y-2">
        {meds.slice(0, 4).map((m, i) => {
          const taken = isTakenToday(m)
          const medId = m._id || m.id || String(i)
          const isUpdating = updating === medId
          
          return (
            <li
              key={medId}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 transition-colors",
                taken && "bg-green-50/50 border-green-200"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium truncate", taken && "text-green-700 line-through")}>
                  {m.name}
                </p>
                {m.dosage || m.schedule || m.frequency ? (
                  <p className="text-xs text-muted-foreground truncate">
                    {[m.dosage, m.schedule, m.frequency].filter(Boolean).join(" • ")}
                  </p>
                ) : null}
              </div>
              <button
                onClick={() => handleToggleTaken(m)}
                disabled={isUpdating}
                className={cn(
                  "shrink-0 p-1.5 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed",
                  taken ? "text-green-600 hover:text-green-700" : "text-muted-foreground hover:text-primary"
                )}
                aria-label={taken ? "Mark as not taken" : "Mark as taken"}
              >
                {taken ? (
                  <CheckCircle2 className="h-5 w-5 fill-green-600 text-white" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
