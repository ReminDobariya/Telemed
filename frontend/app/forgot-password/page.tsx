"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email.")
      return
    }
    setLoading(true)
    // dummy delay
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    toast({ title: "Reset link sent", description: "Check your email for instructions." })
  }

  return (
    <main className="mx-auto grid min-h-dvh max-w-xl place-items-center px-4 py-12">
      <section className="w-full rounded-lg border bg-card p-6 shadow-sm">
        <header className="mb-4">
          <h1 className="text-pretty text-2xl font-semibold">Reset your password</h1>
          <p className="text-sm text-muted-foreground">Enter your email and we’ll send you reset instructions.</p>
        </header>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Go back to sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
