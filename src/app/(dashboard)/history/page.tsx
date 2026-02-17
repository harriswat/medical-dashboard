import { Card, CardContent } from '@/components/ui/card'
import { History } from 'lucide-react'

export default function HistoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">
          View past medications and activities
        </p>
      </div>

      <Card className="border-border bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
            <History className="h-8 w-8 text-secondary" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-muted-foreground">
              History will appear here in Phase 2
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
