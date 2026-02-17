import type { Medication, MedicationLog } from '@/types/database.types'
import { MedicationCard } from './MedicationCard'

interface TimeSlotProps {
  time: string
  medications: Medication[]
  logs: MedicationLog[]
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

function isPast(time: string): boolean {
  const now = new Date()
  const [hours, minutes] = time.split(':').map(Number)
  return now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)
}

function isCurrent(time: string): boolean {
  const now = new Date()
  const [hours] = time.split(':').map(Number)
  return now.getHours() === hours
}

export function TimeSlot({ time, medications, logs }: TimeSlotProps) {
  const past = isPast(time)
  const current = isCurrent(time)

  return (
    <div className={`relative ${current ? '' : ''}`}>
      {/* Time label */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`flex items-center justify-center w-16 text-sm font-medium ${
          current ? 'text-primary' : past ? 'text-muted-foreground' : 'text-foreground'
        }`}>
          {formatTime(time)}
        </div>
        <div className={`flex-1 h-px ${current ? 'bg-primary/30' : 'bg-border'}`} />
        {current && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Now</span>
        )}
      </div>

      {/* Medication cards */}
      <div className="ml-[76px] space-y-2 mb-4">
        {medications.map((med) => {
          const log = logs.find(
            (l) => l.medication_id === med.id && l.scheduled_time === time
          ) || null
          return (
            <MedicationCard
              key={`${med.id}-${time}`}
              medication={med}
              scheduledTime={time}
              log={log}
            />
          )
        })}
      </div>
    </div>
  )
}
