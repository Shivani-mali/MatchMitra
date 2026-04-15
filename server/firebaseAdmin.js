import admin from 'firebase-admin';

const serviceAccountFromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : null;

if (!admin.apps.length) {
  if (serviceAccountFromEnv) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountFromEnv),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    admin.initializeApp();
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;
