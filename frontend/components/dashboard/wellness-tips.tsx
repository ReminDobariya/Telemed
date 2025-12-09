"use client"

export function WellnessTips({ tips }: { tips?: string[] }) {
  const items = (tips ?? []).slice(0, 4)
  return (
    <div className="rounded-xl border bg-card p-4 md:p-5">
      <h3 className="text-base md:text-lg font-medium">Wellness tips</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">We’ll add tips as we learn more about you.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((t, i) => (
            <li key={i} className="text-sm text-foreground/90 leading-6">
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
