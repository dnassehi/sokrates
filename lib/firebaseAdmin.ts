// Server-side Firebase Admin SDK initialisering
import admin from 'firebase-admin'

if (!admin.apps.length) {
  // Hent tjenestekonto-nøkkel fra miljøvariabel (base64-encoded JSON)
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!, 'base64').toString()
  )
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

// Admin-klienter for autentisering og database
export const authAdmin = admin.auth()
export const firestoreAdmin = admin.firestore()
// Eksporer FieldValue og Timestamp for gjenbruk
export const FieldValue = admin.firestore.FieldValue
export const Timestamp = admin.firestore.Timestamp
