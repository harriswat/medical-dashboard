import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HistoryPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-900">History</h1>
      </div>

      <Card className="border-green-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-green-900">Medication History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">History will appear here</p>
        </CardContent>
      </Card>
    </div>
  )
}
