// pages/register-clinic-code.tsx
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';

export default function RegisterClinicCodePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) return router.replace('/login');
      setUser(u);
    });
    return unsub;
  }, [router]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!code.trim()) { setError('Fyll inn klinikkode.'); return; }
    setError(''); setLoading(true);
    try {
      const token = await auth.currentUser!.getIdToken();
      const res = await fetch('/api/registerClinicCode', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ clinicCode: code.trim() })
      });
      if (!res.ok) throw new Error('Ugyldig kode');
      router.replace('/dashboard');
    } catch (err:any) {
      setError(err.message || 'Feil ved registrering');
      setLoading(false);
    }
  };

  if (!user) return null;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">Registrer klinikkode</h1>
        <input
          type="text"
          placeholder="Klinikkode"
          value={code}
          onChange={e=>setCode(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring"
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Lagrer…' : 'Registrer kode'}
        </button>
      </form>
    </div>
  );
}
