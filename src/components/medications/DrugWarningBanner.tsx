'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export function DrugWarningBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900">Drug Interaction Warning</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Hydrocodone + Zofran together can increase risk of serotonin syndrome.
          Watch for: confusion, rapid heart rate, fever, muscle stiffness.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-600 flex-shrink-0"
        aria-label="Dismiss warning"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
