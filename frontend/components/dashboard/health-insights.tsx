"use client"

import { useEffect, useState } from "react"
import { HealthAPI } from "@/lib/api"

export function HealthInsights() {
  const [tips, setTips] = useState<{ id: string; title: string; description: string }[]>([])
  const [last, setLast] = useState<string>("-")

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await HealthAPI.overview()
        if (ignore) return
        // naive sample tips based on vitals count
        const count = (res.health?.vitals?.length ?? 0)
        const sample = [
          { id: '1', title: 'Stay hydrated', description: 'Drink 6–8 glasses of water daily.' },
          { id: '2', title: 'Light activity', description: 'Take a short walk after meals.' },
          { id: '3', title: 'Track vitals', description: 'Log BP/HR weekly to monitor trends.' },
        ]
        setTips(sample.slice(0, Math.min(3, Math.max(1, Math.ceil(count / 2)))))
        setLast(new Date(res.health?.updatedAt ?? Date.now()).toLocaleDateString())
      } catch {
        // ignore
      }
    }
    load()
    return () => { ignore = true }
  }, [])
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Health Insights</h2>
        <p className="text-xs text-muted-foreground">Last consultation: {last}</p>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {tips.map((tip) => (
          <article key={tip.id} className="rounded-md border p-3">
            <h3 className="text-sm font-medium">{tip.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{tip.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
