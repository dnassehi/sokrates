import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const buf = [];
  for await (const chunk of req) buf.push(chunk);
  const { messages, isEdit } = JSON.parse(Buffer.concat(buf).toString());
  const prompt = isEdit ? { role: 'system', content: '...edit prompt...' }
                         : { role: 'system', content: '...initial prompt...' };
  const stream = await openai.chat.completions.create({ assistant_id: process.env.ASSISTANT_ID, messages: [prompt, ...messages], response_format:{type:'json',schema:{}}, stream:true }, { responseType:'stream' });
  res.writeHead(200, { 'Content-Type':'text/event-stream','Cache-Control':'no-cache' });
  for await (const part of stream) {
    const c = part.choices[0].delta.content; if (!c) continue;
    res.write(`data: ${JSON.stringify(c)}\n\n`);
  }
  res.write('event: done\ndata: [DONE]\n\n');
  res.end();
}