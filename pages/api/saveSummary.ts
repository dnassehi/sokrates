import { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../lib/firebaseAdmin';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const token = req.headers.authorization?.split(' ')[1];
  const uid = (await admin.auth().verifyIdToken(token)).uid;
  const { sessionId, summary } = req.body;
  const ref = admin.firestore().collection('sessions').doc(sessionId);
  const snap = await ref.get(); if (!snap.exists) return res.status(404).json({ error:'Ikke funnet' });
  const data = snap.data(); if (data.patientId !== uid) return res.status(403).end();
  await ref.update({ summary: {...summary,approvedBy:uid,approvedAt:admin.firestore.FieldValue.serverTimestamp()}, status:'awaiting_approval' });
  res.status(200).json({ success:true });
}