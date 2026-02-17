'use client'

import { useState, useTransition } from 'react'
import { Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { submitCheckin } from '@/app/(dashboard)/task-actions'

interface FeelingCheckinProps {
  todayCheckins: {
    id: string
    period: string
    pain_level: number
    mood_level: number
    energy_level: number
    notes: string | null
  }[]
}

function getCurrentPeriod(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function LevelSlider({ label, value, onChange, emoji }: { label: string; value: number; onChange: (v: number) => void; emoji: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{emoji} {label}</span>
        <span className="text-sm font-medium w-6 text-center">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
        style={{ fontSize: '16px' }}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/50 px-0.5">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )
}

export function FeelingCheckin({ todayCheckins }: FeelingCheckinProps) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const currentPeriod = getCurrentPeriod()

  const existingCheckin = todayCheckins.find((c) => c.period === currentPeriod)

  const [pain, setPain] = useState(existingCheckin?.pain_level || 5)
  const [mood, setMood] = useState(existingCheckin?.mood_level || 5)
  const [energy, setEnergy] = useState(existingCheckin?.energy_level || 5)
  const [notes, setNotes] = useState(existingCheckin?.notes || '')

  const periodLabels = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' }

  function handleSubmit() {
    startTransition(async () => {
      await submitCheckin(currentPeriod, pain, mood, energy, notes)
      setExpanded(false)
    })
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          How are you feeling?
        </h2>
        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>

      {/* Show today's check-ins summary */}
      {!expanded && todayCheckins.length > 0 && (
        <div className="flex gap-2">
          {(['morning', 'afternoon', 'evening'] as const).map((period) => {
            const checkin = todayCheckins.find((c) => c.period === period)
            return (
              <div
                key={period}
                className={`flex-1 rounded-lg p-2 text-center text-xs ${
                  checkin ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                <div className="font-medium capitalize">{period}</div>
                {checkin ? (
                  <div className="mt-0.5">Pain {checkin.pain_level}/10</div>
                ) : (
                  <div className="mt-0.5">{period === currentPeriod ? 'Due now' : '--'}</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {expanded && (
        <Card className="border-primary/20">
          <CardContent className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {periodLabels[currentPeriod]} check-in {existingCheckin ? '(updating)' : ''}
            </p>

            <LevelSlider label="Pain" value={pain} onChange={setPain} emoji="" />
            <LevelSlider label="Mood" value={mood} onChange={setMood} emoji="" />
            <LevelSlider label="Energy" value={energy} onChange={setEnergy} emoji="" />

            <textarea
              placeholder="Any notes? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none h-16"
              style={{ fontSize: '16px' }}
            />

            <Button onClick={handleSubmit} disabled={isPending} className="w-full">
              {isPending ? 'Saving...' : existingCheckin ? 'Update Check-in' : 'Save Check-in'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
