// pages/forgot-password.tsx
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<{ type: 'success'|'error'; text: string }|null>(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!email) {
      setMsg({ type: 'error', text: 'Fyll inn e-post.' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg({ type: 'success', text: 'Sjekk e-post for instruksjoner.' });
    } catch {
      setMsg({ type: 'error', text: 'Kunne ikke sende e-post.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleReset} className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">Glemt passord</h1>
        <input
          type="email"
          placeholder="Din e-post"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring"
        />
        {msg && <p className={`text-sm ${msg.type==='error'?'text-red-600':'text-green-600'} mb-4`}>{msg.text}</p>}
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Send tilbakestilling
        </button>
        <p className="text-center text-sm mt-6">
          <p className="text-center text-sm mt-6">
            <Link href="/login" className="text-blue-600 hover:underline">
              Tilbake til innlogging
            </Link>
</p>
        </p>
      </form>
    </div>
  );
}
