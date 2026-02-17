'use client'

import { useState, useTransition } from 'react'
import { Check, X, Clock, AlertTriangle, Utensils, Undo2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { logMedication, undoMedicationLog } from '@/app/(dashboard)/actions'
import type { Medication, MedicationLog } from '@/types/database.types'

interface MedicationCardProps {
  medication: Medication
  scheduledTime: string | null
  log: MedicationLog | null
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`
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
            <p className="text-sm text-muted-foreground mt-0.5">{medication.purpose}</p>

            {isLogged && log && (
              <p className="text-xs text-muted-foreground mt-1">
                {isTaken ? 'Taken' : 'Skipped'} at {new Date(log.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            )}

            {expanded && (
              <div className="mt-3 space-y-2">
                {medication.key_notes.length > 0 && (
                  <div className="space-y-1">
                    {medication.key_notes.map((note, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span> {note}
                      </p>
                    ))}
                  </div>
                )}
                {medication.interactions.length > 0 && (
                  <div className="flex items-start gap-1.5 bg-amber-50 rounded-lg p-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      {medication.interactions.map((interaction, i) => (
                        <p key={i} className="text-xs text-amber-800">{interaction}</p>
                      ))}
                    </div>
                  </div>
                )}
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

export function PRNMedicationCard({ medication, todayLogs }: { medication: Medication; todayLogs: MedicationLog[] }) {
  const [isPending, startTransition] = useTransition()

  function handleLog() {
    startTransition(async () => {
      await logMedication(medication.id, 'taken', null)
    })
  }

  return (
    <Card className="border-dashed border-secondary/40 bg-secondary/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-base">{medication.name}</h3>
              <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">
                As needed
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{medication.purpose}</p>

            {todayLogs.length > 0 && (
              <div className="mt-2 space-y-1">
                {todayLogs.map((log) => (
                  <p key={log.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Taken at {new Date(log.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                ))}
              </div>
            )}

            {medication.interactions.length > 0 && (
              <div className="flex items-start gap-1.5 bg-amber-50 rounded-lg p-2 mt-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  {medication.interactions.map((interaction, i) => (
                    <p key={i} className="text-xs text-amber-800">{interaction}</p>
                  ))}
                </div>
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
      </CardContent>
    </Card>
  )
}
