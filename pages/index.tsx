// pages/index.tsx
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!code.trim()) {
      setError('Vennligst skriv inn legens kode.');
      return;
    }
    const res = await fetch('/api/validateClinicCode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinicCode: code.trim() }),
    });
    if (!res.ok) {
      setError('Ugyldig kode.');
      return;
    }
    router.push(`/chat?clinicCode=${encodeURIComponent(code.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Sokrates.chat</h1>
      <p className="text-lg text-gray-700 mb-8">
        AI-basert anamnesetjeneste for allmennpraksis.
      </p>

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Pasient-innlogging</h2>
        <input
          type="text"
          placeholder="Legens kode"
          value={code}
          onChange={e => { setCode(e.target.value); setError(''); }}
          className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring"
        />
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Start anamnese
        </button>
      </div>

      <Link href="/login">
        <a className="text-blue-600 hover:underline mb-4">Logg inn som lege</a>
      </Link>
      <div className="text-sm text-gray-600">
        <Link href="/terms"><a className="hover:underline">Vilkår & Personvern</a></Link>
      </div>
      <p className="text-sm text-gray-600 mt-4">
        Teknisk support: <a href="mailto:damoun.nassehi@uib.no" className="text-blue-600 hover:underline">damoun.nassehi@uib.no</a>
      </p>
    </div>
  );
}
