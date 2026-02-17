'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ALLOWED_EMAILS = ['harriswatk@gmail.com', 'kentwatkins1@me.com']

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'not-allowed'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    // Validate allowed emails
    if (!ALLOWED_EMAILS.includes(email)) {
      setStatus('not-allowed')
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `https://medical-dashboard-aqb4l.ondigitalocean.app/auth/callback`,
        },
      })

      if (error) {
        setStatus('error')
        setErrorMessage(error.message)
      } else {
        setStatus('success')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage('An unexpected error occurred')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-green-100">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-green-900">Welcome</CardTitle>
          <CardDescription className="text-lg text-green-700">
            Sign in to access your recovery dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
              <div className="mb-2 text-2xl">📧</div>
              <h3 className="mb-2 text-lg font-semibold text-green-900">
                Check your email!
              </h3>
              <p className="text-sm text-green-700">
                We've sent a magic link to <strong>{email}</strong>.
                Click the link to sign in.
              </p>
            </div>
          ) : status === 'not-allowed' ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-6 text-center">
                <div className="mb-2 text-2xl">🔒</div>
                <h3 className="mb-2 text-lg font-semibold text-amber-900">
                  Access Restricted
                </h3>
                <p className="text-sm text-amber-700">
                  This app is for Harris and Kent only.
                </p>
              </div>
              <Button
                onClick={() => {
                  setStatus('idle')
                  setEmail('')
                }}
                variant="outline"
                className="w-full"
              >
                Try again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-900">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>

              {status === 'error' && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-700">
                    {errorMessage || 'Failed to send magic link. Please try again.'}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
              </Button>

              <p className="text-center text-xs text-green-600">
                No password needed. We'll send you a secure link.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
