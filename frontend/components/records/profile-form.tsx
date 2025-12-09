"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { type Patient } from "@/lib/dummy-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { UserAPI } from "@/lib/api"
import { Upload } from "lucide-react"

type Editable = {
  name: string
  email: string
  phone: string
  gender: string
  dob?: string
  age?: number
  address?: string
  bloodGroup?: string
  height?: number
  heightUnit?: 'cm' | 'inch'
  weight?: number
  weightUnit?: 'kg' | 'lb'
  bmi?: number
  profileImage?: string
}

export function ProfileForm() {
  const { toast } = useToast()
  const [form, setForm] = useState<Editable>({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    age: undefined,
    address: "",
    bloodGroup: "",
    height: undefined,
    heightUnit: 'cm',
    weight: undefined,
    weightUnit: 'kg',
    bmi: undefined,
    profileImage: undefined,
  })
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await UserAPI.getProfile()
        if (ignore) return
        const p = res.profile || {}
        setForm((f) => ({
          ...f,
          name: p.name ?? f.name,
          email: p.email ?? f.email,
          phone: p.phone ?? f.phone,
          gender: p.gender ?? f.gender,
          dob: p.dob ? String(p.dob).slice(0, 10) : f.dob,
          age: p.age ?? f.age,
          bloodGroup: p.bloodGroup ?? f.bloodGroup,
          address: p.address ?? f.address,
          height: p.height ?? f.height,
          weight: p.weight ?? f.weight,
          bmi: p.bmi ?? f.bmi,
          profileImage: p.profilePhotoUrl ?? f.profileImage,
        }))
      } catch {
        // ignore first-load errors
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  function update<K extends keyof Editable>(key: K, value: Editable[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // BMI auto-calc when height/weight change
  useEffect(() => {
    const h = form.height
    const w = form.weight
    if (!h || !w) return
    const heightCm = form.heightUnit === 'inch' ? h * 2.54 : h
    const weightKg = form.weightUnit === 'lb' ? w * 0.453592 : w
    const meters = heightCm / 100
    const bmi = Number((weightKg / (meters * meters)).toFixed(1))
    setForm((f) => ({ ...f, bmi }))
  }, [form.height, form.weight, form.heightUnit, form.weightUnit])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      await UserAPI.updateProfile({
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob || undefined,
        age: form.age,
        address: form.address,
        bloodGroup: form.bloodGroup,
        height: form.heightUnit === 'inch' && form.height ? Math.round(form.height * 2.54) : form.height,
        weight: form.weightUnit === 'lb' && form.weight ? Math.round(form.weight * 0.453592) : form.weight,
        profilePhotoUrl: form.profileImage,
      })
      toast({ title: "Profile updated", description: "Your changes have been saved." })
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message ?? "Could not update profile", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {/* Profile Photo Section - Top Center */}
      <div className="flex flex-col items-center gap-4 pb-4 border-b">
        <div className="relative">
          <img
            src={form.profileImage || "/placeholder-user.jpg"}
            alt="profile"
            className="h-24 w-24 rounded-full border-2 object-cover"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => update('profileImage', String(reader.result || ''))
              reader.readAsDataURL(file)
            }}
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Choose photo
        </Button>
      </div>

      {/* Personal Information */}
      <div className="grid gap-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Personal Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <select id="gender" className="h-10 rounded-md border bg-background px-3" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="blood">Blood group</Label>
            <select id="blood" className="h-10 rounded-md border bg-background px-3" value={form.bloodGroup} onChange={(e) => update("bloodGroup", e.target.value)}>
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
        </div>
        {/* Address */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" value={form.address} onChange={(e) => update("address", e.target.value)} rows={3} />
          </div>
        </div>
      </div>

      {/* Physical Measurements */}
      <div className="grid gap-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Physical Measurements</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="height">Height</Label>
            <div className="flex items-center gap-2">
              <Input id="height" type="number" value={form.height ?? ''} onChange={(e) => update('height', e.target.value === '' ? undefined : Number(e.target.value))} />
              <select className="h-10 rounded-md border bg-background px-2 w-20" value={form.heightUnit} onChange={(e) => update('heightUnit', e.target.value as any)}>
                <option value="cm">cm</option>
                <option value="inch">inch</option>
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="weight">Weight</Label>
            <div className="flex items-center gap-2">
              <Input id="weight" type="number" value={form.weight ?? ''} onChange={(e) => update('weight', e.target.value === '' ? undefined : Number(e.target.value))} />
              <select className="h-10 rounded-md border bg-background px-2 w-20" value={form.weightUnit} onChange={(e) => update('weightUnit', e.target.value as any)}>
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bmi">BMI</Label>
            <Input id="bmi" value={form.bmi ?? ''} readOnly className="bg-muted" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t">
        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>{loading ? "Saving..." : "Save changes"}</Button>
      </div>
    </form>
  )
}
