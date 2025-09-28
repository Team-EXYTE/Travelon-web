import { NextRequest, NextResponse } from 'next/server';
import { initAdmin, getAdminAuth, getAdminDB } from '@/db/firebaseAdmin';
import { cookies } from 'next/headers';

// GET /api/admin/travellers - Get travelers list
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
    // console.log("Decoded UID:", uid);
    
    // Get admin status
    const userDoc = await db.collection("users").doc(uid).get();
    // console.log("User doc exists:", userDoc.exists);
    
    if (!userDoc.exists) {
      console.log("User does not exist in the database");
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }
    
    const userData = userDoc.data();
    // console.log("User data:", userData);
    // console.log("Admin status:", userData?.isAdmin);
    
    if (userData?.role !== "Admin") {
      return NextResponse.json({ error: "Not authorized - Admin access required" }, { status: 403 });
    }

    // console.log("Admin verified:", uid);

    // Query the travelers from Firestore
    const travelersRef = db.collection('users-travellers');
    const snapshot = await travelersRef.get();

    // Transform the data
    const travelers = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phoneNumber || '',
        profileImage: data.profileImage || '',
        joinDate: data.joinDate || new Date().toISOString(),
        eventCount: data.bookings?.length || 0,
        bookings: data.bookings || [],
        status: data.status || 'New'
      };
    });

    // Return the travelers
    return NextResponse.json({
      travelers,
      total: travelers.length
    });
  } catch (error: any) {
    console.error('Error getting travelers:', error);
    return NextResponse.json({ error: error.message || 'Failed to get travelers' }, { status: 500 });
  }
}

// DELETE /api/admin/travellers - Delete a traveler
export async function DELETE(request: NextRequest) {
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
    
    // Get admin status
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }
    
    const userData = userDoc.data();
    
    if (userData?.role !== "Admin") {
      return NextResponse.json({ error: "Not authorized - Admin access required" }, { status: 403 });
    }

    // Get the traveler ID from the request body
    const { travelerId } = await request.json();
    if (!travelerId) {
      return NextResponse.json({ error: 'Traveler ID is required' }, { status: 400 });
    }

    // Delete the traveler from Firestore
    await db.collection('travelers').doc(travelerId).delete();

    // Return success
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting traveler:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete traveler' }, { status: 500 });
  }
}

// PATCH /api/admin/travellers - Update traveler status
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
    
    // Get admin status
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }
    
    const userData = userDoc.data();
    
    if (userData?.role !== "Admin") {
      return NextResponse.json({ error: "Not authorized - Admin access required" }, { status: 403 });
    }

    // Get the traveler ID and new status from the request body
    const { travelerId, status } = await request.json();
    if (!travelerId || !status) {
      return NextResponse.json({ error: 'Traveler ID and status are required' }, { status: 400 });
    }

    // Update the traveler status in Firestore
    await db.collection('travelers').doc(travelerId).update({ status });

    // Return success
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating traveler status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update traveler status' }, { status: 500 });
  }
}