'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, History } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    {
      name: 'Today',
      href: '/today',
      icon: Calendar,
      isActive: pathname === '/today',
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
      isActive: pathname === '/history',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-xl shadow-lg pb-safe">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-all',
                tab.isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
