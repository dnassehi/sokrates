import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Les rå body for streaming
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  let body: { messages: any[]; isEdit: boolean };
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
  } catch {
    return res.status(400).end('Invalid JSON');
  }

  const { messages, isEdit } = body;
  const systemPrompt = isEdit
    ? { role: 'system', content: 'Oppdater det forrige JSON-objektet basert på brukerens redigering.' }
    : { role: 'system', content: 'Still sokratiske spørsmål for å fylle ut JSON-schemaet.' };

  const stream = await openai.chat.completions.create(
    {
      assistant_id: process.env.ASSISTANT_ID!,
      messages: [systemPrompt, ...messages],
      response_format: { type: 'json', schema: {/* ditt schema her */} },
      stream: true
    },
    { responseType: 'stream' }
  );

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive'
  });

  for await (const part of stream) {
    const content = part.choices[0]?.delta?.content;
    if (content) {
      res.write(`data: ${JSON.stringify(content)}\n\n`);
    }
  }

  res.write('event: done\ndata: [DONE]\n\n');
  res.end();
}
