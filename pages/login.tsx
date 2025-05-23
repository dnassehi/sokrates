// pages/login.tsx
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        // Hent legeprofil – redirect avhengig av clinicCode
        const snap = await import('firebase/firestore')
          .then(({ doc, getDoc }) =>
            getDoc(doc(import('../lib/firebase').firestore, 'doctors', user.uid))
          );
        const clinicCode = snap.data()?.clinicCode;
        router.replace(clinicCode ? '/dashboard' : '/register-clinic-code');
      }
    });
    return unsub;
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pwd);
    } catch (err: any) {
      setError(err.code === 'auth/user-not-found'
        ? 'Bruker ikke funnet.'
        : err.code === 'auth/wrong-password'
        ? 'Feil passord.'
        : 'Kunne ikke logge inn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">Lege-innlogging</h1>
        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring"
        />
        <input
          type="password"
          placeholder="Passord"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring"
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {loading ? 'Logger inn…' : 'Logg inn'}
        </button>
        <div className="flex justify-between text-sm">
          <Link href="/forgot-password"><a className="text-blue-600 hover:underline">Glemt passord?</a></Link>
          <a className="text-gray-500">Kontakt admin</a>
        </div>
      </form>
    </div>
  );
}
