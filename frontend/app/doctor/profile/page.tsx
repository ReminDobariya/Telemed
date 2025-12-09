"use client"

import { useEffect, useState } from "react"
import { DoctorAuthAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DoctorProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: 0,
    fees: 0,
    bio: "",
    photo: "",
    mode: "both",
    languages: [] as string[],
    qualifications: [] as string[],
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await DoctorAuthAPI.me()
        const doctor = res.doctor
        setForm({
          name: doctor.name || "",
          email: doctor.email || "",
          phone: doctor.phone || "",
          specialization: doctor.specialization || "",
          experience: doctor.experience || 0,
          fees: doctor.fees || 0,
          bio: doctor.bio || "",
          photo: doctor.photo || "",
          mode: doctor.mode || "both",
          languages: doctor.languages || [],
          qualifications: doctor.qualifications || [],
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await DoctorAuthAPI.updateProfile({
        name: form.name,
        phone: form.phone,
        specialization: form.specialization,
        experience: form.experience,
        fees: form.fees,
        bio: form.bio,
        photo: form.photo,
        mode: form.mode,
        languages: form.languages,
        qualifications: form.qualifications,
      })
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="space-y-4">
        <h1 className="text-pretty text-xl font-semibold">Profile</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-4 w-full max-w-full">
      <div>
        <h1 className="text-pretty text-xl sm:text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your professional profile information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Input
                  id="specialization"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fees">Consultation Fees (₹) *</Label>
                <Input
                  id="fees"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.fees}
                  onChange={(e) => setForm({ ...form, fees: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Consultation Mode</Label>
              <Select value={form.mode} onValueChange={(value) => setForm({ ...form, mode: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">Virtual Only</SelectItem>
                  <SelectItem value="in-person">In-Person Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Profile Photo URL</Label>
              <Input
                id="photo"
                type="url"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell patients about your background and expertise..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications (comma-separated)</Label>
              <Input
                id="qualifications"
                value={form.qualifications.join(", ")}
                onChange={(e) => setForm({ ...form, qualifications: e.target.value.split(",").map(q => q.trim()).filter(Boolean) })}
                placeholder="MBBS, MD, etc."
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

