'use client'

import { useState, useEffect } from 'react'
import { useOnlineStatus } from './useOnlineStatus'

export type SyncStatus = 'synced' | 'syncing' | 'offline'

export function useSyncStatus() {
  const isOnline = useOnlineStatus()
  const [syncStatus, setSyncStatusInternal] = useState<SyncStatus>('synced')
  const [syncingTimeoutId, setSyncingTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Update status based on online state
  useEffect(() => {
    if (!isOnline) {
      setSyncStatusInternal('offline')
    } else if (syncStatus === 'offline') {
      setSyncStatusInternal('synced')
    }
  }, [isOnline, syncStatus])

  const setSyncing = (isSyncing: boolean) => {
    if (!isOnline) return // Don't update if offline

    if (isSyncing) {
      // Clear any existing timeout
      if (syncingTimeoutId) {
        clearTimeout(syncingTimeoutId)
      }
      setSyncStatusInternal('syncing')

      // Auto-reset to synced after 2 seconds
      const timeoutId = setTimeout(() => {
        setSyncStatusInternal('synced')
        setSyncingTimeoutId(null)
      }, 2000)

      setSyncingTimeoutId(timeoutId)
    } else {
      // Immediately set to synced
      if (syncingTimeoutId) {
        clearTimeout(syncingTimeoutId)
        setSyncingTimeoutId(null)
      }
      setSyncStatusInternal('synced')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncingTimeoutId) {
        clearTimeout(syncingTimeoutId)
      }
    }
  }, [syncingTimeoutId])

  return { syncStatus, setSyncing }
}
