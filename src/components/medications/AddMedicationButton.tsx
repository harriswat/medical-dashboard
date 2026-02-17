'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddMedicationModal } from './AddMedicationModal'

export function AddMedicationButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-3 active:scale-[0.98] transition-all"
      >
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Plus className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">Add Medication</p>
          <p className="text-xs text-muted-foreground">Set up a new medication</p>
        </div>
      </button>
      <AddMedicationModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
