import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin, getAdminAuth } from '@/db/firebaseAdmin';

export async function POST(request: Request) {
  try {
    await initAdmin();
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }
    
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Create session cookie with the refreshed token (which should now include claims)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    (await cookies()).set({
      name: 'session',
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn / 1000,
      path: '/'
    });
    
    // For debugging: Check if role is in the decoded token
    console.log("Token claims:", decodedToken);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Session refresh error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}