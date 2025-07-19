import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code } = req.body
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' })
    }

    const validCode = process.env.NEXT_PUBLIC_INVITATION_CODES || ''
    const isValid = code.trim() === validCode.trim()
    
    console.log('Server validation:', {
      receivedCode: code,
      validCode: validCode,
      isValid: isValid
    })
    
    res.status(200).json({
      valid: isValid,
      receivedCode: code,
      validCode: validCode
    })
  } catch (error) {
    console.error('Validation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 