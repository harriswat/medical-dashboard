'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(title: string, description: string, assignedToEmail: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Look up assignee by email
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email')

  const assignee = (profiles as any[])?.find((p: any) => p.email === assignedToEmail)
  if (!assignee) throw new Error('User not found')

  await (supabase.from('tasks') as any).insert({
    title,
    description: description || null,
    assigned_to: assignee.id,
    assigned_by: user.id,
  })

  revalidatePath('/today')
}

export async function completeTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await (supabase.from('tasks') as any)
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', taskId)

  revalidatePath('/today')
}

export async function submitCheckin(
  period: 'morning' | 'afternoon' | 'evening',
  painLevel: number,
  moodLevel: number,
  energyLevel: number,
  notes: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString().split('T')[0]

  // Upsert: if check-in already exists for this period today, update it
  const { data: existing } = await (supabase.from('feeling_checkins') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('period', period)
    .eq('checkin_date', today)
    .maybeSingle()

  if (existing) {
    await (supabase.from('feeling_checkins') as any)
      .update({ pain_level: painLevel, mood_level: moodLevel, energy_level: energyLevel, notes: notes || null })
      .eq('id', existing.id)
  } else {
    await (supabase.from('feeling_checkins') as any).insert({
      user_id: user.id,
      period,
      pain_level: painLevel,
      mood_level: moodLevel,
      energy_level: energyLevel,
      notes: notes || null,
      checkin_date: today,
    })
  }

  revalidatePath('/today')
}

export async function logCareActivity(
  category: string,
  description: string,
  notes: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await (supabase.from('care_activities') as any).insert({
    category,
    description,
    logged_by: user.id,
    notes: notes || null,
  })

  revalidatePath('/today')
}
