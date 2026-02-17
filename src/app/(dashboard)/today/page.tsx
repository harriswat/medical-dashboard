import { createClient } from '@/lib/supabase/server'
import { DailySchedule } from '@/components/medications/DailySchedule'
import { TaskList } from '@/components/tasks/TaskList'
import { FeelingCheckin } from '@/components/checkins/FeelingCheckin'
import { QuickActivity } from '@/components/activities/QuickActivity'
import { DoctorContacts } from '@/components/contacts/DoctorContacts'
import { addDoctorContact } from './contact-actions'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user!.id)
    .single()

  const displayName = (profile as { display_name: string | null } | null)?.display_name || user?.email?.split('@')[0] || 'there'
  const greeting = getGreeting()
  const today = new Date().toISOString().split('T')[0]

  // Fetch everything in parallel
  const [
    { data: medications },
    { data: medLogs },
    { data: tasks },
    { data: checkins },
    { data: activities },
    { data: contacts },
    { data: profiles },
  ] = await Promise.all([
    supabase.from('medications').select('*').order('name'),
    (supabase.from('medication_logs') as any).select('*').eq('log_date', today),
    (supabase.from('tasks') as any).select('*').order('created_at', { ascending: false }),
    (supabase.from('feeling_checkins') as any).select('*').eq('checkin_date', today),
    (supabase.from('care_activities') as any).select('*').eq('activity_date', today).order('activity_time', { ascending: false }),
    (supabase.from('doctor_contacts') as any).select('*').order('is_emergency', { ascending: false }),
    supabase.from('profiles').select('id, display_name, email'),
  ])

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {greeting}, {displayName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Medications Schedule */}
      <DailySchedule
        medications={(medications as any[]) || []}
        logs={(medLogs as any[]) || []}
      />

      <hr className="border-border" />

      {/* Feeling Check-in */}
      <FeelingCheckin todayCheckins={(checkins as any[]) || []} />

      <hr className="border-border" />

      {/* Tasks */}
      <TaskList
        tasks={(tasks as any[]) || []}
        currentUserId={user!.id}
        currentUserEmail={user!.email || ''}
        profiles={(profiles as any[]) || []}
      />

      <hr className="border-border" />

      {/* Care Activities */}
      <QuickActivity todayActivities={(activities as any[]) || []} />

      <hr className="border-border" />

      {/* Doctor Contacts */}
      <DoctorContacts
        contacts={(contacts as any[]) || []}
        onAdd={addDoctorContact}
      />
    </div>
  )
}
