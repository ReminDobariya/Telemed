"use client"

import { useEffect, useState } from "react"
import { HealthAPI } from "@/lib/api"
import { Sparkles } from "lucide-react"

export function AIHealthInsights() {
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function generateInsights() {
      try {
        setLoading(true)
        // Check local cache
        let cached: { insights: string[]; signature?: string; ts: number } | null = null
        try {
          const raw = localStorage.getItem('ai_insights_cache')
          if (raw) cached = JSON.parse(raw)
        } catch {}

        // Always call backend to get current signature
        const res = await HealthAPI.getInsights()
        const backendSignature = (res as any).signature

        // If signatures match and cache is recent (within 1 hour), use cached insights
        if (cached && cached.signature === backendSignature) {
          const oneHour = 60 * 60 * 1000
          if (Date.now() - cached.ts < oneHour) {
            if (!ignore) {
              setInsights(cached.insights || [])
              setLoading(false)
              return
            }
          }
        }

        // Signature changed or cache expired - use fresh insights from backend
        if (!ignore) {
          setInsights(res.insights || [])
          try {
            localStorage.setItem('ai_insights_cache', JSON.stringify({
              insights: res.insights || [],
              signature: backendSignature,
              ts: Date.now()
            }))
          } catch {}
        }
      } catch (error) {
        console.error('Failed to generate insights:', error)
        // Try to use cached insights even if backend fails
        try {
          const raw = localStorage.getItem('ai_insights_cache')
          if (raw) {
            const cached = JSON.parse(raw)
            if (!ignore && cached.insights) {
              setInsights(cached.insights)
              setLoading(false)
              return
            }
          }
        } catch {}
        if (!ignore) {
          setInsights([
            "Keep track of your health metrics regularly to maintain awareness of your wellness.",
            "Don't hesitate to reach out to healthcare providers when you have questions or concerns.",
            "Small, consistent lifestyle choices can make a positive difference in your overall health.",
          ])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    generateInsights()
    return () => { ignore = true }
  }, [])

  return (
    <div className="rounded-xl border bg-card p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-base md:text-lg font-medium">AI Health Insights</h2>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">We'll generate insights as we learn more about your health profile.</p>
      ) : (
        <ul className="space-y-3">
          {insights.map((insight, i) => (
            <li key={i} className="text-sm text-foreground/90 leading-relaxed flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

