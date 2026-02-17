'use client'

import { useState, useTransition } from 'react'
import { Plus, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logCareActivity } from '@/app/(dashboard)/task-actions'

const CATEGORIES = [
  { value: 'wound_care', label: 'Wound Care', emoji: '🩹' },
  { value: 'exercise', label: 'Exercise', emoji: '🏃' },
  { value: 'hygiene', label: 'Hygiene', emoji: '🚿' },
  { value: 'nutrition', label: 'Nutrition', emoji: '🍎' },
  { value: 'other', label: 'Other', emoji: '📝' },
]

interface QuickActivityProps {
  todayActivities: { id: string; category: string; description: string; activity_time: string }[]
}

export function QuickActivity({ todayActivities }: QuickActivityProps) {
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState('wound_care')
  const [description, setDescription] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!description.trim()) return
    startTransition(async () => {
      await logCareActivity(category, description.trim(), '')
      setDescription('')
      setShowForm(false)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Care Activities
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="h-8 text-primary"
        >
          <Plus className="h-4 w-4 mr-1" />
          Log
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    category === cat.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
            <input
              placeholder="What did you do? (e.g., Changed gauze)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm"
              autoFocus
              style={{ fontSize: '16px' }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit} disabled={isPending || !description.trim()} className="flex-1">
                {isPending ? 'Logging...' : 'Log Activity'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {todayActivities.length > 0 ? (
        <div className="space-y-1.5">
          {todayActivities.slice(0, 5).map((activity) => {
            const cat = CATEGORIES.find((c) => c.value === activity.category)
            return (
              <div key={activity.id} className="flex items-center gap-2 px-1 py-1">
                <span className="text-sm">{cat?.emoji || '📝'}</span>
                <span className="text-sm flex-1">{activity.description}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.activity_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground px-1">No activities logged today</p>
      )}
    </div>
  )
}
