import { NextResponse } from 'next/server'

// Magic link callback no longer used — redirect to login
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
