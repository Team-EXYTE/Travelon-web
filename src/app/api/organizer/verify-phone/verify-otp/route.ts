import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin, getAdminAuth, getAdminDB } from '@/db/firebaseAdmin';

// Reference to the OTP store from the send-otp route
// In production, you'd use a proper database or cache
declare global {
  var otpStore: Record<string, { otp: string, expires: number }>;
}

// Initialize if it doesn't exist
if (!global.otpStore) {
  global.otpStore = {  };
}

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
    const { phoneNumber, otp } = await request.json();
    
    if (!phoneNumber || !otp) {
      return NextResponse.json({ error: "Phone number and OTP are required" }, { status: 400 });
    }
    
    // Verify OTP
    const storedOtpData = global.otpStore[phoneNumber];
    
    if (!storedOtpData) {
      return NextResponse.json({ error: "OTP expired or not requested" }, { status: 400 });
    }
    
    if (Date.now() > storedOtpData.expires) {
      // Clean up expired OTP
      delete global.otpStore[phoneNumber];
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }
    
    if (storedOtpData.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }
    
    // OTP is valid, update user record
    const uid = decodedClaims.uid;
    const adminDB = getAdminDB();
    
    await adminDB.collection('users').doc(uid).update({
      phoneNumberVerified: true,
      updatedAt: new Date().toISOString()
    });
    
    // Clean up used OTP
    delete global.otpStore[phoneNumber];
    
    // Set custom claims to include phoneNumberVerified
    await adminAuth.setCustomUserClaims(uid, { 
      ...decodedClaims.role && { role: decodedClaims.role },
      phoneNumberVerified: true 
    });
    
    return NextResponse.json({ 
      success: true,
      message: "Phone number verified successfully"
    });
    
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP" }, 
      { status: 500 }
    );
  }
}