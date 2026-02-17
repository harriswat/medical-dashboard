'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      className={cn(
        'mx-4 mt-4 mb-2 p-4 rounded-xl border transition-all duration-300',
        'bg-amber-50 border-amber-200',
        'animate-in slide-in-from-top-2'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
            <WifiOff className="h-4 w-4 text-amber-600" />
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-amber-900">You're offline</p>
          <p className="text-xs text-amber-700">
            You can view the dashboard but actions are paused until you reconnect.
          </p>
        </div>
      </div>
    </div>
  )
}
