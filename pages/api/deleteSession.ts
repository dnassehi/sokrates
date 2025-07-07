import type { NextApiRequest, NextApiResponse } from 'next';
import { firestoreAdmin, Timestamp } from '../../lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { clinicCode, timestamp } = req.body;
  if (typeof clinicCode !== 'string' || typeof timestamp !== 'string') {
    return res.status(400).json({ error: 'Ugyldige parametre' });
  }

  const ts = new Date(timestamp);
  const snap = await firestoreAdmin
    .collection('sessions')
    .where('clinicCode', '==', clinicCode.trim())
    .where('startedAt', '==', Timestamp.fromDate(ts))
    .limit(1)
    .get();

  if (snap.empty) {
    return res.status(404).json({ error: 'Session ikke funnet' });
  }

  await snap.docs[0].ref.delete();
  return res.status(200).json({ success: true });
}
