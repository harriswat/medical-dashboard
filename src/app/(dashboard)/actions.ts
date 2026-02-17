'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { MedicationLogInsert, ScheduleEntry } from '@/types/database.types'

// ── Medication CRUD ──

export async function createMedication(data: {
  name: string
  dosage: string | null
  purpose: string | null
  isPrn: boolean
  schedule: ScheduleEntry[]
  minHoursBetween: number | null
  takeWithFood: boolean
  notes: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await (supabase.from('medications') as any).insert({
    name: data.name,
    dosage: data.dosage,
    purpose: data.purpose,
    is_prn: data.isPrn,
    schedule: data.schedule,
    min_hours_between: data.minHoursBetween,
    take_with_food: data.takeWithFood,
    notes: data.notes,
    created_by: user.id,
  })

  revalidatePath('/today')
  revalidatePath('/history')
}

export async function updateMedication(
  id: string,
  data: {
    name?: string
    dosage?: string | null
    purpose?: string | null
    isPrn?: boolean
    schedule?: ScheduleEntry[]
    minHoursBetween?: number | null
    takeWithFood?: boolean
    notes?: string | null
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.dosage !== undefined) updateData.dosage = data.dosage
  if (data.purpose !== undefined) updateData.purpose = data.purpose
  if (data.isPrn !== undefined) updateData.is_prn = data.isPrn
  if (data.schedule !== undefined) updateData.schedule = data.schedule
  if (data.minHoursBetween !== undefined) updateData.min_hours_between = data.minHoursBetween
  if (data.takeWithFood !== undefined) updateData.take_with_food = data.takeWithFood
  if (data.notes !== undefined) updateData.notes = data.notes

  await (supabase.from('medications') as any).update(updateData).eq('id', id)

  revalidatePath('/today')
  revalidatePath('/history')
}

export async function deleteMedication(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await (supabase.from('medications') as any).delete().eq('id', id)

  revalidatePath('/today')
  revalidatePath('/history')
}

// ── Medication Logging ──

export async function logMedication(
  medicationId: string,
  status: 'taken' | 'skipped',
  scheduledTime: string | null
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString().split('T')[0]

  // For scheduled meds, upsert by (medication, time, date)
  if (scheduledTime) {
    const { data: existing } = await (supabase
      .from('medication_logs') as any)
      .select('id')
      .eq('medication_id', medicationId)
      .eq('scheduled_time', scheduledTime)
      .eq('log_date', today)
      .maybeSingle()

    if (existing) {
      await (supabase.from('medication_logs') as any)
        .update({ status, logged_by: user.id, logged_at: new Date().toISOString() })
        .eq('id', existing.id)

      revalidatePath('/today')
      revalidatePath('/history')
      return
    }
  }

  // Insert new log (always for PRN, or first log for scheduled)
  const row: MedicationLogInsert = {
    medication_id: medicationId,
    scheduled_time: scheduledTime,
    status,
    logged_by: user.id,
    log_date: today,
  }

  await (supabase.from('medication_logs') as any).insert(row)

  revalidatePath('/today')
  revalidatePath('/history')
}

export async function undoMedicationLog(logId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await (supabase.from('medication_logs') as any).delete().eq('id', logId)

  revalidatePath('/today')
  revalidatePath('/history')
}
