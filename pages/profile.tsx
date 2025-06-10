import { useState, useEffect } from 'react'
import { auth } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../lib/firebase'
import { onAuthStateChanged, updatePassword, signOut, sendPasswordResetEmail } from 'firebase/auth'
import { useRouter } from 'next/router'
import useRequireAuth from '../lib/useRequireAuth'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [clinicCode, setClinicCode] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [msg, setMsg] = useState<{type:'error'|'success'; text:string}|null>(null)

  useRequireAuth()  // Sikrer at bare innloggede brukere kan se profilen

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) return // (useRequireAuth vil allerede ha redirectet til /login)
      setUser(u)
      const snap = await getDoc(doc(firestore, 'doctors', u.uid))
      const data = snap.data() || {}
      setName(data.name || '')
      setClinicCode(data.clinicCode || '')
    })
    return unsub
  }, [router])

  const handleChangePassword = async e => {
    e.preventDefault()
    if (newPwd.length < 6) {
      return setMsg({ type: 'error', text: 'Minst 6 tegn.' })
    }
    if (newPwd !== confirmPwd) {
      return setMsg({ type: 'error', text: 'Passordene må matche.' })
    }
    try {
      await updatePassword(user, newPwd)
      setMsg({ type: 'success', text: 'Passord endret! Du logges ut.' })
      await signOut(auth)
      router.replace('/login')
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        await sendPasswordResetEmail(auth, user.email!)
        setMsg({ type: 'success', text: 'Re-autentisering kreves. Sjekk e-post.' })
      } else {
        setMsg({ type: 'error', text: 'Kunne ikke endre passord.' })
      }
    }
  }

  if (!user) return null  // Vent til brukerinfo er lastet

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">Min profil</h1>
        <p><strong>Navn:</strong> {name}</p>
        <p><strong>E-post:</strong> {user.email}</p>
        <p><strong>Klinikkode:</strong> {clinicCode}</p>

        <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">Bytt passord</h2>
          <input
            type="password"
            placeholder="Nytt passord"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          />
          <input
            type="password"
            placeholder="Bekreft passord"
            value={confirmPwd}
            onChange={e => setConfirmPwd(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          />
          {msg && (
            <p className={`text-sm ${msg.type==='error' ? 'text-red-600' : 'text-green-600'}`}>
              {msg.text}
            </p>
          )}
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Endre passord
          </button>
        </form>
      </div>
    </div>
  )
}
