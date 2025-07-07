import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import InitModal from '../components/InitModal'
import ChatWindow from '../components/chat/ChatWindow'
import SubmissionComplete from '../components/chat/SubmissionComplete'
import { auth } from '../lib/firebase'

export default function ChatPage() {
  const router = useRouter()
  const { clinicCode } = router.query as { clinicCode?: string }
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    // Send bruker tilbake til forsiden hvis klinikkode mangler
    if (!clinicCode) router.replace('/')
  }, [clinicCode, router])

  const handleAccept = () => setStarted(true)
  const handleComplete = () => setCompleted(true)
  const handleNew = async () => {
    await auth.signOut()
    router.replace('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!started && <InitModal onAccept={handleAccept} />}
      {started && !completed && <ChatWindow onComplete={handleComplete} />}
      {completed && <SubmissionComplete onNewRequest={handleNew} />}
    </div>
  )
}
