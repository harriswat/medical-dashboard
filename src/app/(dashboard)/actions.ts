'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { MedicationLogInsert } from '@/types/database.types'

export async function logMedication(
  medicationId: string,
  status: 'taken' | 'skipped',
  scheduledTime: string | null
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString().split('T')[0]

  // Check if already logged for this time slot today
  if (scheduledTime) {
    const { data: existing } = await (supabase
      .from('medication_logs') as any)
      .select('id')
      .eq('medication_id', medicationId)
      .eq('scheduled_time', scheduledTime)
      .eq('log_date', today)
      .maybeSingle()

    if (existing) {
      await (supabase
        .from('medication_logs') as any)
        .update({ status, logged_by: user.id, logged_at: new Date().toISOString() })
        .eq('id', existing.id)

      revalidatePath('/today')
      revalidatePath('/history')
      return
    }
  }

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
