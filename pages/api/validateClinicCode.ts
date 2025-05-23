import { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  const { clinicCode } = req.body;
  if (typeof clinicCode !== 'string' || !clinicCode.trim())
    return res.status(400).json({ error: 'Ugyldig klinikkode' });
  const snap = await admin.firestore().collection('clinics').doc(clinicCode.trim()).get();
  if (!snap.exists) return res.status(404).json({ error: 'Kode ikke funnet' });
  return res.status(200).json({ valid: true });
}