'use client'

import { Plus, X } from 'lucide-react'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface DayTimePickerProps {
  selectedDays: number[]
  dayTimes: Record<number, string[]>
  onToggleDay: (day: number) => void
  onAddTime: (day: number) => void
  onRemoveTime: (day: number, index: number) => void
  onChangeTime: (day: number, index: number, time: string) => void
  onSelectAllDays: () => void
}

export function DayTimePicker({
  selectedDays,
  dayTimes,
  onToggleDay,
  onAddTime,
  onRemoveTime,
  onChangeTime,
  onSelectAllDays,
}: DayTimePickerProps) {
  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Days</p>
          <button
            type="button"
            onClick={onSelectAllDays}
            className="text-xs text-primary font-medium"
          >
            {selectedDays.length === 7 ? 'Clear all' : 'Every day'}
          </button>
        </div>
        <div className="flex gap-2 justify-between">
          {DAY_LABELS.map((label, day) => (
            <button
              key={day}
              type="button"
              onClick={() => onToggleDay(day)}
              className={`h-10 w-10 rounded-full text-sm font-medium transition-all ${
                selectedDays.includes(day)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Time inputs per selected day */}
      {selectedDays.length > 0 && (
        <div className="space-y-3">
          {selectedDays.sort((a, b) => a - b).map(day => (
            <div key={day} className="space-y-2">
              <p className="text-sm font-medium text-foreground">{DAY_NAMES[day]}</p>
              {(dayTimes[day] || ['08:00']).map((time, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => onChangeTime(day, idx, e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    style={{ fontSize: '16px' }}
                  />
                  {(dayTimes[day] || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveTime(day, idx)}
                      className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => onAddTime(day)}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                <Plus className="h-3 w-3" />
                Add time
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
