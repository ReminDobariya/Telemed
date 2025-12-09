"use client"

import { useEffect, useState } from "react"
import { type Prescription } from "@/lib/dummy-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PrescriptionsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function PrescriptionsTable() {
  const { toast } = useToast()
  const [items, setItems] = useState<Prescription[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Prescription>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await PrescriptionsAPI.list()
        if (ignore) return
        const mapped: Prescription[] = res.prescriptions.map((p: any) => ({
          id: p._id,
          medication: p.medication,
          dosage: p.dosage,
          prescribedBy: p.prescribedBy || 'Provider',
          date: new Date(p.createdAt).toISOString().slice(0,10),
          instructions: p.instructions,
        }))
        setItems(mapped)
      } catch (e: any) {
        toast({ title: "Failed to load prescriptions", description: e?.message ?? "", variant: "destructive" })
      }
    }
    load()
    return () => { ignore = true }
  }, [toast])

  async function addItem() {
    if (!form.medication || !form.dosage) return
    try {
      setSaving(true)
      const res = await PrescriptionsAPI.create({ medication: form.medication, dosage: form.dosage, instructions: form.instructions })
      const p = res.prescription
      const item: Prescription = {
        id: p._id,
        medication: p.medication,
        dosage: p.dosage,
        prescribedBy: 'Provider',
        date: new Date(p.createdAt).toISOString().slice(0,10),
        instructions: p.instructions,
      }
      setItems((prev) => [item, ...prev])
      setOpen(false)
      setForm({})
    } catch (e: any) {
      toast({ title: "Add failed", description: e?.message ?? "", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      {/* FIX: Adjust CardHeader to place button on a new line on small screens. */}
      <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Prescriptions</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {/* FIX: Make button full-width on mobile. */}
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add prescription</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="pr-med">Medication</Label>
                  <Input
                    id="pr-med"
                    value={form.medication ?? ""}
                    onChange={(e) => setForm({ ...form, medication: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pr-dose">Dosage</Label>
                  <Input
                    id="pr-dose"
                    value={form.dosage ?? ""}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="pr-by">Prescribed by</Label>
                  <Input
                    id="pr-by"
                    value={form.prescribedBy ?? ""}
                    onChange={(e) => setForm({ ...form, prescribedBy: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pr-date">Date</Label>
                  <Input
                    id="pr-date"
                    type="date"
                    value={form.date ?? ""}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pr-inst">Instructions</Label>
                <Input
                  id="pr-inst"
                  value={form.instructions ?? ""}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addItem} disabled={saving}>{saving ? 'Adding...' : 'Add'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {items.map((p) => (
            <div key={p.id} className="flex flex-col rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{p.medication}</div>
                <div className="text-sm text-muted-foreground">
                  {p.dosage} • {p.prescribedBy} • {p.date}
                </div>
                {p.instructions ? <div className="text-sm">{p.instructions}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
