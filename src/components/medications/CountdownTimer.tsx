'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle2 } from 'lucide-react'

interface CountdownTimerProps {
  lastTakenAt: string | null
  minHoursBetween: number
}

export function CountdownTimer({ lastTakenAt, minHoursBetween }: CountdownTimerProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(interval)
  }, [])

  if (!lastTakenAt) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle2 className="h-4 w-4" />
        <span>Ready to take</span>
      </div>
    )
  }

  const lastTaken = new Date(lastTakenAt).getTime()
  const nextAllowed = lastTaken + minHoursBetween * 60 * 60 * 1000
  const remaining = nextAllowed - now

  if (remaining <= 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle2 className="h-4 w-4" />
        <span>Ready to take</span>
      </div>
    )
  }

  const totalMs = minHoursBetween * 60 * 60 * 1000
  const elapsed = totalMs - remaining
  const progress = Math.min((elapsed / totalMs) * 100, 100)

  const hours = Math.floor(remaining / (60 * 60 * 1000))
  const minutes = Math.ceil((remaining % (60 * 60 * 1000)) / (60 * 1000))

  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Next dose in <span className="font-medium text-foreground">{timeStr}</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary/60 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
