'use client'

import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    // Handle browser online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connectivity check (every 30 seconds)
    const checkConnectivity = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

        const response = await fetch('/api/health', {
          method: 'HEAD',
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        setIsOnline(response.ok)
      } catch {
        // Fetch failed or timed out - we're offline
        setIsOnline(false)
      }
    }

    const intervalId = setInterval(checkConnectivity, 30000)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(intervalId)
    }
  }, [])

  return isOnline
}
