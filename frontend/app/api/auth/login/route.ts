import {NextResponse} from 'next/server'
import {createSession, validateCredentials} from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {username, password} = body

    if (!username || !password) {
      return NextResponse.json({error: 'Username and password are required'}, {status: 400})
    }

    // Validate credentials
    const isValid = validateCredentials(username, password)

    if (!isValid) {
      return NextResponse.json({error: 'Invalid credentials'}, {status: 401})
    }

    // Create session
    await createSession()

    return NextResponse.json({success: true})
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
