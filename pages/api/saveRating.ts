import { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../lib/firebaseAdmin';
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const uid=(await admin.auth().verifyIdToken(req.headers.authorization.split(' ')[1])).uid;
  const { sessionId, patientId, score, comment } = req.body;
  await admin.firestore().collection('ratings').add({ sessionId, patientId, doctorId:uid, score, comment, timestamp:admin.firestore.FieldValue.serverTimestamp() });
  res.status(200).json({ success:true });
}