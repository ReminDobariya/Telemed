"use client"

import { useEffect, useState } from "react"
import { AllergiesAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function AllergiesTable() {
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<{
    substance?: string
    reaction?: string
    reactionOther?: string
    severity?: 'mild'|'moderate'|'severe'
    status?: 'active'|'resolved'
  }>({ severity: "mild", status: "active" })

  useEffect(() => {
    let ignore = false
    AllergiesAPI.list().then((res)=>{ if (!ignore) setItems(res.allergies) }).catch(()=>{})
    return ()=>{ ignore = true }
  }, [])

  async function addItem() {
    if (!form.substance || !form.reaction || !form.severity) return
    const reactionValue = form.reaction === 'other' ? form.reactionOther : form.reaction
    const { allergy } = await AllergiesAPI.create({
      substance: form.substance,
      reaction: reactionValue || '',
      severity: form.severity,
      status: form.status || 'active',
    })
    setItems((prev)=> [allergy, ...prev])
    setOpen(false)
    setForm({ severity: "mild", status: "active" })
  }

  async function remove(id: string) {
    try { await AllergiesAPI.delete(id); setItems((prev)=> prev.filter(a=> a._id !== id)) } catch {}
  }

  return (
    <Card>
      {/* FIX: Adjust CardHeader to place button on a new line on small screens. */}
      <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Allergies</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {/* FIX: Make button full-width on mobile. */}
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add allergy</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="al-sub">Substance</Label>
                <Input
                  id="al-sub"
                  placeholder="e.g., Penicillin, Peanuts"
                  value={form.substance ?? ""}
                  onChange={(e) => setForm({ ...form, substance: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="al-reaction">Reaction</Label>
                {form.reaction !== 'other' ? (
                  <Select
                    value={form.reaction ?? ""}
                    onValueChange={(v) => setForm({ ...form, reaction: v, reactionOther: v === 'other' ? '' : undefined })}
                  >
                    <SelectTrigger id="al-reaction">
                      <SelectValue placeholder="Select reaction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rash">Rash</SelectItem>
                      <SelectItem value="hives">Hives</SelectItem>
                      <SelectItem value="itching">Itching</SelectItem>
                      <SelectItem value="swelling">Swelling</SelectItem>
                      <SelectItem value="shortness of breath">Shortness of Breath</SelectItem>
                      <SelectItem value="anaphylaxis">Anaphylaxis</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Specify reaction"
                      value={form.reactionOther ?? ""}
                      onChange={(e) => setForm({ ...form, reactionOther: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm({ ...form, reaction: '', reactionOther: undefined })}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="al-severity">Severity</Label>
                  <Select
                    value={form.severity ?? "mild"}
                    onValueChange={(v) => setForm({ ...form, severity: v as any })}
                  >
                    <SelectTrigger id="al-severity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="al-status">Status</Label>
                  <Select
                    value={form.status ?? "active"}
                    onValueChange={(v) => setForm({ ...form, status: v as any })}
                  >
                    <SelectTrigger id="al-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => { setOpen(false); setForm({ severity: "mild", status: "active" }) }}>
                  Cancel
                </Button>
                <Button onClick={addItem}>Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {items.map((a) => (
            <div key={a._id} className="flex flex-col rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{a.substance}</div>
                <div className="text-sm text-muted-foreground">
                  {a.reaction} • {a.severity ? a.severity[0].toUpperCase() + a.severity.slice(1) : ''}
                </div>
                {a.status && (
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-0.5 rounded-full ${
                      a.status === 'active' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 sm:mt-0">
                <Button variant="ghost" size="sm" onClick={()=>remove(a._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
