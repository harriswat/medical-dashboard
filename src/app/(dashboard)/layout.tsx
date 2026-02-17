import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile for display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single() as { data: { display_name: string | null } | null }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User'

  return (
    <DashboardShell displayName={displayName}>
      {children}
    </DashboardShell>
  )
}
