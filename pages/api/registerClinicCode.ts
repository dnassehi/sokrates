import { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Mangler token' });
  let uid;
  try { uid = (await admin.auth().verifyIdToken(token)).uid; }
  catch { return res.status(401).json({ error: 'Ugyldig token' }); }
  const { clinicCode } = req.body;
  const clinic = await admin.firestore().collection('clinics').doc(clinicCode).get();
  if (!clinic.exists) return res.status(404).json({ error: 'Kode finnes ikke' });
  await admin.firestore().collection('doctors').doc(uid).set({ clinicCode }, { merge: true });
  return res.status(200).json({ success: true });
}