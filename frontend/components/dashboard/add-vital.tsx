"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { HealthAPI } from "@/lib/api"

export function AddVitalCard() {
  const { toast } = useToast()
  const [type, setType] = useState("")
  const [value, setValue] = useState("")
  const [unit, setUnit] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!type || !value) {
      toast({ title: "Missing fields", description: "Type and value are required", variant: "destructive" })
      return
    }
    try {
      setSaving(true)
      await HealthAPI.addVital({ type, value, unit: unit || undefined })
      toast({ title: "Vital added", description: `${type}: ${value}${unit ? ` ${unit}` : ''}` })
      setType("")
      setValue("")
      setUnit("")
    } catch (e: any) {
      toast({ title: "Failed to add vital", description: e?.message ?? "", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="rounded-xl border bg-card p-4 md:p-6">
      <h2 className="text-base md:text-lg font-medium">Add Vital</h2>
      <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="v-type">Type</Label>
          <Input id="v-type" placeholder="e.g., BP, HR" value={type} onChange={(e) => setType(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="v-value">Value</Label>
          <Input id="v-value" placeholder="e.g., 120/80 or 72" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="v-unit">Unit (optional)</Label>
          <Input id="v-unit" placeholder="e.g., mmHg, bpm" value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>
        <div className="sm:col-span-3 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </form>
    </article>
  )
}


