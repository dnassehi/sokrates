import type { NextApiRequest, NextApiResponse } from 'next'
import { authAdmin, firestoreAdmin } from '../../lib/firebaseAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
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

  // Sjekk at brukeren er en registrert lege
  const doctorSnap = await firestoreAdmin.collection('doctors').doc(uid).get()
  if (!doctorSnap.exists) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const clinicCode = doctorSnap.data()!.clinicCode

  // Hent alle sessions for denne lege (klinikkode)
  const sessionsSnap = await firestoreAdmin
    .collection('sessions')
    .where('clinicCode', '==', clinicCode)
    .orderBy('startedAt', 'desc')
    .get()
  const sessions = sessionsSnap.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      patientId: data.patientId,
      status: data.status,
      startedAt: data.startedAt.toDate().toISOString()
    }
  })

  return res.status(200).json({ sessions })
}
