import { NextRequest, NextResponse } from 'next/server';
import { initAdmin, getAdminAuth, getAdminDB } from '@/db/firebaseAdmin';
import { cookies } from 'next/headers';

// GET /api/admin/profile - Get admin profile data
export async function GET(request: NextRequest) {
  await initAdmin();
  const db = getAdminDB();
  
  try {
    // Authenticate admin via session cookie
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    
    // Get admin user data
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const userData = userDoc.data();
    // console.log('User Data:', userData);
    // Verify user is an admin
     if (userData?.role !== "Admin") {
      return NextResponse.json({ error: "Not authorized - Admin access required" }, { status: 403 });
    }

    // Transform user data to profile format
    const profile = {
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      role: 'Admin',
      phoneNumberVerified: userData.phoneNumberVerified || false,
      profileImage: userData.profileImage || '',
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
    };

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error getting admin profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to get admin profile' }, { status: 500 });
  }
}

// PATCH /api/admin/profile - Update admin profile data
export async function PATCH(request: NextRequest) {
  await initAdmin();
  const db = getAdminDB();
  
  try {
    // Authenticate admin via session cookie
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    
    // Get admin user
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const userData = userDoc.data();
    
    // Verify user is an admin
    if (userData?.role !== "Admin") {
      return NextResponse.json({ error: "Not authorized - Admin access required" }, { status: 403 });
    }

    // Get the updated profile data from request body
    const updatedData = await request.json();
    
    // Filter out any fields that shouldn't be updated
    const allowedFields = ['firstName', 'lastName', 'phoneNumber'];
    const filteredData: { [key: string]: any } = {};
    
    for (const field of allowedFields) {
      if (field in updatedData) {
        filteredData[field] = updatedData[field];
      }
    }

    // Add updatedAt timestamp
    filteredData.updatedAt = new Date().toISOString();

    // Update the user document in Firestore
    await db.collection("users").doc(uid).update(filteredData);

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to update admin profile' }, { status: 500 });
  }
}