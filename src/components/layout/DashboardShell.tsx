'use client'

import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface DashboardShellProps {
  displayName: string
  children: React.ReactNode
}

export function DashboardShell({ displayName, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header displayName={displayName} />

      {/* Content area with padding for fixed header and bottom nav */}
      <main className="pt-14 pb-20 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
