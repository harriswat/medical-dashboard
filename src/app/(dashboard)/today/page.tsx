import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-900">Today</h1>
        <p className="text-green-700">Welcome, {user?.email}</p>
      </div>

      <Card className="border-green-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-green-900">Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">Today's schedule will appear here</p>
        </CardContent>
      </Card>
    </div>
  )
}
