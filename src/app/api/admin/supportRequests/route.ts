import { NextRequest, NextResponse } from "next/server";
import { initAdmin, getAdminDB, getAdminAuth } from "@/db/firebaseAdmin";
import { cookies } from "next/headers";

// GET /api/admin/supportRequests - Get all support requests
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

    // Get all support requests that are not closed
    const supportRequestsSnapshot = await db.collection("supportRequests")
        .orderBy("createdAt", "desc")
        .get();
    
    const supportRequests = supportRequestsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        categoryName: data.categoryName || '',
        createdAt: data.createdAt || '',
        message: data.message || '',
        status: data.status || 'pending',
        subject: data.subject || '',
        userEmail: data.userEmail || '',
        userId: data.userId || '',
      };
    });

    return NextResponse.json({ supportRequests });
    
  } catch (error: any) {
    console.error('Error fetching support requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch support requests' }, 
      { status: 500 }
    );
  }
}