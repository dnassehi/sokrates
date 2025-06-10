// pages/api/startSession.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { authAdmin, firestoreAdmin } from '../../lib/firebaseAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  // Verifiser Firebase ID-token fra Authorization-header
  const authHeader = req.headers.authorization || ''
  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Mangler autentiseringstoken' })
  }
  let uid: string
  try {
    const decoded = await authAdmin.verifyIdToken(token)
    uid = decoded.uid
    // Sjekk om brukeren er anonym (pasient). Hvis ikke, nekt (bare pasienter skal opprette sesjon)
    if (decoded.firebase?.sign_in_provider !== 'anonymous') {
      return res.status(403).json({ error: 'Kun pasient kan starte sesjon' })
    }
  } catch {
    return res.status(401).json({ error: 'Ugyldig token' })
  }

  const { clinicCode } = req.body
  if (typeof clinicCode !== 'string' || !clinicCode.trim()) {
    return res.status(400).json({ error: 'Ugyldig eller manglende klinikkode' })
  }

  // Sjekk at klinikkoden finnes
  const code = clinicCode.trim()
  const clinicSnap = await firestoreAdmin.collection('clinics').doc(code).get()
  if (!clinicSnap.exists) {
    return res.status(404).json({ error: 'Klinikkode ikke funnet' })
  }

  // Finn lege med gitt klinikkode
  const doctorsSnap = await firestoreAdmin
    .collection('doctors')
    .where('clinicCode', '==', code)
    .limit(1)
    .get()
  if (doctorsSnap.empty) {
    return res.status(500).json({ error: 'Ingen lege registrert for klinikkoden' })
  }
  const doctorId = doctorsSnap.docs[0].id

  // Opprett ny sessions-dokument
  const sessionRef = await firestoreAdmin.collection('sessions').add({
    clinicCode: code,
    patientId: uid,
    doctorId: doctorId,
    status: 'in_progress',
    startedAt: firestoreAdmin.Timestamp.fromDate(new Date())
  })

  return res.status(200).json({ sessionId: sessionRef.id })
}