import { NextResponse } from 'next/server';
import { initAdmin, getAdminAuth, getAdminDB } from '@/db/firebaseAdmin';

export async function POST(request: Request) {
  try {
    // Initialize Firebase Admin
    await initAdmin();
    
    // Parse the request body
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }
    
    // Verify the ID token
    const adminAuth = getAdminAuth();
    const verifiedToken = await adminAuth.verifyIdToken(idToken);
    
    // Get user info and check if they exist in our collection
    const uid = verifiedToken.uid;
    const adminDB = getAdminDB();
    const userDoc = await adminDB.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get user role from Firestore
    const userData = userDoc.data();
    const role = userData?.role || 'user';
    const phoneNumberVerified = userData?.phoneNumberVerified || false;
    
    // Set custom claims for the user
    await adminAuth.setCustomUserClaims(uid, { role , phoneNumberVerified });
    
    // Don't create session cookie here - just return success with flag
    return NextResponse.json({
      success: true,
      refreshToken: true, // Signal client to refresh token
      user: {
        uid,
        role,
        name: `${userData?.firstName || ''} ${userData?.lastName || ''}`,
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during login" },
      { status: 500 }
    );
  }
}