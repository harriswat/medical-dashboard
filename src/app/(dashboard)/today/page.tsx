import { createClient } from '@/lib/supabase/server'
import { DailySchedule } from '@/components/medications/DailySchedule'

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

  // Fetch medications and today's logs
  const [{ data: medications }, { data: logs }] = await Promise.all([
    supabase.from('medications').select('*').order('name'),
    supabase.from('medication_logs').select('*').eq('log_date', today),
  ])

  return (
    <div className="p-4 space-y-4">
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

      <DailySchedule
        medications={(medications as any[]) || []}
        logs={(logs as any[]) || []}
      />
    </div>
  )
}
