// Server-side Admin-SDK for Firebase
import admin from 'firebase-admin';

if (!admin.apps.length) {
  // Fire bas64-kodet JSON fra env-variabel
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!, 'base64').toString()
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const authAdmin = admin.auth();
export const firestoreAdmin = admin.firestore();
