import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!, 'base64').toString()
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const authAdmin = admin.auth();
export const firestoreAdmin = admin.firestore();