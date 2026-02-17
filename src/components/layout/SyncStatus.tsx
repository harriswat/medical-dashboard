'use client'

import { useSyncStatus } from '@/hooks/useSyncStatus'
import { cn } from '@/lib/utils'

export function SyncStatus() {
  const { syncStatus } = useSyncStatus()

  const statusConfig = {
    synced: {
      color: 'bg-primary',
      text: 'Synced',
      animate: false,
    },
    syncing: {
      color: 'bg-amber-500',
      text: 'Syncing...',
      animate: true,
    },
    offline: {
      color: 'bg-orange-500',
      text: 'Offline',
      animate: false,
    },
  }

  const config = statusConfig[syncStatus]

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground transition-all duration-300">
      <div
        className={cn(
          'h-2 w-2 rounded-full transition-colors duration-300',
          config.color,
          config.animate && 'animate-pulse'
        )}
      />
      <span className="transition-opacity duration-300">{config.text}</span>
    </div>
  )
}
