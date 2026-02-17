import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, Clock, Pill } from 'lucide-react'

export default async function HistoryPage() {
  const supabase = await createClient()

  // Get last 7 days of medication logs with medication details
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: logs } = await (supabase
    .from('medication_logs') as any)
    .select('*, medications(name, is_prn, dosage)')
    .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
    .order('logged_at', { ascending: false })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.display_name]))

  // Group logs by date
  const logsByDate = new Map<string, any[]>()
  for (const log of (logs || []) as any[]) {
    const date = log.log_date
    if (!logsByDate.has(date)) logsByDate.set(date, [])
    logsByDate.get(date)!.push(log)
  }

  const sortedDates = [...logsByDate.keys()].sort().reverse()

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">Past medication logs</p>
      </div>

      {sortedDates.length === 0 ? (
        <Card className="border-border bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Pill className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No medication history yet</p>
          </CardContent>
        </Card>
      ) : (
        sortedDates.map((date) => {
          const dayLogs = logsByDate.get(date)!
          const dateObj = new Date(date + 'T12:00:00')
          const isToday = date === new Date().toISOString().split('T')[0]

          return (
            <div key={date}>
              <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                {isToday ? 'Today' : dateObj.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </h2>
              <div className="space-y-1.5">
                {dayLogs.map((log: any) => (
                  <Card key={log.id} className="border-border/50">
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        log.status === 'taken'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {log.status === 'taken' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {log.medications?.name || 'Unknown'}
                          {log.medications?.dosage && (
                            <span className="text-xs text-muted-foreground ml-1">{log.medications.dosage}</span>
                          )}
                          {log.medications?.is_prn && (
                            <span className="text-xs text-secondary ml-1">(PRN)</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(log.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                          {log.scheduled_time && (
                            <span className="text-muted-foreground/60">
                              (scheduled {log.scheduled_time})
                            </span>
                          )}
                          <span>by {profileMap.get(log.logged_by) || 'Unknown'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
