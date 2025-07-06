import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin, getAdminAuth } from '@/db/firebaseAdmin';

export async function GET() {
  try {
    await initAdmin();
    const sessionCookie = (await cookies()).get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Verify the session cookie
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Return user details with limited information for security
    return NextResponse.json({ 
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: decodedClaims.role,
        phoneNumberVerified: decodedClaims.phoneNumberVerified || false
      }
    });
    
  } catch (error: any) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" }, 
      { status: 401 }
    );
  }
}