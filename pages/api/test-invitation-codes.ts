import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const invitationCodes = process.env.NEXT_PUBLIC_INVITATION_CODES || 'NOT_SET'
  
  res.status(200).json({
    invitationCodes: invitationCodes,
    codesArray: invitationCodes.split(','),
    isBreadcrumb17Valid: invitationCodes.includes('breadcrumb17')
  })
} 