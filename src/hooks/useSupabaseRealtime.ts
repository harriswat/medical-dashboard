'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseSupabaseRealtimeOptions<T> {
  filter?: string
  onInsert?: (item: T) => void
  onUpdate?: (item: T) => void
  onDelete?: (id: string) => void
}

export function useSupabaseRealtime<T extends Record<string, any> = Record<string, any>>(
  table: string,
  options: UseSupabaseRealtimeOptions<T> = {}
) {
  const [channelStatus, setChannelStatus] = useState<'subscribed' | 'closed' | 'error'>('closed')
  const supabase = createClient()

  useEffect(() => {
    // Create channel with unique name
    const channelName = `${table}-changes-${Date.now()}`
    const channel: RealtimeChannel = supabase.channel(channelName)

    // Subscribe to postgres changes
    channel
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: options.filter,
        } as any,
        (payload: any) => {
          if (payload.eventType === 'INSERT' && options.onInsert) {
            options.onInsert(payload.new as T)
          } else if (payload.eventType === 'UPDATE' && options.onUpdate) {
            options.onUpdate(payload.new as T)
          } else if (payload.eventType === 'DELETE' && options.onDelete) {
            const oldRecord = payload.old as any
            options.onDelete(oldRecord.id)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setChannelStatus('subscribed')
        } else if (status === 'CLOSED') {
          setChannelStatus('closed')
        } else if (status === 'CHANNEL_ERROR') {
          setChannelStatus('error')
        }
      })

    // Cleanup: remove channel on unmount
    return () => {
      supabase.removeChannel(channel)
      setChannelStatus('closed')
    }
  }, [table, options.filter]) // Re-subscribe if table or filter changes

  return channelStatus
}
