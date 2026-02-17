'use client'

import { useState, useTransition } from 'react'
import { Phone, Plus, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Contact {
  id: string
  name: string
  specialty: string | null
  phone: string
  is_emergency: boolean
  notes: string | null
}

interface DoctorContactsProps {
  contacts: Contact[]
  onAdd: (name: string, phone: string, specialty: string, isEmergency: boolean) => Promise<void>
}

export function DoctorContacts({ contacts, onAdd }: DoctorContactsProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [isEmergency, setIsEmergency] = useState(false)
  const [isPending, startTransition] = useTransition()

  const emergencyContacts = contacts.filter((c) => c.is_emergency)
  const routineContacts = contacts.filter((c) => !c.is_emergency)

  function handleAdd() {
    if (!name.trim() || !phone.trim()) return
    startTransition(async () => {
      await onAdd(name.trim(), phone.trim(), specialty.trim(), isEmergency)
      setName('')
      setPhone('')
      setSpecialty('')
      setIsEmergency(false)
      setShowForm(false)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Doctor Contacts
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="h-8 text-primary"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3 space-y-2">
            <Input placeholder="Doctor name" value={name} onChange={(e) => setName(e.target.value)} style={{ fontSize: '16px' }} />
            <Input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" style={{ fontSize: '16px' }} />
            <Input placeholder="Specialty (optional)" value={specialty} onChange={(e) => setSpecialty(e.target.value)} style={{ fontSize: '16px' }} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} className="rounded" />
              Emergency contact
            </label>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={isPending || !name.trim() || !phone.trim()} className="flex-1">
                {isPending ? 'Adding...' : 'Add Contact'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground px-1">No contacts added yet</p>
      ) : (
        <div className="space-y-2">
          {emergencyContacts.map((contact) => (
            <a key={contact.id} href={`tel:${contact.phone}`} className="block">
              <Card className="border-destructive/20 bg-destructive/5 active:scale-[0.98] transition-transform">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-destructive">{contact.phone} — Emergency</p>
                  </div>
                  <Phone className="h-5 w-5 text-destructive" />
                </CardContent>
              </Card>
            </a>
          ))}
          {routineContacts.map((contact) => (
            <a key={contact.id} href={`tel:${contact.phone}`} className="block">
              <Card className="border-border active:scale-[0.98] transition-transform">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {contact.phone}
                      {contact.specialty && ` — ${contact.specialty}`}
                    </p>
                  </div>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
