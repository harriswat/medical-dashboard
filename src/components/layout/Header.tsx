'use client'

import { SyncStatus } from './SyncStatus'

interface HeaderProps {
  displayName: string
}

export function Header({ displayName }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border rounded-b-xl shadow-sm pt-safe z-10">
      <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground">{displayName}</h1>
        </div>
        <SyncStatus />
      </div>
    </header>
  )
}
