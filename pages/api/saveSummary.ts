import type { NextApiRequest, NextApiResponse } from 'next'
import { authAdmin, firestoreAdmin, FieldValue } from '../../lib/firebaseAdmin'

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

  const { sessionId, summary } = req.body
  if (typeof sessionId !== 'string' || typeof summary !== 'object') {
    return res.status(400).json({ error: 'Ugyldig request body' })
  }

  // Hent sessions-dokumentet
  const sessionRef = firestoreAdmin.collection('sessions').doc(sessionId)
  const snap = await sessionRef.get()
  if (!snap.exists) {
    return res.status(404).json({ error: 'Session not found' })
  }
  const data = snap.data()!
  if (data.patientId !== uid) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  // Oppdater session med oppsummering og sett status til "awaiting_approval"
  await sessionRef.update({
    summary: {
      ...summary,
      approvedBy: uid,
      approvedAt: FieldValue.serverTimestamp()
    },
    status: 'awaiting_approval'
  })

  return res.status(200).json({ success: true })
}
