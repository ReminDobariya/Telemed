"use client"

import { useEffect, useState } from "react"
import { MedicationsAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
export function MedicationsTable() {
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<{
    name?: string
    dosage?: string
    frequency?: string
    startedOn?: string
    endDate?: string
    notes?: string
    status?: 'active' | 'completed' | 'paused'
  }>({ status: 'active' })
  const [loading, setLoading] = useState(false)
  const [showCustomFrequency, setShowCustomFrequency] = useState(false)

  useEffect(() => {
    let ignore = false
    MedicationsAPI.list().then((res)=>{ if (!ignore) setItems(res.medications) }).catch(()=>{})
    return ()=>{ ignore = true }
  }, [])

  const total = items.length

  async function addItem() {
    if (!form.name || !form.dosage || !form.frequency) return
    setLoading(true)
    try {
      const { medication } = await MedicationsAPI.create({
        name: form.name,
        dosage: form.dosage,
        frequency: form.frequency || '',
        startedOn: form.startedOn,
        endDate: form.endDate,
        notes: form.notes,
        status: form.status || 'active',
      })
      setItems((prev)=> [medication, ...prev])
      setOpen(false)
      setForm({ status: 'active' })
      setShowCustomFrequency(false)
    } finally { setLoading(false) }
  }

  async function remove(id: string) {
    try {
      await MedicationsAPI.delete(id)
      setItems((prev)=> prev.filter(it=> it._id !== id))
    } catch {}
  }

  return (
    <Card>
      {/* FIX: Adjust CardHeader to place button on a new line on small screens. */}
      <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Medications</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {/* FIX: Make button full-width on mobile. */}
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add medication</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="m-name">Name</Label>
                <Input
                  id="m-name"
                  value={form.name ?? ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter medication name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-dosage">Dosage</Label>
                <Input
                  id="m-dosage"
                  value={form.dosage ?? ""}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                  placeholder="e.g., 500mg, 1 tablet"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-frequency">Frequency</Label>
                {!showCustomFrequency ? (
                  <div className="flex gap-2">
                    <Select value={form.frequency ?? ""} onValueChange={(v) => {
                      if (v === 'custom') {
                        setShowCustomFrequency(true)
                        setForm({ ...form, frequency: '' })
                      } else {
                        setForm({ ...form, frequency: v })
                      }
                    }}>
                      <SelectTrigger id="m-frequency" className="flex-1">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once daily">Once daily</SelectItem>
                        <SelectItem value="twice daily">Twice daily</SelectItem>
                        <SelectItem value="thrice daily">Thrice daily</SelectItem>
                        <SelectItem value="as needed">As needed</SelectItem>
                        <SelectItem value="every 6 hours">Every 6 hours</SelectItem>
                        <SelectItem value="every 8 hours">Every 8 hours</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter custom frequency"
                      value={form.frequency ?? ""}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCustomFrequency(false)
                        setForm({ ...form, frequency: '' })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="m-started">Started on</Label>
                  <Input
                    id="m-started"
                    type="date"
                    value={form.startedOn ?? ""}
                    onChange={(e) => setForm({ ...form, startedOn: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-end-date">End date (Optional)</Label>
                  <Input
                    id="m-end-date"
                    type="date"
                    value={form.endDate ?? ""}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-status">Status</Label>
                <Select value={form.status ?? 'active'} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                  <SelectTrigger id="m-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-notes">Notes (Optional)</Label>
                <Textarea
                  id="m-notes"
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes about this medication"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => { setOpen(false); setForm({ status: 'active' }); setShowCustomFrequency(false) }}>
                  Cancel
                </Button>
                <Button onClick={addItem} disabled={loading}>{loading ? "Adding..." : "Add"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-3">
          {total} {total === 1 ? "item" : "items"}
        </div>
        <div className="grid gap-2">
          {items.map((m) => (
            <div key={m._id} className="flex flex-col rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-sm text-muted-foreground">
                  {m.dosage} • {m.frequency}
                  {m.startedOn ? ` • Started: ${new Date(m.startedOn + 'T00:00:00').toLocaleDateString()}` : ""}
                  {m.endDate ? ` • Ended: ${new Date(m.endDate + 'T00:00:00').toLocaleDateString()}` : ""}
                </div>
                {m.status && (
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-0.5 rounded-full ${
                      m.status === 'active' ? 'bg-green-100 text-green-800' :
                      m.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 sm:mt-0">
                <Button variant="ghost" size="sm" onClick={()=>remove(m._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
