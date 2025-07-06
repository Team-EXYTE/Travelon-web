import "server-only";

import admin from "firebase-admin";

interface FirebaseAdminAppParams {
  projectId: string;
  clientEmail: string;
  storageBucket: string;
  privateKey: string;
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

// Track initialization state
let firebaseAdminInitialized = false;

export function createFirebaseAdminApp(params: FirebaseAdminAppParams) {
  const privateKey = formatPrivateKey(params.privateKey);

  // Return existing app if already initialized
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const cert = admin.credential.cert({
    projectId: params.projectId,
    clientEmail: params.clientEmail,
    privateKey,
  });

  // Initialize and return the app
  return admin.initializeApp({
    credential: cert,
    projectId: params.projectId,
    storageBucket: params.storageBucket,
  });
}

export async function initAdmin() {
  // Return if already initialized
  if (firebaseAdminInitialized) {
    return;
  }

  try {
    createFirebaseAdminApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      privateKey: process.env.FIREBASE_PRIVATE_KEY || "",
    });
    firebaseAdminInitialized = true;
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    throw error;
  }
}

// Export functions that ensure initialization
export const getAdminAuth = () => {
  if (!firebaseAdminInitialized && admin.apps.length === 0) {
    throw new Error("Firebase Admin not initialized. Call initAdmin() first.");
  }
  return admin.auth();
};

export const getAdminDB = () => {
  if (!firebaseAdminInitialized && admin.apps.length === 0) {
    throw new Error("Firebase Admin not initialized. Call initAdmin() first.");
  }
  return admin.firestore();
};

export const getAdminStorage = () => {
  if (!firebaseAdminInitialized && admin.apps.length === 0) {
    throw new Error("Firebase Admin not initialized. Call initAdmin() first.");
  }
  return admin.storage().bucket();
};