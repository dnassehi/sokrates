// Wrapper for server-side token-verifisering
import { authAdmin } from './firebaseAdmin';

export async function verifyIdToken(token: string): Promise<string> {
  // Verifiser Firebase ID-token og returner uid
  const decoded = await authAdmin.verifyIdToken(token);
  return decoded.uid;
}
