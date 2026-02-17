import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      // Redirect to login with error
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth`)
    }

    // Successful auth - redirect to dashboard
    return NextResponse.redirect(`${requestUrl.origin}/today`)
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
