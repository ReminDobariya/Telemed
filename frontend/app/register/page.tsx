"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-context"
import { Input as Password } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type Step = 1 | 2

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  // form data
  const [name, setName] = useState("")
  const [gender, setGender] = useState("")
  const [dob, setDob] = useState<string>("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [tos, setTos] = useState(false)

  const canNext1 = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone.trim().length >= 7 && password.length >= 6
  const canSubmit = (gender === 'male' || gender === 'female' || gender === 'other') && tos

  const handleSubmit = async () => {
    setLoading(true)
    await register({
      name,
      email,
      phone,
      password,
      gender,
      age: dob ? Math.max(0, Math.floor((Date.now() - new Date(dob).getTime()) / (365.25*24*60*60*1000))) : undefined,
    })
    setLoading(false)
    toast({ title: "Registration successful", description: "You can now sign in." })
    router.push("/login")
  }

  return (
    <main className="mx-auto grid min-h-dvh max-w-2xl place-items-center px-4 py-6 sm:py-12">
      <section className="w-full rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
        <header className="mb-4">
          <h1 className="text-pretty text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground">Step {step} of 2</p>
        </header>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Password id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canNext1}>
                Next
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select id="gender" className="h-10 rounded-md border bg-background px-3" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth (optional)</Label>
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
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
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
                {loading ? "Submitting…" : "Create account"}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
