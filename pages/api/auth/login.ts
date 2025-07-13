import { NextApiRequest, NextApiResponse } from 'next'
import { sign } from 'jsonwebtoken'
import { serialize } from 'cookie'

const APP_PASSWORD = process.env.APP_PASSWORD || 'your-secure-password-here'
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body

  if (!password) {
    return res.status(400).json({ error: 'Password is required' })
  }

  if (password === APP_PASSWORD) {
    // Create JWT token
    const token = sign(
      { authenticated: true, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Set HTTP-only cookie
    const cookie = serialize('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    res.setHeader('Set-Cookie', cookie)
    res.status(200).json({ success: true })
  } else {
    res.status(401).json({ error: 'Invalid password' })
  }
} 