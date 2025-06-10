import type { NextApiRequest, NextApiResponse } from 'next'
import { authAdmin, firestoreAdmin } from '../../lib/firebaseAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Mangler autentiseringstoken' })
  }
  let uid: string
  try {
    uid = (await authAdmin.verifyIdToken(token)).uid
  } catch {
    return res.status(401).json({ error: 'Ugyldig token' })
  }

  const { sessionId } = req.body
  if (typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Ugyldig request body' })
  }

  // Hent sessions-dokumentet
  const sessionSnap = await firestoreAdmin.collection('sessions').doc(sessionId).get()
  if (!sessionSnap.exists) {
    return res.status(404).json({ error: 'Session not found' })
  }
  const data = sessionSnap.data()!
  if (data.doctorId !== uid) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  // Returner oppsummering og relevant info
  return res.status(200).json({
    session: {
      patientId: data.patientId,
      summary: data.summary || null,
      status: data.status
    }
  })
}
