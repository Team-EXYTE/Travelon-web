import { NextRequest, NextResponse } from "next/server";
import { initAdmin, getAdminDB, getAdminAuth } from "@/db/firebaseAdmin";
import { cookies } from "next/headers";

// PATCH /api/admin/supportRequests/[requestId] - Update support request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    await initAdmin();
    const db = getAdminDB();
    
    // Verify the session to ensure the user is authenticated
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized: No session cookie" },
        { status: 401 }
      );
    }

    // Verify the session with Firebase Admin
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    // Get the user document to check role
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Unauthorized: User not found" },
        { status: 401 }
      );
    }

    const userData = userDoc.data();
    if (!userData || userData.role !== "Admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const requestId = params.requestId;

    // Get the support request document to verify it exists
    const supportRequestDoc = await db.collection("supportRequests").doc(requestId).get();
    if (!supportRequestDoc.exists) {
      return NextResponse.json(
        { error: "Not Found: Support request not found" },
        { status: 404 }
      );
    }

    // Parse the request body to get the new status
    const { status } = await request.json();
    
    if (!status || !["pending", "inProgress", "resolved", "closed"].includes(status)) {
      return NextResponse.json(
        { error: "Bad Request: Invalid status value" },
        { status: 400 }
      );
    }

    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    // Update the support request document
    await db.collection("supportRequests").doc(requestId).update(updateData);

    return NextResponse.json(
      { 
        message: "Support request updated successfully",
        status: status
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating support request:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}