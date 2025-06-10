import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './firebase'

/**
 * Hook som omdirigerer til /login dersom bruker ikke er autentisert.
 * Returverdien er gjeldende Firebase-bruker (eller null før innlasting).
 */
export default function useRequireAuth(): User | null {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        router.replace('/login')
      } else {
        setCurrentUser(user)
      }
    })
    return unsubscribe
  }, [router])

  return currentUser
}
