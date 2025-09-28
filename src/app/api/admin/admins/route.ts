import { NextRequest, NextResponse } from 'next/server';
import { initAdmin, getAdminAuth, getAdminDB } from '@/db/firebaseAdmin';
import { cookies } from 'next/headers';

// GET /api/admin/admins - Get all admins except the current admin
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
    const currentAdminUid = decodedClaims.uid;
    
    // Get current admin data to verify they are an admin
    const currentAdminDoc = await db.collection("users").doc(currentAdminUid).get();
    
    if (!currentAdminDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const currentAdminData = currentAdminDoc.data();
    
    // Verify user is an admin
    if (currentAdminData?.role !== "Admin") {
      return NextResponse.json({ error: "Not authorized - Admin access required" }, { status: 403 });
    }

    // Get all users with role "Admin" except the current admin
    const adminsSnapshot = await db.collection("users")
      .where("role", "==", "Admin")
      .get();
    
    interface AdminData {
      id: string;
      name: string;
      email: string;
      avatar: string;
      joinDate: string;
      status: string;
      phoneNumber: string;
      district: string;
      username: string;
      phoneNumberVerified: boolean;
    }
    
    const admins: AdminData[] = [];
    
    adminsSnapshot.forEach(doc => {
      const adminData = doc.data();
      // Skip the current admin
      if (doc.id !== currentAdminUid) {
        admins.push({
          id: doc.id,
          name: `${adminData.firstName || ''} ${adminData.lastName || ''}`.trim(),
          email: adminData.email || '',
          avatar: adminData.profileImage || '',
          joinDate: adminData.createdAt || '',
          status: adminData.status || 'Active',
          // Include other fields as needed
          phoneNumber: adminData.phoneNumber || '',
          district: adminData.district || '',
          username: adminData.username || '',
          phoneNumberVerified: adminData.phoneNumberVerified || false
        });
      }
    });

    return NextResponse.json({ admins });
    
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch admins' }, { status: 500 });
  }
}

// POST /api/admin/admins - Create a new admin
export async function POST(request: NextRequest) {
  await initAdmin();
  const db = getAdminDB();
  const adminAuth = getAdminAuth();
  
  try {
    // Authenticate current admin via session cookie
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const currentAdminUid = decodedClaims.uid;
    
    // Verify current user is an admin
    const currentAdminDoc = await db.collection("users").doc(currentAdminUid).get();
    if (!currentAdminDoc.exists || currentAdminDoc.data()?.role !== "Admin") {
      return NextResponse.json({ error: "Not authorized - Admin access required" }, { status: 403 });
    }

    // Get request data
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      address, 
      district, 
      orgName, 
      phoneNumber, 
      username,
      status 
    } = await request.json();
    
    if (!email || !password || !firstName || !lastName || !address || !district || !orgName || !phoneNumber || !username) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Create user with Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`
    });

    // Create user document in Firestore
    const now = new Date().toISOString();
    await db.collection("users").doc(userRecord.uid).set({
      email,
      firstName,
      lastName,
      address,
      district,
      orgName,
      phoneNumber,
      username,
      role: "Admin", // Default value
      phoneNumberVerified: false, // Default value
      status: status || "Active",
      createdAt: now,
      updatedAt: now
    });

    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      uid: userRecord.uid
    });
    
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create admin' 
    }, { status: 500 });
  }
}
