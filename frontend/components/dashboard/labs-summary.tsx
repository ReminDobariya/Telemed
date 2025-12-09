"use client"

type Report = { id?: string; type?: string; date?: string }

export function LabsSummary({ reports }: { reports?: Report[] }) {
  const items = (reports ?? []).slice(0, 3)
  return (
    <div className="rounded-xl border bg-card p-4 md:p-5">
      <h3 className="text-base md:text-lg font-medium">Recent lab reports</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No recent reports.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((r, i) => (
            <li key={r.id ?? i} className="flex items-center justify-between rounded-lg bg-background border px-3 py-2">
              <span className="text-sm">{r.type ?? "Report"}</span>
              <span className="text-xs text-muted-foreground">{r.date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
