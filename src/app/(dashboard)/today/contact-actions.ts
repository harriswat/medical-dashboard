'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addDoctorContact(
  name: string,
  phone: string,
  specialty: string,
  isEmergency: boolean
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await (supabase.from('doctor_contacts') as any).insert({
    name,
    phone,
    specialty: specialty || null,
    is_emergency: isEmergency,
  })

  revalidatePath('/today')
}
