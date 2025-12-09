"use client"

import { useState } from "react"
import { reports as initialData, type Report } from "@/lib/dummy-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"

export function ReportsTable() {
  const [items, setItems] = useState<Report[]>(initialData)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Report>>({ type: "lab" })

  function addItem() {
    if (!form.title || !form.type || !form.date) return
    setItems((prev) => [
      {
        id: `r${Date.now()}`,
        title: form.title!,
        type: form.type!,
        date: form.date!,
        summary: form.summary,
        fileUrl: form.fileUrl,
      },
      ...prev,
    ])
    setOpen(false)
    setForm({ type: "lab" })
  }

  return (
    <Card>
      {/* FIX: Adjust CardHeader to place button on a new line on small screens. */}
      <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Reports</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {/* FIX: Make button full-width on mobile. */}
            <Button size="sm" className="w-full sm:w-auto">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add report</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="rp-title">Title</Label>
                <Input
                  id="rp-title"
                  value={form.title ?? ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="rp-type">Type</Label>
                  <Select
                    value={form.type ?? "lab"}
                    onValueChange={(v) => setForm({ ...form, type: v as Report["type"] })}
                  >
                    <SelectTrigger id="rp-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab">Lab</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="discharge">Discharge</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rp-date">Date</Label>
                  <Input
                    id="rp-date"
                    type="date"
                    value={form.date ?? ""}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rp-summary">Summary</Label>
                <Input
                  id="rp-summary"
                  value={form.summary ?? ""}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rp-file">File URL (optional)</Label>
                <Input
                  id="rp-file"
                  value={form.fileUrl ?? ""}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>
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
          {items.map((r) => (
            <div key={r.id} className="flex flex-col items-start gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-lg">
                <div className="font-medium">{r.title}</div>
                <div className="text-sm text-muted-foreground">
                  {r.type[0].toUpperCase() + r.type.slice(1)} • {r.date}
                </div>
                {r.summary ? <div className="text-sm">{r.summary}</div> : null}
              </div>
              {r.fileUrl ? (
                <Link href={r.fileUrl} target="_blank" className="mt-2 sm:mt-0">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
