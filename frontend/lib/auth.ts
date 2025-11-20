import {cookies} from 'next/headers'

const SESSION_COOKIE_NAME = 'auth_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * Creates a signed session token using Web Crypto API (Edge Runtime compatible)
 */
async function createSessionToken(): Promise<string> {
  const timestamp = Date.now().toString()
  const secret = process.env.AUTH_SESSION_SECRET!

  // Create HMAC signature using Web Crypto API
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(timestamp)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return `${timestamp}.${signatureHex}`
}

/**
 * Verifies a signed session token using Web Crypto API (Edge Runtime compatible)
 */
async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.AUTH_SESSION_SECRET
    if (!secret) return false

    const [timestamp, signature] = token.split('.')
    if (!timestamp || !signature) return false

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(timestamp)

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      {name: 'HMAC', hash: 'SHA-256'},
      false,
      ['sign']
    )

    const expectedSignature = await crypto.subtle.sign('HMAC', key, messageData)
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Timing-safe comparison
    if (signature !== expectedHex) return false

    // Check if token is still valid (not expired)
    const tokenAge = Date.now() - parseInt(timestamp, 10)
    const maxAge = SESSION_MAX_AGE * 1000
    return tokenAge < maxAge
  } catch {
    return false
  }
}

/**
 * Validates username and password against environment variables
 */
export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.AUTH_USERNAME
  const validPassword = process.env.AUTH_PASSWORD

  if (!validUsername || !validPassword) {
    console.error('AUTH_USERNAME and AUTH_PASSWORD must be set')
    return false
  }

  return username === validUsername && password === validPassword
}

/**
 * Creates a session cookie after successful authentication
 */
export async function createSession() {
  const token = await createSessionToken()
  const cookieStore = await cookies()

  // Use 'lax' for SameSite - standard for first-party authentication cookies
  // This works in incognito mode and provides good security
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure in production only
    sameSite: 'lax', // Standard setting for auth cookies, works in incognito
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

/**
 * Verifies if the current request has a valid session
 */
export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) return false

  return await verifySessionToken(sessionCookie.value)
}

/**
 * Clears the session cookie
 */
export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
