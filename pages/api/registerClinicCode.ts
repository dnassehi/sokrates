import type { NextApiRequest, NextApiResponse } from 'next';
import { authAdmin, firestoreAdmin } from '../../lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Mangler autentiseringstoken' });
  }

  let uid: string;
  try {
    const decoded = await authAdmin.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: 'Ugyldig token' });
  }

  const { clinicCode } = req.body;
  if (typeof clinicCode !== 'string' || !clinicCode.trim()) {
    return res.status(400).json({ error: 'Ugyldig klinikkode' });
  }

  const clinicSnap = await firestoreAdmin.collection('clinics').doc(clinicCode.trim()).get();
  if (!clinicSnap.exists) {
    return res.status(404).json({ error: 'Klinikkode finnes ikke' });
  }

  await firestoreAdmin
    .collection('doctors')
    .doc(uid)
    .set({ clinicCode: clinicCode.trim() }, { merge: true });

  return res.status(200).json({ success: true });
}
