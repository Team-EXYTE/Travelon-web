import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin, getAdminAuth } from '@/db/firebaseAdmin';

// Store OTPs in memory (for development only - in production, use a proper storage solution)
const otpStore: Record<string, { otp: string, expires: number }> = {};

export async function POST(request: Request) {
  try {
    await initAdmin();
    const sessionCookie = (await cookies()).get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Verify the session cookie
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Get request body
    const { phoneNumber } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5-minute expiration
    otpStore[phoneNumber] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };
    
    // For development, log the OTP (in production, you'd send via SMS)
    console.log(`OTP for ${phoneNumber}: ${otp}`);
    
    return NextResponse.json({ 
      message: "OTP sent successfully" 
    });
    
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" }, 
      { status: 500 }
    );
  }
}