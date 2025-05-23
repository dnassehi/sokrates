// components/ChatWindow.tsx
import { useState, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  onComplete: () => void;
}

export default function ChatWindow({ onComplete }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const sendRef = useRef<HTMLButtonElement>(null);

  const handleSend = async () => {
    if (!input.trim() || streaming) return;

    // Legg til bruker‐melding i historikken
    const userMsg: Message = { role: 'user', content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');

    // Hvis pasienten klikker \"GODKJENN\" avsluttes chat‐flyten
    if (input.trim().toUpperCase() === 'GODKJENN') {
      onComplete();
      return;
    }

    setStreaming(true);

    // Kall API‐ruten med historikk og edit‐flag
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, isEdit })
    });

    if (!res.body) {
      setStreaming(false);
      return;
    }

    // Opprett en plassholder for assistent‐svar
    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = '';
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value);
        // Expect SSE‐format: \"data: {...}\\n\\n\"
        for (const part of chunk.split('\n\n')) {
          if (part.startsWith('data: ')) {
            const data = part.replace(/^data: /, '').trim();
            if (data === '[DONE]') {
              done = true;
              break;
            }
            assistantContent += data;
            // Oppdater siste assistent‐melding
            setMessages((msgs) => {
              const updated = [...msgs];
              updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
              return updated;
            });
          }
        }
      }
    }

    setStreaming(false);

    // Etter første komplette oppsummering, slå på edit‐modus
    if (!isEdit) setIsEdit(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Meldingsområde */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block p-2 rounded ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {m.content || (streaming && m.role === 'assistant' ? '…' : '')}
            </div>
          </div>
        ))}
      </div>

      {/* Inndata og send-knapp */}
      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={streaming}
        />
        <button
          ref={sendRef}
          onClick={handleSend}
          disabled={streaming}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {streaming ? '…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
