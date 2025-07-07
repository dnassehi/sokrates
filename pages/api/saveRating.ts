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

  const { sessionId, patientId, score, comment } = req.body
  if (!sessionId || !patientId || typeof score !== 'number') {
    return res.status(400).json({ error: 'Ugyldige data' })
  }

  // Lagre en ny vurdering i `ratings`-samlingen
  await firestoreAdmin.collection('ratings').add({
    sessionId,
    patientId,
    doctorId: uid,
    score,
    comment: comment || '',
    timestamp: FieldValue.serverTimestamp()
  })

  return res.status(200).json({ success: true })
}
