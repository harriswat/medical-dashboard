'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  IDENTITIES,
  IDENTITY_STORAGE_KEY,
  isValidIdentityKey,
  type IdentityKey,
} from '@/lib/auth/identities'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, User } from 'lucide-react'

type Status = 'idle' | 'signing-in' | 'auto-signing-in' | 'error'

export default function LoginPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityKey | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = useCallback(
    async (identityKey: IdentityKey) => {
      const identity = IDENTITIES[identityKey]
      setSelectedIdentity(identityKey)

      const { error } = await supabase.auth.signInWithPassword({
        email: identity.email,
        password: identity.password,
      })

      if (error) {
        setStatus('error')
        setErrorMessage(error.message)
        setSelectedIdentity(null)
        return
      }

      localStorage.setItem(IDENTITY_STORAGE_KEY, identityKey)
      router.push('/today')
      router.refresh()
    },
    [supabase, router],
  )

  // Auto-sign-in if identity is saved
  useEffect(() => {
    const saved = localStorage.getItem(IDENTITY_STORAGE_KEY)
    if (saved && isValidIdentityKey(saved)) {
      setStatus('auto-signing-in')
      setSelectedIdentity(saved)
      handleSignIn(saved)
    }
  }, [handleSignIn])

  const isLoading = status === 'signing-in' || status === 'auto-signing-in'

  if (status === 'auto-signing-in') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
          <p className="text-green-700">
            Welcome back, {selectedIdentity && IDENTITIES[selectedIdentity].displayName}...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <Card className="w-full max-w-sm shadow-lg border-green-100">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-green-900">Welcome</CardTitle>
          <CardDescription className="text-base text-green-700">
            Who&apos;s checking in?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {status === 'error' && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
              <p className="text-sm text-red-700">
                {errorMessage || 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setStatus('signing-in')
              handleSignIn('harris')
            }}
            disabled={isLoading}
            className="w-full text-left disabled:opacity-50"
          >
            <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all">
              <CardContent className="flex items-center gap-4 py-5 px-5">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-green-900">Harris</p>
                  <p className="text-sm text-green-600">Patient</p>
                </div>
                {status === 'signing-in' && selectedIdentity === 'harris' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />
                )}
              </CardContent>
            </Card>
          </button>

          <button
            onClick={() => {
              setStatus('signing-in')
              handleSignIn('kent')
            }}
            disabled={isLoading}
            className="w-full text-left disabled:opacity-50"
          >
            <Card className="border-2 border-amber-200 hover:border-amber-400 hover:shadow-md transition-all">
              <CardContent className="flex items-center gap-4 py-5 px-5">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-amber-900">Kent</p>
                  <p className="text-sm text-amber-600">Caregiver</p>
                </div>
                {status === 'signing-in' && selectedIdentity === 'kent' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600" />
                )}
              </CardContent>
            </Card>
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
