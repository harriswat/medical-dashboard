'use client'

import type { Medication, MedicationLog } from '@/types/database.types'
import { TimeSlot } from './TimeSlot'
import { PRNMedicationCard } from './MedicationCard'
import { DrugWarningBanner } from './DrugWarningBanner'

interface DailyScheduleProps {
  medications: Medication[]
  logs: MedicationLog[]
}

export function DailySchedule({ medications, logs }: DailyScheduleProps) {
  // Split into scheduled and PRN
  const scheduled = medications.filter((m) => !m.is_prn)
  const prn = medications.filter((m) => m.is_prn)

  // Collect all unique time slots and sort them
  const timeSlots = [...new Set(scheduled.flatMap((m) => m.schedule_times))].sort()

  // Count completed meds
  const totalScheduled = scheduled.reduce((acc, m) => acc + m.schedule_times.length, 0)
  const completedCount = logs.filter((l) => l.scheduled_time !== null).length

  return (
    <div className="space-y-4">
      {/* Drug interaction warning */}
      <DrugWarningBanner />

      {/* Progress summary */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {completedCount} of {totalScheduled} medications logged today
        </p>
        {completedCount === totalScheduled && totalScheduled > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            All done!
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${totalScheduled > 0 ? (completedCount / totalScheduled) * 100 : 0}%` }}
        />
      </div>

      {/* Timeline */}
      <div className="mt-6">
        {timeSlots.map((time) => {
          const medsAtTime = scheduled.filter((m) => m.schedule_times.includes(time))
          return (
            <TimeSlot
              key={time}
              time={time}
              medications={medsAtTime}
              logs={logs}
            />
          )
        })}
      </div>

      {/* PRN medications */}
      {prn.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-muted-foreground">As Needed</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2">
            {prn.map((med) => {
              const medLogs = logs.filter((l) => l.medication_id === med.id)
              return (
                <PRNMedicationCard
                  key={med.id}
                  medication={med}
                  todayLogs={medLogs}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
