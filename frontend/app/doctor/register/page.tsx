"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { Upload } from "lucide-react"

export default function DoctorRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    photo: "",
    languages: [] as string[],
    mode: "both" as "virtual" | "in-person" | "both",
    fees: "",
    bio: "",
    qualifications: [] as string[],
  })
  const [qualificationInput, setQualificationInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [tos, setTos] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.specialization || !form.fees) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
      return
    }
    if (!tos) {
      toast({ title: "Error", description: "Please agree to the Terms of Service and Privacy Policy", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const res = await apiFetch<{ success: true; token: string; doctor: any }>('/api/doctor/auth/register', {
        method: 'POST',
        body: {
          ...form,
          experience: Number.parseInt(form.experience) || 0,
          fees: Number.parseFloat(form.fees),
        },
      })
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('tm_auth_token', res.token)
        window.localStorage.setItem('tm_user_role', 'doctor')
      }
      toast({ title: "Success", description: "Account created successfully" })
      router.push('/doctor/dashboard')
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message || "Could not create account", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  function addQualification() {
    if (qualificationInput.trim()) {
      setForm({ ...form, qualifications: [...form.qualifications, qualificationInput.trim()] })
      setQualificationInput("")
    }
  }

  function removeQualification(index: number) {
    setForm({ ...form, qualifications: form.qualifications.filter((_, i) => i !== index) })
  }

  function toggleLanguage(lang: string) {
    setForm({
      ...form,
      languages: form.languages.includes(lang)
        ? form.languages.filter(l => l !== lang)
        : [...form.languages, lang],
    })
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 py-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Doctor Registration</CardTitle>
            <CardDescription>Create your doctor account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
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
                    placeholder="e.g., Cardiology, Dermatology"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mode">Consultation Mode *</Label>
                  <Select value={form.mode} onValueChange={(v: any) => setForm({ ...form, mode: v })}>
                    <SelectTrigger id="mode">
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
                  <Label htmlFor="fees">Consultation Fee (₹) *</Label>
                  <Input
                    id="fees"
                    type="number"
                    value={form.fees}
                    onChange={(e) => setForm({ ...form, fees: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2">
                  {['en', 'hi', 'gu', 'mr'].map(lang => (
                    <Button
                      key={lang}
                      type="button"
                      variant={form.languages.includes(lang) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleLanguage(lang)}
                    >
                      {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : lang === 'gu' ? 'Gujarati' : 'Marathi'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-3">
                  {form.photo && (
                    <img src={form.photo} alt="Profile" className="h-16 w-16 rounded-full border object-cover" />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = () => setForm({ ...form, photo: String(reader.result) })
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-1 h-4 w-4" /> Choose Photo
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Qualifications</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., MBBS, MD"
                    value={qualificationInput}
                    onChange={(e) => setQualificationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addQualification()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addQualification}>Add</Button>
                </div>
                {form.qualifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.qualifications.map((q, i) => (
                      <div key={i} className="flex items-center gap-1 rounded-md border px-2 py-1 text-sm">
                        <span>{q}</span>
                        <button
                          type="button"
                          onClick={() => removeQualification(i)}
                          className="text-destructive hover:underline"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={tos} 
                  onChange={(e)=>setTos(e.target.checked)} 
                  className="mt-0.5"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy" target="_blank" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <Button type="submit" className="w-full" disabled={loading || !tos}>
                {loading ? "Creating account..." : "Register"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/doctor/login"
                  className="text-primary hover:underline"
                >
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


