import { NextRequest, NextResponse } from "next/server";
import { auth } from "firebase-admin";
import { getAdminDB, initAdmin } from "@/db/firebaseAdmin";

export async function DELETE(
  request: NextRequest, 
  { params }: { params: { adminId: string } }
) {
  try {
    await initAdmin();
    const db = getAdminDB();
    
    // Verify the session to ensure the user is authenticated
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized: No session cookie" },
        { status: 401 }
      );
    }

    // Verify the session with Firebase Admin
    const decodedClaims = await auth().verifySessionCookie(sessionCookie, true);
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

    const adminId = params.adminId;

    // Don't allow admins to delete themselves
    if (adminId === userId) {
      return NextResponse.json(
        { error: "Bad Request: Cannot delete your own admin account" },
        { status: 400 }
      );
    }

    // Get the admin document to verify it exists and is an admin
    const adminDoc = await db.collection("users").doc(adminId).get();
    if (!adminDoc.exists) {
      return NextResponse.json(
        { error: "Not Found: Admin not found" },
        { status: 404 }
      );
    }

    const adminData = adminDoc.data();
    if (!adminData || adminData.role !== "Admin") {
      return NextResponse.json(
        { error: "Bad Request: User is not an admin" },
        { status: 400 }
      );
    }

    // Delete the admin document
    await db.collection("users").doc(adminId).delete();

    return NextResponse.json(
      { message: "Admin deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { adminId: string } }
) {
  try {
    await initAdmin();
    const db = getAdminDB();
    
    // Verify the session to ensure the user is authenticated
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized: No session cookie" },
        { status: 401 }
      );
    }

    // Verify the session with Firebase Admin
    const decodedClaims = await auth().verifySessionCookie(sessionCookie, true);
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

    const adminId = params.adminId;

    // Get the admin document to verify it exists and is an admin
    const adminDoc = await db.collection("users").doc(adminId).get();
    if (!adminDoc.exists) {
      return NextResponse.json(
        { error: "Not Found: Admin not found" },
        { status: 404 }
      );
    }

    const adminData = adminDoc.data();
    if (!adminData || adminData.role !== "Admin") {
      return NextResponse.json(
        { error: "Bad Request: User is not an admin" },
        { status: 400 }
      );
    }

    // Parse the request body to get the fields to update
    const requestData = await request.json();
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString() // Add updated timestamp
    };

    // Only allow certain fields to be updated
    if (requestData.firstName !== undefined) updateData.firstName = requestData.firstName;
    if (requestData.lastName !== undefined) updateData.lastName = requestData.lastName;
    if (requestData.email !== undefined) updateData.email = requestData.email;
    if (requestData.status !== undefined) updateData.status = requestData.status;
    if (requestData.address !== undefined) updateData.address = requestData.address;
    if (requestData.district !== undefined) updateData.district = requestData.district;
    if (requestData.phoneNumber !== undefined) updateData.phoneNumber = requestData.phoneNumber;
    if (requestData.username !== undefined) updateData.username = requestData.username;
    if (requestData.orgName !== undefined) updateData.orgName = requestData.orgName;

    // Update password if provided
    if (requestData.password) {
      try {
        await auth().updateUser(adminId, {
          password: requestData.password
        });
      } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json(
          { error: "Failed to update password" },
          { status: 500 }
        );
      }
    }
    
    // Update the admin document in Firestore
    await db.collection("users").doc(adminId).update(updateData);

    return NextResponse.json(
      { message: "Admin updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}