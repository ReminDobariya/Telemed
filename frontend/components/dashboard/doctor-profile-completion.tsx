"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

type DoctorProfileCompletionProps = {
  doctor: any
}

export function DoctorProfileCompletion({ doctor }: DoctorProfileCompletionProps) {
  const router = useRouter()
  
  // Calculate completion percentage based on specific fields
  const fields = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'experience', label: 'Experience' },
    { key: 'fees', label: 'Consultation Fees' },
    { key: 'bio', label: 'Bio' },
    { key: 'qualifications', label: 'Qualifications' },
    { key: 'photo', label: 'Profile Photo' },
  ]
  
  const completedFields = fields.filter(field => {
    const value = doctor?.[field.key]
    // Check if value exists and is not empty
    if (value === undefined || value === null || value === '') {
      return false
    }
    // For numbers (experience, fees), check if they're > 0
    if (typeof value === 'number') {
      return value > 0
    }
    // For arrays (qualifications), check if they have items
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return true
  }).length
  
  const completionPercentage = Math.round((completedFields / fields.length) * 100)
  
  // Always show the component unless profile is 100% complete
  if (completionPercentage >= 100) {
    return null
  }

  // Ensure we have a valid percentage (0-99)
  const displayPercentage = Math.max(0, Math.min(99, completionPercentage))

  return (
    <div className="rounded-xl border bg-gradient-to-br from-blue-50/50 to-blue-100/30 p-3 md:p-4 border-blue-200/50">
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-blue-900">
            Complete Your Profile
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">{displayPercentage}%</span>
        </div>
      </div>
      
      <div className="relative h-1.5 mb-3 w-full rounded-full bg-blue-100 overflow-hidden">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={() => router.push('/doctor/profile')}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          Complete Profile
        </Button>
        <div className="flex items-center gap-1 text-xs text-blue-600/70">
          <CheckCircle2 className="h-3 w-3" />
          <span>Help us provide better care</span>
        </div>
      </div>
    </div>
  )
}
