'use client'

import type { Medication, MedicationLog, ScheduleEntry } from '@/types/database.types'
import { TimeSlot } from './TimeSlot'
import { PRNMedicationCard } from './MedicationCard'
import { AddMedicationButton } from './AddMedicationButton'

interface DailyScheduleProps {
  medications: Medication[]
  logs: MedicationLog[]
  prnLastLogs: Record<string, string>
}

export function DailySchedule({ medications, logs, prnLastLogs }: DailyScheduleProps) {
  const today = new Date().getDay() // 0=Sunday, 1=Monday, etc.

  // Split into scheduled and PRN
  const scheduled = medications.filter((m) => !m.is_prn)
  const prn = medications.filter((m) => m.is_prn)

  // For each scheduled med, find times that apply today
  const todayMedTimes: { med: Medication; time: string }[] = []
  scheduled.forEach((med) => {
    const schedule = (med.schedule || []) as ScheduleEntry[]
    schedule
      .filter((entry) => entry.day === today)
      .forEach((entry) => {
        todayMedTimes.push({ med, time: entry.time })
      })
  })

  // Collect unique time slots and sort
  const timeSlots = [...new Set(todayMedTimes.map((mt) => mt.time))].sort()

  // Count today's scheduled meds and completions
  const totalScheduled = todayMedTimes.length
  const completedCount = logs.filter((l) => l.scheduled_time !== null).length

  const hasMedications = medications.length > 0

  return (
    <div className="space-y-4">
      {/* Add medication button */}
      <AddMedicationButton />

      {!hasMedications && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No medications set up yet. Tap above to get started.
        </p>
      )}

      {/* Progress summary - only show if there are scheduled meds today */}
      {totalScheduled > 0 && (
        <>
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalScheduled} medications logged today
            </p>
            {completedCount === totalScheduled && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                All done!
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalScheduled) * 100}%` }}
            />
          </div>
        </>
      )}

      {/* No scheduled meds today but some exist */}
      {totalScheduled === 0 && scheduled.length > 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No scheduled medications for today.
        </p>
      )}

      {/* Timeline */}
      {timeSlots.length > 0 && (
        <div className="mt-6">
          {timeSlots.map((time) => {
            const medsAtTime = todayMedTimes
              .filter((mt) => mt.time === time)
              .map((mt) => mt.med)
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
      )}

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
                  lastTakenAt={prnLastLogs[med.id] || null}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
