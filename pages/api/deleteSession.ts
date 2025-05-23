import { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../lib/firebaseAdmin';
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  if(req.headers['x-admin-key']!==process.env.ADMIN_API_KEY) return res.status(401).end();
  const { clinicCode, timestamp }=req.body;
  const ts=admin.firestore.Timestamp.fromDate(new Date(timestamp));
  const snap=await admin.firestore().collection('sessions').where('clinicCode','==',clinicCode).where('startedAt','==',ts).limit(1).get();
  if(snap.empty) return res.status(404).json({ error:'Ikke funnet' });
  await snap.docs[0].ref.delete();
  res.status(200).json({ success:true });
}