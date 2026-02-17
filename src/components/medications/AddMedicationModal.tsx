'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DayTimePicker } from './DayTimePicker'
import { createMedication } from '@/app/(dashboard)/actions'
import { Calendar, Zap, ArrowLeft, Loader2 } from 'lucide-react'
import type { ScheduleEntry } from '@/types/database.types'

interface AddMedicationModalProps {
  open: boolean
  onClose: () => void
}

interface FormData {
  name: string
  dosage: string
  purpose: string
  takeWithFood: boolean
  isPrn: boolean | null
  selectedDays: number[]
  dayTimes: Record<number, string[]>
  minHoursBetween: string
}

const initialForm: FormData = {
  name: '',
  dosage: '',
  purpose: '',
  takeWithFood: false,
  isPrn: null,
  selectedDays: [],
  dayTimes: {},
  minHoursBetween: '',
}

export function AddMedicationModal({ open, onClose }: AddMedicationModalProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [isPending, startTransition] = useTransition()

  function reset() {
    setStep(1)
    setForm(initialForm)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleToggleDay(day: number) {
    setForm(prev => {
      const days = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
      const times = { ...prev.dayTimes }
      if (!times[day]) times[day] = ['08:00']
      if (!days.includes(day)) delete times[day]
      return { ...prev, selectedDays: days, dayTimes: times }
    })
  }

  function handleSelectAllDays() {
    setForm(prev => {
      if (prev.selectedDays.length === 7) {
        return { ...prev, selectedDays: [], dayTimes: {} }
      }
      const allDays = [0, 1, 2, 3, 4, 5, 6]
      const times: Record<number, string[]> = {}
      allDays.forEach(d => { times[d] = prev.dayTimes[d] || ['08:00'] })
      return { ...prev, selectedDays: allDays, dayTimes: times }
    })
  }

  function handleAddTime(day: number) {
    setForm(prev => ({
      ...prev,
      dayTimes: {
        ...prev.dayTimes,
        [day]: [...(prev.dayTimes[day] || ['08:00']), '20:00'],
      },
    }))
  }

  function handleRemoveTime(day: number, index: number) {
    setForm(prev => ({
      ...prev,
      dayTimes: {
        ...prev.dayTimes,
        [day]: (prev.dayTimes[day] || []).filter((_, i) => i !== index),
      },
    }))
  }

  function handleChangeTime(day: number, index: number, time: string) {
    setForm(prev => ({
      ...prev,
      dayTimes: {
        ...prev.dayTimes,
        [day]: (prev.dayTimes[day] || []).map((t, i) => (i === index ? time : t)),
      },
    }))
  }

  function handleSubmit() {
    // Build schedule entries from day/time selections
    const schedule: ScheduleEntry[] = []
    if (!form.isPrn) {
      form.selectedDays.forEach(day => {
        (form.dayTimes[day] || []).forEach(time => {
          schedule.push({ day, time })
        })
      })
    }

    startTransition(async () => {
      await createMedication({
        name: form.name,
        dosage: form.dosage || null,
        purpose: form.purpose || null,
        isPrn: form.isPrn || false,
        schedule,
        minHoursBetween: form.isPrn && form.minHoursBetween
          ? parseFloat(form.minHoursBetween)
          : null,
        takeWithFood: form.takeWithFood,
        notes: null,
      })
      handleClose()
    })
  }

  const canSubmitScheduled = form.selectedDays.length > 0
  const canSubmitPrn = true // min_hours_between is optional

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step === 3 ? 2 : 1)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <DialogTitle>
              {step === 1 && 'Add Medication'}
              {step === 2 && 'Medication Type'}
              {step === 3 && (form.isPrn ? 'As-Needed Settings' : 'Set Schedule')}
            </DialogTitle>
          </div>
          {/* Step dots */}
          <div className="flex gap-1.5 pt-1">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* Step 1: Name & Dosage */}
        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground">Medication Name *</label>
              <input
                type="text"
                placeholder="e.g., Testosterone Cypionate"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground"
                style={{ fontSize: '16px' }}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Dosage</label>
              <input
                type="text"
                placeholder="e.g., 200mg, 1 tablet, 5/325mg"
                value={form.dosage}
                onChange={e => setForm({ ...form, dosage: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground"
                style={{ fontSize: '16px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Purpose</label>
              <input
                type="text"
                placeholder="e.g., Pain management, Antibiotic"
                value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground"
                style={{ fontSize: '16px' }}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.takeWithFood}
                onChange={e => setForm({ ...form, takeWithFood: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-foreground">Take with food</span>
            </label>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!form.name.trim()}
              className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-40 transition-all active:scale-[0.98]"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Scheduled vs As-Needed */}
        {step === 2 && (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">How do you take this medication?</p>
            <button
              type="button"
              onClick={() => { setForm({ ...form, isPrn: false }); setStep(3) }}
              className="w-full rounded-xl border-2 border-border p-4 text-left hover:border-primary/50 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Scheduled</p>
                  <p className="text-xs text-muted-foreground">Set specific days and times</p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setForm({ ...form, isPrn: true }); setStep(3) }}
              className="w-full rounded-xl border-2 border-border p-4 text-left hover:border-primary/50 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">As Needed</p>
                  <p className="text-xs text-muted-foreground">Log when you take it, with optional dose timer</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 3: Configuration */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            {/* Scheduled config */}
            {!form.isPrn && (
              <>
                <DayTimePicker
                  selectedDays={form.selectedDays}
                  dayTimes={form.dayTimes}
                  onToggleDay={handleToggleDay}
                  onAddTime={handleAddTime}
                  onRemoveTime={handleRemoveTime}
                  onChangeTime={handleChangeTime}
                  onSelectAllDays={handleSelectAllDays}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmitScheduled || isPending}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Medication
                </button>
              </>
            )}

            {/* PRN config */}
            {form.isPrn && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Minimum hours between doses
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    A countdown timer will show on your dashboard
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="e.g., 4"
                      value={form.minHoursBetween}
                      onChange={e => setForm({ ...form, minHoursBetween: e.target.value })}
                      min="0"
                      step="0.5"
                      className="w-24 rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                      style={{ fontSize: '16px' }}
                    />
                    <span className="text-sm text-muted-foreground">hours</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmitPrn || isPending}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Medication
                </button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
