'use client'

import { useState, useTransition } from 'react'
import { Check, X, Clock, Utensils, Undo2, MoreHorizontal, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { logMedication, undoMedicationLog, deleteMedication } from '@/app/(dashboard)/actions'
import { CountdownTimer } from './CountdownTimer'
import type { Medication, MedicationLog } from '@/types/database.types'

interface MedicationCardProps {
  medication: Medication
  scheduledTime: string | null
  log: MedicationLog | null
}

export function MedicationCard({ medication, scheduledTime, log }: MedicationCardProps) {
  const [isPending, startTransition] = useTransition()
  const [expanded, setExpanded] = useState(false)

  const isTaken = log?.status === 'taken'
  const isSkipped = log?.status === 'skipped'
  const isLogged = isTaken || isSkipped

  function handleLog(status: 'taken' | 'skipped') {
    startTransition(async () => {
      await logMedication(medication.id, status, scheduledTime)
    })
  }

  function handleUndo() {
    if (!log) return
    startTransition(async () => {
      await undoMedicationLog(log.id)
    })
  }

  return (
    <Card className={`border transition-all ${
      isTaken ? 'border-primary/30 bg-primary/5' :
      isSkipped ? 'border-muted bg-muted/30' :
      'border-border bg-card'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0" onClick={() => setExpanded(!expanded)}>
            <div className="flex items-center gap-2">
              <h3 className={`font-medium text-base ${isSkipped ? 'text-muted-foreground line-through' : ''}`}>
                {medication.name}
              </h3>
              {medication.take_with_food && (
                <Utensils className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
              )}
            </div>
            {medication.dosage && (
              <p className="text-xs text-muted-foreground mt-0.5">{medication.dosage}</p>
            )}
            {medication.purpose && (
              <p className="text-sm text-muted-foreground mt-0.5">{medication.purpose}</p>
            )}

            {isLogged && log && (
              <p className="text-xs text-muted-foreground mt-1">
                {isTaken ? 'Taken' : 'Skipped'} at {new Date(log.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            )}

            {expanded && medication.notes && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span> {medication.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLogged ? (
              <button
                onClick={handleUndo}
                disabled={isPending}
                className="h-11 w-11 rounded-full border border-muted flex items-center justify-center text-muted-foreground hover:bg-muted/50 active:scale-95 transition-all"
                aria-label="Undo"
              >
                <Undo2 className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleLog('skipped')}
                  disabled={isPending}
                  className="h-11 w-11 rounded-full border border-muted flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive active:scale-95 transition-all"
                  aria-label="Skip"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleLog('taken')}
                  disabled={isPending}
                  className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                  aria-label="Mark as taken"
                >
                  <Check className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface PRNMedicationCardProps {
  medication: Medication
  todayLogs: MedicationLog[]
  lastTakenAt: string | null
}

export function PRNMedicationCard({ medication, todayLogs, lastTakenAt }: PRNMedicationCardProps) {
  const [isPending, startTransition] = useTransition()
  const [showMenu, setShowMenu] = useState(false)

  function handleLog() {
    startTransition(async () => {
      await logMedication(medication.id, 'taken', null)
    })
  }

  function handleDelete() {
    if (!confirm(`Delete ${medication.name}?`)) return
    startTransition(async () => {
      await deleteMedication(medication.id)
    })
  }

  return (
    <Card className="border-dashed border-secondary/40 bg-secondary/5">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-base">{medication.name}</h3>
                <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">
                  As needed
                </span>
              </div>
              {medication.dosage && (
                <p className="text-xs text-muted-foreground mt-0.5">{medication.dosage}</p>
              )}
              {medication.purpose && (
                <p className="text-sm text-muted-foreground mt-0.5">{medication.purpose}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-9 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                    <button
                      onClick={() => { handleDelete(); setShowMenu(false) }}
                      className="w-full px-3 py-2 text-sm text-destructive flex items-center gap-2 hover:bg-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleLog}
                disabled={isPending}
                className="h-11 px-4 rounded-full bg-secondary/20 text-secondary-foreground flex items-center gap-2 hover:bg-secondary/30 active:scale-95 transition-all text-sm font-medium"
              >
                <Check className="h-4 w-4" />
                Log
              </button>
            </div>
          </div>

          {/* Countdown timer */}
          {medication.min_hours_between && (
            <CountdownTimer
              lastTakenAt={lastTakenAt}
              minHoursBetween={medication.min_hours_between}
            />
          )}

          {/* Today's logs */}
          {todayLogs.length > 0 && (
            <div className="space-y-1">
              {todayLogs.map((log) => (
                <p key={log.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Taken at {new Date(log.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
