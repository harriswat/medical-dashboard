'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IDENTITY_STORAGE_KEY } from '@/lib/auth/identities'
import { useRouter } from 'next/navigation'
import { SyncStatus } from './SyncStatus'
import { ArrowLeftRight } from 'lucide-react'

interface HeaderProps {
  displayName: string
}

export function Header({ displayName }: HeaderProps) {
  const [isSwitching, setIsSwitching] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSwitch = async () => {
    setIsSwitching(true)
    await supabase.auth.signOut()
    localStorage.removeItem(IDENTITY_STORAGE_KEY)
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border rounded-b-xl shadow-sm pt-safe z-10">
      <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground">{displayName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatus />
          <button
            onClick={handleSwitch}
            disabled={isSwitching}
            className="text-muted-foreground hover:text-foreground p-2 rounded-md transition-colors disabled:opacity-50"
            aria-label="Switch user"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
